import { apiErrorMessage } from "@ronin/content";
import type { Locale } from "@ronin/content";
import type { runnerCopy } from "@ronin/content/runner-copy";
import {
  RunnerApi,
  ClientError,
  RunSession,
  Submission,
  Gestures,
  abyssAhead,
  DEFAULT_BINDINGS,
  parseBindings,
  rebind,
  actionFor,
  keyLabel,
  ANIMATIONS,
  demoPose,
  drawRig,
  canvasBrush,
} from "@ronin/runner-client";
import type { RunTicket, PauseReason } from "@ronin/runner-client";
import { REGIONS } from "@ronin/runner-core";
import { RULES_V2 } from "@ronin/runner-core";
import type { RunnerTextKey } from "@ronin/content/runner-copy";
import type { Animation } from "@ronin/runner-client";
import type { Action } from "@ronin/runner-core";
import { stateHash } from "@ronin/contracts/canonical";
export async function initializeGame(
  root: HTMLElement,
  context: {
    locale: () => Locale;
    text: () => ReturnType<typeof runnerCopy>;
    setRedraw: (render: () => void) => void;
  },
) {
  document.body.classList.toggle("touch-device", navigator.maxTouchPoints > 0);
  const text = context.text;
  const get = <T extends HTMLElement = HTMLElement>(id: string) => {
    const node = document.getElementById(id);
    if (!node) throw new Error("missing_element_" + id);
    return node as T;
  };
  const surface = get("surface"),
    viewport = surface.parentElement!,
    frame = get("surface").closest<HTMLElement>(".game-frame")!,
    api = new RunnerApi();
  const play = get<HTMLButtonElement>("play"),
    mode = get<HTMLSelectElement>("mode"),
    regionSelect = get<HTMLSelectElement>("region"),
    pause = get<HTMLButtonElement>("pause"),
    resume = get<HTMLButtonElement>("resume"),
    newRun = get<HTMLButtonElement>("new-run"),
    retry = get<HTMLButtonElement>("retry");
  const alternate = get<HTMLInputElement>("alternate"),
    reduced = get<HTMLInputElement>("reduced"),
    fullscreen = get<HTMLInputElement>("fullscreen");
  let session: RunSession | undefined,
    submission: Submission | undefined,
    engineReady = false,
    starting = false,
    startKey = "",
    candidate: RunTicket | undefined,
    latchedMode: "FULL" | "REGIONAL" = "FULL",
    latchedRegion: RunTicket["starting_region_id"] = "BAMBOO",
    unlocked: string[] = ["BAMBOO"],
    regionsPromise: ReturnType<RunnerApi["guest"]> | undefined,
    startError: ClientError | undefined,
    confirming = false,
    portraitAllowed = false,
    lastPhase = "",
    renderer: { destroy(): void; resize(): void } | undefined;
  let bindings = DEFAULT_BINDINGS;
  reduced.checked = matchMedia("(prefers-reduced-motion: reduce)").matches;
  fullscreen.checked = navigator.maxTouchPoints > 0;
  try {
    const saved = JSON.parse(
      localStorage.getItem("ronin.runner.settings") ?? "{}",
    ) as Record<string, unknown>;
    if (saved["bindings"]) bindings = parseBindings(saved["bindings"]);
    for (const input of [alternate, reduced, fullscreen])
      if (typeof saved[input.id] === "boolean")
        input.checked = saved[input.id] as boolean;
  } catch {
    /* Optional preferences. */
  }
  const saveSettings = () => {
    try {
      localStorage.setItem(
        "ronin.runner.settings",
        JSON.stringify({
          bindings,
          alternate: alternate.checked,
          reduced: reduced.checked,
          fullscreen: fullscreen.checked,
        }),
      );
    } catch {
      /* Optional preferences. */
    }
    render();
  };
  for (const input of [alternate, reduced, fullscreen])
    input.addEventListener("change", saveSettings);
  for (const input of root.querySelectorAll<HTMLInputElement>("[data-binding]"))
    input.addEventListener("keydown", (event) => {
      if (event.code === "Tab") return;
      event.preventDefault();
      event.stopPropagation();
      try {
        bindings = rebind(
          bindings,
          input.dataset["binding"] as Action,
          event.code,
        );
        get("binding-error").hidden = true;
        saveSettings();
      } catch {
        get("binding-error").hidden = false;
      }
    });
  get("reset-keys").addEventListener("click", () => {
    bindings = DEFAULT_BINDINGS;
    get("binding-error").hidden = true;
    saveSettings();
  });
  const loadRegions = () => {
    regionsPromise = api.guest();
    void regionsPromise
      .then((player) => {
        unlocked = player.region_unlocks ?? ["BAMBOO"];
        render();
      })
      .catch(() => {})
      .finally(() => {
        regionsPromise = undefined;
      });
    return regionsPromise;
  };
  mode.addEventListener("change", () => {
    if (!session && !starting && mode.value === "REGIONAL") void loadRegions();
    render();
  });
  const isPortrait = () =>
    navigator.maxTouchPoints > 0 && window.innerHeight > window.innerWidth;
  function message(error: ClientError, atStart = false) {
    if (["NETWORK_UNAVAILABLE", "SERVICE_UNAVAILABLE"].includes(error.code))
      return atStart ? text().offlineStart : text().network;
    if (error.status === 401 || error.code === "SESSION_CHANGED")
      return text().sessionError;
    if (
      error.code === "RULES_MISMATCH" ||
      error.code === "INVALID_SERVER_RESPONSE"
    )
      return text().rulesError;
    if (error.code === "REPLAY_BUFFER_ERROR") return text().bufferError;
    if (error.code === "RENDER_ERROR") return text().renderError;
    return apiErrorMessage(error.code, context.locale());
  }
  const formatted = (value: number | string) =>
    new Intl.NumberFormat(context.locale(), {
      maximumFractionDigits: 0,
    }).format(typeof value === "string" ? BigInt(value) : value);
  function render() {
    const t = text(),
      s = session,
      state = s?.state,
      phase = s?.phase ?? "ready",
      ended = phase === "ended",
      shielded = phase === "paused" || phase === "countdown";
    document.body.classList.toggle("run-active", !!s && !ended);
    viewport.classList.toggle("shielded", shielded);
    root.querySelector<HTMLElement>(".masthead")!.inert = shielded;
    root.querySelector<HTMLElement>("footer")!.inert = shielded;
    if (phase !== lastPhase) {
      if (phase === "paused") {
        pointers.clear();
        gestures.cancel();
      }
      lastPhase = phase;
      requestAnimationFrame(() => renderer?.resize());
    }
    surface.setAttribute("aria-label", t.stageLabel);
    const region = state?.journey?.region ?? "BAMBOO",
      cycle = state?.journey?.cycle ?? 1;
    get("biome-name").textContent = t[("region_" + region) as RunnerTextKey];
    get("biome-index").textContent = String(
      REGIONS.indexOf(region) + 1,
    ).padStart(2, "0");
    root.querySelector<HTMLElement>(".stage-meta")!.textContent =
      `${t[("region_" + region) as RunnerTextKey]} / ${t.cycle} ${cycle}`;
    regionSelect.hidden = mode.value !== "REGIONAL";
    get("region-label").hidden = regionSelect.hidden;
    regionSelect.disabled = starting || !!startKey;
    for (const option of regionSelect.options) {
      option.disabled = !unlocked.includes(option.value);
      option.textContent =
        t[("region_" + option.value) as RunnerTextKey] +
        (option.disabled ? ` · ${t.locked}` : "");
    }
    root.querySelector<HTMLElement>(".mode-help")!.textContent = t.directorHelp;
    root.querySelector<HTMLElement>(".scope")!.textContent = t.directorScope;
    for (const action of ["JUMP", "SLIDE", "ATTACK"] as const)
      get<HTMLInputElement>("bind-" + action).value = bindings[action]
        .map(keyLabel)
        .join(" / ");
    get<HTMLSelectElement>("rig-animation")
      .querySelectorAll("option")
      .forEach((o) => {
        o.textContent = t[("anim_" + o.value) as RunnerTextKey];
      });
    const keyboard = root.querySelector<HTMLElement>(".keyboard-help")!;
    keyboard.textContent = `${bindings.JUMP.map(keyLabel).join(" / ")} ${t.jump} · ${bindings.SLIDE.map(keyLabel).join(" / ")} ${t.slide} · ${bindings.ATTACK.map(keyLabel).join(" / ")} ${t.attack} · Esc ${t.pause}`;
    get("world-warning").hidden = !(
      s &&
      state &&
      abyssAhead(state, s.world, s.manifest.physics)
    );
    const combat = state?.combat;
    get<HTMLProgressElement>("concentration").value =
      combat?.concentration ?? 0;
    get("concentration-value").textContent =
      (combat?.concentration ?? 0) + " / 100";
    get("combo").textContent =
      combat?.concentration === 100
        ? t.specialReady
        : (combat?.combo ?? 0) > 0
          ? `${t.combo}: ${combat!.combo}`
          : "";
    const recent =
      s?.recentEvents.filter(
        (e) =>
          ["SPECIAL", "PERFECT", "HIT", "MISS", "DAMAGE"].includes(e.type) &&
          s.state.tick - e.tick < 45,
      ) ?? [];
    const priority = ["SPECIAL", "PERFECT", "DAMAGE", "HIT", "MISS"];
    const feedback = recent.sort(
      (a, b) =>
        b.tick - a.tick || priority.indexOf(a.type) - priority.indexOf(b.type),
    )[0];
    const feedbackKeys = {
      SPECIAL: "feedbackSpecial",
      PERFECT: "feedbackPerfect",
      HIT: "feedbackHit",
      MISS: "feedbackMiss",
      DAMAGE: "feedbackDamage",
    } as const;
    const feedbackText = feedback
      ? t[feedbackKeys[feedback.type as keyof typeof feedbackKeys]]
      : "";
    const feedbackNode = get("combat-feedback");
    if (feedbackNode.textContent !== feedbackText)
      feedbackNode.textContent = feedbackText;
    surface.dataset["concentration"] = String(combat?.concentration ?? 0);
    surface.dataset["combo"] = String(combat?.combo ?? 0);
    surface.dataset["specials"] = String(combat?.specials ?? 0);
    surface.dataset["phase"] = phase;
    surface.dataset["tick"] = String(state?.tick ?? 0);
    surface.dataset["hp"] = String(state?.hp ?? 3);
    surface.dataset["jumps"] = String(state?.jumps ?? 0);
    surface.dataset["attackAge"] = String(state?.attackAge ?? -1);
    surface.dataset["slideUntil"] = String(state?.slideUntil ?? 0);
    surface.dataset["runId"] = s?.ticket.run_id ?? "";
    get("setup").hidden = !!s;
    get("pause-panel").hidden = phase !== "paused" || confirming;
    get("confirm-panel").hidden = !confirming;
    get("countdown-panel").hidden = phase !== "countdown";
    get("countdown").textContent = String(s?.countdown ?? 3);
    get("result").hidden = !ended;
    mode.disabled = starting || !!startKey;
    play.disabled = !engineReady || starting;
    play.textContent =
      !engineReady && !startError
        ? t.loadingGame
        : starting
          ? t.loading
          : startError
            ? t.startRetry
            : t.play;
    get("start-error").hidden = !startError;
    if (startError) get("start-error").textContent = message(startError, true);
    pause.disabled = phase !== "running";
    get("score").textContent = state ? formatted(state.score) : "—";
    get("distance").textContent =
      formatted(
        state
          ? Math.floor(
              state.distance /
                (s!.manifest.physics.scale * s!.manifest.physics.unitsPerMeter),
            )
          : 0,
      ) + " m";
    const hearts = state?.hp ?? 3;
    get("surface").dataset["endReason"] = state?.endReason ?? "";
    const heartNode = root!.querySelector<HTMLElement>(".hearts")!;
    heartNode.setAttribute("aria-label", `${t.lives}: ${hearts}/3`);
    heartNode.querySelector("span")!.textContent =
      "♥".repeat(hearts) + "♡".repeat(3 - hearts);
    get("action-buttons").hidden = !alternate.checked || phase !== "running";
    const rotate = phase === "paused" && isPortrait() && !portraitAllowed;
    get("rotate-note").hidden = !rotate;
    get("portrait").hidden = !rotate;
    resume.disabled =
      rotate || (s?.pauseReason === "buffer" && s.recorder.nearlyFull);
    const pauseTexts: Record<PauseReason, string> = {
      manual: t.pauseHint,
      focus: t.focusPause,
      orientation: t.orientationPause,
      fullscreen: t.pauseHint,
      frame: t.framePause,
      buffer: t.bufferPause,
    };
    get("pause-hint").textContent = s ? pauseTexts[s.pauseReason] : t.pauseHint;
    if (candidate) {
      get("actual-limits").textContent =
        `${t.serverWindow}: ${new Intl.DateTimeFormat(context.locale(), { dateStyle: "medium", timeStyle: "short" }).format(new Date(candidate.expires_at))} · ${candidate.limits.max_segments_per_run} ${context.locale() === "pt-BR" ? "partes" : "parts"} · ${candidate.limits.max_run_encoded_bytes / 1048576} MiB`;
    }
    const error = submission?.error;
    get("connection").hidden = !error;
    get("connection-message").textContent = error ? message(error) : "";
    retry.disabled =
      !!submission?.busy || Date.now() < (submission?.retryAt ?? 0);
    retry.textContent = error?.status === 401 ? t.reconnect : t.retry;
    if (ended && s) {
      const status = submission?.status,
        verified = status?.status === "VERIFIED";
      get("result").dataset["status"] = status?.status ?? "SENDING";
      get("result-title").textContent =
        state?.endReason === "QUIT" ? t.finishTitle : t.deadTitle;
      get("end-reason").textContent =
        state?.endReason === "QUIT"
          ? t.reasonQuit
          : state?.endReason === "ABYSS"
            ? t.reasonAbyss
            : t.reasonHp;
      get("result-label").textContent = verified
        ? t.confirmedStats
        : t.localStats;
      get("result-score").textContent = formatted(
        verified ? status.score! : state!.score,
      );
      get("result-distance").textContent =
        formatted(
          verified
            ? status.distance_m!
            : Math.floor(
                state!.distance /
                  (s.manifest.physics.scale * s.manifest.physics.unitsPerMeter),
              ),
        ) + " m";
      let title = t.sending,
        hint = t.pendingHint;
      if (error) {
        title = t.awaiting;
        hint = message(error);
      } else if (verified) {
        title = status.ranked ? t.verified : t.quitVerified;
        hint = t.verifiedHint;
      } else if (status?.status === "REJECTED") {
        title = t.rejected;
        hint = apiErrorMessage(
          status.rejection_code ?? "REPLAY_INVALID",
          context.locale(),
        );
      } else if (status?.status === "EXPIRED") {
        title = t.expired;
        hint = t.unranked;
      } else if (submission?.received) {
        title = t.pending;
      }
      get("result-status").textContent = title;
      get("result-hint").textContent = hint;
      newRun.disabled = !submission?.safeToLeave;
    }
  }
  context.setRedraw(render);
  const focusPanel = (id: string) =>
    requestAnimationFrame(() => get(id).focus());
  function pauseRun(reason: PauseReason) {
    const before = session?.phase;
    session?.pause(reason);
    if (session?.phase === "paused" && before !== "paused") {
      confirming = false;
      render();
      focusPanel("resume");
    }
  }
  async function immersive() {
    if (!fullscreen.checked) return;
    try {
      if (!document.fullscreenElement) {
        if (!frame.requestFullscreen) throw new Error("fullscreen_unavailable");
        await frame.requestFullscreen();
      }
      const orientation = screen.orientation as ScreenOrientation & {
        lock?: (value: string) => Promise<void>;
      };
      if (orientation.lock) await orientation.lock("landscape");
    } catch {
      get("immersive-note").hidden = false;
    }
  }
  async function start() {
    if (starting || session) return;
    starting = true;
    startError = undefined;
    if (!startKey) {
      startKey = crypto.randomUUID();
      latchedMode = mode.value === "REGIONAL" ? "REGIONAL" : "FULL";
      latchedRegion = REGIONS.includes(
        regionSelect.value as RunTicket["starting_region_id"],
      )
        ? (regionSelect.value as RunTicket["starting_region_id"])
        : "BAMBOO";
    }
    const immersion = immersive();
    render();
    try {
      const player = await (regionsPromise ?? api.guest());
      unlocked = player.region_unlocks ?? ["BAMBOO"];
      candidate ??= await api.start(startKey, latchedMode, latchedRegion);
      const manifest = await api.manifest(candidate);
      await immersion;
      lab.open = false;
      stopLab();
      session = new RunSession(candidate, manifest);
      submission = new Submission(api, session.recorder);
      submission.onChange = render;
      session.onChange = render;
      session.onEnd = () => {
        const current = session!,
          result = submission!;
        void stateHash(current.state).then((hash) => {
          if (session === current) surface.dataset["stateHash"] = hash;
        });
        void result.finish(current.state.tick, current.state.endReason!);
        render();
        focusPanel("result");
      };
      session.begin();
      if (isPortrait() && !portraitAllowed) pauseRun("orientation");
      else surface.focus();
    } catch (error) {
      startError =
        error instanceof ClientError
          ? error
          : new ClientError("NETWORK_UNAVAILABLE");
    } finally {
      starting = false;
      render();
    }
  }
  play.addEventListener("click", () => {
    void start();
  });
  pause.addEventListener("click", () => pauseRun("manual"));
  resume.addEventListener("click", () => {
    session?.resume(performance.now());
    render();
    surface.focus();
  });
  get("portrait").addEventListener("click", () => {
    portraitAllowed = true;
    render();
    session?.resume(performance.now());
    surface.focus();
  });
  get("quit").addEventListener("click", () => {
    confirming = true;
    render();
    focusPanel("cancel-quit");
  });
  get("cancel-quit").addEventListener("click", () => {
    confirming = false;
    render();
    focusPanel("resume");
  });
  get("confirm-quit").addEventListener("click", () => {
    confirming = false;
    session?.quit();
    render();
  });
  newRun.addEventListener("click", () => {
    if (!submission?.safeToLeave) return;
    submission.dispose();
    submission = undefined;
    session = undefined;
    candidate = undefined;
    startKey = "";
    startError = undefined;
    portraitAllowed = false;
    if (mode.value === "REGIONAL") void loadRegions();
    surface.removeAttribute("data-state-hash");
    render();
    play.focus();
  });
  retry.addEventListener("click", () => {
    if (submission?.error?.status === 401) void submission.reconnect();
    else void submission?.synchronize(true);
  });
  window.addEventListener("online", () => {
    void submission?.synchronize(true);
  });
  window.addEventListener("blur", () => pauseRun("focus"));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseRun("focus");
  });
  document.addEventListener("fullscreenchange", () => {
    renderer?.resize();
    if (!document.fullscreenElement) pauseRun("fullscreen");
  });
  screen.orientation?.addEventListener("change", () => {
    portraitAllowed = false;
    pauseRun("orientation");
    renderer?.resize();
  });
  let lastPortrait = isPortrait();
  window.addEventListener("resize", () => {
    const portrait = isPortrait();
    if (portrait !== lastPortrait) {
      lastPortrait = portrait;
      portraitAllowed = false;
      pauseRun("orientation");
    }
    if (portrait && !portraitAllowed) pauseRun("orientation");
    renderer?.resize();
  });
  window.addEventListener("beforeunload", (event) => {
    if (session && (!submission?.safeToLeave || session.phase !== "ended")) {
      event.preventDefault();
      event.returnValue = "";
    }
  });
  window.addEventListener("keydown", (event) => {
    if (event.code === "Tab" && session?.phase === "paused") {
      const panel = get(confirming ? "confirm-panel" : "pause-panel");
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>("button:not(:disabled),a[href]"),
      ).filter((node) => !node.hidden && node.getClientRects().length > 0);
      const first = focusable[0],
        last = focusable.at(-1);
      if (
        first &&
        last &&
        (!panel.contains(document.activeElement) ||
          (event.shiftKey && document.activeElement === first) ||
          (!event.shiftKey && document.activeElement === last))
      ) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
    }

    if (
      event.repeat ||
      event.isComposing ||
      event.ctrlKey ||
      event.altKey ||
      event.metaKey ||
      (event.target instanceof HTMLElement &&
        event.target.matches("input,select,textarea,[contenteditable]"))
    )
      return;
    if (event.code === "Escape" && session) {
      event.preventDefault();
      if (confirming) {
        confirming = false;
        render();
      } else if (session.phase === "paused") {
        if (!resume.disabled) {
          session.resume(performance.now());
          surface.focus();
        }
      } else pauseRun("manual");
      return;
    }
    if (session?.phase !== "running") return;
    if (
      event.target instanceof HTMLElement &&
      event.target.closest("button,a[href],summary")
    )
      return;
    const action = actionFor(bindings, event.code);
    if (action) {
      event.preventDefault();
      session.input(action);
    }
  });
  surface.addEventListener("contextmenu", (event) => {
    if (session?.phase === "running") event.preventDefault();
  });
  const gestures = new Gestures(),
    pointers = new Set<number>();
  surface.addEventListener("pointerdown", (event) => {
    if (session?.phase !== "running" || event.button !== 0) return;
    event.preventDefault();
    surface.focus();
    pointers.add(event.pointerId);
    gestures.down(
      event.pointerId,
      event.clientX,
      event.clientY,
      performance.now(),
    );
    try {
      surface.setPointerCapture(event.pointerId);
    } catch {
      /* Synthetic or cancelled pointer. */
    }
  });
  surface.addEventListener("pointermove", (event) => {
    if (!pointers.has(event.pointerId)) return;
    event.preventDefault();
    const action = gestures.move(event.pointerId, event.clientX, event.clientY);
    if (action) session?.input(action);
  });
  const release = (event: PointerEvent, cancel = false) => {
    if (!pointers.has(event.pointerId)) return;
    event.preventDefault();
    const action = cancel
      ? undefined
      : gestures.up(
          event.pointerId,
          event.clientX,
          event.clientY,
          performance.now(),
        );
    if (action) session?.input(action);
    pointers.delete(event.pointerId);
    if (cancel) gestures.invalidate();
    if (!pointers.size) gestures.releaseAll();
  };
  surface.addEventListener("pointerup", (event) => release(event));
  surface.addEventListener("pointercancel", (event) => release(event, true));
  surface.addEventListener("lostpointercapture", (event) => {
    // A normal pointerup already removed this ID. Do not discard other fingers.
    if (!pointers.delete(event.pointerId)) return;
    gestures.invalidate();
    if (!pointers.size) gestures.releaseAll();
  });
  for (const button of root!.querySelectorAll<HTMLButtonElement>(
    "[data-action]",
  )) {
    const input = () => session?.input(button.dataset["action"] as Action);
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      input();
    });
    button.addEventListener("click", (event) => {
      if (event.detail === 0) input();
    });
  }
  const lab = get<HTMLDetailsElement>("rig-lab"),
    poseSelect = get<HTMLSelectElement>("rig-animation"),
    animate = get<HTMLInputElement>("rig-play"),
    debug = get<HTMLInputElement>("rig-debug");
  for (const value of ANIMATIONS) poseSelect.add(new Option(value, value));
  poseSelect.value = "RUN";
  animate.checked = !reduced.checked;
  let labFrame = 0,
    labTick = 0,
    labAt = 0;
  const stopLab = () => {
    cancelAnimationFrame(labFrame);
    labFrame = 0;
    get("rig-preview").replaceChildren();
  };
  const startLab = () => {
    stopLab();
    if (!lab.open) return;
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 300;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", text().rigTitle);
    get("rig-preview").append(canvas);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    labAt = performance.now();
    const paint = (time: number) => {
      if (!lab.open) return;
      if (animate.checked && document.visibilityState === "visible")
        labTick += Math.min(6, Math.max(0, (time - labAt) * 0.06));
      labAt = time;
      ctx.fillStyle = "#f2e7ce";
      ctx.fillRect(0, 0, 640, 300);
      ctx.save();
      const clip = poseSelect.value;
      const lift = ["JUMP_START", "JUMP_APEX", "DOUBLE_JUMP", "FALL"].includes(
        clip,
      )
        ? -Math.abs(Math.sin((labTick / 72) * Math.PI)) * 65
        : 0;
      ctx.translate(160, 250 + lift);
      ctx.scale(1.75, 1.75);
      drawRig(
        canvasBrush(ctx),
        demoPose(poseSelect.value as Animation, Math.floor(labTick)),
        RULES_V2,
        reduced.checked,
        debug.checked,
      );
      ctx.restore();
      canvas.dataset["frame"] = String(Math.floor(labTick));
      canvas.dataset["animation"] = poseSelect.value;
      labFrame = requestAnimationFrame(paint);
    };
    labFrame = requestAnimationFrame(paint);
  };
  lab.addEventListener("toggle", startLab);
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && lab.open) startLab();
  });
  window.addEventListener("pagehide", stopLab);
  render();
  try {
    const { mountRunner } = await import("@ronin/runner-client/scene");
    const mounted = mountRunner(surface, {
      session: () => session,
      frame: (time) => session?.frame(time),
      reducedMotion: () => reduced.checked,
    });
    renderer = mounted;
    await mounted.ready;
    engineReady = true;
    render();
    window.addEventListener("pagehide", (event) => {
      if (event.persisted) {
        pauseRun("focus");
        return;
      }
      submission?.dispose();
      mounted.destroy();
    });
    window.addEventListener("pageshow", (event) => {
      if (event.persisted) mounted.resize();
    });
  } catch {
    renderer?.destroy();
    startError = new ClientError("RENDER_ERROR");
    play.disabled = true;
  }
  render();
}
