// Comprehensive scroll preservation utility
export class ScrollPreservation {
  private static scrollPosition = 0;
  private static isPreserving = false;

  static preserve(): void {
    if (this.isPreserving) return;
    
    this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    this.isPreserving = true;
    
    // Lock scroll position
    document.documentElement.style.setProperty('--scroll-y', `${this.scrollPosition}px`);
    document.body.style.position = 'fixed';
    document.body.style.top = `calc(var(--scroll-y) * -1)`;
    document.body.style.width = '100%';
    document.body.style.overflowY = 'scroll';
  }

  static restore(): void {
    if (!this.isPreserving) return;
    
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.width = '';
    document.body.style.overflowY = '';
    
    window.scrollTo(0, this.scrollPosition);
    this.isPreserving = false;
  }

  static forceScrollTo(position: number): void {
    this.scrollPosition = position;
    if (!this.isPreserving) {
      window.scrollTo(0, position);
    }
  }
}

// Debounced state updater to prevent rapid re-renders
export function createDebouncedUpdater<T>(
  setter: (value: T) => void,
  delay: number = 16 // ~60fps
): (value: T) => void {
  let timeoutId: NodeJS.Timeout;
  let latestValue: T;

  return (value: T) => {
    latestValue = value;
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      setter(latestValue);
    }, delay);
  };
}
