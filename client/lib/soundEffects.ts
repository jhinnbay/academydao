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

  // Generate a smooth cyberpunk typing sound - like mechanical keyboard with bass
  static playTypingSound(): void {
    try {
      const ctx = this.getAudioContext();

      // Bass click with subtle harmonics
      const bassOsc = ctx.createOscillator();
      const harmonic = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();
      const harmonicGain = ctx.createGain();

      // Low-pass filter for warmth
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);
      filter.Q.setValueAtTime(2, ctx.currentTime);

      bassOsc.connect(filter);
      harmonic.connect(harmonicGain);
      filter.connect(gainNode);
      harmonicGain.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Deep bass click (like mechanical switch)
      bassOsc.frequency.setValueAtTime(120, ctx.currentTime);
      bassOsc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);
      bassOsc.type = 'triangle';

      // Subtle harmonic for character
      harmonic.frequency.setValueAtTime(360, ctx.currentTime);
      harmonic.type = 'sine';

      // Smooth envelope
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.005);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      harmonicGain.gain.setValueAtTime(0.02, ctx.currentTime);
      harmonicGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

      bassOsc.start(ctx.currentTime);
      harmonic.start(ctx.currentTime);
      bassOsc.stop(ctx.currentTime + 0.08);
      harmonic.stop(ctx.currentTime + 0.04);
    } catch (error) {
      console.log("Sound effect not available:", error);
    }
  }

  // Generate a warm, atmospheric processing sound - like servers humming
  static playGenerateSound(): void {
    try {
      const ctx = this.getAudioContext();

      // Deep atmospheric drone with gentle modulation
      const drone1 = ctx.createOscillator();
      const drone2 = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const filter = ctx.createBiquadFilter();
      const mainGain = ctx.createGain();
      const drone2Gain = ctx.createGain();

      // LFO for gentle modulation
      lfo.frequency.setValueAtTime(0.3, ctx.currentTime);
      lfoGain.gain.setValueAtTime(8, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(drone1.frequency);

      // Warm low frequencies
      drone1.frequency.setValueAtTime(60, ctx.currentTime);
      drone1.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.8);
      drone1.frequency.linearRampToValueAtTime(55, ctx.currentTime + 1.5);
      drone1.type = 'triangle';

      drone2.frequency.setValueAtTime(90, ctx.currentTime);
      drone2.frequency.linearRampToValueAtTime(110, ctx.currentTime + 1.2);
      drone2.type = 'sine';

      // Gentle low-pass filtering
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(400, ctx.currentTime + 0.8);
      filter.frequency.linearRampToValueAtTime(150, ctx.currentTime + 1.5);
      filter.Q.setValueAtTime(1, ctx.currentTime);

      // Connect everything
      drone1.connect(filter);
      drone2.connect(drone2Gain);
      filter.connect(mainGain);
      drone2Gain.connect(mainGain);
      mainGain.connect(ctx.destination);

      // Smooth fade in and out
      mainGain.gain.setValueAtTime(0, ctx.currentTime);
      mainGain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.3);
      mainGain.gain.setValueAtTime(0.05, ctx.currentTime + 1.0);
      mainGain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      drone2Gain.gain.setValueAtTime(0.02, ctx.currentTime);
      drone2Gain.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.8);
      drone2Gain.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 1.5);

      lfo.start(ctx.currentTime);
      drone1.start(ctx.currentTime);
      drone2.start(ctx.currentTime);
      lfo.stop(ctx.currentTime + 1.5);
      drone1.stop(ctx.currentTime + 1.5);
      drone2.stop(ctx.currentTime + 1.5);
    } catch (error) {
      console.log("Sound effect not available:", error);
    }
  }

  // Generate a satisfying completion sound - like a synth power-down
  static playCompleteSound(): void {
    try {
      const ctx = this.getAudioContext();

      // Create warm, descending synth tones
      const createSynthTone = (freq: number, delay: number, duration: number, volume: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        // Warm low-pass filter
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 3, ctx.currentTime + delay);
        filter.Q.setValueAtTime(2, ctx.currentTime + delay);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.type = 'triangle';  // Warmer than square wave
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.7, ctx.currentTime + delay + duration);

        // Smooth envelope
        gain.gain.setValueAtTime(0, ctx.currentTime + delay);
        gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      };

      // Descending bass chord - satisfying resolution
      createSynthTone(130, 0, 0.4, 0.06);      // Bass note (C3)
      createSynthTone(165, 0.05, 0.35, 0.04);  // E3
      createSynthTone(196, 0.08, 0.3, 0.03);   // G3
      createSynthTone(262, 0.12, 0.25, 0.02);  // C4 (octave)

      // Add subtle bass drop for satisfaction
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      const bassFilter = ctx.createBiquadFilter();

      bassFilter.type = 'lowpass';
      bassFilter.frequency.setValueAtTime(100, ctx.currentTime + 0.2);

      bassOsc.connect(bassFilter);
      bassFilter.connect(bassGain);
      bassGain.connect(ctx.destination);

      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(65, ctx.currentTime + 0.2);
      bassOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.5);

      bassGain.gain.setValueAtTime(0, ctx.currentTime + 0.2);
      bassGain.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.25);
      bassGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      bassOsc.start(ctx.currentTime + 0.2);
      bassOsc.stop(ctx.currentTime + 0.5);

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
