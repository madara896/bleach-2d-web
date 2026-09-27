// Bleach 2D Web Game: Procedural Web Audio Engine
// Generates high-impact anime battle SFX & dynamic soundtrack using native Web Audio API

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isBgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private currentStep: number = 0;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public init(): void {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('Web Audio not supported or failed to initialize', e);
    }
  }

  public resume(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // --- Sound Effects ---

  /** High-impact metal sword clash with resonant ring */
  public playSwordClash(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Metal clang oscillator
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'triangle';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(950, t);
    osc1.frequency.exponentialRampToValueAtTime(140, t + 0.15);

    osc2.frequency.setValueAtTime(1420, t);
    osc2.frequency.exponentialRampToValueAtTime(280, t + 0.12);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    // Filter to simulate sharp blade sheen
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, t);
    filter.Q.setValueAtTime(3.5, t);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.26);
    osc2.stop(t + 0.26);
  }

  /** Instantaneous Shunpo / Sonído flash step wind displacement snap */
  public playShunpo(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.12);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.frequency.exponentialRampToValueAtTime(300, t + 0.12);
    filter.Q.setValueAtTime(2.0, t);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.13);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  /** Getsuga Tensho energy release roar */
  public playGetsuga(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const subOsc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(90, t + 0.45);

    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(110, t);
    subOsc.frequency.exponentialRampToValueAtTime(55, t + 0.5);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.linearRampToValueAtTime(0.9, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    const dist = this.ctx.createWaveShaper();
    dist.curve = this.makeDistortionCurve(15) as unknown as Float32Array<ArrayBuffer>;

    osc.connect(dist);
    subOsc.connect(dist);
    dist.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    subOsc.start(t);
    osc.stop(t + 0.52);
    subOsc.stop(t + 0.52);
  }

  /** Cero charging whine into destructive hollow explosion */
  public playCero(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Piercing high-pitch charge
    const chargeOsc = this.ctx.createOscillator();
    const chargeGain = this.ctx.createGain();
    chargeOsc.type = 'sine';
    chargeOsc.frequency.setValueAtTime(1400, t);
    chargeOsc.frequency.linearRampToValueAtTime(3200, t + 0.2);

    chargeGain.gain.setValueAtTime(0.4, t);
    chargeGain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    chargeOsc.connect(chargeGain);
    chargeGain.connect(this.sfxGain);
    chargeOsc.start(t);
    chargeOsc.stop(t + 0.26);

    // Deep bass laser blast
    const blastOsc = this.ctx.createOscillator();
    const blastGain = this.ctx.createGain();
    blastOsc.type = 'sawtooth';
    blastOsc.frequency.setValueAtTime(180, t + 0.18);
    blastOsc.frequency.exponentialRampToValueAtTime(45, t + 0.6);

    blastGain.gain.setValueAtTime(0.0, t);
    blastGain.gain.setValueAtTime(0.9, t + 0.18);
    blastGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    blastOsc.connect(blastGain);
    blastGain.connect(this.sfxGain);
    blastOsc.start(t + 0.18);
    blastOsc.stop(t + 0.66);
  }

  /** Hado #90: Kurohitsugi gravity crush sound */
  public playKurohitsugi(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.linearRampToValueAtTime(40, t + 0.8);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.86);
  }

  /** Quincy spirit arrow release */
  public playArrow(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1600, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.15);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  /** Bankai / Resurrección activation chime & spiritual hum */
  public playBankai(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Harmonic bell chimes (mystical awakening chord)
    const freqs = [440, 554.37, 659.25, 880, 1108.73];
    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);

      gain.gain.setValueAtTime(0, t);
      gain.gain.setValueAtTime(0.5 / (idx + 1), t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(t + idx * 0.04);
      osc.stop(t + 1.3);
    });

    // Deep sub-bass surge of spiritual power
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(80, t + 0.1);
    subOsc.frequency.exponentialRampToValueAtTime(35, t + 1.0);

    subGain.gain.setValueAtTime(0.7, t + 0.1);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(t + 0.1);
    subOsc.stop(t + 1.15);
  }

  /** Ultimate Art Cut-In Strike */
  public playUltimate(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Glass shatter + explosive bass
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(2400, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.9);

    gain.gain.setValueAtTime(0.9, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 1.05);
  }

  /** Light hit punch */
  public playHitLight(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(70, t + 0.08);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  /** Heavy impact hit */
  public playHitHeavy(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    gain.gain.setValueAtTime(0.8, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.23);
  }

  /** Shield / Guard block */
  public playBlock(): void {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(120, t + 0.08);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.11);
  }

  // --- Dynamic Synth Battle BGM ---

  public startBattleBGM(): void {
    if (this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
    this.isBgmPlaying = true;
    this.currentStep = 0;

    const tempo = 138; // BPM
    const stepDuration = 60 / tempo / 4; // 16th notes

    // Bleach rock chord progression: Em -> C -> D -> Bm
    const bassline = [
      41.2, 41.2, 82.4, 41.2, 41.2, 82.4, 41.2, 41.2, // E1
      32.7, 32.7, 65.4, 32.7, 32.7, 65.4, 32.7, 32.7, // C1
      36.7, 36.7, 73.4, 36.7, 36.7, 73.4, 36.7, 36.7, // D1
      30.9, 30.9, 61.7, 30.9, 30.9, 61.7, 30.9, 41.2  // B0 -> E1
    ];

    const leadRiff = [
      329.63, 0, 392.00, 0, 493.88, 0, 440.00, 392.00,
      329.63, 0, 261.63, 0, 293.66, 0, 329.63, 0
    ];

    const playStep = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
      const t = this.ctx.currentTime;

      // Bass note
      const bassFreq = bassline[this.currentStep % bassline.length];
      if (bassFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(bassFreq, t);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, t);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + stepDuration * 1.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(t);
        osc.stop(t + stepDuration * 1.9);
      }

      // Kick drum on 1, 5, 9, 13
      if (this.currentStep % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(140, t);
        kickOsc.frequency.exponentialRampToValueAtTime(38, t + 0.09);

        kickGain.gain.setValueAtTime(0.8, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        kickOsc.connect(kickGain);
        kickGain.connect(this.bgmGain);
        kickOsc.start(t);
        kickOsc.stop(t + 0.11);
      }

      // Snare on 4, 12
      if (this.currentStep % 8 === 4) {
        const snareOsc = this.ctx.createOscillator();
        const snareGain = this.ctx.createGain();
        snareOsc.type = 'triangle';
        snareOsc.frequency.setValueAtTime(220, t);

        snareGain.gain.setValueAtTime(0.5, t);
        snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        snareOsc.connect(snareGain);
        snareGain.connect(this.bgmGain);
        snareOsc.start(t);
        snareOsc.stop(t + 0.13);
      }

      // Lead melody
      const leadFreq = leadRiff[this.currentStep % leadRiff.length];
      if (leadFreq > 0 && Math.random() > 0.1) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(leadFreq, t);

        leadGain.gain.setValueAtTime(0.12, t);
        leadGain.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 1.4);

        leadOsc.connect(leadGain);
        leadGain.connect(this.bgmGain);
        leadOsc.start(t);
        leadOsc.stop(t + stepDuration * 1.5);
      }

      this.currentStep = (this.currentStep + 1) % 64;
      this.bgmTimer = window.setTimeout(playStep, stepDuration * 1000);
    };

    playStep();
  }

  public stopBattleBGM(): void {
    this.isBgmPlaying = false;
    if (this.bgmTimer !== null) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private makeDistortionCurve(amount: number): Float32Array {
    const k = typeof amount === 'number' ? amount : 50;
    const nSamples = 44100;
    const curve = new Float32Array(nSamples);
    const deg = Math.PI / 180;
    for (let i = 0; i < nSamples; ++i) {
      const x = (i * 2) / nSamples - 1;
      curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
    }
    return curve;
  }
}

// Global audio engine singleton
export const audio = new AudioEngine();
