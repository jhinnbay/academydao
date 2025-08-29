// Ultimate scroll position guard
export class ScrollGuard {
  private static instance: ScrollGuard;
  private currentPosition = 0;
  private isActive = false;
  private rafId: number | null = null;

  static getInstance(): ScrollGuard {
    if (!this.instance) {
      this.instance = new ScrollGuard();
    }
    return this.instance;
  }

  start(): void {
    if (this.isActive) return;
    
    this.isActive = true;
    this.currentPosition = window.scrollY;
    this.monitor();
  }

  stop(): void {
    this.isActive = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  updatePosition(): void {
    this.currentPosition = window.scrollY;
  }

  private monitor(): void {
    if (!this.isActive) return;

    const actualPosition = window.scrollY;
    
    // If position changed unexpectedly, restore it
    if (Math.abs(actualPosition - this.currentPosition) > 5) {
      window.scrollTo(0, this.currentPosition);
    } else {
      this.currentPosition = actualPosition;
    }

    this.rafId = requestAnimationFrame(() => this.monitor());
  }
}

// Initialize global scroll guard
export const scrollGuard = ScrollGuard.getInstance();
