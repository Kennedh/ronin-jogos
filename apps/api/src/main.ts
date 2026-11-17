import { createApi } from "./index.ts";
import { developmentPool } from "../../../scripts/development.ts";
const pool = developmentPool();
const port = Number(process.env["PORT"] ?? 3001);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("invalid_port");
const api = createApi({
  pool,
  origin: process.env["PORTAL_ORIGIN"] ?? `http://127.0.0.1:${port}`,
});
api.addHook("onClose", async () => {
  await pool.end();
});
try {
  await pool.query("SELECT csrf_digest FROM sessions LIMIT 0");
  await api.listen({ host: "127.0.0.1", port });
  console.log(
    `Ronin dev API: http://127.0.0.1:${port}; inicie db:dev e dev:verifier separadamente.`,
  );
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.once(signal, () => {
      void api.close();
    });
} catch (error) {
  await api.close();
  throw error;
}
