import { validate } from "@ronin/contracts";
import type { components, SchemaName } from "@ronin/contracts";
import type { ReplaySegment, FinishRequest } from "@ronin/contracts/replay";
import { loadManifest } from "@ronin/content/runner-manifest";
export type RunTicket = components["schemas"]["RunTicket"];
export type RunStatus = components["schemas"]["RunStatus"];
export class ClientError extends Error {
  readonly code: string;
  readonly status: number;
  readonly retryAfter: number;
  constructor(code: string, status = 0, retryAfter = 0) {
    super(code);
    this.code = code;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}
/** Same-origin only. Cookie is HttpOnly; CSRF and identity remain in memory. */
export class RunnerApi {
  private csrf = "";
  playerId = "";
  readonly fetcher: typeof fetch;
  constructor(fetcher: typeof fetch = globalThis.fetch.bind(globalThis)) {
    this.fetcher = fetcher;
  }
  private async request(
    path: string,
    method: string,
    schema: SchemaName | undefined,
    body?: BodyInit,
    headers: Record<string, string> = {},
  ) {
    const abort = new AbortController(),
      timeout = setTimeout(() => abort.abort(), 15000);
    try {
      const response = await this.fetcher("/api/v1" + path, {
        method,
        credentials: "same-origin",
        cache: "no-store",
        signal: abort.signal,
        headers: {
          ...(method !== "GET" ? { "x-csrf-token": this.csrf } : {}),
          ...headers,
        },
        ...(body === undefined ? {} : { body }),
      });
      if (!response.ok) {
        let code = "SERVICE_UNAVAILABLE";
        try {
          const error = (await response.json()) as {
            error?: { code?: unknown };
          };
          if (typeof error.error?.code === "string") code = error.error.code;
        } catch {
          /* Generic failure, never display response HTML. */
        }
        throw new ClientError(
          code,
          response.status,
          Math.min(
            300,
            Math.max(0, Number(response.headers.get("retry-after")) || 0),
          ),
        );
      }
      const refreshedCsrf = response.headers.get("x-csrf-token");
      if (refreshedCsrf) this.csrf = refreshedCsrf;
      if (response.status === 204) return undefined;
      const value: unknown = await response.json();
      if (!schema || !validate(schema, value))
        throw new ClientError("INVALID_SERVER_RESPONSE");
      const csrf = response.headers.get("x-csrf-token");
      if (csrf) this.csrf = csrf;
      return value;
    } catch (error) {
      if (error instanceof ClientError) throw error;
      throw new ClientError("NETWORK_UNAVAILABLE");
    } finally {
      clearTimeout(timeout);
    }
  }
  async profile() {
    return (await this.request(
      "/me",
      "GET",
      "PlayerSummary",
    )) as components["schemas"]["PlayerSummary"];
  }
  async updateProfile(input: components["schemas"]["UpdateProfileRequest"]) {
    return (await this.request(
      "/me",
      "PATCH",
      "PlayerSummary",
      JSON.stringify(input),
      { "content-type": "application/json" },
    )) as components["schemas"]["PlayerSummary"];
  }

  async googleConfig() {
    return (await this.request(
      "/auth/google/config",
      "GET",
      "GoogleConfig",
    )) as components["schemas"]["GoogleConfig"];
  }
  async googleChallenge(
    purpose: components["schemas"]["GoogleChallengeRequest"]["purpose"],
  ) {
    return (await this.request(
      "/auth/google/challenge",
      "POST",
      "GoogleChallenge",
      JSON.stringify({ purpose }),
      { "content-type": "application/json" },
    )) as components["schemas"]["GoogleChallenge"];
  }
  async googleAuth(
    purpose: components["schemas"]["GoogleChallengeRequest"]["purpose"],
    token: string,
  ) {
    const path = {
      SIGN_IN: "/auth/google",
      LINK: "/auth/link",
      REAUTH: "/auth/google/reauth",
    }[purpose];
    const profile = (await this.request(
      path,
      "POST",
      "PlayerSummary",
      JSON.stringify({ id_token: token }),
      { "content-type": "application/json" },
    )) as components["schemas"]["PlayerSummary"] | undefined;
    if (profile) this.playerId = profile.player_id;
    return profile;
  }
  async unlinkGoogle() {
    return (await this.request(
      "/auth/google/link",
      "DELETE",
      "PlayerSummary",
    )) as components["schemas"]["PlayerSummary"];
  }
  async register(input: components["schemas"]["RegisterRequest"]) {
    await this.request(
      "/auth/register",
      "POST",
      "AuthAccepted",
      JSON.stringify(input),
      { "content-type": "application/json" },
    );
  }
  async resendEmail(locale?: "pt-BR" | "en") {
    await this.request(
      "/auth/verify-email/resend",
      "POST",
      "AuthAccepted",
      JSON.stringify(locale ? { locale } : {}),
      { "content-type": "application/json" },
    );
  }
  async verifyEmail(token: string) {
    await this.request(
      "/auth/verify-email",
      "POST",
      undefined,
      JSON.stringify({ token }),
      { "content-type": "application/json" },
    );
  }
  async login(email: string, password: string) {
    const value = (await this.request(
      "/auth/login",
      "POST",
      "PlayerSummary",
      JSON.stringify({ email, password }),
      { "content-type": "application/json", "x-ronin-auth": "1" },
    )) as components["schemas"]["PlayerSummary"];
    this.playerId = value.player_id;
    return value;
  }
  async forgot(email: string) {
    await this.request(
      "/auth/password/forgot",
      "POST",
      "AuthAccepted",
      JSON.stringify({ email }),
      { "content-type": "application/json", "x-ronin-auth": "1" },
    );
  }
  async resetPassword(token: string, new_password: string) {
    await this.request(
      "/auth/password/reset",
      "POST",
      undefined,
      JSON.stringify({ token, new_password }),
      { "content-type": "application/json", "x-ronin-auth": "1" },
    );
  }
  async reauth(password: string) {
    await this.request(
      "/auth/reauth",
      "POST",
      undefined,
      JSON.stringify({ password }),
      { "content-type": "application/json" },
    );
  }
  async accountSessions() {
    return (await this.request(
      "/me/sessions",
      "GET",
      "AccountSessions",
    )) as components["schemas"]["AccountSessions"];
  }
  async revokeSession(id: string) {
    await this.request(
      "/me/sessions/" + encodeURIComponent(id),
      "DELETE",
      undefined,
    );
  }
  async logout() {
    await this.request("/auth/logout", "POST", undefined, "{}", {
      "content-type": "application/json",
      "x-ronin-auth": "1",
    });
    this.playerId = "";
    this.csrf = "";
  }
  async guest(locale?: "pt-BR" | "en") {
    const value = (await this.request(
      "/auth/guest",
      "POST",
      "PlayerSummary",
      "{}",
      {
        "content-type": "application/json",
        ...(locale ? { "accept-language": locale } : {}),
      },
    )) as components["schemas"]["PlayerSummary"];
    if (this.playerId && this.playerId !== value.player_id)
      throw new ClientError("SESSION_CHANGED", 401);
    this.playerId = value.player_id;
    return value;
  }
  async bosses() {
    return (await this.request(
      "/me/bosses",
      "GET",
      "BossProgress",
    )) as components["schemas"]["BossProgress"];
  }
  async start(
    key: string,
    mode: "FULL" | "REGIONAL" = "FULL",
    region: RunTicket["starting_region_id"] = "BAMBOO",
  ) {
    const ticket = (await this.request(
      "/runs/start",
      "POST",
      "RunTicket",
      JSON.stringify(mode === "FULL" ? { mode } : { mode, region_id: region }),
      { "content-type": "application/json", "idempotency-key": key },
    )) as RunTicket;
    if (
      ticket.mode !== mode ||
      ticket.starting_region_id !== (mode === "FULL" ? "BAMBOO" : region)
    )
      throw new ClientError("RULES_MISMATCH");
    return ticket;
  }
  async manifest(ticket: RunTicket) {
    const value = (await this.request(
      `/runs/${ticket.run_id}/manifest`,
      "GET",
      "RunManifest",
    )) as components["schemas"]["RunManifest"];
    if (value.manifest_hash !== ticket.versions.rules_manifest_hash)
      throw new ClientError("RULES_MISMATCH");
    const manifest = await loadManifest(
      value.manifest,
      value.manifest_hash,
    ).catch(() => {
      throw new ClientError("RULES_MISMATCH");
    });
    for (const key of [
      "rules_major",
      "rules_patch",
      "generator_version",
      "scoring_version",
      "replay_protocol_version",
      "assets_manifest_version",
    ] as const)
      if (manifest[key] !== ticket.versions[key])
        throw new ClientError("RULES_MISMATCH");
    return manifest;
  }
  async upload(segment: ReplaySegment, hash: string, bytes: Uint8Array) {
    const ack = await this.request(
      `/runs/${segment.run_id}/segments/${segment.index}`,
      "PUT",
      "SegmentAck",
      new Blob([Uint8Array.from(bytes)], { type: "application/octet-stream" }),
      {
        "content-type": "application/octet-stream",
        "x-start-tick": String(segment.start_tick),
        "x-end-tick": String(segment.end_tick),
        "x-segment-hash": hash,
        ...(segment.previous_hash
          ? { "x-previous-segment-hash": segment.previous_hash }
          : {}),
      },
    );
    const value = ack as components["schemas"]["SegmentAck"];
    if (
      value.run_id !== segment.run_id ||
      value.index !== segment.index ||
      value.segment_hash !== hash
    )
      throw new ClientError("INVALID_SERVER_RESPONSE");
    return value;
  }
  async finish(id: string, finish: FinishRequest) {
    const value = (await this.request(
      `/runs/${id}/finish`,
      "POST",
      "RunStatus",
      JSON.stringify(finish),
      { "content-type": "application/json" },
    )) as RunStatus;
    if (value.run_id !== id) throw new ClientError("INVALID_SERVER_RESPONSE");
    return value;
  }
  async status(id: string) {
    const value = (await this.request(
      `/runs/${id}`,
      "GET",
      "RunStatus",
    )) as RunStatus;
    if (value.run_id !== id) throw new ClientError("INVALID_SERVER_RESPONSE");
    return value;
  }
}
