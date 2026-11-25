import { accountMarkup } from "./account-markup.ts";
import { runnerPath, preferredLocale } from "@ronin/content";
import type { Locale } from "@ronin/content";
import { runnerCopy } from "@ronin/content/runner-copy";
import type { RunnerTextKey } from "@ronin/content/runner-copy";
const root = document.querySelector<HTMLElement>("#app");
if (!root) throw new Error("missing_root");
let savedLocale = "";
try {
  savedLocale = localStorage.getItem("ronin.locale") ?? "";
} catch {
  /* Preferences are optional. */
}
let locale: Locale = location.pathname.endsWith("/pt-br")
  ? "pt-BR"
  : location.pathname.endsWith("/en")
    ? "en"
    : savedLocale === "pt-BR" || savedLocale === "en"
      ? savedLocale
      : preferredLocale(navigator.languages);
const accountPage = location.pathname.startsWith("/account");
const accountIntent: {
  kind: "verify" | "reset" | "invalid" | "";
  token: string;
} = { kind: "", token: "" };
function takeAccountIntent() {
  accountIntent.kind = "";
  accountIntent.token = "";
  const params = new URLSearchParams(location.hash.slice(1)),
    verify = params.get("verify"),
    reset = params.get("reset");
  if (verify || reset) {
    const token = verify ?? reset ?? "";
    accountIntent.kind =
      /^[A-Za-z0-9_-]{43}$/.test(token) && !(verify && reset)
        ? verify
          ? "verify"
          : "reset"
        : "invalid";
    accountIntent.token = accountIntent.kind === "invalid" ? "" : token;
  }
  history.replaceState(null, "", location.pathname);
}
if (accountPage) {
  takeAccountIntent();
  const meta = document.createElement("meta");
  meta.name = "robots";
  meta.content = "noindex,nofollow";
  document.head.append(meta);
}
const gamePage = location.pathname.startsWith("/roninrunner"),
  text = () => runnerCopy(locale);
root.innerHTML = `<header class="masthead"><a href="/" class="wordmark"><img src="/mark.svg" width="42" height="42" alt=""><span>RONIN <b>PLAY</b></span></a><nav class="top-nav" aria-label="Ronin"><a href="/" data-copy="back"></a><a href="https://ronin.dev.br" target="_blank" rel="noopener noreferrer" data-copy="ronin"></a><a id="account-link" href="/account/en">Ronin ID</a><span class="languages"><a data-language="pt-BR" href="/roninrunner/pt-br" lang="pt-BR">PT</a><span>/</span><a data-language="en" href="/roninrunner/en" lang="en">EN</a></span></nav></header>
${
  accountPage
    ? accountMarkup
    : gamePage
      ? `<section class="game-heading"><div><p class="eyebrow" data-copy="eyebrow"></p><h1>Ronin <em>Runner.</em></h1></div><p class="development" data-copy="development"></p></section>
<section class="game-frame" aria-label="Ronin Runner"><div class="hud"><div class="biome"><span class="red-dot"></span><span id="biome-name" data-copy="bamboo"></span><small id="biome-index">01</small></div><div class="hearts" role="img" aria-label="3"><span aria-hidden="true">♥ ♥ ♥</span></div><div class="metric"><span data-copy="distance"></span><strong id="distance">0 <small>m</small></strong></div><div class="metric score-metric"><span data-copy="score"></span><strong id="score">—</strong></div><button id="pause" class="quiet" disabled><span aria-hidden="true">Ⅱ</span><span data-copy="pause"></span></button></div>
<div class="viewport"><div id="surface" class="surface" tabindex="0" role="application"></div><section class="start-panel paper-panel" id="setup"><span class="mini-label" data-copy="ready"></span><h2 data-copy="subtitle"></h2><p class="intro" data-copy="description"></p><label class="mode-label" for="mode" data-copy="mode"></label><select id="mode"><option value="FULL" data-copy="full"></option><option value="REGIONAL" data-copy="regional"></option></select><label id="region-label" for="region" data-copy="regionLabel" hidden></label><select id="region" hidden><option value="BAMBOO" data-copy="region_BAMBOO"></option><option value="TEMPLE" data-copy="region_TEMPLE" disabled></option><option value="MOUNTAINS" data-copy="region_MOUNTAINS" disabled></option><option value="CASTLE" data-copy="region_CASTLE" disabled></option></select><p class="small mode-help" data-copy="modeHelp"></p><button id="play" class="primary" disabled data-copy="play"></button><a href="#rig-lab" id="open-creator" class="creator-link" data-copy="rigTitle"></a><p id="start-error" class="error" role="alert" hidden></p></section>
<section class="pause-panel paper-panel" id="pause-panel" hidden role="dialog" aria-modal="true" aria-labelledby="pause-title"><span class="mini-label" data-copy="shieldLabel"></span><h2 id="pause-title" data-copy="paused"></h2><p id="pause-hint" data-copy="pauseHint"></p><button id="resume" class="primary" data-copy="resume"></button><button id="quit" class="quiet" data-copy="quit"></button><p id="rotate-note" class="small" data-copy="rotateHint" hidden></p><button id="portrait" class="quiet" data-copy="continuePortrait" hidden></button><nav class="languages pause-languages" aria-label="Idioma / Language"><a data-language="pt-BR" href="/roninrunner/pt-br" lang="pt-BR">PT</a><span>/</span><a data-language="en" href="/roninrunner/en" lang="en">EN</a></nav></section>
<section class="pause-panel paper-panel" id="confirm-panel" hidden role="dialog" aria-modal="true" aria-labelledby="confirm-title"><span class="mini-label" data-copy="exitHint"></span><h2 id="confirm-title" data-copy="confirmQuit"></h2><p data-copy="quitHint"></p><button id="confirm-quit" class="primary" data-copy="confirm"></button><button id="cancel-quit" class="quiet" data-copy="cancel"></button></section>
<section class="countdown-panel" id="countdown-panel" hidden role="status"><span data-copy="countdown"></span><strong id="countdown">3</strong></section>
<section id="result" class="result-panel paper-panel" hidden aria-labelledby="result-title" tabindex="-1"><span class="mini-label" data-copy="resultTitle"></span><h2 id="result-title" data-copy="deadTitle"></h2><p id="end-reason"></p><div class="result-numbers"><div><span id="result-label" data-copy="localStats"></span><strong id="result-score">—</strong></div><div><span data-copy="distance"></span><strong id="result-distance">—</strong></div></div><p id="result-status" role="status"></p><div id="boss-results"></div><p id="result-hint" class="small"></p><button id="new-run" class="primary" data-copy="newRun" disabled></button></section>
</div><div id="boss-hud" class="boss-hud" hidden><strong id="boss-name"></strong><label><span data-copy="bossHp"></span> <progress id="boss-energy" max="1" value="1"></progress></label><span id="boss-openings"></span><span id="boss-cue" role="status" aria-live="polite"></span></div><div class="combat-strip" id="combat-strip"><label for="concentration" data-copy="concentration"></label><progress id="concentration" max="100" value="0"></progress><strong id="concentration-value">0 / 100</strong><span id="combo"></span><span id="world-warning" role="status" aria-live="polite" hidden data-copy="abyssAhead"></span><span id="combat-feedback" role="status" aria-live="polite"></span></div><div class="under-stage"><p class="keyboard-help" data-copy="keyboard"></p><p class="touch-help" data-copy="touch"></p><span class="stage-meta" data-copy="inkLabel"></span></div><div id="action-buttons" class="action-buttons" hidden><button data-action="JUMP"><span aria-hidden="true">↑</span><span data-copy="jump"></span></button><button data-action="SLIDE"><span aria-hidden="true">↓</span><span data-copy="slide"></span></button><button data-action="ATTACK"><span aria-hidden="true">／</span><span data-copy="attack"></span></button></div></section>
<div class="connection" id="connection" hidden><span class="red-dot"></span><p id="connection-message" role="status"></p><button id="retry" class="quiet" data-copy="retry"></button></div><p class="notice" id="immersive-note" hidden data-copy="fullscreenFallback"></p>
<section class="bottom-grid"><div class="settings"><h2 data-copy="settings"></h2><label><input id="alternate" type="checkbox"><span data-copy="alternate"></span></label><label><input id="reduced" type="checkbox"><span data-copy="reduced"></span></label><label><input id="fullscreen" type="checkbox"><span data-copy="fullscreen"></span></label></div><div class="instructions"><h2 data-copy="controls"></h2><p data-copy="combatHint"></p><p data-copy="touch"></p><p data-copy="privacy" class="small"></p></div><details class="policy"><summary data-copy="policyTitle"></summary><p data-copy="policy"></p><p id="actual-limits" class="small"></p><p data-copy="memory"></p><p data-copy="field" class="small"></p></details></section><section class="control-study"><div class="key-settings"><h2 data-copy="rebindTitle"></h2><p class="small" data-copy="rebindHint"></p><label><span data-copy="jump"></span><input id="bind-JUMP" readonly aria-label="Jump / Saltar" data-binding="JUMP"></label><label><span data-copy="slide"></span><input id="bind-SLIDE" readonly aria-label="Slide / Deslizar" data-binding="SLIDE"></label><label><span data-copy="attack"></span><input id="bind-ATTACK" readonly aria-label="Katana" data-binding="ATTACK"></label><p id="binding-error" role="alert" hidden data-copy="rebindError"></p><button id="reset-keys" class="quiet" data-copy="resetKeys"></button></div><aside class="boss-progress"><p data-copy="bossHelp"></p><p id="boss-progress" role="status"></p><button id="boss-refresh" type="button" data-copy="bossRefresh"></button><label><input id="boss-sound" type="checkbox" checked> <span data-copy="bossSound"></span></label></aside><details id="rig-lab" class="rig-lab"><summary data-copy="rigTitle"></summary><p data-copy="rigHint"></p><div class="creator-layout"><div class="creator-preview"><label for="rig-animation" data-copy="rigPose"></label><select id="rig-animation"></select><label><input type="checkbox" id="rig-play" checked><span data-copy="rigPlay"></span></label><label><input type="checkbox" id="rig-debug"><span data-copy="rigDebug"></span></label><div id="rig-preview"></div><output id="creator-emblem"></output></div><div><div id="creator-fields"></div><p id="creator-requirement"></p><div class="creator-actions"><button type="button" id="creator-save" class="primary" data-copy="creatorSave" disabled></button><button type="button" id="creator-reset" class="quiet" data-copy="creatorReset" disabled></button><button type="button" id="creator-reload" class="quiet" data-copy="creatorReload"></button></div><p id="creator-status" role="status"></p></div></div></details></section><p class="scope" data-copy="scope"></p>`
      : `<section class="hub-hero"><p class="eyebrow" data-copy="brand"></p><h1 data-copy="homeTitle"></h1><p data-copy="homeDescription"></p><a class="primary" id="hub-play" href="${runnerPath(locale)}" data-copy="enter"></a><div class="hub-ink" aria-hidden="true"><span class="sun"></span><i></i><i></i><i></i><i></i><b>R.</b></div></section><section class="hub-game"><p class="mini-label" data-copy="gameTag"></p><h2>Ronin Runner</h2><p data-copy="description"></p><p class="development" data-copy="development"></p></section>`
}
<footer><span>© Ronin Play</span><a href="/third-party.txt" target="_blank" rel="noopener noreferrer" data-copy="licenses"></a><p data-copy="footer"></p><a href="https://ronin.dev.br" target="_blank" rel="noopener noreferrer">Ronin ↗</a></footer>`;
const get = <T extends HTMLElement = HTMLElement>(id: string) => {
  const node = document.getElementById(id);
  if (!node) throw new Error("missing_element_" + id);
  return node as T;
};
function applyCopy() {
  document.documentElement.lang = locale;
  document.title = accountPage
    ? "Ronin ID · Ronin Play"
    : "Ronin Runner · Ronin Play";
  get<HTMLAnchorElement>("account-link").href =
    "/account/" + (locale === "pt-BR" ? "pt-br" : "en");
  for (const node of root!.querySelectorAll<HTMLElement>("[data-copy]"))
    node.textContent = text()[node.dataset["copy"] as RunnerTextKey];
  for (const a of root!.querySelectorAll<HTMLAnchorElement>(
    "[data-language]",
  )) {
    a.href = accountPage
      ? "/account/" + (a.dataset["language"] === "pt-BR" ? "pt-br" : "en")
      : gamePage
        ? runnerPath(a.dataset["language"] as Locale)
        : "/";
    a.setAttribute(
      "aria-current",
      a.dataset["language"] === locale ? "true" : "false",
    );
  }
  const hub = document.querySelector<HTMLAnchorElement>("#hub-play");
  if (hub) hub.href = runnerPath(locale);
}
applyCopy();
let redraw = () => {};
if (accountPage)
  window.addEventListener("hashchange", () => {
    takeAccountIntent();
    window.dispatchEvent(new Event("ronin-account-link"));
    redraw();
  });
for (const link of root.querySelectorAll<HTMLAnchorElement>("[data-language]"))
  link.addEventListener("click", (event) => {
    event.preventDefault();
    locale = link.dataset["language"] as Locale;
    try {
      localStorage.setItem("ronin.locale", locale);
    } catch {
      /* Optional preference. */
    }
    if (gamePage) history.replaceState(null, "", runnerPath(locale));
    if (accountPage)
      history.replaceState(
        null,
        "",
        "/account/" + (locale === "pt-BR" ? "pt-br" : "en"),
      );
    applyCopy();
    redraw();
  });
if (gamePage)
  void import("./game.ts")
    .then((module) =>
      module.initializeGame(root!, {
        locale: () => locale,
        text,
        setRedraw: (fn) => {
          redraw = fn;
        },
      }),
    )
    .catch(() => {
      get("start-error").hidden = false;
      get("start-error").textContent = text().renderError;
    });

if (accountPage)
  void import("./account.ts")
    .then((module) =>
      module.initializeAccount(
        root!,
        {
          locale: () => locale,
          setRedraw: (fn) => {
            redraw = fn;
          },
        },
        accountIntent,
      ),
    )
    .catch(() => {
      const e = document.getElementById("account-error");
      if (e) {
        e.hidden = false;
        e.textContent =
          locale === "pt-BR"
            ? "Não foi possível carregar a conta. Recarregue a página."
            : "Could not load account. Please reload the page.";
      }
    });
