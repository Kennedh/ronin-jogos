import { trackPoolClose } from "./pool-close.ts";
import LocalPostgres from "../../scripts/local-postgres.ts";
import { mkdtemp, realpath, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, sep } from "node:path";
import { createServer } from "node:net";
import { randomBytes } from "node:crypto";
import { Pool } from "pg";
export async function testPostgres() {
  const root = await realpath(tmpdir());
  const dir = await mkdtemp(join(root, "ronin-qa-pg-"));
  const server = createServer();
  await new Promise<void>((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("no_test_port");
  const port = address.port;
  await new Promise<void>((resolve, reject) =>
    server.close((e) => (e ? reject(e) : resolve())),
  );
  const password = randomBytes(24).toString("hex");
  // The launcher rejects with undefined when postgres exits before readiness.
  // Preserve bounded native diagnostics without ever exposing the random password.
  let diagnostic = "";
  let phase = "initialise";
  const record = (message: unknown) => {
    diagnostic = (
      diagnostic + String(message).replaceAll(password, "[redacted]")
    ).slice(-16384);
  };
  const pg = new LocalPostgres({
    databaseDir: join(dir, "data"),
    user: "ronin_test",
    password,
    port,
    persistent: true,
    authMethod: "scram-sha-256",
    createPostgresUser: false,
    postgresFlags: [
      "-h",
      "127.0.0.1",
      "-c",
      "max_connections=12",
      "-c",
      "shared_buffers=16MB",
    ],
    initdbFlags: ["--encoding=UTF8", "--locale=C"],
    onLog: record,
    onError: record,
  });
  let closePool: (() => Promise<void>) | undefined;
  let started = false;
  async function close() {
    await closePool?.();
    if (started) await pg.stop();
    const target = await realpath(dir);
    if (!target.startsWith(root + sep) || !target.includes("ronin-qa-pg-"))
      throw new Error("unsafe_qa_path");
    // Windows may briefly retain the stopped server log handle (or scan it).
    // Retry only transient filesystem cleanup; a persistent lock still fails QA.
    await rm(target, {
      recursive: true,
      force: false,
      maxRetries: 5,
      retryDelay: 100,
    });
  }
  try {
    await pg.initialise();
    phase = "start";
    await pg.start();
    started = true;
    const pool = new Pool({
      host: "127.0.0.1",
      port,
      user: "ronin_test",
      password,
      database: "postgres",
      max: 4,
      connectionTimeoutMillis: 10000,
    });
    closePool = trackPoolClose(pool);
    phase = "connect";
    await pool.query("SELECT 1");
    return { pool, close, port, cluster: pg };
  } catch (e) {
    await close();
    throw new Error(`qa_postgres_${phase}_failed: ${diagnostic}`, { cause: e });
  }
}
