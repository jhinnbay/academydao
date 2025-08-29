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

  // Generate a cyberpunk completion sound with digital harmony
  static playCompleteSound(): void {
    try {
      const ctx = this.getAudioContext();

      // Create multiple layers for rich cyberpunk completion sound
      const createTone = (freq: number, delay: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Digital filtering
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(freq * 2, ctx.currentTime + delay);
        filter.Q.setValueAtTime(5, ctx.currentTime + delay);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);

        // Sharp attack with digital decay
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };

      // Cyberpunk chord progression with digital glitch timing
      createTone(440, 0, 0.2);      // Base frequency
      createTone(554, 0.05, 0.18);  // Perfect fourth (slightly delayed)
      createTone(659, 0.08, 0.15);  // Major third (more delayed)
      createTone(880, 0.12, 0.12);  // Octave (final high note)

      // Add digital artifact burst
      const noise = ctx.createOscillator();
      const noiseGain = ctx.createGain();
      const noiseFilter = ctx.createBiquadFilter();

      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(2000, ctx.currentTime + 0.15);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ctx.destination);

      noise.type = 'sawtooth';
      noise.frequency.setValueAtTime(1760, ctx.currentTime + 0.15);

      noiseGain.gain.setValueAtTime(0, ctx.currentTime + 0.15);
      noiseGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.16);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);

      noise.start(ctx.currentTime + 0.15);
      noise.stop(ctx.currentTime + 0.22);

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
