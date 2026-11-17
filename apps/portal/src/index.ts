import { runnerPath, preferredLocale } from "@ronin/content";
const locale = location.pathname.endsWith("/pt-br")
  ? "pt-BR"
  : location.pathname.endsWith("/en")
    ? "en"
    : preferredLocale(navigator.languages);
const root = document.querySelector("#app");
if (!root) throw new Error("missing_root");
document.documentElement.lang = locale;
const title = document.createElement("h1");
title.textContent = "Ronin Play";
const status = document.createElement("p");
status.textContent =
  locale === "pt-BR"
    ? "Ambiente de desenvolvimento. Ronin Runner ainda não está disponível para jogar."
    : "Development environment. Ronin Runner is not playable yet.";
const nav = document.createElement("nav");
for (const language of ["pt-BR", "en"] as const) {
  const a = document.createElement("a");
  a.href = runnerPath(language);
  a.textContent = language;
  nav.append(a, " ");
}
root.append(title, status, nav);
