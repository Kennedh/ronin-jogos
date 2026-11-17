/** Local development only: fixed synthetic credentials, no external DB URL accepted. */
import EmbeddedPostgres from "embedded-postgres";
import { Pool } from "pg";
import { mkdir, realpath, stat } from "node:fs/promises";
import { resolve, join } from "node:path";
import { migrate } from "@ronin/data";
const expected = resolve("artifacts");
await mkdir(expected, { recursive: true });
if ((await realpath(expected)) !== expected)
  throw new Error("symlinked_dev_root");
const dir = join(expected, "dev-postgres");
await mkdir(dir, { recursive: true });
if ((await realpath(dir)) !== dir) throw new Error("symlinked_dev_cluster");
const pg = new EmbeddedPostgres({
  databaseDir: dir,
  user: "ronin_dev",
  password: "ronin_dev",
  port: 15432,
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
let started = false;
let pool: Pool | undefined;
try {
  const exists = await stat(join(dir, "PG_VERSION")).then(
    () => true,
    () => false,
  );
  if (!exists) await pg.initialise();
  await pg.start();
  started = true;
  pool = new Pool({
    host: "127.0.0.1",
    port: 15432,
    user: "ronin_dev",
    password: "ronin_dev",
    database: "postgres",
    max: 4,
  });
  await migrate(pool);
  console.log(
    "PostgreSQL dev: 127.0.0.1:15432; credenciais fictícias em .env.example. Ctrl+C encerra somente este processo; dados em artifacts/dev-postgres.",
  );
  if (!process.argv.includes("--check"))
    await new Promise<void>((done) => {
      process.once("SIGINT", done);
      process.once("SIGTERM", done);
    });
} finally {
  await pool?.end();
  if (started) await pg.stop();
}
