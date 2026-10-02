/**
 * Tiny synthesized sound engine. No audio assets, everything is generated
 * with the Web Audio API so the game ships with zero binary files.
 */

const MUTE_KEY = "desi-vision-muted";

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted = false;

  constructor() {
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === "1";
    } catch {
      this.muted = false;
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  setMuted(m: boolean): void {
    this.muted = m;
    try {
      localStorage.setItem(MUTE_KEY, m ? "1" : "0");
    } catch {
      /* storage unavailable, keep going */
    }
  }

  private ensure(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx) {
      const AC =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  private blip(
    freq: number,
    dur: number,
    type: OscillatorType,
    vol = 0.12,
    delay = 0,
    slideTo?: number,
  ): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const t = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    }
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  /** UI tap */
  click(): void {
    this.blip(1250, 0.05, "square", 0.05);
  }

  /** Countdown tick */
  tick(): void {
    this.blip(880, 0.07, "sine", 0.09);
  }

  /** Round start jingle */
  start(): void {
    this.blip(440, 0.1, "triangle", 0.12);
    this.blip(660, 0.1, "triangle", 0.12, 0.09);
    this.blip(880, 0.18, "triangle", 0.12, 0.18);
  }

  /** Successful catch: bright ascending arp, picked from 3 variations */
  catch(): void {
    const pick = Math.floor(Math.random() * 3);
    if (pick === 0) {
      this.blip(523, 0.09, "triangle", 0.16);
      this.blip(784, 0.09, "triangle", 0.16, 0.07);
      this.blip(1047, 0.2, "triangle", 0.16, 0.14);
    } else if (pick === 1) {
      this.blip(587, 0.08, "triangle", 0.16);
      this.blip(880, 0.08, "triangle", 0.16, 0.07);
      this.blip(1175, 0.22, "triangle", 0.16, 0.14);
    } else {
      this.blip(659, 0.08, "triangle", 0.16);
      this.blip(988, 0.08, "triangle", 0.16, 0.06);
      this.blip(1319, 0.08, "triangle", 0.16, 0.12);
      this.blip(1568, 0.2, "triangle", 0.16, 0.18);
    }
  }

  /** Combo sting, pitch rises with the combo level */
  combo(level: number): void {
    const base = 620 + Math.min(level, 12) * 70;
    this.blip(base, 0.09, "square", 0.07);
    this.blip(base * 1.5, 0.14, "square", 0.07, 0.06);
  }

  /** Miss / fail: low buzz */
  fail(): void {
    this.blip(170, 0.22, "sawtooth", 0.1, 0, 110);
    this.blip(120, 0.28, "sawtooth", 0.1, 0.1, 80);
  }

  /** Assisted tag accepted */
  tag(): void {
    this.blip(700, 0.08, "sine", 0.12);
    this.blip(1050, 0.12, "sine", 0.12, 0.07);
  }
}

export const sound = new SoundEngine();
