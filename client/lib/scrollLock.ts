// Comprehensive scroll lock utility to prevent any scroll jumping
export class ScrollLock {
  private static isLocked = false;
  private static originalScrollPosition = 0;
  private static originalBodyStyle = '';
  private static originalHtmlStyle = '';

  static lock(): void {
    if (this.isLocked) return;

    // Save current scroll position
    this.originalScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
    
    // Save original styles
    this.originalBodyStyle = document.body.style.cssText;
    this.originalHtmlStyle = document.documentElement.style.cssText;

    // Apply scroll lock styles
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    document.body.style.cssText += `
      position: fixed !important;
      top: -${this.originalScrollPosition}px !important;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
      padding-right: ${scrollbarWidth}px !important;
    `;
    
    document.documentElement.style.cssText += `
      overflow: hidden !important;
      height: 100% !important;
    `;

    this.isLocked = true;
  }

  static unlock(): void {
    if (!this.isLocked) return;

    // Restore original styles
    document.body.style.cssText = this.originalBodyStyle;
    document.documentElement.style.cssText = this.originalHtmlStyle;

    // Restore scroll position
    window.scrollTo(0, this.originalScrollPosition);

    this.isLocked = false;
  }

  static forcePreventScroll(element: HTMLElement): void {
    element.addEventListener('scroll', this.preventScrollHandler, { passive: false });
    element.addEventListener('wheel', this.preventScrollHandler, { passive: false });
    element.addEventListener('touchmove', this.preventScrollHandler, { passive: false });
  }

  static removePreventScroll(element: HTMLElement): void {
    element.removeEventListener('scroll', this.preventScrollHandler);
    element.removeEventListener('wheel', this.preventScrollHandler);
    element.removeEventListener('touchmove', this.preventScrollHandler);
  }

  private static preventScrollHandler = (e: Event): void => {
    e.preventDefault();
    e.stopImmediatePropagation();
  };
}
