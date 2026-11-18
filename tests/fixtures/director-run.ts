import { createState } from "@ronin/runner-core";
import type { Rules, Region } from "@ronin/runner-core";
import { BLOCK_SIZE, directorCourse } from "@ronin/content/director";
import { solveWindow } from "@ronin/content/solver";
import type { Command } from "@ronin/content/solver";
export function directorRun(
  seed: string,
  r: Rules,
  endDistance: number,
  region: Region = "BAMBOO",
) {
  let state = createState(seed, r, region),
    maxResolved = 0,
    maxWorld = 0,
    blocks = 0;
  const commands: Command[] = [];
  while (state.distance < endDistance) {
    const end = Math.min(
        endDistance,
        (Math.floor(state.distance / BLOCK_SIZE) + 1) * BLOCK_SIZE,
      ),
      world = directorCourse(seed, state.distance, end, r, region),
      proof = solveWindow(world, r, state, end);
    if (!proof)
      throw new Error(
        `no_route_at_${state.distance}_${state.journey?.region}_${state.journey?.cycle}`,
      );
    commands.push(...proof.commands);
    state = proof.state;
    maxResolved = Math.max(maxResolved, state.resolved.length);
    maxWorld = Math.max(maxWorld, world.entities.length);
    blocks++;
  }
  return { state, commands, maxResolved, maxWorld, blocks };
}
