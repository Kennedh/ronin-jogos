/** Node transport only; browser codecs remain free of Node imports. */
import { createGunzip } from "node:zlib";
import { Readable } from "node:stream";
import { validateSegment } from "./replay.ts";
import { parseJson } from "./canonical.ts";
export class TransportError extends Error {
  readonly status: number;
  constructor(status: number, code: string) {
    super(code);
    this.status = status;
  }
}
export async function decodeTransport(bytes: Uint8Array, encoding: string) {
  if (bytes.byteLength > 262144) throw new TransportError(413, "encoded_limit");
  let decoded: Uint8Array = bytes;
  if (encoding === "gzip") {
    const gzip = createGunzip({ chunkSize: 16384 });
    const source = Readable.from([bytes]);
    source.pipe(gzip);
    const parts: Buffer[] = [];
    let size = 0;
    try {
      for await (const raw of gzip) {
        const part = raw as Buffer;
        size += part.length;
        if (size > 1048576) throw new TransportError(413, "decoded_limit");
        parts.push(part);
      }
      decoded = Buffer.concat(parts, size);
    } catch (error) {
      if (error instanceof TransportError) throw error;
      throw new TransportError(422, "invalid_gzip");
    } finally {
      source.destroy();
      gzip.destroy();
    }
  } else if (encoding !== "identity")
    throw new TransportError(415, "unsupported_encoding");
  try {
    return {
      segment: validateSegment(parseJson(decoded)),
      decodedSize: decoded.byteLength,
    };
  } catch {
    throw new TransportError(422, "invalid_replay");
  }
}
