export const PORTAL_ORIGIN = "https://play.ronin.dev.br";
export const RUNNER_PATH = "/roninrunner";
export const LOCALES = ["pt-BR", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export function runnerPath(locale?: Locale): string {
  return locale === undefined
    ? RUNNER_PATH
    : `${RUNNER_PATH}/${locale === "pt-BR" ? "pt-br" : "en"}`;
}
export function preferredLocale(languages: readonly string[]): Locale {
  const first = languages[0]?.toLowerCase();
  return first === "pt" || first?.startsWith("pt-") ? "pt-BR" : "en";
}

export { API_ERRORS, apiErrorMessage } from "./api-errors.ts";
