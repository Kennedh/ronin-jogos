/** Original, synthesized supplementary cue. Visual cues remain sufficient without audio. */
export class BossSound {
  private context: AudioContext | undefined;
  private key = "";
  unlock() {
    try {
      this.context ??= new AudioContext();
      void this.context.resume().catch(() => {});
    } catch {
      /* Unsupported or blocked audio remains optional. */
    }
  }
  cue(key: string, high: boolean, enabled: boolean) {
    if (this.key === key) return;
    this.key = key;
    if (!enabled || !this.context || this.context.state !== "running") return;
    const c = this.context,
      o = c.createOscillator(),
      g = c.createGain();
    o.type = "triangle";
    o.frequency.value = high ? 660 : 220;
    g.gain.setValueAtTime(0.04, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.12);
    o.connect(g);
    g.connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.14);
    o.onended = () => {
      o.disconnect();
      g.disconnect();
    };
  }
  close() {
    void this.context?.close().catch(() => {});
    this.context = undefined;
  }
}
