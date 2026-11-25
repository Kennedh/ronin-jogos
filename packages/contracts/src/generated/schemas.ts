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
      account_status: {
        type: "string",
        enum: ["GUEST", "EMAIL_PENDING", "REGISTERED", "DELETION_PENDING"],
      },
      email: {
        type: ["string", "null"],
        format: "email",
      },
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
      public_profile: {
        type: "boolean",
      },
      nickname_change_available_at: {
        type: ["string", "null"],
        format: "date-time",
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
  DeletionConsent: {
    type: "object",
    additionalProperties: false,
    required: ["confirmed"],
    properties: {
      confirmed: {
        type: "boolean",
        const: true,
      },
    },
  },
  PrivacyStatus: {
    type: "object",
    additionalProperties: false,
    required: ["deletion", "nickname_moderation"],
    properties: {
      deletion: {
        type: ["object", "null"],
        additionalProperties: false,
        required: ["state", "requested_at", "finalize_at", "resolved_at"],
        properties: {
          state: {
            type: "string",
            enum: ["PENDING", "CANCELLED", "COMPLETED"],
          },
          requested_at: {
            type: "string",
            format: "date-time",
          },
          finalize_at: {
            type: "string",
            format: "date-time",
          },
          resolved_at: {
            type: ["string", "null"],
            format: "date-time",
          },
        },
      },
      nickname_moderation: {
        type: ["object", "null"],
        additionalProperties: false,
        required: [
          "state",
          "reason",
          "hidden_at",
          "appealed_at",
          "resolved_at",
        ],
        properties: {
          state: {
            type: "string",
            enum: ["HIDDEN", "APPEALED", "RESTORED", "UPHELD"],
          },
          reason: {
            type: "string",
            enum: ["IMPERSONATION", "OFFENSIVE", "PERSONAL_DATA", "OTHER"],
          },
          hidden_at: {
            type: "string",
            format: "date-time",
          },
          appealed_at: {
            type: ["string", "null"],
            format: "date-time",
          },
          resolved_at: {
            type: ["string", "null"],
            format: "date-time",
          },
        },
      },
    },
  },
  PrivacyExportCursor: {
    type: "object",
    additionalProperties: false,
    required: ["after_id", "started_through"],
    properties: {
      after_id: {
        type: "string",
        format: "uuid",
      },
      started_through: {
        type: "string",
        format: "date-time",
      },
    },
  },
  PrivacyExportRequest: {
    type: "object",
    additionalProperties: false,
    properties: {
      cursor: {
        $ref: "#/$defs/PrivacyExportCursor",
      },
    },
  },
  PrivacyExportPage: {
    type: "object",
    additionalProperties: false,
    required: [
      "version",
      "exported_at",
      "profile",
      "progress",
      "sessions",
      "runs",
      "privacy",
      "next_cursor",
      "character",
    ],
    properties: {
      version: {
        type: "integer",
        const: 1,
      },
      character: {
        $ref: "#/$defs/Character",
      },
      exported_at: {
        type: "string",
        format: "date-time",
      },
      profile: {
        type: "object",
        additionalProperties: false,
        required: [
          "player_id",
          "nickname",
          "locale",
          "public_profile",
          "status",
          "created_at",
          "email",
          "email_verified_at",
          "pending_email",
          "google_linked_at",
        ],
        properties: {
          player_id: {
            type: "string",
            format: "uuid",
          },
          nickname: {
            type: ["string", "null"],
          },
          locale: {
            type: "string",
            enum: ["pt-BR", "en"],
          },
          public_profile: {
            type: "boolean",
          },
          status: {
            type: "string",
            enum: ["REGISTERED", "DELETION_PENDING"],
          },
          created_at: {
            type: "string",
            format: "date-time",
          },
          email: {
            type: ["string", "null"],
          },
          email_verified_at: {
            type: ["string", "null"],
            format: "date-time",
          },
          pending_email: {
            type: ["string", "null"],
          },
          google_linked_at: {
            type: ["string", "null"],
            format: "date-time",
          },
        },
      },
      progress: {
        type: "object",
        additionalProperties: false,
        required: ["regions", "seals", "rewards"],
        properties: {
          regions: {
            type: "array",
            items: {
              type: "string",
            },
          },
          seals: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["boss_id", "earned_at", "run_id"],
              properties: {
                boss_id: {
                  type: "string",
                },
                earned_at: {
                  type: "string",
                  format: "date-time",
                },
                run_id: {
                  type: "string",
                  format: "uuid",
                },
              },
            },
          },
          rewards: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["reward_id", "earned_at", "run_id"],
              properties: {
                reward_id: {
                  type: "string",
                },
                earned_at: {
                  type: "string",
                  format: "date-time",
                },
                run_id: {
                  type: "string",
                  format: "uuid",
                },
              },
            },
          },
        },
      },
      sessions: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          required: ["created_at", "last_seen_at", "expires_at"],
          properties: {
            created_at: {
              type: "string",
              format: "date-time",
            },
            last_seen_at: {
              type: "string",
              format: "date-time",
            },
            expires_at: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
      runs: {
        type: "array",
        maxItems: 200,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "run_id",
            "mode",
            "starting_region",
            "started_at",
            "status",
            "end_reason",
            "score",
            "real_distance_units",
            "ranked",
            "verified_at",
          ],
          properties: {
            run_id: {
              type: "string",
              format: "uuid",
            },
            mode: {
              type: "string",
              enum: ["FULL", "REGIONAL"],
            },
            starting_region: {
              type: "string",
            },
            started_at: {
              type: "string",
              format: "date-time",
            },
            status: {
              type: "string",
            },
            end_reason: {
              type: ["string", "null"],
            },
            score: {
              type: ["string", "null"],
            },
            real_distance_units: {
              type: ["string", "null"],
            },
            ranked: {
              type: ["boolean", "null"],
            },
            verified_at: {
              type: ["string", "null"],
              format: "date-time",
            },
          },
        },
      },
      privacy: {
        $ref: "#/$defs/PrivacyStatus",
      },
      next_cursor: {
        oneOf: [
          {
            $ref: "#/$defs/PrivacyExportCursor",
          },
          {
            type: "null",
          },
        ],
      },
    },
  },
  MergePreviewRequest: {
    oneOf: [
      {
        type: "object",
        additionalProperties: false,
        required: ["method", "email", "password"],
        properties: {
          method: {
            type: "string",
            const: "EMAIL",
          },
          email: {
            type: "string",
            format: "email",
            maxLength: 254,
          },
          password: {
            type: "string",
            minLength: 1,
            maxLength: 256,
          },
        },
      },
      {
        type: "object",
        additionalProperties: false,
        required: ["method", "id_token"],
        properties: {
          method: {
            type: "string",
            const: "GOOGLE",
          },
          id_token: {
            type: "string",
            minLength: 1,
            maxLength: 5500,
          },
        },
      },
    ],
  },
  MergeConfirmRequest: {
    type: "object",
    additionalProperties: false,
    required: ["merge_nonce", "confirmed"],
    properties: {
      appearance_from: {
        type: "string",
        enum: ["GUEST", "TARGET"],
      },
      merge_nonce: {
        type: "string",
        pattern: "^[A-Za-z0-9_-]{43}$",
      },
      confirmed: {
        type: "boolean",
        const: true,
      },
    },
  },
  MergeProgress: {
    type: "object",
    additionalProperties: false,
    required: [
      "nickname",
      "runs",
      "verified",
      "best_ranked_score",
      "regions",
      "seals",
      "rewards",
      "character",
    ],
    properties: {
      nickname: {
        type: ["string", "null"],
      },
      character: {
        $ref: "#/$defs/Character",
      },
      runs: {
        type: "integer",
        minimum: 0,
      },
      verified: {
        type: "integer",
        minimum: 0,
      },
      best_ranked_score: {
        type: ["string", "null"],
        pattern: "^(0|[1-9][0-9]*)$",
      },
      regions: {
        type: "array",
        items: {
          type: "string",
        },
      },
      seals: {
        type: "array",
        items: {
          type: "string",
        },
      },
      rewards: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  },
  MergePreview: {
    type: "object",
    additionalProperties: false,
    required: [
      "merge_nonce",
      "source_player_id",
      "target_player_id",
      "expires_at",
      "summary",
    ],
    properties: {
      merge_nonce: {
        type: "string",
        pattern: "^[A-Za-z0-9_-]{43}$",
      },
      source_player_id: {
        type: "string",
        format: "uuid",
      },
      target_player_id: {
        type: "string",
        format: "uuid",
      },
      expires_at: {
        type: "string",
        format: "date-time",
      },
      summary: {
        type: "object",
        additionalProperties: false,
        required: ["source", "target"],
        properties: {
          source: {
            $ref: "#/$defs/MergeProgress",
          },
          target: {
            $ref: "#/$defs/MergeProgress",
          },
        },
      },
    },
  },
  GoogleConfig: {
    type: "object",
    additionalProperties: false,
    required: ["client_id"],
    properties: {
      client_id: {
        type: ["string", "null"],
      },
    },
  },
  GoogleChallengeRequest: {
    type: "object",
    additionalProperties: false,
    required: ["purpose"],
    properties: {
      purpose: {
        type: "string",
        enum: ["SIGN_IN", "LINK", "REAUTH", "MERGE"],
      },
    },
  },
  GoogleChallenge: {
    type: "object",
    additionalProperties: false,
    required: ["nonce"],
    properties: {
      nonce: {
        type: "string",
        pattern: "^[A-Za-z0-9_-]{43}$",
      },
    },
  },
  GoogleCredential: {
    type: "object",
    additionalProperties: false,
    required: ["id_token"],
    properties: {
      id_token: {
        type: "string",
        minLength: 1,
        maxLength: 5500,
      },
    },
  },
  UpdateProfileRequest: {
    type: "object",
    additionalProperties: false,
    minProperties: 1,
    properties: {
      nickname: {
        type: "string",
        minLength: 3,
        maxLength: 20,
      },
      public_profile: {
        type: "boolean",
      },
    },
  },
  RegisterRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      locale: {
        type: "string",
        enum: ["pt-BR", "en"],
      },
      email: {
        type: "string",
        format: "email",
        maxLength: 254,
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
        maxLength: 254,
      },
      password: {
        type: "string",
        minLength: 1,
        maxLength: 256,
      },
    },
    additionalProperties: false,
  },
  CharacterCatalog: {
    type: "object",
    additionalProperties: false,
    required: ["catalog_version", "parts"],
    properties: {
      catalog_version: {
        type: "string",
      },
      parts: {
        type: "array",
        items: {
          $ref: "#/$defs/CharacterPart",
        },
      },
    },
  },
  CosmeticInventory: {
    type: "object",
    additionalProperties: false,
    required: ["unlocked_part_ids", "equipped"],
    properties: {
      unlocked_part_ids: {
        type: "array",
        items: {
          type: "string",
        },
      },
      equipped: {
        $ref: "#/$defs/Character",
      },
    },
  },
  EmblemUpdate: {
    type: "object",
    additionalProperties: false,
    required: ["emblem_instance_id"],
    properties: {
      emblem_instance_id: {
        type: ["string", "null"],
        maxLength: 64,
      },
      expected_appearance_version: {
        type: "integer",
        minimum: 1,
      },
    },
  },
  CharacterPart: {
    type: "object",
    required: [
      "part_id",
      "slot",
      "asset_id",
      "rig_version",
      "is_basic_free",
      "unlock_requirement_id",
      "labels",
    ],
    additionalProperties: false,
    properties: {
      part_id: {
        type: "string",
      },
      slot: {
        type: "string",
        enum: [
          "body_palette",
          "hair_style",
          "hair_color",
          "eye_style",
          "face_detail",
          "outfit_id",
          "head_accessory_id",
          "katana_visual_id",
          "slash_effect_id",
          "profile_emblem_id",
        ],
      },
      asset_id: {
        type: "string",
      },
      rig_version: {
        type: "string",
      },
      is_basic_free: {
        type: "boolean",
      },
      unlock_requirement_id: {
        type: ["string", "null"],
      },
      labels: {
        type: "object",
        additionalProperties: false,
        required: ["pt-BR", "en"],
        properties: {
          "pt-BR": {
            type: "string",
          },
          en: {
            type: "string",
          },
        },
      },
    },
  },
  Character: {
    type: "object",
    additionalProperties: false,
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
        minProperties: 10,
        propertyNames: {
          enum: [
            "body_palette",
            "hair_style",
            "hair_color",
            "eye_style",
            "face_detail",
            "outfit_id",
            "head_accessory_id",
            "katana_visual_id",
            "slash_effect_id",
            "profile_emblem_id",
          ],
        },
        additionalProperties: {
          type: "string",
        },
      },
    },
  },
  CharacterUpdate: {
    type: "object",
    additionalProperties: false,
    required: ["expected_appearance_version", "slots"],
    properties: {
      expected_appearance_version: {
        type: "integer",
        minimum: 1,
        maximum: 2147483647,
      },
      slots: {
        type: "object",
        minProperties: 1,
        propertyNames: {
          enum: [
            "body_palette",
            "hair_style",
            "hair_color",
            "eye_style",
            "face_detail",
            "outfit_id",
            "head_accessory_id",
            "katana_visual_id",
            "slash_effect_id",
            "profile_emblem_id",
          ],
        },
        additionalProperties: {
          type: "string",
          minLength: 1,
          maxLength: 64,
        },
      },
    },
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
      boss_results: {
        type: "array",
        maxItems: 4,
        items: {
          $ref: "#/$defs/BossResultSummary",
        },
      },
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
  PhysicsRules: {
    type: "object",
    required: [
      "version",
      "tickRate",
      "scale",
      "unitsPerMeter",
      "speed",
      "speedCeiling",
      "gravity",
      "jump",
      "doubleJump",
      "coyoteTicks",
      "jumpBufferTicks",
      "slideTicks",
      "slideRecoveryTicks",
      "attackWindup",
      "attackActive",
      "attackRecovery",
      "perfectTicks",
      "hurtTicks",
      "bodyWidth",
      "bodyHeight",
      "slideWidth",
      "slideHeight",
      "swordReach",
      "fatalY",
    ],
    additionalProperties: false,
    properties: {
      version: {
        type: "string",
        pattern: "^[a-zA-Z0-9._-]{1,100}$",
      },
      tickRate: {
        type: "integer",
        const: 60,
      },
      scale: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      unitsPerMeter: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      speed: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      speedCeiling: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      gravity: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      jump: {
        type: "integer",
        minimum: -9007199254740991,
        maximum: -1,
      },
      doubleJump: {
        type: "integer",
        minimum: -9007199254740991,
        maximum: -1,
      },
      coyoteTicks: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      jumpBufferTicks: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      slideTicks: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      slideRecoveryTicks: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      attackWindup: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      attackActive: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      attackRecovery: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      perfectTicks: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      hurtTicks: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      bodyWidth: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      bodyHeight: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      slideWidth: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      slideHeight: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      swordReach: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      fatalY: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      concentrationCap: {
        type: "integer",
        minimum: 100,
        maximum: 100,
      },
      perfectGain: {
        type: "integer",
        minimum: 1,
        maximum: 100,
      },
      normalGain: {
        type: "integer",
        minimum: 1,
        maximum: 100,
      },
      normalBreaksCombo: {
        type: "integer",
        minimum: 0,
        maximum: 1,
      },
      specialReach: {
        type: "integer",
        minimum: 1,
        maximum: 1000000,
      },
      specialFxTicks: {
        type: "integer",
        minimum: 1,
        maximum: 60,
      },
      bambooMeters: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      templeMeters: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      mountainMeters: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      castleMeters: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
      cycleSpeedStep: {
        type: "integer",
        minimum: 1,
        maximum: 9007199254740991,
      },
    },
  },
  RunnerManifest: {
    type: "object",
    required: [
      "rules_major",
      "rules_patch",
      "generator_version",
      "scoring_version",
      "replay_protocol_version",
      "assets_manifest_version",
      "physics",
    ],
    additionalProperties: false,
    properties: {
      rules_major: {
        type: "integer",
        minimum: 1,
      },
      rules_patch: {
        type: "integer",
        minimum: 0,
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
      assets_manifest_version: {
        type: "string",
        minLength: 1,
      },
      physics: {
        $ref: "#/$defs/PhysicsRules",
      },
    },
  },
  RegionUnlocks: {
    type: "object",
    additionalProperties: false,
    required: ["unlocked_regions"],
    properties: {
      unlocked_regions: {
        type: "array",
        minItems: 1,
        maxItems: 4,
        uniqueItems: true,
        items: {
          type: "string",
          enum: ["BAMBOO", "TEMPLE", "MOUNTAINS", "CASTLE"],
        },
      },
    },
  },
  RunManifest: {
    type: "object",
    required: ["manifest_hash", "manifest"],
    additionalProperties: false,
    properties: {
      manifest_hash: {
        type: "string",
        pattern: "^[a-f0-9]{64}$",
      },
      manifest: {
        $ref: "#/$defs/RunnerManifest",
      },
    },
  },
  BossResultSummary: {
    type: "object",
    additionalProperties: false,
    required: ["boss_id", "defeated", "retreated", "bonus"],
    properties: {
      boss_id: {
        type: "string",
        enum: ["B01", "B02", "B03", "B04"],
      },
      defeated: {
        type: "integer",
        minimum: 0,
      },
      retreated: {
        type: "integer",
        minimum: 0,
      },
      bonus: {
        type: "string",
        pattern: "^(0|[1-9][0-9]*)$",
      },
    },
  },
  BossProgress: {
    type: "object",
    additionalProperties: false,
    required: ["seals", "rewards"],
    properties: {
      seals: {
        type: "array",
        maxItems: 4,
        uniqueItems: true,
        items: {
          type: "string",
          enum: ["B01", "B02", "B03", "B04"],
        },
      },
      rewards: {
        type: "array",
        maxItems: 7,
        uniqueItems: true,
        items: {
          type: "string",
          enum: [
            "AURORA_TRAIL",
            "FOUR_PATHS_GUARDIAN",
            "PATH_LEGEND",
            "BROKEN_ROOTS",
            "SILENCED_BELL",
            "TAMED_WIND",
            "DISPELLED_ECLIPSE",
          ],
        },
      },
    },
  },
  ResendEmailRequest: {
    type: "object",
    additionalProperties: false,
    properties: {
      locale: {
        type: "string",
        enum: ["pt-BR", "en"],
      },
    },
  },
  EmptyRequest: {
    type: "object",
    additionalProperties: false,
  },
  AuthAccepted: {
    type: "object",
    additionalProperties: false,
    required: ["status"],
    properties: {
      status: {
        type: "string",
        const: "ACCEPTED",
      },
    },
  },
  AuthTokenRequest: {
    type: "object",
    additionalProperties: false,
    required: ["token"],
    properties: {
      token: {
        type: "string",
        pattern: "^[A-Za-z0-9_-]{43}$",
      },
    },
  },
  ForgotPasswordRequest: {
    type: "object",
    additionalProperties: false,
    required: ["email"],
    properties: {
      email: {
        type: "string",
        format: "email",
        maxLength: 254,
      },
    },
  },
  ResetPasswordRequest: {
    type: "object",
    additionalProperties: false,
    required: ["token", "new_password"],
    properties: {
      token: {
        type: "string",
        pattern: "^[A-Za-z0-9_-]{43}$",
      },
      new_password: {
        type: "string",
        minLength: 12,
        maxLength: 256,
      },
    },
  },
  ReauthRequest: {
    type: "object",
    additionalProperties: false,
    required: ["password"],
    properties: {
      password: {
        type: "string",
        minLength: 1,
        maxLength: 256,
      },
    },
  },
  AccountSessions: {
    type: "object",
    additionalProperties: false,
    required: ["sessions"],
    properties: {
      sessions: {
        type: "array",
        maxItems: 20,
        items: {
          type: "object",
          additionalProperties: false,
          required: [
            "session_id",
            "created_at",
            "last_seen_at",
            "expires_at",
            "current",
          ],
          properties: {
            session_id: {
              type: "string",
              format: "uuid",
            },
            created_at: {
              type: "string",
              format: "date-time",
            },
            last_seen_at: {
              type: "string",
              format: "date-time",
            },
            expires_at: {
              type: "string",
              format: "date-time",
            },
            current: {
              type: "boolean",
            },
          },
        },
      },
    },
  },
} as const;
