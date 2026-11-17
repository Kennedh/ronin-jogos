/** Named synthetic cluster only. Production wiring belongs to the deployment phase. */
import { Pool } from "pg";
export function developmentPool() {
  if (
    process.env["DATABASE_URL"] &&
    process.env["DATABASE_URL"] !==
      "postgresql://ronin_dev:ronin_dev@127.0.0.1:15432/postgres"
  )
    throw new Error("external_database_not_authorized_for_dev_command");
  return new Pool({
    host: "127.0.0.1",
    port: 15432,
    user: "ronin_dev",
    password: "ronin_dev",
    database: "postgres",
    max: 4,
    connectionTimeoutMillis: 10000,
  });
}
