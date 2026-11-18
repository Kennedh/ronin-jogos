import type { EventEmitter } from "node:events";
interface PoolLifecycle {
  on(event: "connect", listener: (client: EventEmitter) => void): unknown;
  end(): Promise<void>;
}
/** pg-pool can finish end() before idle clients emit end. Track from creation. */
export function trackPoolClose(pool: PoolLifecycle) {
  const connections = new Set<Promise<void>>();
  pool.on("connect", (client) => {
    const closed = new Promise<void>((resolve) => client.once("end", resolve));
    connections.add(closed);
    void closed.then(() => connections.delete(closed));
  });
  let closing: Promise<void> | undefined;
  return () =>
    (closing ??= (async () => {
      await pool.end();
      await Promise.all(connections);
    })());
}
