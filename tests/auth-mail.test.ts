import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, stat, readdir, rm } from "node:fs/promises";
import { resolve, join, relative, isAbsolute } from "node:path";
import { randomUUID } from "node:crypto";
import { LocalMailTransport } from "../scripts/local-auth-mail.ts";
test("5A: private local mail transport is durable, idempotent and absent from public routes", async () => {
  const root = resolve("artifacts"),
    directory = await mkdtemp(join(root, "qa-auth-mail-"));
  const owned = () => {
    const path = relative(root, resolve(directory));
    assert.ok(path && !path.startsWith("..") && !isAbsolute(path));
  };
  owned();
  try {
    const transport = new LocalMailTransport(directory),
      id = randomUUID(),
      mail = {
        to: "fixture@example.test",
        subject: "Synthetic confirmation",
        text: "Private fixture only",
        locale: "en" as const,
        purpose: "VERIFY" as const,
        link: "https://play.ronin.dev.br/account/en#verify=" + "x".repeat(43),
      };
    await transport.send(id, mail);
    await transport.send(id, mail);
    assert.equal((await readdir(directory)).length, 1);
    assert.deepEqual(
      JSON.parse(await readFile(join(directory, id + ".json"), "utf8")),
      mail,
    );
    await assert.rejects(() =>
      transport.send(id, { ...mail, text: "changed" }),
    );
    await assert.rejects(() => transport.send("../escape", mail));
    if (process.platform !== "win32")
      assert.equal((await stat(join(directory, id + ".json"))).mode & 0o077, 0);
  } finally {
    owned();
    await rm(resolve(directory), { recursive: true, force: true });
  }
});
