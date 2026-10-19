import type { SkyState } from './sky';
// The promo video's own sound design, shared with the page so both stay in
// step (videos/meet-you-at-sunset, generated for the venue).
import birdsUrl from '/videos/meet-you-at-sunset/assets/audio/sfx-birds.mp3?url';
import musicUrl from '/videos/meet-you-at-sunset/assets/audio/music-bed.mp3?url';
import cricketsUrl from '/videos/meet-you-at-sunset/assets/audio/sfx-crickets.mp3?url';
import doorsUrl from '/videos/meet-you-at-sunset/assets/audio/sfx-doors.mp3?url';
import clinkUrl from '/videos/meet-you-at-sunset/assets/audio/sfx-clink.mp3?url';
import lightsUrl from '/videos/meet-you-at-sunset/assets/audio/sfx-lights.mp3?url';
import cheerUrl from '/videos/meet-you-at-sunset/assets/audio/sfx-cheer.mp3?url';

/**
 * An optional soundscape for the experience page: birdsong in the morning,
 * the acoustic music bed through golden hour and the reception, crickets
 * after dark, plus a few one-time cues (barn doors, glasses, string lights,
 * a cheer). It is silent until the visitor switches it on.
 */

export type Cue = 'doors' | 'clink' | 'lights' | 'cheer';

const CUE_URLS: Readonly<Record<Cue, string>> = {
  doors: doorsUrl,
  clink: clinkUrl,
  lights: lightsUrl,
  cheer: cheerUrl,
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** How loud each ambient layer should be for a time of day, 0 to 1. */
export const layerLevels = (sky: SkyState) => ({
  birds: clamp01(1 - sky.stars * 3) * clamp01(1 - sky.glow),
  music: clamp01(sky.glow) * clamp01(1 - sky.stars),
  crickets: clamp01(sky.stars),
});

const MAX = { birds: 0.45, music: 0.32, crickets: 0.4 } as const;

export class Soundscape {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private layers: Partial<Record<keyof typeof MAX, GainNode>> = {};
  private cues: Partial<Record<Cue, AudioBuffer>> = {};
  private played = new Set<Cue>();
  private loading: Promise<void> | null = null;

  get running() {
    return this.context?.state === 'running';
  }

  /** Must be called from a click or key press: browsers block audio otherwise. */
  async start() {
    if (!this.context) {
      const Context =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (!Context) return;
      this.context = new Context();
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.context.destination);
    }
    await this.context.resume();
    this.loading ??= this.load();
    await this.loading;
    const now = this.context.currentTime;
    this.master?.gain.cancelScheduledValues(now);
    this.master?.gain.setTargetAtTime(0.9, now, 0.6);
  }

  stop() {
    if (!this.context || !this.master) return;
    const now = this.context.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(0, now, 0.25);
    window.setTimeout(() => {
      if (this.master && this.master.gain.value < 0.02) {
        void this.context?.suspend();
      }
    }, 1200);
  }

  private async decode(url: string) {
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    return this.context!.decodeAudioData(data);
  }

  private async load() {
    const context = this.context!;
    const loops = { birds: birdsUrl, music: musicUrl, crickets: cricketsUrl };
    await Promise.all(
      (Object.keys(loops) as Array<keyof typeof loops>).map(async (name) => {
        const buffer = await this.decode(loops[name]);
        const gain = context.createGain();
        gain.gain.value = 0;
        gain.connect(this.master!);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        // Start each loop at a different point so short clips repeat less.
        source.start(0, Math.random() * buffer.duration);
        this.layers[name] = gain;
      })
    );
    await Promise.all(
      (Object.keys(CUE_URLS) as Cue[]).map(async (cue) => {
        this.cues[cue] = await this.decode(CUE_URLS[cue]);
      })
    );
  }

  /** Follow the page's time of day; cheap enough to call on every scroll. */
  update(sky: SkyState) {
    if (!this.context || !this.running) return;
    const levels = layerLevels(sky);
    const now = this.context.currentTime;
    for (const name of Object.keys(MAX) as Array<keyof typeof MAX>) {
      this.layers[name]?.gain.setTargetAtTime(
        levels[name] * MAX[name],
        now,
        0.5
      );
    }
  }

  /** Plays a cue once per visit, the first time its section comes into view. */
  cue(name: Cue) {
    if (!this.context || !this.running || this.played.has(name)) return;
    const buffer = this.cues[name];
    if (!buffer || !this.master) return;
    this.played.add(name);
    const source = this.context.createBufferSource();
    const gain = this.context.createGain();
    gain.gain.value = 0.55;
    source.buffer = buffer;
    source.connect(gain).connect(this.master);
    source.start();
  }

  dispose() {
    void this.context?.close();
    this.context = null;
  }
}
