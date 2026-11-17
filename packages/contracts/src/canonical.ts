/** JSON subset for authoritative data: safe integer numbers, strings, arrays and plain objects. */
function validString(s: string): string {
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c >= 0xd800 && c <= 0xdbff) {
      const n = s.charCodeAt(++i);
      if (!(n >= 0xdc00 && n <= 0xdfff)) throw new Error("invalid_unicode");
    } else if (c >= 0xdc00 && c <= 0xdfff) throw new Error("invalid_unicode");
  }
  return s;
}
export function canonical(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "string") return JSON.stringify(validString(value));
  if (typeof value === "number") {
    if (!Number.isSafeInteger(value)) throw new Error("unsafe_json_number");
    return JSON.stringify(value);
  }
  if (Array.isArray(value))
    return "[" + Array.from(value, canonical).join(",") + "]";
  if (typeof value === "object") {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null)
      throw new Error("invalid_json_object");
    const o = value as Record<string, unknown>;
    return (
      "{" +
      Object.keys(o)
        .sort()
        .map((k) => JSON.stringify(validString(k)) + ":" + canonical(o[k]))
        .join(",") +
      "}"
    );
  }
  throw new Error("unsupported_json_value");
}
/** Strict parser catches duplicate *decoded* keys before JSON.parse could overwrite them. */
export function parseJson(bytes: Uint8Array): unknown {
  if (bytes.byteLength > 1048576) throw new Error("decoded_limit");
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  let at = 0,
    nodes = 0;
  function space() {
    while (/[ \r\n\t]/.test(text[at] ?? "!")) at++;
  }
  function string(): string {
    const start = at++;
    while (at < text.length) {
      const ch = text[at++];
      if (ch === "\\") {
        at++;
        continue;
      }
      if (ch === '"')
        return validString(JSON.parse(text.slice(start, at)) as string);
    }
    throw new Error("unterminated_string");
  }
  function value(depth: number): unknown {
    if (depth > 32 || ++nodes > 100000) throw new Error("json_complexity");
    space();
    const ch = text[at];
    if (ch === '"') return string();
    if (ch === "{") {
      at++;
      space();
      const result: Record<string, unknown> = Object.create(null) as Record<
        string,
        unknown
      >;
      if (text[at] === "}") {
        at++;
        return result;
      }
      while (true) {
        space();
        if (text[at] !== '"') throw new Error("expected_key");
        const key = string();
        if (Object.hasOwn(result, key)) throw new Error("duplicate_json_key");
        space();
        if (text[at++] !== ":") throw new Error("expected_colon");
        result[key] = value(depth + 1);
        space();
        const sep = text[at++];
        if (sep === "}") return result;
        if (sep !== ",") throw new Error("expected_separator");
      }
    }
    if (ch === "[") {
      at++;
      space();
      const result: unknown[] = [];
      if (text[at] === "]") {
        at++;
        return result;
      }
      while (true) {
        result.push(value(depth + 1));
        space();
        const sep = text[at++];
        if (sep === "]") return result;
        if (sep !== ",") throw new Error("expected_separator");
      }
    }
    for (const [token, result] of [
      ["true", true],
      ["false", false],
      ["null", null],
    ] as const)
      if (text.startsWith(token, at)) {
        at += token.length;
        return result;
      }
    const token = /^-?(?:0|[1-9][0-9]*)(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/.exec(
      text.slice(at),
    )?.[0];
    if (!token) throw new Error("invalid_json");
    at += token.length;
    const number = Number(token);
    if (!Number.isSafeInteger(number)) throw new Error("unsafe_json_number");
    return number;
  }
  const result = value(0);
  space();
  if (at !== text.length) throw new Error("trailing_json");
  return result;
}
export async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", Uint8Array.from(bytes));
  return Array.from(new Uint8Array(digest), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export async function stateHash(value: unknown): Promise<string> {
  return sha256(new TextEncoder().encode(canonical(value)));
}
