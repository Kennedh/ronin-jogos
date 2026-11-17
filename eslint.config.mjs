import js from "@eslint/js";
import ts from "typescript-eslint";
export default ts.config(
  {
    ignores: [
      "**/dist/**",
      "**/node_modules/**",
      "packages/contracts/src/generated/**",
    ],
  },
  js.configs.recommended,
  ...ts.configs.recommended,
  {
    files: ["**/*.mjs"],
    languageOptions: {
      globals: { process: "readonly", console: "readonly", URL: "readonly" },
    },
  },
  {
    files: ["packages/runner-core/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "node:*",
            "phaser",
            "fastify",
            "@ronin/data",
            "@ronin/runner-client",
          ],
        },
      ],
      "no-restricted-globals": [
        "error",
        "window",
        "document",
        "performance",
        "Date",
      ],
      "no-restricted-properties": [
        "error",
        {
          object: "Math",
          property: "random",
          message: "Use the versioned deterministic PRNG.",
        },
      ],
    },
  },
);
