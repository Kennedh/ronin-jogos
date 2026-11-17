import {
  RULES_V1,
  compileRules,
  createWorld,
  createRandom,
  randomNext,
  add,
} from "@ronin/runner-core";
import type { Rules, Entity, Gap } from "@ronin/runner-core";
import { canonical, sha256 } from "@ronin/contracts/canonical";
export interface RunnerManifest {
  rules_major: number;
  rules_patch: number;
  generator_version: string;
  scoring_version: string;
  replay_protocol_version: "rr-input-v1";
  assets_manifest_version: string;
  physics: Rules;
}
export const FOUNDATION_MANIFEST: RunnerManifest = Object.freeze({
  rules_major: 1,
  rules_patch: 0,
  generator_version: "rr-primitive-course-1",
  scoring_version: "rr-score-1",
  replay_protocol_version: "rr-input-v1",
  assets_manifest_version: "rr-foundation-no-art-1",
  physics: RULES_V1,
});
export async function manifestHash(manifest: RunnerManifest): Promise<string> {
  return sha256(new TextEncoder().encode(canonical(manifest)));
}
export async function loadManifest(
  value: unknown,
  expectedHash?: string,
): Promise<RunnerManifest> {
  const manifest = value as RunnerManifest;
  if (
    !manifest ||
    canonical(Object.keys(manifest).sort()) !==
      canonical(Object.keys(FOUNDATION_MANIFEST).sort()) ||
    manifest.rules_major !== 1 ||
    !Number.isSafeInteger(manifest.rules_patch) ||
    manifest.rules_patch < 0 ||
    manifest.generator_version !== "rr-primitive-course-1" ||
    manifest.scoring_version !== "rr-score-1" ||
    manifest.replay_protocol_version !== "rr-input-v1" ||
    typeof manifest.assets_manifest_version !== "string" ||
    !manifest.assets_manifest_version
  )
    throw new Error("unsupported_manifest");
  const physics = compileRules(manifest.physics);
  // Dispatch old physics versions explicitly; numeric tuning alone cannot change the algorithm.
  if (physics.version !== RULES_V1.version)
    throw new Error("unsupported_physics");
  if (expectedHash && (await manifestHash(manifest)) !== expectedHash)
    throw new Error("manifest_hash_mismatch");
  return Object.freeze({ ...manifest, physics });
}
/** Versioned infinite primitive course for foundation integration. Advanced director is phase3. */
export function primitiveCourse(
  seed: string,
  distance: number,
  endDistance: number,
) {
  if (
    !Number.isSafeInteger(distance) ||
    distance < 0 ||
    !Number.isSafeInteger(endDistance) ||
    endDistance < distance ||
    endDistance - distance > 40000000
  )
    throw new Error("invalid_course_window");
  const offset = randomNext(createRandom(seed, "world")).value % 24001;
  const first = Math.max(0, Math.floor((distance - 200000) / 1200000));
  const last = Math.floor(add(endDistance, 200000) / 1200000);
  const gaps: Gap[] = [],
    entities: Entity[] = [];
  for (let block = first; block <= last; block++) {
    const base = add(block * 1200000, offset);
    gaps.push({ start: add(base, 800000), end: add(base, 890000) });
    entities.push({
      id: `o-${block}`,
      x: add(base, 300000),
      width: 40000,
      top: -65000,
      bottom: 0,
      kind: "OBSTACLE",
    });
    entities.push({
      id: `e-${block}`,
      x: add(base, 520000),
      width: 40000,
      top: -80000,
      bottom: 0,
      kind: "ENEMY",
    });
  }
  return createWorld(gaps, entities);
}
