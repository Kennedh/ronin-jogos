import {
  createHmac,
  randomBytes,
  randomUUID,
  timingSafeEqual,
} from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { Fault, transaction, serverTime } from "./runtime.ts";
import type { Clock } from "./runtime.ts";
import { Sessions, digest } from "./sessions.ts";
import type { Session } from "./sessions.ts";
import { PasswordHasher, passwordPolicy } from "./passwords.ts";
import type { PasswordRecord } from "./passwords.ts";
import { enqueueAuthMail, checkMailKey } from "./auth-mail.ts";
export function normalizedEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (
    email.length > 254 ||
    !/^([^\s@]+)@([a-z0-9.-]+\.[a-z]{2,63})$/.test(email) ||
    /[^\x21-\x7e]/.test(email)
  )
    throw new Fault(422, "INVALID_REQUEST");
  return email;
}
function nickname(value: string) {
  const name = value.normalize("NFKC").trim().replace(/ +/g, " ");
  if (
    Array.from(name).length < 3 ||
    Array.from(name).length > 20 ||
    !/^[\p{L}\p{N} _-]+$/u.test(name) ||
    [
      "ronin",
      "admin",
      "administrator",
      "administrador",
      "support",
      "suporte",
      "moderator",
    ].includes(name.toLowerCase())
  )
    throw new Fault(422, "INVALID_NICKNAME");
  return name;
}
export class Accounts {
  readonly pool: Pool;
  readonly clock: Clock;
  readonly sessions: Sessions;
  readonly hasher = new PasswordHasher();
  readonly key: Buffer;
  readonly origin: string;
  constructor(pool: Pool, key: Buffer, origin: string, clock?: Clock) {
    checkMailKey(key);
    this.pool = pool;
    this.key = Buffer.from(key);
    this.origin = origin;
    this.clock = clock;
    this.sessions = new Sessions(pool, clock);
  }
  private async player(db: PoolClient, id: string) {
    const p = (
      await db.query(
        "SELECT * FROM players WHERE id=$1 AND status NOT IN ('DELETION_PENDING','ANONYMIZED') FOR UPDATE",
        [id],
      )
    ).rows[0];
    if (!p) throw new Fault(401, "SESSION_REQUIRED");
    return p;
  }
  private async live(db: PoolClient, auth: Session, now: Date, recent = false) {
    const row = (
      await db.query(
        "SELECT * FROM sessions WHERE id=$1 AND player_id=$2 AND revoked_at IS NULL AND expires_at>$3 FOR UPDATE",
        [auth.sessionId, auth.playerId, now],
      )
    ).rows[0];
    if (!row) throw new Fault(401, "SESSION_REQUIRED");
    if (
      recent &&
      (!row.authenticated_at ||
        now.getTime() - row.authenticated_at.getTime() > 600000)
    )
      throw new Fault(403, "REAUTH_REQUIRED");
    return row;
  }
  private async audit(
    db: PoolClient,
    player: string,
    event: string,
    now: Date,
  ) {
    await db.query(
      "INSERT INTO account_audit(id,player_id,event,created_at) VALUES($1,$2,$3,$4)",
      [randomUUID(), player, event, now],
    );
  }
  private async cooldown(db: PoolClient, email: string, now: Date) {
    const key = createHmac("sha256", this.key)
      .update("mail:" + email)
      .digest();
    return !!(
      await db.query(
        "INSERT INTO auth_email_cooldowns(email_digest,sent_at) VALUES($1,$2) ON CONFLICT(email_digest) DO UPDATE SET sent_at=EXCLUDED.sent_at WHERE auth_email_cooldowns.sent_at<=$3 RETURNING email_digest",
        [key, now, new Date(now.getTime() - 60000)],
      )
    ).rowCount;
  }
  private async send(
    db: PoolClient,
    p: { id: string; locale: "pt-BR" | "en" },
    email: string,
    purpose: "VERIFY" | "RESET",
    requestId: string | null,
    now: Date,
  ) {
    const token = randomBytes(32).toString("base64url"),
      expires = new Date(
        now.getTime() + (purpose === "VERIFY" ? 86400000 : 1800000),
      );
    await db.query(
      "UPDATE account_tokens SET used_at=$3 WHERE player_id=$1 AND purpose=$2 AND used_at IS NULL",
      [p.id, purpose, now],
    );
    await db.query(
      "INSERT INTO account_tokens(digest,player_id,purpose,request_id,created_at,expires_at) VALUES($1,$2,$3,$4,$5,$6)",
      [digest(token), p.id, purpose, requestId, now, expires],
    );
    const link = new URL(
      "/account/" + (p.locale === "pt-BR" ? "pt-br" : "en"),
      this.origin,
    );
    link.hash = (purpose === "VERIFY" ? "verify=" : "reset=") + token;
    const pt = p.locale === "pt-BR",
      subject =
        purpose === "VERIFY"
          ? pt
            ? "Confirme seu Ronin ID"
            : "Confirm your Ronin ID"
          : pt
            ? "Redefina sua senha do Ronin ID"
            : "Reset your Ronin ID password";
    const hint =
      purpose === "VERIFY"
        ? pt
          ? "Abra no navegador em que iniciou o cadastro e confirme. O link vale por 24 horas."
          : "Open this in the browser where you started registration and confirm. The link expires in 24 hours."
        : pt
          ? "Escolha uma nova senha. O link vale por 30 minutos. As sessões anteriores serão encerradas."
          : "Choose a new password within 30 minutes. Previous sessions will be signed out.";
    await enqueueAuthMail(
      db,
      this.key,
      {
        to: email,
        subject,
        text:
          subject +
          "\n\n" +
          hint +
          "\n\n" +
          link.href +
          "\n\n" +
          (pt
            ? "Se não solicitou, ignore esta mensagem."
            : "If you did not request this, ignore this message."),
        locale: p.locale,
        purpose,
        link: link.href,
      },
      now,
    );
  }
  async register(
    auth: Session,
    input: {
      email: string;
      password: string;
      nickname?: string;
      locale?: "pt-BR" | "en";
    },
  ) {
    const email = normalizedEmail(input.email);
    passwordPolicy(input.password);
    const record = await this.hasher.hash(input.password);
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock),
        p = await this.player(db, auth.playerId);
      await this.live(db, auth, now);
      if (p.status === "REGISTERED") return;
      const old = (
        await db.query("SELECT * FROM email_registrations WHERE player_id=$1", [
          p.id,
        ])
      ).rows[0];
      if (old && now.getTime() - old.requested_at.getTime() < 60000) return;
      if (input.locale) {
        p.locale = input.locale;
        await db.query("UPDATE players SET locale=$2 WHERE id=$1", [
          p.id,
          input.locale,
        ]);
      }
      const name = nickname(p.nickname ?? input.nickname ?? "");
      const key = name.toLowerCase();
      await db.query(
        "INSERT INTO nickname_reservations(normalized_name,player_id) VALUES($1,$2) ON CONFLICT DO NOTHING",
        [key, p.id],
      );
      const reserved = (
        await db.query(
          "SELECT player_id FROM nickname_reservations WHERE normalized_name=$1",
          [key],
        )
      ).rows[0];
      if (!reserved || reserved.player_id !== p.id)
        throw new Fault(409, "NICKNAME_UNAVAILABLE");
      await db.query(
        "DELETE FROM nickname_reservations WHERE player_id=$1 AND normalized_name<>$2",
        [p.id, key],
      );
      const request = randomUUID();
      await db.query(
        "UPDATE account_tokens SET used_at=$2 WHERE player_id=$1 AND purpose='VERIFY' AND used_at IS NULL",
        [p.id, now],
      );
      await db.query(
        "INSERT INTO email_registrations(player_id,request_id,email,algorithm,salt,digest,requested_at,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(player_id) DO UPDATE SET request_id=EXCLUDED.request_id,email=EXCLUDED.email,algorithm=EXCLUDED.algorithm,salt=EXCLUDED.salt,digest=EXCLUDED.digest,requested_at=EXCLUDED.requested_at,expires_at=EXCLUDED.expires_at",
        [
          p.id,
          request,
          email,
          record.algorithm,
          record.salt,
          record.digest,
          now,
          new Date(now.getTime() + 86400000),
        ],
      );
      await db.query(
        "UPDATE players SET status='EMAIL_PENDING',nickname=$2 WHERE id=$1",
        [p.id, name],
      );
      if (await this.cooldown(db, email, now))
        await this.send(db, p, email, "VERIFY", request, now);
      await this.audit(db, p.id, "REGISTRATION_REQUESTED", now);
    });
  }
  async resend(auth: Session, locale?: "pt-BR" | "en") {
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock),
        p = await this.player(db, auth.playerId);
      await this.live(db, auth, now);
      const r = (
        await db.query("SELECT * FROM email_registrations WHERE player_id=$1", [
          p.id,
        ])
      ).rows[0];
      if (p.status !== "EMAIL_PENDING" || !r) return;
      if (locale) {
        p.locale = locale;
        await db.query("UPDATE players SET locale=$2 WHERE id=$1", [
          p.id,
          locale,
        ]);
      }
      if (await this.cooldown(db, r.email, now)) {
        await db.query(
          "UPDATE email_registrations SET expires_at=$2 WHERE player_id=$1",
          [p.id, new Date(now.getTime() + 86400000)],
        );
        await this.send(db, p, r.email, "VERIFY", r.request_id, now);
        await this.audit(db, p.id, "CONFIRMATION_RESENT", now);
      }
    });
  }
  async verifyEmail(auth: Session, token: string) {
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock),
        p = await this.player(db, auth.playerId);
      await this.live(db, auth, now);
      const t = (
        await db.query(
          "SELECT * FROM account_tokens WHERE digest=$1 AND purpose='VERIFY' FOR UPDATE",
          [digest(token)],
        )
      ).rows[0];
      if (!t || t.used_at || t.expires_at <= now)
        throw new Fault(422, "AUTH_TOKEN_INVALID");
      if (t.player_id !== p.id) throw new Fault(403, "AUTH_TOKEN_CONTEXT");
      const r = (
        await db.query("SELECT * FROM email_registrations WHERE player_id=$1", [
          p.id,
        ])
      ).rows[0];
      if (!r || r.request_id !== t.request_id || r.expires_at <= now)
        throw new Fault(422, "AUTH_TOKEN_INVALID");
      // Serialize proofs for one email, without ever choosing identity by the address alone.
      await db.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1,1751))",
        [r.email],
      );
      if (
        (
          await db.query("SELECT 1 FROM email_accounts WHERE email=$1", [
            r.email,
          ])
        ).rowCount
      )
        throw new Fault(409, "EMAIL_ALREADY_LINKED");
      await db.query(
        "INSERT INTO email_accounts(player_id,email,verified_at) VALUES($1,$2,$3)",
        [p.id, r.email, now],
      );
      await db.query(
        "INSERT INTO password_credentials(player_id,algorithm,salt,digest,changed_at) VALUES($1,$2,$3,$4,$5)",
        [p.id, r.algorithm, r.salt, r.digest, now],
      );
      await db.query("UPDATE players SET status='REGISTERED' WHERE id=$1", [
        p.id,
      ]);
      await db.query(
        "UPDATE account_tokens SET used_at=$2 WHERE player_id=$1 AND used_at IS NULL",
        [p.id, now],
      );
      await db.query("DELETE FROM email_registrations WHERE player_id=$1", [
        p.id,
      ]);
      await db.query(
        "UPDATE sessions SET revoked_at=$2 WHERE player_id=$1 AND revoked_at IS NULL",
        [p.id, now],
      );
      await this.audit(db, p.id, "EMAIL_VERIFIED", now);
      return this.sessions.issue(db, p.id, p.locale, now);
    });
  }
  async login(emailValue: string, password: string, current?: Session) {
    const email = normalizedEmail(emailValue),
      candidate = (
        await this.pool.query(
          "SELECT c.*,p.locale,p.status FROM email_accounts a JOIN players p ON p.id=a.player_id JOIN password_credentials c ON c.player_id=p.id WHERE a.email=$1",
          [email],
        )
      ).rows[0] as
        | (PasswordRecord & {
            player_id: string;
            locale: Session["locale"];
            status: string;
          })
        | undefined;
    const valid = await this.hasher.verify(password, candidate);
    if (!valid || candidate?.status !== "REGISTERED")
      throw new Fault(401, "INVALID_CREDENTIALS");
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock);
      await db.query(
        "SELECT id FROM players WHERE id=ANY($1::uuid[]) ORDER BY id FOR UPDATE",
        [
          [
            ...new Set([
              candidate.player_id,
              ...(current ? [current.playerId] : []),
            ]),
          ],
        ],
      );
      const p = await this.player(db, candidate.player_id),
        r = (
          await db.query(
            "SELECT * FROM password_credentials WHERE player_id=$1",
            [p.id],
          )
        ).rows[0];
      if (
        p.status !== "REGISTERED" ||
        !r ||
        !timingSafeEqual(r.digest, candidate.digest)
      )
        throw new Fault(401, "INVALID_CREDENTIALS");
      if (current && current.playerId !== p.id) {
        const source = (
          await db.query("SELECT status FROM players WHERE id=$1", [
            current.playerId,
          ])
        ).rows[0];
        if (
          source?.status !== "REGISTERED" &&
          (
            await db.query("SELECT 1 FROM runs WHERE player_id=$1 LIMIT 1", [
              current.playerId,
            ])
          ).rowCount
        )
          throw new Fault(409, "GUEST_PROGRESS_REQUIRES_LINK");
      }
      if (current)
        await db.query("UPDATE sessions SET revoked_at=$2 WHERE id=$1", [
          current.sessionId,
          now,
        ]);
      await this.audit(db, p.id, "PASSWORD_LOGIN", now);
      return this.sessions.issue(db, p.id, p.locale, now);
    });
  }
  async forgot(emailValue: string) {
    const email = normalizedEmail(emailValue);
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock),
        a = (
          await db.query(
            "SELECT player_id FROM email_accounts WHERE email=$1",
            [email],
          )
        ).rows[0];
      if (!a) return;
      const p = await this.player(db, a.player_id);
      if (p.status !== "REGISTERED") return;
      if (await this.cooldown(db, email, now)) {
        await this.send(db, p, email, "RESET", null, now);
        await this.audit(db, p.id, "RESET_REQUESTED", now);
      }
    });
  }
  async reset(token: string, password: string) {
    passwordPolicy(password);
    const record = await this.hasher.hash(password);
    const hint = (
      await this.pool.query(
        "SELECT player_id FROM account_tokens WHERE digest=$1 AND purpose='RESET'",
        [digest(token)],
      )
    ).rows[0];
    if (!hint) throw new Fault(422, "AUTH_TOKEN_INVALID");
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock),
        p = await this.player(db, hint.player_id),
        t = (
          await db.query(
            "SELECT * FROM account_tokens WHERE digest=$1 AND purpose='RESET' FOR UPDATE",
            [digest(token)],
          )
        ).rows[0];
      if (p.status !== "REGISTERED" || !t || t.used_at || t.expires_at <= now)
        throw new Fault(422, "AUTH_TOKEN_INVALID");
      await db.query(
        "UPDATE password_credentials SET algorithm=$2,salt=$3,digest=$4,changed_at=$5 WHERE player_id=$1",
        [p.id, record.algorithm, record.salt, record.digest, now],
      );
      await db.query(
        "UPDATE account_tokens SET used_at=$2 WHERE player_id=$1 AND used_at IS NULL",
        [p.id, now],
      );
      await db.query(
        "UPDATE sessions SET revoked_at=$2 WHERE player_id=$1 AND revoked_at IS NULL",
        [p.id, now],
      );
      await this.audit(db, p.id, "PASSWORD_RESET", now);
    });
  }
  async reauth(auth: Session, password: string) {
    const r = (
      await this.pool.query(
        "SELECT * FROM password_credentials WHERE player_id=$1",
        [auth.playerId],
      )
    ).rows[0] as PasswordRecord | undefined;
    if (!(await this.hasher.verify(password, r)))
      throw new Fault(401, "INVALID_CREDENTIALS");
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock);
      await this.player(db, auth.playerId);
      await this.live(db, auth, now);
      const latest = (
        await db.query(
          "SELECT digest FROM password_credentials WHERE player_id=$1",
          [auth.playerId],
        )
      ).rows[0];
      if (!latest || !timingSafeEqual(latest.digest, r!.digest))
        throw new Fault(401, "INVALID_CREDENTIALS");
      await db.query("UPDATE sessions SET authenticated_at=$2 WHERE id=$1", [
        auth.sessionId,
        now,
      ]);
      await this.audit(db, auth.playerId, "REAUTHENTICATED", now);
    });
  }
  async list(auth: Session) {
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock);
      await this.player(db, auth.playerId);
      await this.live(db, auth, now, true);
      const rows = (
        await db.query(
          "SELECT id,created_at,last_seen_at,expires_at FROM sessions WHERE player_id=$1 AND revoked_at IS NULL AND expires_at>$2 ORDER BY created_at DESC,id DESC LIMIT 20",
          [auth.playerId, now],
        )
      ).rows;
      return {
        sessions: rows.map((r) => ({
          session_id: r.id,
          created_at: r.created_at.toISOString(),
          last_seen_at: r.last_seen_at.toISOString(),
          expires_at: r.expires_at.toISOString(),
          current: r.id === auth.sessionId,
        })),
      };
    });
  }
  async revoke(auth: Session, id: string) {
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock);
      await this.player(db, auth.playerId);
      await this.live(db, auth, now, true);
      if (
        !(
          await db.query(
            "UPDATE sessions SET revoked_at=$3 WHERE id=$1 AND player_id=$2 AND revoked_at IS NULL",
            [id, auth.playerId, now],
          )
        ).rowCount
      )
        throw new Fault(403, "SESSION_FORBIDDEN");
      await this.audit(db, auth.playerId, "SESSION_REVOKED", now);
    });
  }
  async logout(auth: Session) {
    return transaction(this.pool, async (db) => {
      const now = await serverTime(db, this.clock);
      await this.player(db, auth.playerId);
      await this.live(db, auth, now);
      await db.query("UPDATE sessions SET revoked_at=$2 WHERE id=$1", [
        auth.sessionId,
        now,
      ]);
      await this.audit(db, auth.playerId, "LOGGED_OUT", now);
    });
  }
}
