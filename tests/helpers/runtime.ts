import assert from "node:assert/strict";
import type { Pool } from "pg";
import { randomUUID } from "node:crypto";
import { gzipSync } from "node:zlib";
import { createApi } from "../../apps/api/src/index.ts";
import type { ApiOptions } from "../../apps/api/src/index.ts";
import { encodeSegment, segmentHash } from "@ronin/contracts/replay";
import type { ReplaySegment } from "@ronin/contracts/replay";
import type { components } from "@ronin/contracts";
import { validate } from "@ronin/contracts";
export type Ticket = components["schemas"]["RunTicket"];
export interface Client {
  cookie: string;
  csrf: string;
  playerId: string;
}
export function harness(
  pool: Pool,
  clock: () => Date,
  policy?: ApiOptions["policy"],
) {
  const api = createApi({
    pool,
    clock,
    origin: "https://play.ronin.dev.br",
    rateSecret: Buffer.alloc(32, 7),
    ...(policy ? { policy } : {}),
  });
  const base = {
    host: "play.ronin.dev.br",
    origin: "https://play.ronin.dev.br",
  };
  const headers = (client?: Client) => ({
    ...base,
    ...(client ? { cookie: client.cookie, "x-csrf-token": client.csrf } : {}),
  });
  async function guest(language = "pt-BR"): Promise<Client> {
    const response = await api.inject({
      method: "POST",
      url: "/api/v1/auth/guest",
      headers: { ...base, "accept-language": language },
      payload: {},
    });
    assert.equal(response.statusCode, 201, response.body);
    assert.equal(validate("PlayerSummary", response.json()), true);
    const value = String(response.headers["set-cookie"]);
    assert.match(value, /^__Host-rr_sid=/);
    assert.match(value, /HttpOnly/);
    assert.match(value, /Secure/);
    assert.match(value, /SameSite=Lax/);
    assert.doesNotMatch(value, /Domain=/);
    return {
      cookie: value.split(";")[0]!,
      csrf: String(response.headers["x-csrf-token"]),
      playerId: response.json().player_id,
    };
  }
  async function start(
    client: Client,
    key = randomUUID(),
    body: Record<string, unknown> = { mode: "FULL" },
  ): Promise<Ticket> {
    const response = await api.inject({
      method: "POST",
      url: "/api/v1/runs/start",
      headers: { ...headers(client), "idempotency-key": key },
      payload: body,
    });
    assert.equal(response.statusCode, 201, response.body);
    assert.equal(validate("RunTicket", response.json()), true);
    return response.json() as Ticket;
  }
  async function upload(
    client: Client,
    segment: ReplaySegment,
    encoding: "identity" | "gzip" = "identity",
  ) {
    const bytes = encodeSegment(segment),
      payload = encoding === "gzip" ? gzipSync(bytes) : Buffer.from(bytes);
    return api.inject({
      method: "PUT",
      url: `/api/v1/runs/${segment.run_id}/segments/${segment.index}`,
      headers: {
        ...headers(client),
        "content-type": "application/octet-stream",
        "content-encoding": encoding,
        "x-start-tick": String(segment.start_tick),
        "x-end-tick": String(segment.end_tick),
        "x-segment-hash": await segmentHash(segment),
        ...(segment.previous_hash
          ? { "x-previous-segment-hash": segment.previous_hash }
          : {}),
      },
      payload,
    });
  }
  async function finish(
    client: Client,
    segment: ReplaySegment,
    endReason: "QUIT" | "HP_ZERO" | "ABYSS" = "QUIT",
  ) {
    return api.inject({
      method: "POST",
      url: `/api/v1/runs/${segment.run_id}/finish`,
      headers: headers(client),
      payload: {
        final_segment_index: segment.index,
        final_tick: segment.end_tick,
        final_hash: await segmentHash(segment),
        end_reason: endReason,
      },
    });
  }
  async function status(client: Client, id: string) {
    const response = await api.inject({
      url: `/api/v1/runs/${id}`,
      headers: headers(client),
    });
    assert.equal(response.statusCode, 200, response.body);
    assert.equal(validate("RunStatus", response.json()), true);
    return response.json() as components["schemas"]["RunStatus"];
  }
  return { api, base, headers, guest, start, upload, finish, status };
}
export function part(
  ticket: Pick<Ticket, "run_id">,
  end = 60,
  quit = true,
): ReplaySegment {
  return {
    protocol: "rr-input-v1",
    run_id: ticket.run_id,
    index: 0,
    start_tick: 0,
    end_tick: end,
    previous_hash: null,
    actions: [],
    controls: quit ? [{ tick: end, sequence: 0, action: "QUIT" }] : [],
  };
}
