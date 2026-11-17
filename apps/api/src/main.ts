import { createApi } from "./index.ts";
const api = createApi();
const port = Number(process.env["PORT"] ?? 3001);
if (!Number.isInteger(port) || port < 1024 || port > 65535)
  throw new Error("invalid_port");
await api.listen({ host: "127.0.0.1", port });
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.once(signal, () => {
    void api.close();
  });
