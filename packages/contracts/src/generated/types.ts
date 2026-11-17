export interface paths {
  "/auth/guest": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Criar ou reutilizar identidade visitante */
    post: operations["post_auth_guest"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/register": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Registrar conta por email e senha */
    post: operations["post_auth_register"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/login": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Login email/senha */
    post: operations["post_auth_login"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/google": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Login com credencial do Google verificada no servidor */
    post: operations["post_auth_google"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/verify-email": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Confirmar email por token de uso unico */
    post: operations["post_auth_verify_email"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/password/forgot": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Pedir redefinicao de senha sem revelar se conta existe */
    post: operations["post_auth_password_forgot"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/password/reset": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Redefinir senha com token de uso unico */
    post: operations["post_auth_password_reset"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/logout": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Revogar sessao atual */
    post: operations["post_auth_logout"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/merge/preview": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Consultar potencial mesclagem com prova de ambas identidades */
    post: operations["post_auth_merge_preview"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/merge/confirm": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Mesclar duas identidades autenticadas com idempotencia */
    post: operations["post_auth_merge_confirm"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/auth/link": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Vincular Google ou email a identidade autenticada */
    post: operations["post_auth_link"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/sessions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Sessoes ativas e autenticacoes recentes resumidas */
    get: operations["get_me_sessions"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/sessions/{session_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    /** Revogar sessao do proprio usuario */
    delete: operations["delete_me_sessions_session_id"];
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/preferences": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Idioma, som, acessibilidade e qualidade */
    patch: operations["patch_me_preferences"];
    trace?: never;
  };
  "/me/progress": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Metricas de carreira e regioes desbloqueadas verificadas */
    get: operations["get_me_progress"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/missions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Catalogo de missoes e progresso confiavel */
    get: operations["get_me_missions"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/achievements": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Conquistas e quatro selos de chefes */
    get: operations["get_me_achievements"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/regions": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Regioes atingidas legitimamente */
    get: operations["get_me_regions"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/players/{player_id}/public": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Somente dados publicos de perfil */
    get: operations["get_players_player_id_public"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/export": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Solicitar exportacao de dados protegida */
    post: operations["post_me_export"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/delete-request": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Solicitar exclusao de conta apos reautenticacao */
    post: operations["post_me_delete_request"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Perfil atual da identidade */
    get: operations["get_me"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/character/catalog": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Pecas basicas livres e cosmeticos desbloqueaveis */
    get: operations["get_character_catalog"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/character": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Aparencia atual */
    get: operations["get_me_character"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Atualizar IDs de pecas permitidas com controle de concorrencia */
    patch: operations["patch_me_character"];
    trace?: never;
  };
  "/runs/start": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Criar tentativa competitiva FULL ou REGIONAL */
    post: operations["post_runs_start"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/runs/{run_id}/segments/{index}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    /**
     * Enviar bloco compacto de comandos em ticks
     * @description Codec rr-input-v1 conforme ADR-002; headers devem coincidir com o envelope. Hash da representação canônica descomprimida, não dos bytes gzip. Limites aplicados em streaming antes/depois da descompressão.
     */
    put: operations["put_runs_run_id_segments_index"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/runs/{run_id}/finish": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Finalizar e pedir verificacao server-side
     * @description Primeiro finish fixa final_tick/hash/motivo até expires_at. Retry idêntico não renova prazo. Partes faltantes podem chegar até upload_deadline; PENDING apenas após completude. Atraso do worker não altera elegibilidade semanal.
     */
    post: operations["post_runs_run_id_finish"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/runs/{run_id}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Consultar somente a propria tentativa */
    get: operations["get_runs_run_id"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/leaderboards/{kind}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Ranking FULL global ou REGIONAL separado por versao de regra */
    get: operations["get_leaderboards_kind"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/weekly/current": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Edicao global publicada de desafios */
    get: operations["get_weekly_current"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/weekly/me": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Progresso atual validado e selos 2/4/5 */
    get: operations["get_weekly_me"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/weekly/archive": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Historico de edicoes, sem progresso privado */
    get: operations["get_weekly_archive"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/weekly/{week_id}/me": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Progresso individual de edicao historica */
    get: operations["get_weekly_week_id_me"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/cosmetics": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Inventario de cosmeticos */
    get: operations["get_me_cosmetics"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/me/emblems/equip": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    /** Equipar um unico emblema ja concedido */
    patch: operations["patch_me_emblems_equip"];
    trace?: never;
  };
  "/health": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Liveness da API, sem afirmar prontidão do banco/verificador */
    get: operations["get_health"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    /** @enum {string} */
    RunMode: "FULL" | "REGIONAL";
    PlayerSummary: {
      /** Format: uuid */
      player_id: string;
      /** @enum {string} */
      account_type: "GUEST" | "EMAIL" | "GOOGLE" | "MULTI";
      nickname: string | null;
      /** @enum {string} */
      locale: "pt-BR" | "en";
      email_verified?: boolean;
      region_unlocks?: string[];
    };
    RegisterRequest: {
      /** Format: email */
      email: string;
      password: string;
      nickname?: string;
    };
    EmailLoginRequest: {
      /** Format: email */
      email: string;
      password: string;
    };
    CharacterPart: {
      part_id: string;
      slot: string;
      is_basic_free: boolean;
      unlock_requirement_id?: string | null;
      rig_version: string;
      locale_key?: string;
    };
    Character: {
      /** Format: uuid */
      player_id: string;
      appearance_version: number;
      slots: {
        [key: string]: string;
      };
    };
    CharacterUpdate: {
      expected_appearance_version: number;
      slots: {
        [key: string]: string;
      };
    };
    RunTicket: {
      /** Format: uuid */
      run_id: string;
      mode: components["schemas"]["RunMode"];
      /** @enum {string} */
      starting_region_id: "BAMBOO" | "TEMPLE" | "MOUNTAINS" | "CASTLE";
      seed: string;
      versions: components["schemas"]["RunVersions"];
      /** Format: date-time */
      started_at: string;
      /** Format: date-time */
      expires_at: string;
      limits: components["schemas"]["RunLimits"];
      /** Format: date-time */
      server_time: string;
    } & (
      | {
          /** @constant */
          mode?: "FULL";
          /** @constant */
          starting_region_id?: "BAMBOO";
        }
      | {
          /** @constant */
          mode?: "REGIONAL";
        }
    );
    SegmentAck: {
      /** Format: uuid */
      run_id: string;
      index: number;
      segment_hash: string;
      /** @constant */
      persisted: true;
    };
    RunStatus: {
      /** Format: uuid */
      run_id: string;
      /** @enum {string} */
      status:
        | "CREATED"
        | "ACTIVE"
        | "AWAITING_SEGMENTS"
        | "PENDING"
        | "VERIFYING"
        | "VERIFIED"
        | "REJECTED"
        | "ABANDONED"
        | "EXPIRED";
      score?: string | null;
      distance_m?: number | null;
      /** Format: date-time */
      verified_at?: string | null;
      rejection_code?: string | null;
      /** @enum {string|null} */
      end_reason?: "HP_ZERO" | "ABYSS" | "QUIT" | null;
      ranked?: boolean | null;
    } & (unknown & unknown);
    LeaderboardEntry: {
      rank: number;
      /** Format: uuid */
      player_id?: string;
      public_name: string;
      avatar_parts?: {
        [key: string]: string;
      };
      /** @description Inteiro decimal para evitar overflow de JavaScript */
      score: string;
      distance_m: number;
      rules_major: number;
    };
    LeaderboardPage: {
      entries: components["schemas"]["LeaderboardEntry"][];
      next_cursor?: string | null;
      rules_major: number;
    };
    WeeklyEdition: {
      week_id: string;
      /** Format: date-time */
      starts_at: string;
      /** Format: date-time */
      ends_at: string;
      challenges: {
        challenge_id: string;
        /** @enum {string} */
        tier: "EASY" | "MEDIUM" | "HARD";
        metric: string;
        target: number;
        locale_key: string;
      }[];
    };
    ApiError: {
      error: {
        code: string;
        message_key: string;
        request_id: string;
        details?: Record<string, never>;
      };
    };
    Health: {
      /** @constant */
      status: "ok";
      /** @constant */
      service: "ronin-play-api";
    };
    RunStart: {
      mode: components["schemas"]["RunMode"];
      /** @enum {string} */
      region_id?: "BAMBOO" | "TEMPLE" | "MOUNTAINS" | "CASTLE";
    } & (
      | {
          /** @constant */
          mode?: "FULL";
          region_id?: never;
        }
      | {
          /** @constant */
          mode?: "REGIONAL";
          /** @enum {string} */
          region_id: "BAMBOO" | "TEMPLE" | "MOUNTAINS" | "CASTLE";
        }
    );
    RunVersions: {
      rules_major: number;
      rules_patch: number;
      generator_version: string;
      scoring_version: string;
      /** @constant */
      replay_protocol_version: "rr-input-v1";
      rules_manifest_hash: string;
      assets_manifest_version: string;
    };
    RunLimits: {
      /** @constant */
      segment_ticks: 3600;
      /** @constant */
      max_encoded_bytes: 262144;
      /** @constant */
      max_decoded_bytes: 1048576;
      /** @constant */
      max_actions_per_tick: 2;
      /** @constant */
      upload_grace_seconds: 86400;
    };
    FinishRequest: {
      final_segment_index: number;
      final_tick: number;
      final_hash: string;
      /** @enum {string} */
      end_reason: "HP_ZERO" | "ABYSS" | "QUIT";
    };
    ReplayAction: {
      tick: number;
      /** @enum {string} */
      action: "JUMP" | "SLIDE" | "ATTACK";
    };
    ReplayControl: {
      tick: number;
      sequence: number;
      /** @enum {string} */
      action: "PAUSE" | "RESUME" | "QUIT";
    };
    ReplaySegment: {
      /** @constant */
      protocol: "rr-input-v1";
      /** Format: uuid */
      run_id: string;
      index: number;
      start_tick: number;
      end_tick: number;
      previous_hash: string | null;
      actions: components["schemas"]["ReplayAction"][];
      controls: components["schemas"]["ReplayControl"][];
    };
  };
  responses: {
    /** @description Corpo ou formato invalido */
    BadRequest: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["ApiError"];
      };
    };
    /** @description Sessao ou credencial invalida */
    Unauthorized: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["ApiError"];
      };
    };
    /** @description Sem permissao sobre recurso */
    Forbidden: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["ApiError"];
      };
    };
    /** @description Recurso inexistente */
    NotFound: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["ApiError"];
      };
    };
    /** @description Idempotencia, versao concorrente ou estado de run invalido */
    Conflict: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["ApiError"];
      };
    };
    /** @description Estado invalido ou token expirado */
    InvalidState: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["ApiError"];
      };
    };
    /** @description Segmento maior que limite da politica */
    PayloadTooLarge: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["ApiError"];
      };
    };
    /** @description Muitas requisicoes, usar Retry-After */
    RateLimited: {
      headers: {
        "Retry-After"?: number;
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["ApiError"];
      };
    };
  };
  parameters: {
    RunId: string;
  };
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  post_auth_guest: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Sessao de visitante restaurada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PlayerSummary"];
        };
      };
      /** @description Identidade visitante criada */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PlayerSummary"];
        };
      };
      429: components["responses"]["RateLimited"];
    };
  };
  post_auth_register: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RegisterRequest"];
      };
    };
    responses: {
      /** @description Confirmacao solicitada sem enumeracao de contas */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      400: components["responses"]["BadRequest"];
      429: components["responses"]["RateLimited"];
    };
  };
  post_auth_login: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["EmailLoginRequest"];
      };
    };
    responses: {
      /** @description Sessao autenticada emitida em cookie seguro */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PlayerSummary"];
        };
      };
      401: components["responses"]["Unauthorized"];
      429: components["responses"]["RateLimited"];
    };
  };
  post_auth_google: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          id_token: string;
          csrf_proof: string;
        };
      };
    };
    responses: {
      /** @description Identidade Google autenticada e vinculada ao sub */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PlayerSummary"];
        };
      };
      401: components["responses"]["Unauthorized"];
      429: components["responses"]["RateLimited"];
    };
  };
  post_auth_verify_email: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          token: string;
        };
      };
    };
    responses: {
      /** @description Endereco confirmado */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      422: components["responses"]["InvalidState"];
    };
  };
  post_auth_password_forgot: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          /** Format: email */
          email: string;
        };
      };
    };
    responses: {
      /** @description Pedido recebido; resposta neutra */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      429: components["responses"]["RateLimited"];
    };
  };
  post_auth_password_reset: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          token: string;
          new_password: string;
        };
      };
    };
    responses: {
      /** @description Senha atualizada, sessoes rotacionadas */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      422: components["responses"]["InvalidState"];
    };
  };
  post_auth_logout: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Sessao encerrada */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      401: components["responses"]["Unauthorized"];
    };
  };
  post_auth_merge_preview: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          target_session_proof: string;
        };
      };
    };
    responses: {
      /** @description Comparativo sem modificar dados */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            merge_nonce: string;
            /** Format: uuid */
            source_player_id: string;
            /** Format: uuid */
            target_player_id: string;
            summary?: Record<string, never>;
          };
        };
      };
      403: components["responses"]["Forbidden"];
    };
  };
  post_auth_merge_confirm: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          merge_nonce: string;
          /** @constant */
          confirmed: true;
        };
      };
    };
    responses: {
      /** @description Perfil canonico, sem duplicar eventos */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PlayerSummary"];
        };
      };
      409: components["responses"]["Conflict"];
    };
  };
  post_auth_link: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          /** @enum {string} */
          method: "EMAIL" | "GOOGLE";
          /** @description Prova de posse validada no servidor */
          proof: string;
        };
      };
    };
    responses: {
      /** @description Metodo associado, sessao rotacionada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PlayerSummary"];
        };
      };
      403: components["responses"]["Forbidden"];
      409: components["responses"]["Conflict"];
    };
  };
  get_me_sessions: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Dispositivos sem dados sensiveis */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            sessions?: {
              session_id: string;
              /** Format: date-time */
              created_at: string;
              current: boolean;
              /** Format: date-time */
              last_seen_at?: string | null;
            }[];
          };
        };
      };
    };
  };
  delete_me_sessions_session_id: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        session_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Sessao revogada */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      403: components["responses"]["Forbidden"];
    };
  };
  patch_me_preferences: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          /** @enum {string} */
          locale?: "pt-BR" | "en";
          reduced_motion?: boolean;
          /** @enum {string} */
          graphics_quality?: "AUTO" | "LOW" | "HIGH";
          music_volume?: number;
          effects_volume?: number;
        };
      };
    };
    responses: {
      /** @description Preferencias persistidas */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            [key: string]: unknown;
          };
        };
      };
    };
  };
  get_me_progress: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Progresso e marcos */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            verified_distance_m: number;
            verified_perfect_slashes: number;
            verified_kills: number;
            unlocked_regions: string[];
          };
        };
      };
    };
  };
  get_me_missions: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Progresso das missoes */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            missions?: {
              [key: string]: unknown;
            }[];
          };
        };
      };
    };
  };
  get_me_achievements: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Conquistas concedidas */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            achievements?: string[];
            boss_seals?: string[];
          };
        };
      };
    };
  };
  get_me_regions: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Lista de region IDs */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            unlocked_regions?: string[];
          };
        };
      };
    };
  };
  get_players_player_id_public: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        player_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Nome publico, avatar sintetico e conquistas publicas */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            /** Format: uuid */
            player_id: string;
            public_name: string;
            avatar_parts?: {
              [key: string]: string;
            };
            achievements_public?: string[];
          };
        };
      };
    };
  };
  post_me_export: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Pedido aceito apos autenticacao recente quando necessario */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      403: components["responses"]["Forbidden"];
    };
  };
  post_me_delete_request: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Pedido aceito com instrucoes e periodo de confirmacao */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      403: components["responses"]["Forbidden"];
    };
  };
  get_me: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Perfil e configuracoes */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["PlayerSummary"];
        };
      };
      401: components["responses"]["Unauthorized"];
    };
  };
  get_character_catalog: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Catalogo versionado */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            catalog_version: string;
            parts: components["schemas"]["CharacterPart"][];
          };
        };
      };
    };
  };
  get_me_character: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Equipamento atual */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Character"];
        };
      };
    };
  };
  patch_me_character: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["CharacterUpdate"];
      };
    };
    responses: {
      /** @description Aparencia canonica atualizada */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Character"];
        };
      };
      403: components["responses"]["Forbidden"];
      409: components["responses"]["Conflict"];
    };
  };
  post_runs_start: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["RunStart"];
      };
    };
    responses: {
      /** @description Tentativa autorizada, seed e versoes do servidor */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RunTicket"];
        };
      };
      403: components["responses"]["Forbidden"];
      429: components["responses"]["RateLimited"];
    };
  };
  put_runs_run_id_segments_index: {
    parameters: {
      query?: never;
      header: {
        "X-Start-Tick": number;
        "X-End-Tick": number;
        "X-Segment-Hash": string;
        "X-Previous-Segment-Hash"?: string;
      };
      path: {
        run_id: components["parameters"]["RunId"];
        index: number;
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/octet-stream": string;
      };
    };
    responses: {
      /** @description Segmento identico ja recebido */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["SegmentAck"];
        };
      };
      /** @description Segmento persistido; ainda nao verificado */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["SegmentAck"];
        };
      };
      409: components["responses"]["Conflict"];
      413: components["responses"]["PayloadTooLarge"];
    };
  };
  post_runs_run_id_finish: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        run_id: components["parameters"]["RunId"];
      };
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["FinishRequest"];
      };
    };
    responses: {
      /** @description Fechamento imutável recebido; AWAITING_SEGMENTS até cadeia completa, depois PENDING; sem score público */
      202: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RunStatus"];
        };
      };
      409: components["responses"]["Conflict"];
      422: components["responses"]["InvalidState"];
    };
  };
  get_runs_run_id: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        run_id: components["parameters"]["RunId"];
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Status e resultados confirmados se VERIFIED */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RunStatus"];
        };
      };
      403: components["responses"]["Forbidden"];
      404: components["responses"]["NotFound"];
    };
  };
  get_leaderboards_kind: {
    parameters: {
      query?: {
        region_id?: string;
        rules_major?: number;
        cursor?: string;
      };
      header?: never;
      path: {
        kind:
          | "global"
          | "global_weekly"
          | "regional"
          | "regional_weekly"
          | "hall_of_fame";
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Melhor run VERIFIED por jogador por quadro e paginacao cursor */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["LeaderboardPage"];
        };
      };
    };
  };
  get_weekly_current: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Cinco desafios e prazo UTC */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["WeeklyEdition"];
        };
      };
    };
  };
  get_weekly_me: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Edicao, progresso individual e maior tier */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            edition: components["schemas"]["WeeklyEdition"];
            challenges_completed: number;
            earned_tiers: ("BRONZE" | "SILVER" | "GOLD")[];
          };
        };
      };
    };
  };
  get_weekly_archive: {
    parameters: {
      query?: {
        cursor?: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Pagina de edicoes ja publicadas */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            editions?: components["schemas"]["WeeklyEdition"][];
            next_cursor?: string | null;
          };
        };
      };
    };
  };
  get_weekly_week_id_me: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        week_id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Recompensas bronze prata e ouro da edicao */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            week_id: string;
            challenges_completed: number;
            earned_tiers: ("BRONZE" | "SILVER" | "GOLD")[];
          };
        };
      };
    };
  };
  get_me_cosmetics: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Itens e estado de posse/equipamento */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            unlocked_part_ids?: string[];
            equipped?: components["schemas"]["Character"];
          };
        };
      };
    };
  };
  patch_me_emblems_equip: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": {
          emblem_instance_id: string | null;
        };
      };
    };
    responses: {
      /** @description Emblema atualizado apos verificacao de posse */
      204: {
        headers: {
          [name: string]: unknown;
        };
        content?: never;
      };
      403: components["responses"]["Forbidden"];
    };
  };
  get_health: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Processo responde */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Health"];
        };
      };
    };
  };
}
