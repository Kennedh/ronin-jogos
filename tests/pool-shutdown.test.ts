import { test } from "node:test";
import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { setImmediate as nextTurn } from "node:timers/promises";
import { trackPoolClose } from "./helpers/pool-close.ts";
import { testPostgres } from "./helpers/postgres.ts";

test("QA shutdown waits for every connection end before stopping native Postgres", async () => {
  const events = new EventEmitter(),
    first = new EventEmitter(),
    second = new EventEmitter();
  let endCalls = 0,
    closed = false;
  const close = trackPoolClose({
    on: events.on.bind(events),
    async end() {
      endCalls++;
    },
  });
  events.emit("connect", first);
  events.emit("connect", second);
  const closing = close().then(() => {
    closed = true;
  });
  await nextTurn();
  assert.equal(endCalls, 1);
  assert.equal(closed, false);
  first.emit("end");
  await nextTurn();
  assert.equal(closed, false);
  second.emit("end");
  await closing;
  assert.equal(closed, true);
  await close();
  assert.equal(endCalls, 1);

  const db = await testPostgres(),
    clients = await Promise.all(
      Array.from({ length: 3 }, () => db.pool.connect()),
    ),
    ended = new Set();
  for (const client of clients) {
    client.once("end", () => ended.add(client));
    await client.query("SELECT 1");
    client.release();
  }
  const stop = db.cluster.stop.bind(db.cluster);
  db.cluster.stop = async () => {
    try {
      assert.equal(ended.size, clients.length);
    } finally {
      await stop();
    }
  };
  await db.close();
  assert.equal(ended.size, 3);
});
