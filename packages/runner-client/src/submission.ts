import { ClientError } from "./api.ts";
import type { RunnerApi, RunStatus } from "./api.ts";
import type { Recorder } from "./recorder.ts";
import type { FinishRequest } from "@ronin/contracts/replay";
export class Submission {
  readonly api: RunnerApi;
  readonly recorder: Recorder;
  status: RunStatus | undefined;
  error: ClientError | undefined;
  received = false;
  busy = false;
  retryAt = 0;
  onChange: () => void = () => {};
  private commitment: FinishRequest | undefined;
  private running: Promise<void> | undefined;
  private again = false;
  private disposed = false;
  private timer: ReturnType<typeof setTimeout> | undefined;
  constructor(api: RunnerApi, recorder: Recorder) {
    this.api = api;
    this.recorder = recorder;
    recorder.onPart = () => {
      void this.synchronize();
    };
  }
  get safeToLeave() {
    return (
      this.received &&
      this.recorder.pending.length === 0 &&
      !this.recorder.fault
    );
  }
  async finish(tick: number, reason: FinishRequest["end_reason"]) {
    try {
      this.commitment = await this.recorder.finish(tick, reason);
      await this.synchronize(true);
    } catch {
      this.error = new ClientError("REPLAY_BUFFER_ERROR");
      this.onChange();
    }
  }
  synchronize(force = false): Promise<void> {
    if (this.disposed) return Promise.resolve();
    if (force) {
      if (Date.now() < this.retryAt) return Promise.resolve();
      this.error = undefined;
    }
    if (this.error) return Promise.resolve();
    if (this.running) {
      this.again = true;
      return this.running;
    }
    this.running = this.cycle().finally(() => {
      this.running = undefined;
    });
    return this.running;
  }
  private async cycle() {
    this.busy = true;
    clearTimeout(this.timer);
    this.onChange();
    try {
      do {
        this.again = false;
        await this.recorder.ready();
        if (this.disposed) return;
        if (this.commitment && !this.received) {
          this.status = await this.api.finish(
            this.recorder.ticket.run_id,
            this.commitment,
          );
          this.received = true;
        }
        while (this.recorder.pending.length && !this.disposed) {
          const part = this.recorder.pending[0]!;
          await this.api.upload(part.segment, part.hash, part.bytes);
          this.recorder.acknowledge(part);
          this.onChange();
        }
        if (this.commitment && !this.disposed)
          this.status = await this.api.status(this.recorder.ticket.run_id);
      } while (this.again && !this.disposed);
      if (
        this.commitment &&
        this.status &&
        !["VERIFIED", "REJECTED", "EXPIRED", "ABANDONED"].includes(
          this.status.status,
        ) &&
        !this.disposed
      )
        this.timer = setTimeout(() => {
          void this.synchronize();
        }, 1000);
    } catch (error) {
      this.error =
        error instanceof ClientError
          ? error
          : new ClientError("REPLAY_BUFFER_ERROR");
      this.retryAt = Date.now() + this.error.retryAfter * 1000;
      if (this.error.retryAfter)
        this.timer = setTimeout(
          () => this.onChange(),
          this.error.retryAfter * 1000,
        );
    } finally {
      this.busy = false;
      this.onChange();
    }
  }
  async reconnect() {
    try {
      await this.api.guest();
      await this.synchronize(true);
    } catch (error) {
      this.error =
        error instanceof ClientError
          ? error
          : new ClientError("NETWORK_UNAVAILABLE");
      this.onChange();
    }
  }
  dispose() {
    this.disposed = true;
    clearTimeout(this.timer);
    this.recorder.onPart = () => {};
  }
}
