import Fastify from "fastify";
import type { FastifyRequest, FastifyReply } from "fastify";
import { randomBytes, randomUUID, createHmac } from "node:crypto";
import type { Pool } from "pg";
import { schema, validate } from "@ronin/contracts";
import type { SchemaName } from "@ronin/contracts";
import { parseJson } from "@ronin/contracts/canonical";
import { segmentHash } from "@ronin/contracts/replay";
import {
  decodeTransport,
  TransportError,
} from "@ronin/contracts/node-transport";
import { preferredLocale } from "@ronin/content";
import { Runs, Sessions, Fault, rateLimit } from "@ronin/data";
import type { Session, Clock, ResourcePolicy } from "@ronin/data";
import { CURRENT_MANIFEST } from "@ronin/content/runner-manifest";
import type { RunnerManifest } from "@ronin/content/runner-manifest";
export interface ApiOptions {
  manifest?: RunnerManifest;
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
  const cookieName = origin.protocol === "https:" ? "__Host-rr_sid" : "rr_sid";
  const readCookie = (request: FastifyRequest) => cookie(request, cookieName);
  const auths = new WeakMap<FastifyRequest, Session>();
  const session = (request: FastifyRequest) => {
    const value = auths.get(request);
    if (!value) throw new Fault(401, "SESSION_REQUIRED");
    return value;
  };
  const setCookie = (reply: FastifyReply, token: string, auth: Session) =>
    reply.header(
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
    const token = readCookie(request);
    if (!token) throw new Fault(401, "SESSION_REQUIRED");
    const auth = await sessions.read(token);
    auths.set(request, auth);
    if (request.method !== "GET")
      sessions.checkCsrf(
        auth,
        request.headers["x-csrf-token"] as string | undefined,
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
  api.post(
    "/api/v1/runs/start",
    { bodyLimit: 8192 },
    async (request, reply) => {
      const result = await runs.start(
        session(request).playerId,
        request.body,
        (request.headers["idempotency-key"] as string) ?? "",
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
