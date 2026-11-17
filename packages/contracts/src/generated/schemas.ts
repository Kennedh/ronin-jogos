/* Generated from OpenAPI. Do not edit. */
export const definitions = {
  RunMode: {
    type: "string",
    enum: ["FULL", "REGIONAL"],
  },
  PlayerSummary: {
    type: "object",
    required: ["player_id", "account_type", "nickname", "locale"],
    properties: {
      player_id: {
        type: "string",
        format: "uuid",
      },
      account_type: {
        type: "string",
        enum: ["GUEST", "EMAIL", "GOOGLE", "MULTI"],
      },
      nickname: {
        type: ["string", "null"],
      },
      locale: {
        type: "string",
        enum: ["pt-BR", "en"],
      },
      email_verified: {
        type: "boolean",
      },
      region_unlocks: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  },
  RegisterRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
      },
      password: {
        type: "string",
        minLength: 12,
        maxLength: 256,
      },
      nickname: {
        type: "string",
        minLength: 3,
        maxLength: 20,
      },
    },
    additionalProperties: false,
  },
  EmailLoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: {
        type: "string",
        format: "email",
      },
      password: {
        type: "string",
      },
    },
    additionalProperties: false,
  },
  CharacterPart: {
    type: "object",
    required: ["part_id", "slot", "is_basic_free", "rig_version"],
    properties: {
      part_id: {
        type: "string",
      },
      slot: {
        type: "string",
      },
      is_basic_free: {
        type: "boolean",
      },
      unlock_requirement_id: {
        type: ["string", "null"],
      },
      rig_version: {
        type: "string",
      },
      locale_key: {
        type: "string",
      },
    },
  },
  Character: {
    type: "object",
    required: ["player_id", "appearance_version", "slots"],
    properties: {
      player_id: {
        type: "string",
        format: "uuid",
      },
      appearance_version: {
        type: "integer",
        minimum: 1,
      },
      slots: {
        type: "object",
        additionalProperties: {
          type: "string",
        },
      },
    },
  },
  CharacterUpdate: {
    type: "object",
    required: ["expected_appearance_version", "slots"],
    properties: {
      expected_appearance_version: {
        type: "integer",
        minimum: 1,
      },
      slots: {
        type: "object",
        additionalProperties: {
          type: "string",
        },
      },
    },
    additionalProperties: false,
  },
  RunTicket: {
    type: "object",
    properties: {
      run_id: {
        type: "string",
        format: "uuid",
      },
      mode: {
        $ref: "#/$defs/RunMode",
      },
      starting_region_id: {
        type: "string",
        enum: ["BAMBOO", "TEMPLE", "MOUNTAINS", "CASTLE"],
      },
      seed: {
        type: "string",
        pattern: "^[a-f0-9]{32}$",
      },
      versions: {
        $ref: "#/$defs/RunVersions",
      },
      started_at: {
        type: "string",
        format: "date-time",
      },
      expires_at: {
        type: "string",
        format: "date-time",
      },
      limits: {
        $ref: "#/$defs/RunLimits",
      },
      server_time: {
        type: "string",
        format: "date-time",
      },
    },
    required: [
      "run_id",
      "mode",
      "starting_region_id",
      "seed",
      "versions",
      "started_at",
      "expires_at",
      "limits",
      "server_time",
    ],
    additionalProperties: false,
    oneOf: [
      {
        properties: {
          mode: {
            const: "FULL",
          },
          starting_region_id: {
            const: "BAMBOO",
          },
        },
      },
      {
        properties: {
          mode: {
            const: "REGIONAL",
          },
        },
      },
    ],
  },
  SegmentAck: {
    type: "object",
    required: ["run_id", "index", "segment_hash", "persisted"],
    properties: {
      run_id: {
        type: "string",
        format: "uuid",
      },
      index: {
        type: "integer",
        minimum: 0,
      },
      segment_hash: {
        type: "string",
        pattern: "^[a-f0-9]{64}$",
      },
      persisted: {
        type: "boolean",
        const: true,
      },
    },
    additionalProperties: false,
  },
  RunStatus: {
    type: "object",
    required: ["run_id", "status"],
    properties: {
      run_id: {
        type: "string",
        format: "uuid",
      },
      status: {
        type: "string",
        enum: [
          "CREATED",
          "ACTIVE",
          "AWAITING_SEGMENTS",
          "PENDING",
          "VERIFYING",
          "VERIFIED",
          "REJECTED",
          "ABANDONED",
          "EXPIRED",
        ],
      },
      score: {
        type: ["string", "null"],
        pattern: "^(0|[1-9][0-9]*)$",
      },
      distance_m: {
        type: ["integer", "null"],
        minimum: 0,
      },
      verified_at: {
        type: ["string", "null"],
        format: "date-time",
      },
      rejection_code: {
        type: ["string", "null"],
      },
      end_reason: {
        type: ["string", "null"],
        enum: ["HP_ZERO", "ABYSS", "QUIT", null],
      },
      ranked: {
        type: ["boolean", "null"],
      },
      expires_at: {
        type: "string",
        format: "date-time",
      },
      upload_deadline: {
        type: ["string", "null"],
        format: "date-time",
      },
      submitted_complete_at: {
        type: ["string", "null"],
        format: "date-time",
      },
    },
    additionalProperties: false,
    allOf: [
      {
        if: {
          properties: {
            status: {
              const: "VERIFIED",
            },
          },
        },
        then: {
          required: [
            "score",
            "distance_m",
            "verified_at",
            "end_reason",
            "ranked",
          ],
          properties: {
            score: {
              type: "string",
            },
            distance_m: {
              type: "integer",
            },
            verified_at: {
              type: "string",
            },
            end_reason: {
              type: "string",
            },
            ranked: {
              type: "boolean",
            },
          },
        },
        else: {
          properties: {
            score: {
              type: "null",
            },
            distance_m: {
              type: "null",
            },
            verified_at: {
              type: "null",
            },
            ranked: {
              type: "null",
            },
          },
        },
      },
      {
        if: {
          properties: {
            end_reason: {
              const: "QUIT",
            },
          },
          required: ["end_reason"],
        },
        then: {
          properties: {
            ranked: {
              enum: [false, null],
            },
          },
        },
      },
    ],
  },
  LeaderboardEntry: {
    type: "object",
    required: ["rank", "public_name", "score", "distance_m", "rules_major"],
    properties: {
      rank: {
        type: "integer",
        minimum: 1,
      },
      player_id: {
        type: "string",
        format: "uuid",
      },
      public_name: {
        type: "string",
      },
      avatar_parts: {
        type: "object",
        additionalProperties: {
          type: "string",
        },
      },
      score: {
        type: "string",
        description: "Inteiro decimal para evitar overflow de JavaScript",
      },
      distance_m: {
        type: "integer",
        minimum: 0,
      },
      rules_major: {
        type: "integer",
        minimum: 1,
      },
    },
  },
  LeaderboardPage: {
    type: "object",
    required: ["entries", "rules_major"],
    properties: {
      entries: {
        type: "array",
        items: {
          $ref: "#/$defs/LeaderboardEntry",
        },
      },
      next_cursor: {
        type: ["string", "null"],
      },
      rules_major: {
        type: "integer",
        minimum: 1,
      },
    },
  },
  WeeklyEdition: {
    type: "object",
    required: ["week_id", "starts_at", "ends_at", "challenges"],
    properties: {
      week_id: {
        type: "string",
      },
      starts_at: {
        type: "string",
        format: "date-time",
      },
      ends_at: {
        type: "string",
        format: "date-time",
      },
      challenges: {
        type: "array",
        minItems: 5,
        maxItems: 5,
        items: {
          type: "object",
          required: ["challenge_id", "tier", "metric", "target", "locale_key"],
          properties: {
            challenge_id: {
              type: "string",
            },
            tier: {
              type: "string",
              enum: ["EASY", "MEDIUM", "HARD"],
            },
            metric: {
              type: "string",
            },
            target: {
              type: "integer",
              minimum: 1,
            },
            locale_key: {
              type: "string",
            },
          },
        },
      },
    },
  },
  ApiError: {
    type: "object",
    required: ["error"],
    properties: {
      error: {
        type: "object",
        required: ["code", "message_key", "request_id"],
        properties: {
          code: {
            type: "string",
          },
          message_key: {
            type: "string",
          },
          request_id: {
            type: "string",
          },
          details: {
            type: "object",
          },
        },
      },
    },
  },
  Health: {
    type: "object",
    properties: {
      status: {
        type: "string",
        const: "ok",
      },
      service: {
        type: "string",
        const: "ronin-play-api",
      },
    },
    required: ["status", "service"],
    additionalProperties: false,
  },
  RunStart: {
    type: "object",
    properties: {
      mode: {
        $ref: "#/$defs/RunMode",
      },
      region_id: {
        type: "string",
        enum: ["BAMBOO", "TEMPLE", "MOUNTAINS", "CASTLE"],
      },
    },
    required: ["mode"],
    additionalProperties: false,
    oneOf: [
      {
        properties: {
          mode: {
            const: "FULL",
          },
          region_id: false,
        },
      },
      {
        properties: {
          mode: {
            const: "REGIONAL",
          },
          region_id: {
            type: "string",
            enum: ["BAMBOO", "TEMPLE", "MOUNTAINS", "CASTLE"],
          },
        },
        required: ["region_id"],
      },
    ],
  },
  RunVersions: {
    type: "object",
    properties: {
      rules_major: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      rules_patch: {
        type: "integer",
        minimum: 0,
        maximum: 2147483647,
      },
      generator_version: {
        type: "string",
        minLength: 1,
      },
      scoring_version: {
        type: "string",
        minLength: 1,
      },
      replay_protocol_version: {
        type: "string",
        const: "rr-input-v1",
      },
      rules_manifest_hash: {
        type: "string",
        pattern: "^[a-f0-9]{64}$",
      },
      assets_manifest_version: {
        type: "string",
        minLength: 1,
      },
    },
    required: [
      "rules_major",
      "rules_patch",
      "generator_version",
      "scoring_version",
      "replay_protocol_version",
      "rules_manifest_hash",
      "assets_manifest_version",
    ],
    additionalProperties: false,
  },
  RunLimits: {
    type: "object",
    properties: {
      segment_ticks: {
        type: "integer",
        const: 3600,
      },
      max_encoded_bytes: {
        type: "integer",
        const: 262144,
      },
      max_decoded_bytes: {
        type: "integer",
        const: 1048576,
      },
      max_actions_per_tick: {
        type: "integer",
        const: 2,
      },
      upload_grace_seconds: {
        type: "integer",
        const: 86400,
      },
      max_run_encoded_bytes: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
        description:
          "Política imutável de transporte/recursos por tentativa; baseline inicial 134217728, não limite de distância/fase.",
      },
      max_player_encoded_bytes: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
        description:
          "Política imutável de transporte/recursos por tentativa; baseline inicial 536870912, não limite de distância/fase.",
      },
      max_segments_per_run: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
        description:
          "Política imutável de transporte/recursos por tentativa; baseline inicial 10000, não limite de distância/fase.",
      },
      max_active_runs: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
        description:
          "Política imutável de transporte/recursos por tentativa; baseline inicial 3, não limite de distância/fase.",
      },
      wall_time_tolerance_ticks: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
        description:
          "Política imutável de transporte/recursos por tentativa; baseline inicial 120, não limite de distância/fase.",
      },
    },
    required: [
      "segment_ticks",
      "max_encoded_bytes",
      "max_decoded_bytes",
      "max_actions_per_tick",
      "upload_grace_seconds",
      "max_run_encoded_bytes",
      "max_player_encoded_bytes",
      "max_segments_per_run",
      "max_active_runs",
      "wall_time_tolerance_ticks",
    ],
    additionalProperties: false,
  },
  FinishRequest: {
    type: "object",
    properties: {
      final_segment_index: {
        type: "integer",
        minimum: 0,
        maximum: 9007199254740991,
      },
      final_tick: {
        type: "integer",
        minimum: 0,
        maximum: 9007199254740991,
      },
      final_hash: {
        type: "string",
        pattern: "^[a-f0-9]{64}$",
      },
      end_reason: {
        type: "string",
        enum: ["HP_ZERO", "ABYSS", "QUIT"],
      },
    },
    required: ["final_segment_index", "final_tick", "final_hash", "end_reason"],
    additionalProperties: false,
  },
  ReplayAction: {
    type: "object",
    properties: {
      tick: {
        type: "integer",
        minimum: 0,
        maximum: 9007199254740991,
      },
      action: {
        type: "string",
        enum: ["JUMP", "SLIDE", "ATTACK"],
      },
    },
    required: ["tick", "action"],
    additionalProperties: false,
  },
  ReplayControl: {
    type: "object",
    properties: {
      tick: {
        type: "integer",
        minimum: 0,
        maximum: 9007199254740991,
      },
      sequence: {
        type: "integer",
        minimum: 0,
        maximum: 9007199254740991,
      },
      action: {
        type: "string",
        enum: ["PAUSE", "RESUME", "QUIT"],
      },
    },
    required: ["tick", "sequence", "action"],
    additionalProperties: false,
  },
  ReplaySegment: {
    type: "object",
    properties: {
      protocol: {
        type: "string",
        const: "rr-input-v1",
      },
      run_id: {
        type: "string",
        format: "uuid",
      },
      index: {
        type: "integer",
        minimum: 0,
        maximum: 9007199254740991,
      },
      start_tick: {
        type: "integer",
        minimum: 0,
        maximum: 9007199254740991,
      },
      end_tick: {
        type: "integer",
        minimum: 0,
        maximum: 9007199254740991,
      },
      previous_hash: {
        anyOf: [
          {
            type: "string",
            pattern: "^[a-f0-9]{64}$",
          },
          {
            type: "null",
          },
        ],
      },
      actions: {
        type: "array",
        maxItems: 7200,
        items: {
          $ref: "#/$defs/ReplayAction",
        },
      },
      controls: {
        type: "array",
        maxItems: 4096,
        items: {
          $ref: "#/$defs/ReplayControl",
        },
      },
    },
    required: [
      "protocol",
      "run_id",
      "index",
      "start_tick",
      "end_tick",
      "previous_hash",
      "actions",
      "controls",
    ],
    additionalProperties: false,
  },
  GuestRequest: {
    type: "object",
    additionalProperties: false,
    description:
      "Primeiro acesso não exige apelido; idioma vem da primeira preferência Accept-Language.",
  },
} as const;
