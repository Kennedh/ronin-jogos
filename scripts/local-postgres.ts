/** Dev/QA only. On Windows pg_ctl drops administrator privileges before spawn. */
import EmbeddedPostgres from "embedded-postgres";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import { readFile } from "node:fs/promises";
export default class LocalPostgres extends EmbeddedPostgres {
  #windowsStarted = false;
  async #ctl(args: string[]) {
    // Resolve from the launcher, which owns this platform-specific dependency.
    // Dynamic URL keeps Linux typechecking independent of Windows-only installs.
    const resolveNative = createRequire(
      import.meta.resolve("embedded-postgres"),
    );
    const binaries = (await import(
      pathToFileURL(resolveNative.resolve("@embedded-postgres/windows-x64"))
        .href
    )) as { pg_ctl: string };
    return new Promise<void>((resolve, reject) => {
      const child = spawn(
        binaries.pg_ctl,
        ["-D", this.options.databaseDir, ...args],
        {
          windowsHide: true,
          stdio: ["ignore", "pipe", "pipe"],
          env: { ...process.env, LC_MESSAGES: "C" },
        },
      );
      let output = "";
      const record = (data: Buffer) => {
        output = (output + data.toString("utf8")).slice(-65536);
      };
      child.stdout.on("data", record);
      child.stderr.on("data", record);
      const timeout = setTimeout(() => {
        child.kill();
        finish(new Error("dev_pg_ctl_timeout"));
      }, 35000);
      let settled = false;
      function finish(error?: Error) {
        if (settled) return;
        settled = true;
        clearTimeout(timeout);
        // The background Windows server can inherit these pipes. Wait for the
        // controller's exit, not for EOF from the long-running server process.
        child.stdout.destroy();
        child.stderr.destroy();
        if (error) reject(error);
        else resolve();
      }
      child.once("error", finish);
      child.once("exit", (code, signal) => {
        finish(
          code === 0
            ? undefined
            : Object.assign(
                new Error(`dev_pg_ctl_${args[0]}_failed: ${output}`),
                { code, signal },
              ),
        );
      });
    });
  }
  override async start() {
    if (process.platform !== "win32") return super.start();
    // Never adopt or stop an existing cluster from another invocation.
    await this.#ctl(["status"]).then(
      () => {
        throw new Error("dev_postgres_already_running");
      },
      (error: unknown) => {
        if (!(error instanceof Error) || !("code" in error) || error.code !== 3)
          throw error;
      },
    );
    try {
      // The flags are fixed by our two callers; no externally supplied command text.
      await this.#ctl([
        "start",
        "-w",
        "-t",
        "30",
        "-l",
        this.options.databaseDir + ".log",
        "-o",
        ["-p", String(this.options.port), ...this.options.postgresFlags].join(
          " ",
        ),
      ]);
      this.#windowsStarted = true;
    } catch (error) {
      this.options.onLog(
        await readFile(this.options.databaseDir + ".log", "utf8").then(
          (text) => text.slice(-16384),
          () => "",
        ),
      );
      // A timeout may occur after this invocation has started the server.
      const running = await this.#ctl(["status"]).then(
        () => true,
        () => false,
      );
      if (running) {
        this.#windowsStarted = true;
        await this.stop();
      }
      throw error;
    }
  }
  override async stop() {
    if (process.platform !== "win32") return super.stop();
    if (!this.#windowsStarted) return;
    await this.#ctl(["stop", "-w", "-t", "30", "-m", "fast"]);
    this.#windowsStarted = false;
  }
}
