// Sound effects for the Azura terminal interface
export class SoundEffects {
  private static audioContext: AudioContext | null = null;

  private static getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Generate a cyberpunk typing sound effect with digital glitch
  static playTypingSound(): void {
    try {
      const ctx = this.getAudioContext();

      // Create multiple oscillators for layered digital sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();
      const noiseGain = ctx.createGain();

      // Configure filter for digital edge
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, ctx.currentTime);
      filter.Q.setValueAtTime(15, ctx.currentTime);

      // Connect oscillators through filter
      osc1.connect(filter);
      osc2.connect(noiseGain);
      filter.connect(gainNode);
      noiseGain.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Sharp digital click frequencies
      osc1.frequency.setValueAtTime(2400, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(1800, ctx.currentTime + 0.03);

      // Add digital noise burst
      osc2.frequency.setValueAtTime(4800, ctx.currentTime);
      osc2.type = 'square';
      osc1.type = 'sawtooth';

      // Sharp attack, quick decay for digital precision
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.002);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);

      noiseGain.gain.setValueAtTime(0.02, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.01);

      osc1.start(ctx.currentTime);
      osc2.start(ctx.currentTime);
      osc1.stop(ctx.currentTime + 0.03);
      osc2.stop(ctx.currentTime + 0.01);
    } catch (error) {
      console.log("Sound effect not available:", error);
    }
  }

  // Generate a futuristic processing sound with modulated synthesis
  static playGenerateSound(): void {
    try {
      const ctx = this.getAudioContext();

      // Create complex synthesis chain for futuristic processing sound
      const carrier = ctx.createOscillator();
      const modulator = ctx.createOscillator();
      const modulatorGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const distortion = ctx.createWaveShaper();
      const mainGain = ctx.createGain();
      const reverbGain = ctx.createGain();

      // Setup modulation (FM synthesis for digital texture)
      modulator.frequency.setValueAtTime(7, ctx.currentTime);
      modulatorGain.gain.setValueAtTime(50, ctx.currentTime);

      modulator.connect(modulatorGain);
      modulatorGain.connect(carrier.frequency);

      // Carrier signal with sweeping frequency
      carrier.frequency.setValueAtTime(120, ctx.currentTime);
      carrier.frequency.exponentialRampToValueAtTime(280, ctx.currentTime + 0.4);
      carrier.frequency.exponentialRampToValueAtTime(160, ctx.currentTime + 0.8);
      carrier.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 1.2);
      carrier.type = 'sawtooth';

      // Low-pass filter with resonance sweep
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.6);
      filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 1.2);
      filter.Q.setValueAtTime(8, ctx.currentTime);

      // Subtle distortion for digital edge
      const curve = new Float32Array(256);
      for (let i = 0; i < 256; i++) {
        const x = (i - 128) / 128;
        curve[i] = Math.tanh(x * 2) * 0.8;
      }
      distortion.curve = curve;

      // Connect the chain
      carrier.connect(filter);
      filter.connect(distortion);
      distortion.connect(mainGain);
      mainGain.connect(ctx.destination);

      // Dynamic gain envelope
      mainGain.gain.setValueAtTime(0, ctx.currentTime);
      mainGain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.1);
      mainGain.gain.setValueAtTime(0.08, ctx.currentTime + 0.4);
      mainGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.8);
      mainGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      modulator.start(ctx.currentTime);
      carrier.start(ctx.currentTime);
      modulator.stop(ctx.currentTime + 1.2);
      carrier.stop(ctx.currentTime + 1.2);
    } catch (error) {
      console.log("Sound effect not available:", error);
    }
  }

  // Generate a response completion sound
  static playCompleteSound(): void {
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Success chime (ascending notes)
      oscillator.frequency.setValueAtTime(440, ctx.currentTime);
      oscillator.frequency.setValueAtTime(550, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(660, ctx.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.3);
    } catch (error) {
      console.log("Sound effect not available:", error);
    }
  }

  // Type text with sound effects
  static typeWithSound(
    text: string,
    callback: (char: string, isComplete: boolean) => void,
    delay: number = 50,
  ): void {
    let index = 0;

    const typeNext = () => {
      if (index < text.length) {
        const char = text[index];
        this.playTypingSound();
        callback(char, false);
        index++;
        setTimeout(typeNext, delay);
      } else {
        this.playCompleteSound();
        callback("", true);
      }
    };

    typeNext();
  }
}
