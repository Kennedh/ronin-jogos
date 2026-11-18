import { createServer, request as proxyRequest } from "node:http";
import { readFile } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { testPostgres } from "./postgres.ts";
import type { Clock } from "@ronin/data";
import { migrate, VerificationQueue } from "@ronin/data";
import { runOnce } from "@ronin/verifier";
import { createApi } from "../../apps/api/src/index.ts";
import { PORTAL_CSP } from "../../apps/portal/security.ts";
import { FOUNDATION_MANIFEST } from "@ronin/content/runner-manifest";
import type { RunnerManifest } from "@ronin/content/runner-manifest";
/** Serves the exact build with CSP and a real same-origin API/DB/worker. */
export async function portalFixture(
  manifest: RunnerManifest = FOUNDATION_MANIFEST,
  clock?: Clock,
) {
  const db = await testPostgres();
  await migrate(db.pool);
  const dist = resolve("apps/portal/dist");
  let apiPort = 0,
    enabled = true,
    working: Promise<void> | undefined;
  const failures: string[] = [];
  const server = createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    if (url.pathname.startsWith("/api/")) {
      const proxy = proxyRequest(
        {
          hostname: "127.0.0.1",
          port: apiPort,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (response) => {
          res.writeHead(response.statusCode ?? 502, response.headers);
          response.pipe(res);
        },
      );
      proxy.on("error", () => {
        if (!res.headersSent)
          res.writeHead(503, { "content-type": "application/json" });
        res.end('{"error":{"code":"SERVICE_UNAVAILABLE"}}');
      });
      req.pipe(proxy);
      return;
    }
    void (async () => {
      try {
        const entry = [
          "/",
          "/roninrunner",
          "/roninrunner/",
          "/roninrunner/pt-br",
          "/roninrunner/en",
        ].includes(url.pathname);
        const path = entry
          ? resolve(dist, "index.html")
          : resolve(dist, "." + decodeURIComponent(url.pathname));
        if (!path.startsWith(dist + sep)) throw new Error("unsafe_asset_path");
        const body = await readFile(path),
          type =
            extname(path) === ".html"
              ? "text/html; charset=utf-8"
              : extname(path) === ".js"
                ? "text/javascript; charset=utf-8"
                : extname(path) === ".css"
                  ? "text/css; charset=utf-8"
                  : extname(path) === ".svg"
                    ? "image/svg+xml"
                    : extname(path) === ".txt"
                      ? "text/plain; charset=utf-8"
                      : "application/octet-stream";
        res.writeHead(200, {
          "Content-Type": type,
          "Cache-Control": "no-store",
          "Content-Security-Policy": PORTAL_CSP + "; frame-ancestors 'none'",
          "X-Content-Type-Options": "nosniff",
        });
        res.end(body);
      } catch {
        res.writeHead(404);
        res.end();
      }
    })();
  });
  await new Promise<void>((done, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", done);
  });
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("no_portal_port");
  const origin = `http://127.0.0.1:${address.port}`;
  const api = createApi({
    pool: db.pool,
    clock,
    manifest,
    origin,
    rateSecret: Buffer.alloc(32, 19),
  });
  await api.listen({ host: "127.0.0.1", port: 0 });
  const aa = api.server.address();
  if (!aa || typeof aa === "string") throw new Error("no_api_port");
  apiPort = aa.port;
  const queue = new VerificationQueue(db.pool, clock),
    interval = setInterval(() => {
      if (!enabled || working) return;
      working = (async () => {
        try {
          await runOnce(queue);
        } catch {
          failures.push("qa_worker_error");
        } finally {
          working = undefined;
        }
      })();
    }, 40);
  return {
    db,
    origin,
    failures,
    worker(value: boolean) {
      enabled = value;
    },
    async reset() {
      enabled = false;
      await working;
      await db.pool.query(
        "TRUNCATE players,rules_versions,api_rate_buckets CASCADE",
      );
      failures.length = 0;
      enabled = true;
    },
    async close() {
      clearInterval(interval);
      await working;
      await api.close();
      await new Promise<void>((done, reject) =>
        server.close((error) => (error ? reject(error) : done())),
      );
      await db.close();
    },
  };
}
