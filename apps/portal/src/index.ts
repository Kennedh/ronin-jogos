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
const gamePage = location.pathname.startsWith("/roninrunner"),
  text = () => runnerCopy(locale);
root.innerHTML = `<header class="masthead"><a href="/" class="wordmark"><img src="/mark.svg" width="42" height="42" alt=""><span>RONIN <b>PLAY</b></span></a><nav class="top-nav" aria-label="Ronin"><a href="/" data-copy="back"></a><a href="https://ronin.dev.br" target="_blank" rel="noopener noreferrer" data-copy="ronin"></a><span class="languages"><a data-language="pt-BR" href="/roninrunner/pt-br" lang="pt-BR">PT</a><span>/</span><a data-language="en" href="/roninrunner/en" lang="en">EN</a></span></nav></header>
${
  gamePage
    ? `<section class="game-heading"><div><p class="eyebrow" data-copy="eyebrow"></p><h1>Ronin <em>Runner.</em></h1></div><p class="development" data-copy="development"></p></section>
<section class="game-frame" aria-label="Ronin Runner"><div class="hud"><div class="biome"><span class="red-dot"></span><span data-copy="bamboo"></span><small>01</small></div><div class="hearts" role="img" aria-label="3"><span aria-hidden="true">♥ ♥ ♥</span></div><div class="metric"><span data-copy="distance"></span><strong id="distance">0 <small>m</small></strong></div><div class="metric score-metric"><span data-copy="score"></span><strong id="score">—</strong></div><button id="pause" class="quiet" disabled><span aria-hidden="true">Ⅱ</span><span data-copy="pause"></span></button></div>
<div class="viewport"><div id="surface" class="surface" tabindex="0" role="application"></div><section class="start-panel paper-panel" id="setup"><span class="mini-label" data-copy="ready"></span><h2 data-copy="subtitle"></h2><p class="intro" data-copy="description"></p><label class="mode-label" for="mode" data-copy="mode"></label><select id="mode"><option value="FULL" data-copy="full"></option><option value="REGIONAL" data-copy="regional"></option></select><p class="small mode-help" data-copy="modeHelp"></p><button id="play" class="primary" disabled data-copy="play"></button><p id="start-error" class="error" role="alert" hidden></p></section>
<section class="pause-panel paper-panel" id="pause-panel" hidden role="dialog" aria-modal="true" aria-labelledby="pause-title"><span class="mini-label" data-copy="shieldLabel"></span><h2 id="pause-title" data-copy="paused"></h2><p id="pause-hint" data-copy="pauseHint"></p><button id="resume" class="primary" data-copy="resume"></button><button id="quit" class="quiet" data-copy="quit"></button><p id="rotate-note" class="small" data-copy="rotateHint" hidden></p><button id="portrait" class="quiet" data-copy="continuePortrait" hidden></button><nav class="languages pause-languages" aria-label="Idioma / Language"><a data-language="pt-BR" href="/roninrunner/pt-br" lang="pt-BR">PT</a><span>/</span><a data-language="en" href="/roninrunner/en" lang="en">EN</a></nav></section>
<section class="pause-panel paper-panel" id="confirm-panel" hidden role="dialog" aria-modal="true" aria-labelledby="confirm-title"><span class="mini-label" data-copy="exitHint"></span><h2 id="confirm-title" data-copy="confirmQuit"></h2><p data-copy="quitHint"></p><button id="confirm-quit" class="primary" data-copy="confirm"></button><button id="cancel-quit" class="quiet" data-copy="cancel"></button></section>
<section class="countdown-panel" id="countdown-panel" hidden role="status"><span data-copy="countdown"></span><strong id="countdown">3</strong></section>
<section id="result" class="result-panel paper-panel" hidden aria-labelledby="result-title" tabindex="-1"><span class="mini-label" data-copy="resultTitle"></span><h2 id="result-title" data-copy="deadTitle"></h2><p id="end-reason"></p><div class="result-numbers"><div><span id="result-label" data-copy="localStats"></span><strong id="result-score">—</strong></div><div><span data-copy="distance"></span><strong id="result-distance">—</strong></div></div><p id="result-status" role="status"></p><p id="result-hint" class="small"></p><button id="new-run" class="primary" data-copy="newRun" disabled></button></section>
</div><div class="under-stage"><p class="keyboard-help" data-copy="keyboard"></p><p class="touch-help" data-copy="touch"></p><span class="stage-meta" data-copy="inkLabel"></span></div><div id="action-buttons" class="action-buttons" hidden><button data-action="JUMP"><span aria-hidden="true">↑</span><span data-copy="jump"></span></button><button data-action="SLIDE"><span aria-hidden="true">↓</span><span data-copy="slide"></span></button><button data-action="ATTACK"><span aria-hidden="true">／</span><span data-copy="attack"></span></button></div></section>
<div class="connection" id="connection" hidden><span class="red-dot"></span><p id="connection-message" role="status"></p><button id="retry" class="quiet" data-copy="retry"></button></div><p class="notice" id="immersive-note" hidden data-copy="fullscreenFallback"></p>
<section class="bottom-grid"><div class="settings"><h2 data-copy="settings"></h2><label><input id="alternate" type="checkbox"><span data-copy="alternate"></span></label><label><input id="reduced" type="checkbox"><span data-copy="reduced"></span></label><label><input id="fullscreen" type="checkbox"><span data-copy="fullscreen"></span></label></div><div class="instructions"><h2 data-copy="controls"></h2><p data-copy="touch"></p><p data-copy="privacy" class="small"></p></div><details class="policy"><summary data-copy="policyTitle"></summary><p data-copy="policy"></p><p id="actual-limits" class="small"></p><p data-copy="memory"></p><p data-copy="field" class="small"></p></details></section><p class="scope" data-copy="scope"></p>`
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
  document.title = "Ronin Runner · Ronin Play";
  for (const node of root!.querySelectorAll<HTMLElement>("[data-copy]"))
    node.textContent = text()[node.dataset["copy"] as RunnerTextKey];
  for (const a of root!.querySelectorAll<HTMLAnchorElement>(
    "[data-language]",
  )) {
    a.href = gamePage ? runnerPath(a.dataset["language"] as Locale) : "/";
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
