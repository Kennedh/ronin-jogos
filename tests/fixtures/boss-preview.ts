import { RunSession } from "@ronin/runner-client";
import type { RunTicket } from "@ronin/runner-client";
import { mountRunner } from "@ronin/runner-client/scene";
import { BOSS_MANIFEST, manifestHash } from "@ronin/content/runner-manifest";
import { startOffset, RULES_V4, bossSchedule } from "@ronin/runner-core";
import type { Region } from "@ronin/runner-core";
import { bossRun } from "./boss-run.ts";
import { stateHash } from "@ronin/contracts/canonical";
let renderer: ReturnType<typeof mountRunner> | undefined;
async function previewBoss(region: Region, cycle: number) {
  const seed = "0123456789abcdeffedcba9876543210",
    start = (cycle - 1) * 320000000 + startOffset(region, RULES_V4),
    schedule = bossSchedule(start, 0, RULES_V4),
    prefix = bossRun(seed, RULES_V4, schedule.start + 200000),
    ticket: RunTicket = {
      run_id: "a0000000-0000-4000-8000-000000000003",
      mode: "FULL",
      starting_region_id: "BAMBOO",
      seed,
      started_at: "2026-11-18T00:00:00Z",
      expires_at: "2026-11-21T00:00:00Z",
      server_time: "2026-11-18T00:00:00Z",
      versions: {
        ...BOSS_MANIFEST,
        rules_manifest_hash: await manifestHash(BOSS_MANIFEST),
      },
      limits: {
        segment_ticks: 3600,
        max_encoded_bytes: 262144,
        max_decoded_bytes: 1048576,
        max_actions_per_tick: 2,
        upload_grace_seconds: 86400,
        max_run_encoded_bytes: 134217728,
        max_player_encoded_bytes: 536870912,
        max_segments_per_run: 10000,
        max_active_runs: 3,
        wall_time_tolerance_ticks: 120,
      },
    };
  const session = new RunSession(ticket, BOSS_MANIFEST);
  session.state = prefix.state;
  session.phase = "paused";
  renderer?.destroy();
  renderer = mountRunner(document.getElementById("stage")!, {
    session: () => session,
    frame: () => {},
    reducedMotion: () => true,
  });
  await renderer.ready;
  renderer.resize();
  return {
    stateHash: await stateHash(session.state),
    hp: session.state.hp,
    boss: schedule.profile.id,
    region: session.state.journey!.region,
    cycle: session.state.journey!.cycle,
  };
}
(window as unknown as { previewBoss: typeof previewBoss }).previewBoss =
  previewBoss;
window.addEventListener("pagehide", () => renderer?.destroy());
