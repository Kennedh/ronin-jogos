import type { Locale } from "./index.ts";
/** Same message_key contract in both locales; technical/private diagnostics stay server-side. */
export const API_ERRORS = {
  SESSION_REQUIRED: [
    "Sua sessão expirou ou não é válida. Reconecte a mesma identidade para continuar.",
    "Your session expired or is invalid. Reconnect the same identity to continue.",
  ],
  CSRF_REQUIRED: [
    "Atualize a sessão e tente novamente.",
    "Refresh your session and try again.",
  ],
  ORIGIN_FORBIDDEN: [
    "Esta origem não pode alterar sua sessão.",
    "This origin cannot change your session.",
  ],
  HOST_FORBIDDEN: ["Endereço do serviço inválido.", "Invalid service address."],
  INVALID_REQUEST: [
    "Confira os dados enviados e tente novamente.",
    "Check the submitted data and try again.",
  ],
  INVALID_JSON: [
    "Os dados enviados não estão no formato esperado.",
    "The submitted data has an invalid format.",
  ],
  IDEMPOTENCY_KEY_REQUIRED: [
    "Falta a identificação desta solicitação. Tente novamente.",
    "The request identity is missing. Please try again.",
  ],
  IDEMPOTENCY_CONFLICT: [
    "Esta solicitação já foi usada com outros dados.",
    "This request was already used with different data.",
  ],
  ACTIVE_RUN_QUOTA: [
    "Conclua as tentativas pendentes antes de iniciar outra.",
    "Complete your pending runs before starting another.",
  ],
  RATE_LIMITED: [
    "Muitas solicitações. Aguarde um pouco e tente novamente.",
    "Too many requests. Please wait and try again.",
  ],
  VERIFIER_BUSY: [
    "A verificação está ocupada. Tente iniciar a partida mais tarde.",
    "Verification is busy. Please try starting a run later.",
  ],
  REGION_LOCKED: [
    "Esta região ainda não foi desbloqueada.",
    "This region has not been unlocked yet.",
  ],
  RUN_NOT_FOUND: [
    "Tentativa não encontrada nesta conta.",
    "Run not found for this account.",
  ],
  RUN_EXPIRED: [
    "O prazo de envio desta tentativa expirou.",
    "The submission deadline for this run expired.",
  ],
  RUN_CLOSED: [
    "Esta tentativa já foi encerrada.",
    "This run has already ended.",
  ],
  ACTIVE_TIME_INVALID: [
    "O tempo ativo enviado não corresponde à janela da tentativa.",
    "The submitted active time does not match the run window.",
  ],
  SEGMENT_QUOTA: [
    "O limite de partes de replay desta tentativa foi atingido.",
    "The replay segment limit for this run was reached.",
  ],
  STORAGE_QUOTA: [
    "O limite de armazenamento de replay foi atingido.",
    "The replay storage limit was reached.",
  ],
  SEGMENT_CONFLICT: [
    "Esta parte do replay já foi recebida com outro conteúdo.",
    "This replay segment was already received with different content.",
  ],
  FINISH_CONFLICT: [
    "O fechamento desta tentativa já foi recebido com outros dados.",
    "This run finish was already received with different data.",
  ],
  FINISH_PARTS_CONFLICT: [
    "As partes enviadas não correspondem ao fechamento.",
    "The submitted segments do not match the run finish.",
  ],
  INVALID_FINISH: [
    "O fechamento da tentativa é inválido.",
    "The run finish is invalid.",
  ],
  INVALID_SEGMENT_HEADERS: [
    "Os metadados da parte de replay não correspondem ao conteúdo.",
    "The replay segment metadata does not match its content.",
  ],
  SEGMENT_HASH_MISMATCH: [
    "A integridade desta parte de replay não foi confirmada.",
    "The integrity of this replay segment could not be confirmed.",
  ],
  PAYLOAD_TOO_LARGE: [
    "O envio ultrapassa o limite de tamanho informado.",
    "The upload exceeds the stated size limit.",
  ],
  UNSUPPORTED_ENCODING: [
    "A compactação deste envio não é suportada.",
    "This upload compression is not supported.",
  ],
  UNSUPPORTED_MEDIA_TYPE: [
    "O formato deste envio não é suportado.",
    "This upload format is not supported.",
  ],
  INVALID_REPLAY: [
    "O replay enviado é inválido.",
    "The submitted replay is invalid.",
  ],
  REPLAY_INVALID: [
    "Não foi possível validar esta tentativa com as regras do jogo.",
    "This run could not be validated against the game rules.",
  ],
  VERIFIER_UNAVAILABLE: [
    "A verificação não pôde ser concluída. O resultado não foi publicado.",
    "Verification could not be completed. The result was not published.",
  ],
  SERVICE_UNAVAILABLE: [
    "Serviço temporariamente indisponível. Tente novamente mais tarde.",
    "Service temporarily unavailable. Please try again later.",
  ],
  INTERNAL_ERROR: [
    "Não foi possível concluir a solicitação. Tente novamente.",
    "The request could not be completed. Please try again.",
  ],
} as const;
export function apiErrorMessage(key: string, locale: Locale) {
  const code = key
    .replace(/^api\.errors\./, "")
    .toUpperCase() as keyof typeof API_ERRORS;
  return (API_ERRORS[code] ?? API_ERRORS.INTERNAL_ERROR)[
    locale === "pt-BR" ? 0 : 1
  ];
}
