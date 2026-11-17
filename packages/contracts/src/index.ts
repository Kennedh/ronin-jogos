import { Ajv2020 } from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { definitions } from "./generated/schemas.ts";
export type { components, paths, operations } from "./generated/types.ts";
const ajv = new Ajv2020({ strict: true, allErrors: true });
addFormats.default(ajv);
ajv.addSchema({ $id: "urn:ronin:contracts:v1", $defs: definitions });
export type SchemaName = keyof typeof definitions;
export function schema(name: SchemaName) {
  // Fastify's response serializer needs standalone schemas; current health has no refs.
  return definitions[name];
}
export function validate(name: SchemaName, data: unknown): boolean {
  return (
    ajv.validate({ $ref: `urn:ronin:contracts:v1#/$defs/${name}` }, data) ===
    true
  );
}
