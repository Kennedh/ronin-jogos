import {
  mkdir,
  readFile,
  writeFile,
  rename,
  unlink,
  chmod,
} from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { resolve, join } from "node:path";
import { userInfo } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { AuthMail, MailTransport } from "@ronin/data";
async function privateDirectory(directory: string) {
  await mkdir(directory, { recursive: true, mode: 0o700 });
  if (process.platform === "win32") {
    const principal =
      (process.env["USERDOMAIN"] ? process.env["USERDOMAIN"] + "\\" : "") +
      userInfo().username;
    await promisify(execFile)(
      "icacls",
      [
        directory,
        "/inheritance:r",
        "/grant:r",
        principal + ":(OI)(CI)F",
        "*S-1-5-18:(OI)(CI)F",
      ],
      { windowsHide: true },
    );
  } else await chmod(directory, 0o700);
}
export class LocalMailTransport implements MailTransport {
  readonly directory: string;
  constructor(directory: string) {
    this.directory = resolve(directory);
  }
  async send(id: string, mail: AuthMail) {
    if (!/^[a-f0-9-]{36}$/.test(id)) throw new Error("invalid_mail_id");
    await privateDirectory(this.directory);
    const target = join(this.directory, id + ".json"),
      bytes = Buffer.from(JSON.stringify(mail, null, 2) + "\n");
    try {
      const old = await readFile(target);
      if (!old.equals(bytes)) throw new Error("mail_delivery_conflict");
      return;
    } catch (error) {
      if (!(
        error instanceof Error &&
        "code" in error &&
        error.code === "ENOENT"
      ))
        throw error;
    }
    const temp = target + "." + randomBytes(8).toString("hex") + ".tmp";
    try {
      await writeFile(temp, bytes, { flag: "wx", mode: 0o600 });
      await rename(temp, target);
    } finally {
      await unlink(temp).catch(() => {});
    }
  }
}
export async function developmentAuthMail() {
  const { fileURLToPath } = await import("node:url"),
    directory = fileURLToPath(
      new URL("../artifacts/dev-auth/", import.meta.url),
    );
  await privateDirectory(directory);
  const path = join(directory, "mail.key");
  try {
    await writeFile(path, randomBytes(32), { flag: "wx", mode: 0o600 });
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "EEXIST"))
      throw error;
  }
  const key = await readFile(path);
  if (key.length !== 32) throw new Error("invalid_local_mail_key");
  return { key, transport: new LocalMailTransport(join(directory, "inbox")) };
}
