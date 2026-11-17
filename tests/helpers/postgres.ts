import EmbeddedPostgres from "embedded-postgres";
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
  const pg = new EmbeddedPostgres({
    databaseDir: dir,
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
    onLog: () => {},
    onError: () => {},
  });
  let pool: Pool | undefined;
  let started = false;
  async function close() {
    await pool?.end();
    if (started) await pg.stop();
    const target = await realpath(dir);
    if (!target.startsWith(root + sep) || !target.includes("ronin-qa-pg-"))
      throw new Error("unsafe_qa_path");
    await rm(target, { recursive: true, force: false });
  }
  try {
    await pg.initialise();
    await pg.start();
    started = true;
    pool = new Pool({
      host: "127.0.0.1",
      port,
      user: "ronin_test",
      password,
      database: "postgres",
      max: 4,
      connectionTimeoutMillis: 10000,
    });
    await pool.query("SELECT 1");
    return { pool, close, port };
  } catch (e) {
    await close();
    throw e;
  }
}
