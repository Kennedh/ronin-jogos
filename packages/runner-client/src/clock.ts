import { add, integer } from "@ronin/runner-core";
/** Integer microsecond accumulator. No render frame can skip competitive ticks. */
export class FixedClock {
  private remainder = 0;
  advance(microseconds: number, tick: () => void): number {
    if (integer(microseconds) < 0) throw new RangeError("negative_frame_time");
    if (microseconds > 1000000) throw new RangeError("frame_requires_pause");
    this.remainder = add(this.remainder, integer(microseconds * 60));
    let count = 0;
    while (this.remainder >= 1000000) {
      tick();
      this.remainder -= 1000000;
      count++;
    }
    return count;
  }
}
