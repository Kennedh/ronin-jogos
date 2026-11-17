import { readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import type { Pool } from "pg";
export interface Migration {
  id: string;
  sql: string;
}
export async function migrationFiles(): Promise<Migration[]> {
  const root = new URL("../migrations/", import.meta.url);
  const files = (await readdir(root)).filter((f) => f.endsWith(".sql")).sort();
  return Promise.all(
    files.map(async (f) => ({
      id: f.slice(0, -4),
      sql: await readFile(new URL(f, root), "utf8"),
    })),
  );
}
export function checksum(sql: string): string {
  return createHash("sha256")
    .update(sql.replaceAll("\r\n", "\n"))
    .digest("hex");
}
export async function migrate(
  pool: Pool,
  files?: readonly Migration[],
): Promise<string[]> {
  const migrations = files ?? (await migrationFiles());
  for (let i = 0; i < migrations.length; i++)
    if (
      !/^[0-9]{3}_[a-z0-9_]+$/.test(migrations[i]!.id) ||
      (i > 0 && migrations[i - 1]!.id >= migrations[i]!.id)
    )
      throw new Error("invalid_migration_order");
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SET LOCAL lock_timeout='10s'");
    await client.query("SET LOCAL statement_timeout='30s'");
    await client.query("SELECT pg_advisory_xact_lock(17017,1)");
    // Only the runner metadata bootstraps conditionally. Domain SQL never hides drift.
    await client.query(
      "CREATE TABLE IF NOT EXISTS schema_migrations (id text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())",
    );
    const applied = await client.query<{ id: string; checksum: string }>(
      "SELECT id,checksum FROM schema_migrations ORDER BY id",
    );
    for (let i = 0; i < applied.rows.length; i++) {
      const old = applied.rows[i]!,
        expected = migrations[i];
      if (
        !expected ||
        old.id !== expected.id ||
        old.checksum !== checksum(expected.sql)
      )
        throw new Error("migration_drift");
    }
    const changed: string[] = [];
    for (const m of migrations.slice(applied.rows.length)) {
      await client.query(m.sql);
      await client.query(
        "INSERT INTO schema_migrations(id,checksum) VALUES($1,$2)",
        [m.id, checksum(m.sql)],
      );
      changed.push(m.id);
    }
    await client.query("COMMIT");
    return changed;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
