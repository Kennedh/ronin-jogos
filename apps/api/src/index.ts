import Fastify from "fastify";
import type { FastifyRequest, FastifyReply } from "fastify";
import { randomBytes, randomUUID, createHmac } from "node:crypto";
import type { Pool } from "pg";
import { schema, validate } from "@ronin/contracts";
import type { components, SchemaName } from "@ronin/contracts";
import { parseJson } from "@ronin/contracts/canonical";
import { segmentHash } from "@ronin/contracts/replay";
import {
  decodeTransport,
  TransportError,
} from "@ronin/contracts/node-transport";
import { preferredLocale } from "@ronin/content";
import {
  Runs,
  Sessions,
  Fault,
  rateLimit,
  Accounts,
  Merges,
  Privacy,
} from "@ronin/data";
import type { Session, Clock, ResourcePolicy } from "@ronin/data";
import { CURRENT_MANIFEST } from "@ronin/content/runner-manifest";
import type { RunnerManifest } from "@ronin/content/runner-manifest";
import { googleVerifier } from "./google.ts";
import type { GoogleConfig } from "./google.ts";

export interface ApiOptions {
  google?: GoogleConfig;
  manifest?: RunnerManifest;
  authMailKey?: Buffer;
  pool: Pool;
  origin: string;
  clock?: Clock;
  policy?: ResourcePolicy;
  rateSecret?: Buffer;
}
const uuid = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
const hash = /^[a-f0-9]{64}$/;
function checked(name: SchemaName, value: unknown) {
  if (!validate(name, value)) throw new Error("invalid_server_response");
  return value;
}
function cookie(request: FastifyRequest, name: string) {
  const values = (request.headers.cookie ?? "")
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.startsWith(name + "="));
  if (values.length > 1) throw new Fault(401, "SESSION_REQUIRED");
  return values[0]?.slice(name.length + 1);
}
function integerHeader(value: string | undefined) {
  if (
    typeof value !== "string" ||
    !/^(0|[1-9][0-9]*)$/.test(value) ||
    !Number.isSafeInteger(Number(value))
  )
    throw new Fault(422, "INVALID_SEGMENT_HEADERS");
  return Number(value);
}
export function createApi(options?: ApiOptions) {
  const api = Fastify({
    logger: false,
    bodyLimit: 262144,
    requestTimeout: 15000,
    connectionTimeout: 10000,
    genReqId: () => randomUUID(),
    trustProxy: false,
  });
  api.get(
    "/api/v1/health",
    { schema: { response: { 200: schema("Health") } } },
    async () => ({ status: "ok", service: "ronin-play-api" }),
  );
  if (!options) return api; // Liveness-only when no persistence is configured.
  const origin = new URL(options.origin);
  if (
    origin.origin !== options.origin ||
    origin.username ||
    origin.password ||
    origin.pathname !== "/" ||
    !["https:", "http:"].includes(origin.protocol)
  )
    throw new Error("invalid_api_origin");
  if (
    origin.protocol !== "https:" &&
    !["127.0.0.1", "localhost", "[::1]"].includes(origin.hostname)
  )
    throw new Error("insecure_nonlocal_origin");
  if (origin.protocol === "https:" && !options.rateSecret)
    throw new Error("persistent_rate_secret_required");
  const rateSecret = options.rateSecret ?? randomBytes(32);
  if (rateSecret.length < 32) throw new Error("invalid_rate_secret");
  const sessions = new Sessions(options.pool, options.clock),
    runs = new Runs(
      options.pool,
      options.clock,
      options.policy,
      options.manifest ?? CURRENT_MANIFEST,
    );
  const accounts = options.authMailKey
    ? new Accounts(
        options.pool,
        options.authMailKey,
        options.origin,
        options.clock,
      )
    : undefined;
  if (options.google && !accounts)
    throw new Error("google_requires_account_config");
  const verifyGoogle = options.google
    ? googleVerifier(options.google, options.clock)
    : undefined;
  const account = () => {
    if (!accounts) throw new Fault(503, "ACCOUNT_UNAVAILABLE");
    return accounts;
  };
  const merges = new Merges(options.pool, options.clock);
  const privacy = new Privacy(options.pool, options.clock);
  const pendingEndpoints = new Set([
    "GET /api/v1/me",
    "GET /api/v1/me/privacy",
    "POST /api/v1/me/export",
    "POST /api/v1/me/delete-request",
    "DELETE /api/v1/me/delete-request",
    "POST /api/v1/auth/reauth",
    "GET /api/v1/auth/google/config",
    "POST /api/v1/auth/google/challenge",
    "POST /api/v1/auth/google/reauth",
    "GET /api/v1/me/sessions",
    "DELETE /api/v1/me/sessions/:session_id",
  ]);
  const publicAuth = new Set([
    "/api/v1/auth/logout",
    "/api/v1/auth/login",
    "/api/v1/auth/password/forgot",
    "/api/v1/auth/password/reset",
  ]);
  const uniform = async <T>(work: () => Promise<T>) => {
    const started = performance.now();
    try {
      return await work();
    } finally {
      await new Promise((resolve) =>
        setTimeout(resolve, Math.max(0, 100 - (performance.now() - started))),
      );
    }
  };
  const cookieName = origin.protocol === "https:" ? "__Host-rr_sid" : "rr_sid";
  const readCookie = (request: FastifyRequest) => cookie(request, cookieName);
  const auths = new WeakMap<FastifyRequest, Session>();
  const session = (request: FastifyRequest) => {
    const value = auths.get(request);
    if (!value) throw new Fault(401, "SESSION_REQUIRED");
    return value;
  };
  const setCookie = (reply: FastifyReply, token: string, auth: Session) =>
    reply
      .removeHeader("Set-Cookie")
      .header(
        "Set-Cookie",
        `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${auth.expiresAt.toUTCString()}${origin.protocol === "https:" ? "; Secure" : ""}`,
      );
  api.removeContentTypeParser("application/json");
  api.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    (_request, body, done) => {
      try {
        done(
          null,
          parseJson(typeof body === "string" ? Buffer.from(body) : body),
        );
      } catch {
        done(new Fault(422, "INVALID_JSON"));
      }
    },
  );
  api.addContentTypeParser(
    "application/octet-stream",
    { parseAs: "buffer" },
    (_request, body, done) => done(null, body),
  );
  api.addHook("onRequest", async (request, reply) => {
    const route = request.routeOptions.url;
    if (!route || route === "/api/v1/health") return;
    reply
      .header("Cache-Control", "no-store")
      .header("X-Content-Type-Options", "nosniff")
      .header("Referrer-Policy", "no-referrer");
    if (request.headers.host !== origin.host)
      throw new Fault(403, "HOST_FORBIDDEN");
    const headerOrigin = request.headers.origin;
    if (
      (request.method !== "GET" || headerOrigin !== undefined) &&
      headerOrigin !== origin.origin
    )
      throw new Fault(403, "ORIGIN_FORBIDDEN");
    if (request.headers["sec-fetch-site"] === "cross-site")
      throw new Fault(403, "ORIGIN_FORBIDDEN");
    if (Object.keys(request.query as object).length)
      throw new Fault(422, "INVALID_REQUEST");
    if (
      request.method !== "PUT" &&
      request.headers["content-encoding"] &&
      request.headers["content-encoding"] !== "identity"
    )
      throw new Fault(415, "UNSUPPORTED_ENCODING");
    if (route === "/api/v1/auth/guest") {
      await rateLimit(
        options.pool,
        "guest",
        createHmac("sha256", rateSecret).update(request.ip).digest(),
        20,
        options.clock,
      );
      const token = readCookie(request);
      if (token) auths.set(request, await sessions.read(token));
      return;
    }
    if (publicAuth.has(route)) {
      if (
        request.headers["x-ronin-auth"] !== "1" ||
        request.headers["content-type"]?.split(";")[0] !== "application/json"
      )
        throw new Fault(403, "AUTH_CONTEXT_REQUIRED");
      await rateLimit(
        options.pool,
        "public-auth",
        createHmac("sha256", rateSecret).update(request.ip).digest(),
        30,
        options.clock,
      );
      const token = readCookie(request);
      if (token) {
        try {
          auths.set(request, await sessions.read(token));
        } catch (error) {
          if (!(error instanceof Fault && error.status === 401)) throw error;
        }
      }
      if (route === "/api/v1/auth/logout" && auths.has(request))
        sessions.checkCsrf(
          auths.get(request)!,
          request.headers["x-csrf-token"] as string | undefined,
        );
      return;
    }
    const token = readCookie(request);
    if (!token) throw new Fault(401, "SESSION_REQUIRED");
    const auth = await sessions.read(token);
    auths.set(request, auth);
    if (
      auth.deletionPending &&
      !pendingEndpoints.has(request.method + " " + route)
    )
      throw new Fault(409, "ACCOUNT_DELETION_PENDING");
    if (request.method !== "GET")
      sessions.checkCsrf(
        auth,
        request.headers["x-csrf-token"] as string | undefined,
      );
    if (route.startsWith("/api/v1/auth/"))
      await rateLimit(
        options.pool,
        "authenticated-auth",
        createHmac("sha256", rateSecret).update(auth.playerId).digest(),
        20,
        options.clock,
      );
    if (
      request.method !== "GET" &&
      (route.startsWith("/api/v1/auth/google") || route === "/api/v1/auth/link")
    )
      await rateLimit(
        options.pool,
        "google-auth-ip",
        createHmac("sha256", rateSecret).update(request.ip).digest(),
        60,
        options.clock,
      );
    const scope =
      request.method === "GET"
        ? "status"
        : route.endsWith("/start")
          ? "start"
          : request.method === "PUT"
            ? "upload"
            : "finish";
    await rateLimit(
      options.pool,
      scope,
      createHmac("sha256", rateSecret).update(auth.playerId).digest(),
      scope === "start"
        ? 10
        : scope === "status"
          ? 600
          : scope === "upload"
            ? 120
            : 60,
      options.clock,
    );
    const params = request.params as Record<string, string>;
    if (params["run_id"]) {
      if (!uuid.test(params["run_id"])) throw new Fault(422, "INVALID_REQUEST");
      await runs.authorize(auth.playerId, params["run_id"]);
    }
    setCookie(reply, token, auth);
  });
  api.setErrorHandler((error, request, reply) => {
    let status = 500,
      code = "INTERNAL_ERROR";
    if (error instanceof Fault) {
      status = error.status;
      code = error.code;
    } else if (error instanceof TransportError) {
      status = error.status;
      code =
        status === 413
          ? "PAYLOAD_TOO_LARGE"
          : status === 415
            ? "UNSUPPORTED_ENCODING"
            : "INVALID_REPLAY";
    } else if (
      error instanceof Error &&
      "statusCode" in error &&
      typeof error.statusCode === "number" &&
      [400, 413, 415].includes(error.statusCode)
    ) {
      status = error.statusCode;
      code =
        status === 413
          ? "PAYLOAD_TOO_LARGE"
          : status === 415
            ? "UNSUPPORTED_MEDIA_TYPE"
            : "INVALID_REQUEST";
    } else if (
      error instanceof Error &&
      "code" in error &&
      ["53300", "57P03", "57014", "55P03", "40P01", "ECONNREFUSED"].includes(
        String(error.code),
      )
    ) {
      status = 503;
      code = "SERVICE_UNAVAILABLE";
    }
    if (status === 429 || status === 503)
      reply.header("Retry-After", status === 429 ? 60 : 5);
    reply
      .header("Cache-Control", "no-store")
      .status(status)
      .send({
        error: {
          code,
          message_key: "api.errors." + code.toLowerCase(),
          request_id: request.id,
        },
      });
  });
  api.post(
    "/api/v1/auth/guest",
    { bodyLimit: 8192 },
    async (request, reply) => {
      if (!validate("GuestRequest", request.body))
        throw new Fault(422, "INVALID_REQUEST");
      let auth = auths.get(request),
        token = readCookie(request),
        created = false;
      if (!auth) {
        const result = await sessions.guest(
          preferredLocale([
            (request.headers["accept-language"] ?? "en")
              .split(",")[0]!
              .split(";")[0]!,
          ]),
        );
        auth = result.session;
        token = result.token;
        created = true;
      }
      setCookie(reply, token!, auth);
      reply.header("X-CSRF-Token", auth.csrfToken);
      return reply
        .status(created ? 201 : 200)
        .send(checked("PlayerSummary", await sessions.summary(auth)));
    },
  );
  const clearCookie = (reply: FastifyReply) =>
    reply
      .removeHeader("Set-Cookie")
      .header(
        "Set-Cookie",
        `${cookieName}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${origin.protocol === "https:" ? "; Secure" : ""}`,
      );
  const checkedBody = (name: SchemaName, request: FastifyRequest) => {
    if (!validate(name, request.body)) throw new Fault(422, "INVALID_REQUEST");
    return request.body as Record<string, string>;
  };
  api.get("/api/v1/me", async (request) =>
    checked("PlayerSummary", await sessions.summary(session(request))),
  );
  api.patch("/api/v1/me", { bodyLimit: 8192 }, async (request) => {
    if (!validate("UpdateProfileRequest", request.body))
      throw new Fault(422, "INVALID_REQUEST");
    return checked(
      "PlayerSummary",
      await sessions.updateProfile(
        session(request),
        request.body as components["schemas"]["UpdateProfileRequest"],
      ),
    );
  });

  api.get("/api/v1/me/privacy", async (request) =>
    checked("PrivacyStatus", await privacy.status(session(request))),
  );
  api.post("/api/v1/me/export", { bodyLimit: 8192 }, async (request) => {
    if (!validate("PrivacyExportRequest", request.body))
      throw new Fault(422, "INVALID_REQUEST");
    const body = request.body as components["schemas"]["PrivacyExportRequest"];
    return checked(
      "PrivacyExportPage",
      await privacy.exportPage(session(request), body.cursor),
    );
  });
  api.post(
    "/api/v1/me/delete-request",
    { bodyLimit: 8192 },
    async (request, reply) => {
      checkedBody("DeletionConsent", request);
      const auth = session(request),
        result = await privacy.requestDeletion(auth);
      if (result) {
        setCookie(reply, result.token, result.session);
        reply.header("X-CSRF-Token", result.session.csrfToken);
      }
      return reply
        .status(202)
        .send(
          checked(
            "PrivacyStatus",
            await privacy.status(result?.session ?? auth),
          ),
        );
    },
  );
  api.delete("/api/v1/me/delete-request", async (request) =>
    checked("PrivacyStatus", await privacy.cancelDeletion(session(request))),
  );
  api.post(
    "/api/v1/me/nickname-appeal",
    { bodyLimit: 8192 },
    async (request) => {
      checkedBody("EmptyRequest", request);
      return checked("PrivacyStatus", await privacy.appeal(session(request)));
    },
  );
  api.get("/api/v1/auth/google/config", async () =>
    checked("GoogleConfig", { client_id: options.google?.clientId ?? null }),
  );
  api.post(
    "/api/v1/auth/google/challenge",
    { bodyLimit: 8192 },
    async (request) => {
      if (!verifyGoogle) throw new Fault(503, "GOOGLE_UNAVAILABLE");
      const body = checkedBody("GoogleChallengeRequest", request);
      const purpose = body[
        "purpose"
      ] as components["schemas"]["GoogleChallengeRequest"]["purpose"];
      return checked("GoogleChallenge", {
        nonce: await account().googleChallenge(session(request), purpose),
      });
    },
  );
  const useRotatedSession = async (
    reply: FastifyReply,
    result: Awaited<ReturnType<Sessions["issue"]>>,
  ) => {
    setCookie(reply, result.token, result.session);
    reply.header("X-CSRF-Token", result.session.csrfToken);
    return checked("PlayerSummary", await sessions.summary(result.session));
  };
  for (const [path, purpose] of [
    ["/api/v1/auth/google", "SIGN_IN"],
    ["/api/v1/auth/link", "LINK"],
    ["/api/v1/auth/google/reauth", "REAUTH"],
  ] as const) {
    api.post(path, { bodyLimit: 8192 }, async (request, reply) => {
      if (!verifyGoogle) throw new Fault(503, "GOOGLE_UNAVAILABLE");
      const body = checkedBody("GoogleCredential", request);
      const result = await account().google(
        session(request),
        purpose,
        await verifyGoogle(body["id_token"]!),
      );
      return result
        ? useRotatedSession(reply, result)
        : reply.status(204).send();
    });
  }
  api.post(
    "/api/v1/auth/merge/preview",
    { bodyLimit: 8192 },
    async (request) => {
      if (!validate("MergePreviewRequest", request.body))
        throw new Fault(422, "INVALID_REQUEST");
      const body = request.body as components["schemas"]["MergePreviewRequest"];
      const auth = session(request);
      await rateLimit(
        options.pool,
        "merge-proof-ip",
        createHmac("sha256", rateSecret).update(request.ip).digest(),
        30,
        options.clock,
      );
      if (body.method === "EMAIL") {
        await rateLimit(
          options.pool,
          "password-login",
          createHmac("sha256", rateSecret)
            .update(body.email.trim().toLowerCase())
            .digest(),
          10,
          options.clock,
        );
        const candidate = await uniform(() =>
          account().provePassword(body.email, body.password),
        );
        return checked(
          "MergePreview",
          await merges.preview(auth, {
            method: "EMAIL",
            playerId: candidate.player_id,
            passwordDigest: candidate.digest,
          }),
        );
      }
      if (!verifyGoogle) throw new Fault(503, "GOOGLE_UNAVAILABLE");
      return checked(
        "MergePreview",
        await merges.preview(auth, {
          method: "GOOGLE",
          credential: await verifyGoogle(body.id_token),
        }),
      );
    },
  );
  api.post(
    "/api/v1/auth/merge/confirm",
    { bodyLimit: 8192 },
    async (request, reply) => {
      const body = checkedBody("MergeConfirmRequest", request);
      const auth = session(request);
      const result = await merges.confirm(auth, body["merge_nonce"]!);
      return result
        ? useRotatedSession(reply, result)
        : checked("PlayerSummary", await sessions.summary(auth));
    },
  );
  api.delete("/api/v1/auth/google/link", async (request, reply) =>
    useRotatedSession(reply, await account().unlinkGoogle(session(request))),
  );
  api.post(
    "/api/v1/auth/register",
    { bodyLimit: 8192 },
    async (request, reply) => {
      const body = checkedBody("RegisterRequest", request);
      await uniform(() =>
        account().register(session(request), {
          email: body["email"]!,
          password: body["password"]!,
          ...(body["nickname"] ? { nickname: body["nickname"] } : {}),
          ...(body["locale"]
            ? { locale: body["locale"] as "pt-BR" | "en" }
            : {}),
        }),
      );
      return reply
        .status(202)
        .send(checked("AuthAccepted", { status: "ACCEPTED" }));
    },
  );
  api.post(
    "/api/v1/auth/verify-email/resend",
    { bodyLimit: 8192 },
    async (request, reply) => {
      const body = checkedBody("ResendEmailRequest", request);
      await uniform(() =>
        account().resend(
          session(request),
          body["locale"] as "pt-BR" | "en" | undefined,
        ),
      );
      return reply
        .status(202)
        .send(checked("AuthAccepted", { status: "ACCEPTED" }));
    },
  );
  api.post(
    "/api/v1/auth/verify-email",
    { bodyLimit: 8192 },
    async (request, reply) => {
      const body = checkedBody("AuthTokenRequest", request),
        result = await account().verifyEmail(session(request), body["token"]!);
      setCookie(reply, result.token, result.session);
      reply.header("X-CSRF-Token", result.session.csrfToken);
      return reply.status(204).send();
    },
  );
  api.post(
    "/api/v1/auth/login",
    { bodyLimit: 8192 },
    async (request, reply) => {
      const body = checkedBody("EmailLoginRequest", request);
      await rateLimit(
        options.pool,
        "password-login",
        createHmac("sha256", rateSecret)
          .update(body["email"]!.trim().toLowerCase())
          .digest(),
        10,
        options.clock,
      );
      const result = await uniform(() =>
        account().login(body["email"]!, body["password"]!, auths.get(request)),
      );
      setCookie(reply, result.token, result.session);
      reply.header("X-CSRF-Token", result.session.csrfToken);
      return checked("PlayerSummary", await sessions.summary(result.session));
    },
  );
  api.post(
    "/api/v1/auth/password/forgot",
    { bodyLimit: 8192 },
    async (request, reply) => {
      const body = checkedBody("ForgotPasswordRequest", request);
      await uniform(() => account().forgot(body["email"]!));
      return reply
        .status(202)
        .send(checked("AuthAccepted", { status: "ACCEPTED" }));
    },
  );
  api.post(
    "/api/v1/auth/password/reset",
    { bodyLimit: 8192 },
    async (request, reply) => {
      const body = checkedBody("ResetPasswordRequest", request);
      await uniform(() =>
        account().reset(body["token"]!, body["new_password"]!),
      );
      return reply.status(204).send();
    },
  );
  api.post(
    "/api/v1/auth/reauth",
    { bodyLimit: 8192 },
    async (request, reply) => {
      const body = checkedBody("ReauthRequest", request);
      await uniform(() =>
        account().reauth(session(request), body["password"]!),
      );
      return reply.status(204).send();
    },
  );
  api.post(
    "/api/v1/auth/logout",
    { bodyLimit: 8192 },
    async (request, reply) => {
      checkedBody("EmptyRequest", request);
      if (auths.has(request)) await account().logout(session(request));
      clearCookie(reply);
      return reply.status(204).send();
    },
  );
  api.get("/api/v1/me/sessions", async (request) =>
    checked("AccountSessions", await account().list(session(request))),
  );
  api.delete<{ Params: { session_id: string } }>(
    "/api/v1/me/sessions/:session_id",
    async (request, reply) => {
      if (!uuid.test(request.params.session_id))
        throw new Fault(422, "INVALID_REQUEST");
      await account().revoke(session(request), request.params.session_id);
      if (request.params.session_id === session(request).sessionId)
        clearCookie(reply);
      return reply.status(204).send();
    },
  );
  api.post(
    "/api/v1/runs/start",
    { bodyLimit: 8192 },
    async (request, reply) => {
      const result = await runs.start(
        session(request).playerId,
        request.body,
        (request.headers["idempotency-key"] as string) ?? "",
        session(request).sessionId,
      );
      return reply
        .status(result.created ? 201 : 200)
        .send(checked("RunTicket", result.ticket));
    },
  );
  api.put<{ Params: { run_id: string; index: string } }>(
    "/api/v1/runs/:run_id/segments/:index",
    async (request, reply) => {
      const index = integerHeader(request.params.index),
        start = integerHeader(
          request.headers["x-start-tick"] as string | undefined,
        ),
        end = integerHeader(
          request.headers["x-end-tick"] as string | undefined,
        );
      const expected = request.headers["x-segment-hash"],
        previous = request.headers["x-previous-segment-hash"];
      if (
        typeof expected !== "string" ||
        !hash.test(expected) ||
        (previous !== undefined &&
          (typeof previous !== "string" || !hash.test(previous)))
      )
        throw new Fault(422, "INVALID_SEGMENT_HEADERS");
      if (!Buffer.isBuffer(request.body))
        throw new Fault(415, "UNSUPPORTED_MEDIA_TYPE");
      const encoding = request.headers["content-encoding"] ?? "identity";
      if (typeof encoding !== "string")
        throw new Fault(415, "UNSUPPORTED_ENCODING");
      const { segment, decodedSize } = await decodeTransport(
        request.body,
        encoding,
      );
      if (
        segment.run_id !== request.params.run_id ||
        segment.index !== index ||
        segment.start_tick !== start ||
        segment.end_tick !== end ||
        (previous ?? null) !== segment.previous_hash
      )
        throw new Fault(422, "INVALID_SEGMENT_HEADERS");
      const actual = await segmentHash(segment);
      if (actual !== expected) throw new Fault(422, "SEGMENT_HASH_MISMATCH");
      const result = await runs.put(
        session(request).playerId,
        segment,
        actual,
        request.body,
        encoding as "identity" | "gzip",
        decodedSize,
      );
      return reply.status(result.created ? 201 : 200).send(
        checked("SegmentAck", {
          run_id: segment.run_id,
          index,
          segment_hash: actual,
          persisted: true,
        }),
      );
    },
  );
  api.post<{ Params: { run_id: string } }>(
    "/api/v1/runs/:run_id/finish",
    { bodyLimit: 8192 },
    async (request, reply) =>
      reply
        .status(202)
        .send(
          checked(
            "RunStatus",
            await runs.finish(
              session(request).playerId,
              request.params.run_id,
              request.body,
            ),
          ),
        ),
  );
  api.get("/api/v1/me/bosses", async (request) => {
    const player = auths.get(request)!.playerId;
    const seals = (
      await options.pool.query(
        "SELECT boss_id FROM player_boss_seals WHERE player_id=$1 ORDER BY boss_id",
        [player],
      )
    ).rows.map((v) => v.boss_id);
    const rewards = (
      await options.pool.query(
        "SELECT reward_id FROM player_rewards WHERE player_id=$1 ORDER BY reward_id",
        [player],
      )
    ).rows.map((v) => v.reward_id);
    return checked("BossProgress", { seals, rewards });
  });
  api.get("/api/v1/me/regions", async (request) =>
    checked("RegionUnlocks", {
      unlocked_regions: (await sessions.summary(session(request)))
        .region_unlocks,
    }),
  );
  api.get<{ Params: { run_id: string } }>(
    "/api/v1/runs/:run_id",
    async (request) =>
      checked(
        "RunStatus",
        await runs.status(session(request).playerId, request.params.run_id),
      ),
  );
  api.get<{ Params: { run_id: string } }>(
    "/api/v1/runs/:run_id/manifest",
    async (request) =>
      checked(
        "RunManifest",
        await runs.getManifest(
          session(request).playerId,
          request.params.run_id,
        ),
      ),
  );
  return api;
}
