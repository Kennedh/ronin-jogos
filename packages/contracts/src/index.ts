import { definitions } from "./generated/schemas.ts";
import { validators } from "./generated/validators.mjs";
export type { components, paths, operations } from "./generated/types.ts";
export type SchemaName = keyof typeof definitions;
export function schema(name: SchemaName) {
  // Fastify's response serializer needs standalone schemas; current health has no refs.
  return definitions[name];
}
export function validate(name: SchemaName, data: unknown): boolean {
  const validator = validators[name];
  if (!validator) throw new Error("unknown_contract");
  return validator(data) === true;
}
