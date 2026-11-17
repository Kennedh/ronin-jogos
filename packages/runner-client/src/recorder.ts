import { encodeSegment, segmentHash } from "@ronin/contracts/replay";
import type { ReplaySegment, FinishRequest } from "@ronin/contracts/replay";
import type { RunTicket } from "./api.ts";
export interface RecordedPart {
  segment: ReplaySegment;
  hash: string;
  bytes: Uint8Array;
}
/** Only commands are recorded. Buffers are bounded; acknowledged payloads are released. */
export class Recorder {
  readonly ticket: RunTicket;
  readonly pending: RecordedPart[] = [];
  private start = 0;
  private index = 0;
  private hash: string | null = null;
  private sequence = 0;
  private actions: ReplaySegment["actions"] = [];
  private controls: ReplaySegment["controls"] = [];
  private estimate = 512;
  private tail: Promise<void> = Promise.resolve();
  private latest: { index: number; hash: string; tick: number } | undefined;
  totalBytes = 0;
  pendingBytes = 0;
  fault: Error | undefined;
  onPart: () => void = () => {};
  constructor(ticket: RunTicket) {
    this.ticket = ticket;
  }
  get nearlyFull() {
    return (
      this.pendingBytes + this.estimate > 8 * 1024 * 1024 - 8192 ||
      this.totalBytes + this.estimate >
        this.ticket.limits.max_run_encoded_bytes - 8192 ||
      this.index >= this.ticket.limits.max_segments_per_run - 2
    );
  }
  private bytes(value: unknown) {
    return new TextEncoder().encode(JSON.stringify(value)).length + 1;
  }
  action(tick: number, action: ReplaySegment["actions"][number]["action"]) {
    const value = { tick, action };
    this.actions.push(value);
    this.estimate += this.bytes(value);
  }
  control(tick: number, action: ReplaySegment["controls"][number]["action"]) {
    const value = { tick, action, sequence: this.sequence++ };
    this.controls.push(value);
    this.estimate += this.bytes(value);
    if (this.controls.length >= 2000) this.seal(tick);
  }
  afterTick(tick: number) {
    if (
      tick - this.start >= this.ticket.limits.segment_ticks ||
      this.estimate > 180000
    )
      this.seal(tick);
  }
  seal(tick: number) {
    if (tick === this.start && !this.actions.length && !this.controls.length)
      return;
    if (this.index >= this.ticket.limits.max_segments_per_run)
      throw new Error("SEGMENT_QUOTA");
    const draft = {
      protocol: "rr-input-v1" as const,
      run_id: this.ticket.run_id,
      index: this.index++,
      start_tick: this.start,
      end_tick: tick,
      actions: this.actions,
      controls: this.controls,
    };
    this.start = tick;
    this.actions = [];
    this.controls = [];
    this.estimate = 512;
    this.tail = this.tail
      .then(async () => {
        const segment: ReplaySegment = { ...draft, previous_hash: this.hash },
          bytes = encodeSegment(segment),
          hash = await segmentHash(segment);
        this.hash = hash;
        this.latest = { index: segment.index, hash, tick };
        this.totalBytes += bytes.length;
        this.pendingBytes += bytes.length;
        this.pending.push({ segment, hash, bytes });
        this.onPart();
      })
      .catch((error: unknown) => {
        this.fault =
          error instanceof Error ? error : new Error("REPLAY_BUFFER_ERROR");
      });
  }
  async ready() {
    await this.tail;
    if (this.fault) throw this.fault;
  }
  acknowledge(part: RecordedPart) {
    if (this.pending[0] !== part) throw new Error("ack_order");
    this.pending.shift();
    this.pendingBytes -= part.bytes.length;
  }
  async finish(
    tick: number,
    endReason: FinishRequest["end_reason"],
  ): Promise<FinishRequest> {
    this.seal(tick);
    await this.ready();
    if (!this.latest) throw new Error("missing_final_segment");
    return {
      final_segment_index: this.latest.index,
      final_hash: this.latest.hash,
      final_tick: tick,
      end_reason: endReason,
    };
  }
}
