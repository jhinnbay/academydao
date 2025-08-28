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

  // Generate a typing sound effect using Web Audio API
  static playTypingSound(): void {
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Terminal-like click sound (high frequency, short duration)
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(
        600,
        ctx.currentTime + 0.05,
      );

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.05);
    } catch (error) {
      console.log("Sound effect not available:", error);
    }
  }

  // Generate a generation/processing sound effect
  static playGenerateSound(): void {
    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Lower frequency humming sound for generation
      oscillator.frequency.setValueAtTime(200, ctx.currentTime);
      oscillator.frequency.linearRampToValueAtTime(300, ctx.currentTime + 0.5);
      oscillator.frequency.linearRampToValueAtTime(180, ctx.currentTime + 1.0);

      gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.3);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 1.0);
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
