import Fastify from "fastify";
import { schema } from "@ronin/contracts";
export function createApi() {
  const api = Fastify({ logger: false, bodyLimit: 262144 });
  api.get(
    "/api/v1/health",
    { schema: { response: { 200: schema("Health") } } },
    async () => ({ status: "ok", service: "ronin-play-api" }),
  );
  return api;
}
