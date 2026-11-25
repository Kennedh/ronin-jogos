import {
  characterSlots,
  defaultAppearance,
  resolveAppearance,
  slotNames,
  CHARACTER_RIG,
} from "@ronin/content/character";
import type { Appearance, Slot } from "@ronin/content/character";
import type { components } from "@ronin/contracts";
import { apiErrorMessage } from "@ronin/content";
import type { Locale } from "@ronin/content";
import { runnerCopy } from "@ronin/content/runner-copy";
import { ClientError, RunnerApi } from "@ronin/runner-client";

export function attachCreator(
  panel: HTMLElement,
  api: RunnerApi,
  ensureSession: () => Promise<unknown>,
  locale: () => Locale,
) {
  const fields = panel.querySelector<HTMLElement>("#creator-fields")!;
  const save = panel.querySelector<HTMLButtonElement>("#creator-save")!;
  const reset = panel.querySelector<HTMLButtonElement>("#creator-reset")!;
  const reload = panel.querySelector<HTMLButtonElement>("#creator-reload")!;
  const status = panel.querySelector<HTMLElement>("#creator-status")!;
  const emblem = panel.querySelector<HTMLOutputElement>("#creator-emblem")!;
  const requirement = panel.querySelector<HTMLElement>("#creator-requirement")!;
  let equipped: components["schemas"]["Character"] | undefined;
  let catalog: components["schemas"]["CharacterCatalog"]["parts"] = [];
  let owned = new Set<string>();
  let draft: Appearance = { ...defaultAppearance };
  let saving: ReturnType<RunnerApi["saveCharacter"]> | undefined;
  let busy = false,
    conflict = false,
    error = "",
    saved = false,
    generation = 0;
  const controls = new Map<
    Slot,
    { name: HTMLElement; select: HTMLSelectElement }
  >();
  for (const slot of characterSlots) {
    const label = document.createElement("label"),
      name = document.createElement("span"),
      select = document.createElement("select");
    select.id = "creator-" + slot;
    name.id = select.id + "-label";
    select.setAttribute("aria-labelledby", name.id);
    label.append(name, select);
    fields.append(label);
    controls.set(slot, { name, select });
    select.addEventListener("change", () => {
      draft = { ...draft, [slot]: select.value };
      saved = false;
      if (!conflict) error = "";
      render();
    });
  }
  function render() {
    const lang = locale(),
      t = runnerCopy(lang);
    for (const [slot, { name, select }] of controls) {
      name.textContent = slotNames[slot][lang === "en" ? 1 : 0];
      select.replaceChildren(
        ...catalog
          .filter(
            (part) => part.slot === slot && part.rig_version === CHARACTER_RIG,
          )
          .map(
            (part) =>
              new Option(
                part.labels[lang] +
                  (owned.has(part.part_id) ? "" : " · " + t.locked),
                part.part_id,
              ),
          ),
      );
      select.value = draft[slot];
      select.disabled = busy || !equipped;
    }
    const locked = catalog.filter(
      (part) => draft[part.slot] === part.part_id && !owned.has(part.part_id),
    );
    requirement.textContent = locked
      .map((part) => {
        const id = part.unlock_requirement_id;
        const boss =
          id && ["B01", "B02", "B03", "B04"].includes(id)
            ? t[("boss_" + id) as "boss_B01"]
            : undefined;
        return (
          part.labels[lang] +
          " · " +
          (boss ? t.creatorDefeat + " " + boss : t.creatorFourSeals)
        );
      })
      .join(" · ");
    emblem.value =
      draft.profile_emblem_id === defaultAppearance.profile_emblem_id
        ? ""
        : (catalog.find((p) => p.part_id === draft.profile_emblem_id)?.labels[
            lang
          ] ?? "");
    const dirty =
      equipped &&
      characterSlots.some((slot) => draft[slot] !== equipped?.slots[slot]);
    save.disabled = busy || conflict || !dirty || locked.length > 0;
    reset.disabled = busy || !equipped;
    reload.disabled = busy;
    status.textContent = error
      ? apiErrorMessage(error, lang)
      : busy
        ? t.creatorWorking
        : saved
          ? t.creatorSaved
          : dirty
            ? t.creatorUnsaved
            : "";
  }
  function fail(e: unknown) {
    error = e instanceof ClientError ? e.code : "SERVICE_UNAVAILABLE";
    conflict = error === "APPEARANCE_CONFLICT";
  }
  async function load() {
    const id = ++generation;
    busy = true;
    error = "";
    saved = false;
    conflict = false;
    equipped = undefined;
    draft = { ...defaultAppearance };
    render();
    try {
      await saving?.catch(() => undefined);
      await ensureSession();
      const [options, inventory] = await Promise.all([
        api.catalog(),
        api.cosmetics(),
      ]);
      if (id !== generation) return;
      catalog = options.parts;
      owned = new Set(inventory.unlocked_part_ids);
      equipped = inventory.equipped;
      draft = resolveAppearance(equipped.slots);
    } catch (e) {
      if (id === generation) fail(e);
    } finally {
      if (id === generation) {
        busy = false;
        render();
      }
    }
  }
  save.addEventListener("click", async () => {
    if (!equipped || save.disabled) return;
    const id = generation;
    busy = true;
    error = "";
    render();
    try {
      saving = api.saveCharacter({
        expected_appearance_version: equipped.appearance_version,
        slots: draft,
      });
      const updated = await saving;
      if (id !== generation) return;
      equipped = updated;
      draft = resolveAppearance(updated.slots);
      saved = true;
    } catch (e) {
      if (id === generation) fail(e);
    } finally {
      if (id === generation) {
        busy = false;
        render();
      }
    }
  });
  reload.addEventListener("click", () => void load());
  reset.addEventListener("click", () => {
    draft = { ...defaultAppearance };
    saved = false;
    render();
  });
  return {
    load,
    render,
    preview: () => draft,
    finishSave: () => saving?.catch(() => undefined),
  };
}
