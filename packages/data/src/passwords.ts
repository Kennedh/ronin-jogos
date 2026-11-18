import { argon2, randomBytes, timingSafeEqual } from "node:crypto";
import { Fault } from "./runtime.ts";
export const PASSWORD_ALGORITHM = "argon2id-19m-t2-p1-v1";
export interface PasswordRecord {
  algorithm: string;
  salt: Buffer;
  digest: Buffer;
}
const common = new Set([
  "passwordpassword",
  "123456789012",
  "1234567890123456",
  "qwertyuiop123",
  "password1234",
  "abcdefghijkl",
  "senha12345678",
  "123456789123",
  "password123456",
]);
export function passwordPolicy(value: string) {
  if (
    Array.from(value).length < 12 ||
    Array.from(value).length > 256 ||
    Buffer.byteLength(value) > 1024 ||
    common.has(value.toLowerCase())
  )
    throw new Fault(422, "PASSWORD_POLICY");
}
/** Native async Argon2id in pinned Node 24; memory/queue bounded per API process. */
export class PasswordHasher {
  private active = 0;
  private waiting: (() => void)[] = [];
  private dummy: Promise<PasswordRecord>;
  constructor() {
    this.dummy = this.hash("ronin-dummy-credential-only");
  }
  private async derive(message: string, nonce: Buffer) {
    if (this.active >= 2) {
      if (this.waiting.length >= 16) throw new Fault(503, "AUTH_BUSY");
      await new Promise<void>((resolve) => this.waiting.push(resolve));
    } else this.active++;
    try {
      return await new Promise<Buffer>((resolve, reject) =>
        argon2(
          "argon2id",
          {
            message,
            nonce,
            parallelism: 1,
            tagLength: 32,
            memory: 19456,
            passes: 2,
          },
          (error, key) => (error ? reject(error) : resolve(key)),
        ),
      );
    } finally {
      const next = this.waiting.shift();
      if (next) next();
      else this.active--;
    }
  }
  async hash(password: string): Promise<PasswordRecord> {
    const salt = randomBytes(16);
    return {
      algorithm: PASSWORD_ALGORITHM,
      salt,
      digest: await this.derive(password, salt),
    };
  }
  async verify(password: string, record?: PasswordRecord) {
    const candidate = record ?? (await this.dummy);
    if (
      candidate.algorithm !== PASSWORD_ALGORITHM ||
      candidate.salt.length !== 16 ||
      candidate.digest.length !== 32
    )
      throw new Error("invalid_password_record");
    const key = await this.derive(password, candidate.salt);
    return timingSafeEqual(key, candidate.digest) && record !== undefined;
  }
}
