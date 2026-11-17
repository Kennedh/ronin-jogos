/** Test-only child: credentials arrive over IPC, never argv or logs. */
import { Pool } from "pg";
import { VerificationQueue } from "@ronin/data";
import { runOnce } from "@ronin/verifier";
process.once("message", async (value: unknown) => {
  const config = value as { port: number; password: string };
  if (
    !config ||
    !Number.isInteger(config.port) ||
    config.port < 1024 ||
    config.port > 65535 ||
    typeof config.password !== "string"
  )
    throw new Error("invalid_qa_process_config");
  const pool = new Pool({
    host: "127.0.0.1",
    port: config.port,
    user: "ronin_test",
    password: config.password,
    database: "postgres",
    max: 1,
    connectionTimeoutMillis: 5000,
  });
  try {
    const result = await runOnce(new VerificationQueue(pool));
    await pool.end();
    process.send?.({ result }, () => process.disconnect());
  } catch {
    await pool.end();
    process.exitCode = 1;
    process.stderr.write("qa_verifier_process_failed\n");
    process.disconnect();
  }
});
