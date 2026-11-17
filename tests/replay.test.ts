import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { canonical, parseJson, stateHash } from "@ronin/contracts/canonical";
import {
  encodeSegment,
  decodeSegment,
  segmentHash,
  appendSegment,
  replayCursor,
  assertFinish,
} from "@ronin/contracts/replay";
import type { ReplaySegment } from "@ronin/contracts/replay";
const fixture = JSON.parse(
  await readFile(new URL("./fixtures/replay-v1.json", import.meta.url), "utf8"),
) as { segment: ReplaySegment; canonical: string; hash: string };
const origin = fixture.segment;
test("independent canonical replay / SHA256 golden vector and normalization", async () => {
  assert.equal(canonical(origin), fixture.canonical);
  assert.equal(await segmentHash(origin), fixture.hash);
  assert.equal(
    canonical(decodeSegment(encodeSegment(origin))),
    fixture.canonical,
  );
  const shuffled = {
    ...origin,
    actions: origin.actions,
    protocol: origin.protocol,
  };
  assert.equal(await segmentHash(shuffled), fixture.hash);
  assert.equal(
    await stateHash({}),
    "44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
  );
});
test("duplicate decoded keys, invalid Unicode/UTF8, unsafe numbers and deep JSON fail closed", () => {
  for (const source of [
    '{"a":1,"a":2}',
    '{"a":1,"\\u0061":2}',
    '{"a":"\\ud800"}',
    "[9007199254740993]",
    "[1.5]",
    "[1e999]",
    "[]true",
    "[1,]",
    '{"a":1,}',
    "[".repeat(34) + "0" + "]".repeat(34),
  ])
    assert.throws(() => parseJson(new TextEncoder().encode(source)), source);
  assert.throws(() => parseJson(new Uint8Array([0xff])));
  assert.throws(() => parseJson(new Uint8Array(1048577)));
  assert.throws(() => canonical({ x: undefined }));
  assert.throws(() => canonical({ n: Infinity }));
  assert.equal(canonical({ z: 1, a: -0 }), ' {"a":0,"z":1}'.trim());
  const safe = parseJson(
    new TextEncoder().encode('{"__proto__":{"polluted":true}}'),
  ) as object;
  assert.equal(Object.getPrototypeOf(safe), null);
  assert.equal(Object.hasOwn({}, "polluted"), false);
});
test("events are bounded, ordered, unique and inside half-open intervals", () => {
  const invalid = [
    { ...origin, actions: [{ tick: 60, action: "JUMP" }] },
    { ...origin, end_tick: 3601 },
    {
      ...origin,
      actions: [
        { tick: 0, action: "JUMP" },
        { tick: 0, action: "JUMP" },
      ],
    },
    {
      ...origin,
      actions: [
        { tick: 0, action: "ATTACK" },
        { tick: 0, action: "JUMP" },
      ],
    },
    {
      ...origin,
      actions: [
        { tick: 0, action: "JUMP" },
        { tick: 0, action: "SLIDE" },
        { tick: 0, action: "ATTACK" },
      ],
    },
    { ...origin, actions: [], end_tick: 0, controls: [] },
  ];
  for (const s of invalid) assert.throws(() => encodeSegment(s));
  assert.throws(() => decodeSegment(new Uint8Array(262145)));
});
test("ordered cursor rejects skipped, transplanted or changed parts and mismatched finish", async () => {
  const cursor = await appendSegment(replayCursor(origin.run_id), origin);
  await assert.rejects(() => appendSegment(cursor, origin), /chain_mismatch/);
  const second = {
    ...origin,
    index: 1,
    start_tick: 60,
    end_tick: 120,
    actions: [],
    previous_hash: cursor.hash,
  };
  await assert.rejects(
    () => appendSegment(cursor, { ...second, previous_hash: "b".repeat(64) }),
    /chain_mismatch/,
  );
  await assert.rejects(
    () =>
      appendSegment(cursor, {
        ...second,
        run_id: "a0000000-0000-4000-8000-000000000002",
      }),
    /chain_mismatch/,
  );
  const done = await appendSegment(cursor, second);
  const finish = {
    final_segment_index: 1,
    final_tick: 120,
    final_hash: done.hash,
    end_reason: "HP_ZERO",
  };
  assert.deepEqual(assertFinish(done, finish), finish);
  assert.throws(() => assertFinish(done, { ...finish, final_tick: 121 }));
  assert.throws(() => assertFinish(done, { ...finish, end_reason: "QUIT" }));
});
test("pause/resume at same tick, zero-tick control parts and global sequence remain deterministic", async () => {
  const pause = {
    ...origin,
    end_tick: 5,
    controls: [{ tick: 5, sequence: 0, action: "PAUSE" as const }],
  };
  const cursor = await appendSegment(replayCursor(origin.run_id), pause);
  assert.equal(cursor.paused, true);
  const resume = {
    ...origin,
    index: 1,
    start_tick: 5,
    end_tick: 5,
    previous_hash: cursor.hash,
    actions: [],
    controls: [{ tick: 5, sequence: 1, action: "RESUME" as const }],
  };
  const active = await appendSegment(cursor, resume);
  assert.equal(active.paused, false);
  assert.equal(active.nextTick, 5);
  await assert.rejects(() =>
    appendSegment(cursor, {
      ...resume,
      controls: [{ tick: 5, sequence: 0, action: "RESUME" }],
    }),
  );
  await assert.rejects(() =>
    appendSegment(cursor, {
      ...resume,
      end_tick: 6,
      controls: [{ tick: 6, sequence: 1, action: "RESUME" }],
    }),
  );
  const quit = {
    ...resume,
    index: 2,
    previous_hash: active.hash,
    controls: [{ tick: 5, sequence: 2, action: "QUIT" as const }],
  };
  const ended = await appendSegment(active, quit);
  assertFinish(ended, {
    final_segment_index: 2,
    final_tick: 5,
    final_hash: ended.hash,
    end_reason: "QUIT",
  });
  await assert.rejects(() =>
    appendSegment(ended, { ...quit, index: 3, previous_hash: ended.hash }),
  );
});
test("paused ticks cannot advance, contain actions, or acquire a second pause", async () => {
  for (const controls of [
    [{ tick: 2, sequence: 0, action: "PAUSE" }],
    [
      { tick: 2, sequence: 0, action: "PAUSE" },
      { tick: 2, sequence: 1, action: "PAUSE" },
    ],
    [{ tick: 2, sequence: 0, action: "RESUME" }],
    [
      { tick: 2, sequence: 0, action: "PAUSE" },
      { tick: 3, sequence: 1, action: "RESUME" },
    ],
  ]) {
    await assert.rejects(() =>
      appendSegment(replayCursor(origin.run_id), { ...origin, controls }),
    );
  }
  await assert.rejects(() =>
    appendSegment(replayCursor(origin.run_id), {
      ...origin,
      end_tick: 5,
      actions: [{ tick: 4, action: "JUMP" }],
      controls: [
        { tick: 3, sequence: 0, action: "PAUSE" },
        { tick: 3, sequence: 1, action: "QUIT" },
      ],
    }),
  );
});

test("decoded replay reproduces the same core state, including boundary pause and QUIT", async () => {
  const { createState, createWorld, playSegment, step } =
    await import("@ronin/runner-core");
  const world = createWorld();
  let direct = createState("0123456789abcdeffedcba9876543210");
  for (let tick = 0; tick < 60; tick++)
    direct = step(direct, tick < 2 ? ["JUMP"] : [], world).state;
  const replayed = playSegment(
    createState("0123456789abcdeffedcba9876543210"),
    decodeSegment(encodeSegment(origin)),
    world,
  );
  assert.deepEqual(replayed, direct);
  const paused = playSegment(
    replayed,
    {
      start_tick: 60,
      end_tick: 60,
      actions: [],
      controls: [{ tick: 60, sequence: 0, action: "PAUSE" }],
    },
    world,
  );
  const quit = playSegment(
    paused,
    {
      start_tick: 60,
      end_tick: 60,
      actions: [],
      controls: [
        { tick: 60, sequence: 1, action: "RESUME" },
        { tick: 60, sequence: 2, action: "QUIT" },
      ],
    },
    world,
  );
  assert.equal(quit.tick, 60);
  assert.equal(quit.endReason, "QUIT");
  assert.throws(() =>
    playSegment(
      quit,
      { start_tick: 60, end_tick: 61, actions: [], controls: [] },
      world,
    ),
  );
});

test("one hundred ordered segments keep a bounded cursor and unchanged chain identity", async () => {
  let cursor = replayCursor(origin.run_id);
  for (let index = 0; index < 100; index++)
    cursor = await appendSegment(cursor, {
      ...origin,
      index,
      start_tick: index * 3600,
      end_tick: (index + 1) * 3600,
      previous_hash: cursor.hash,
      actions: [],
      controls: [],
    });
  assert.equal(cursor.nextIndex, 100);
  assert.equal(cursor.nextTick, 360000);
  assert.equal(Object.keys(cursor).length, 7);
  assert.throws(() => canonical(new Array(1)));
});
