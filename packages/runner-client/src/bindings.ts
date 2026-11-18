import type { Action } from "@ronin/runner-core";
export type Bindings = Record<Action, readonly string[]>;
export const DEFAULT_BINDINGS: Bindings = Object.freeze({
  JUMP: Object.freeze(["Space", "ArrowUp"]),
  SLIDE: Object.freeze(["KeyS", "ArrowDown"]),
  ATTACK: Object.freeze(["KeyJ"]),
});
const allowed =
  /^(Key[A-Z]|Digit[0-9]|Space|ArrowUp|ArrowDown|ArrowLeft|ArrowRight)$/;
export function parseBindings(value: unknown): Bindings {
  if (
    !value ||
    typeof value !== "object" ||
    Object.keys(value).sort().join(",") !== "ATTACK,JUMP,SLIDE"
  )
    throw new Error("invalid_bindings");
  const keys = value as Bindings,
    all: string[] = [];
  for (const action of ["JUMP", "SLIDE", "ATTACK"] as const) {
    const list = keys[action];
    if (
      !Array.isArray(list) ||
      list.length < 1 ||
      list.length > 2 ||
      list.some((k) => typeof k !== "string" || !allowed.test(k))
    )
      throw new Error("invalid_bindings");
    all.push(...list);
  }
  if (new Set(all).size !== all.length) throw new Error("duplicate_binding");
  return Object.freeze({
    JUMP: Object.freeze([...keys.JUMP]),
    SLIDE: Object.freeze([...keys.SLIDE]),
    ATTACK: Object.freeze([...keys.ATTACK]),
  });
}
export function rebind(keys: Bindings, action: Action, code: string): Bindings {
  return parseBindings({ ...keys, [action]: [code] });
}
export function actionFor(keys: Bindings, code: string): Action | undefined {
  return (["JUMP", "SLIDE", "ATTACK"] as const).find((a) =>
    keys[a].includes(code),
  );
}
export function keyLabel(code: string) {
  return (
    (
      {
        Space: "Space",
        ArrowUp: "↑",
        ArrowDown: "↓",
        ArrowLeft: "←",
        ArrowRight: "→",
      } as Record<string, string>
    )[code] ?? code.replace(/^(Key|Digit)/, "")
  );
}
