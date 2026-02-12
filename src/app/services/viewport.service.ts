import { Injectable, signal, computed, effect } from '@angular/core';

export type ViewportType = 'mobile' | 'tablet' | 'desktop';
export type OrientationType = 'portrait' | 'landscape';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private readonly breakpoints = {
    mobile: 700,
    tablet: 1024,
  };

  /** Signal de largeur et hauteur */
  private width = signal(window.innerWidth);
  private height = signal(window.innerHeight);

  /** Signals dérivés */
  readonly isMobile = computed(() => this.width() < this.breakpoints.mobile);
  readonly isTablet = computed(
    () => this.width() >= this.breakpoints.mobile && this.width() < this.breakpoints.tablet
  );
  readonly isDesktop = computed(() => this.width() >= this.breakpoints.tablet);

  readonly viewportType = computed<ViewportType>(() => {
    if (this.isMobile()) return 'mobile';
    if (this.isTablet()) return 'tablet';
    return 'desktop';
  });

  readonly orientation = computed<OrientationType>(() =>
    this.width() > this.height() ? 'landscape' : 'portrait'
  );

  constructor() {
    // ✅ Écoute directe du resize (fonctionne même dans un service)
    window.addEventListener('resize', () => {
      this.width.set(window.innerWidth);
      this.height.set(window.innerHeight);
    });

    // Optionnel : effet pour debug
    effect(() => {
      console.log(
        `Viewport: ${this.viewportType()} | Orientation: ${this.orientation()} | ${this.width()}x${this.height()}`
      );
    });
  }
}
