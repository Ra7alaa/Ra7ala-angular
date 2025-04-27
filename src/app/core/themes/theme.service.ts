import { Injectable, Renderer2, RendererFactory2 } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeOption = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private storageKey = 'ra7ala-theme';
  private themeSubject = new BehaviorSubject<ThemeOption>(
    this.getCurrentTheme()
  );
  private renderer: Renderer2;
  private themeLinks: { [key: string]: HTMLLinkElement } = {};

  public theme$: Observable<ThemeOption> = this.themeSubject.asObservable();

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.loadThemeStylesheets();
    this.applyTheme(this.getCurrentTheme());
    this.listenForSystemChanges();
  }

  /**
   * Load theme stylesheets
   */
  private loadThemeStylesheets(): void {
    // Base variables are already loaded in index.html

    // Load dark theme CSS
    this.themeLinks['dark'] = this.renderer.createElement('link');
    this.renderer.setAttribute(this.themeLinks['dark'], 'rel', 'stylesheet');
    this.renderer.setAttribute(
      this.themeLinks['dark'],
      'href',
      'assets/css/dark-theme.css'
    );
    this.renderer.setAttribute(this.themeLinks['dark'], 'disabled', 'true');
    this.renderer.appendChild(document.head, this.themeLinks['dark']);

    // Load RTL stylesheet (will be enabled/disabled by language service)
    if (!document.querySelector('link[href="assets/css/rtl.css"]')) {
      const rtlLink = this.renderer.createElement('link');
      this.renderer.setAttribute(rtlLink, 'rel', 'stylesheet');
      this.renderer.setAttribute(rtlLink, 'href', 'assets/css/rtl.css');
      this.renderer.setAttribute(rtlLink, 'id', 'rtl-stylesheet');
      this.renderer.setAttribute(rtlLink, 'disabled', 'true'); // Default disabled, LanguageService will enable as needed
      this.renderer.appendChild(document.head, rtlLink);
    }
  }

  /**
   * Set a new theme and apply it
   */
  setTheme(theme: ThemeOption): void {
    localStorage.setItem(this.storageKey, theme);
    this.themeSubject.next(theme);
    this.applyTheme(theme);
    console.log(`Theme switched to: ${theme}`);
  }

  /**
   * Get the current theme setting
   */
  getCurrentTheme(): ThemeOption {
    const savedTheme = localStorage.getItem(this.storageKey) as ThemeOption;
    return savedTheme || 'system';
  }

  /**
   * Check if current theme is dark (either explicit dark setting or system preference)
   */
  isDarkTheme(): boolean {
    const theme = this.getCurrentTheme();
    return (
      theme === 'dark' ||
      (theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  }

  /**
   * Apply the specified theme
   */
  private applyTheme(theme: ThemeOption): void {
    const isDark = this.isDarkTheme();

    // Apply or remove dark theme class
    if (isDark) {
      document.documentElement.classList.add('dark-theme');
      if (this.themeLinks['dark']) {
        this.renderer.removeAttribute(this.themeLinks['dark'], 'disabled');
      }
    } else {
      document.documentElement.classList.remove('dark-theme');
      if (this.themeLinks['dark']) {
        this.renderer.setAttribute(this.themeLinks['dark'], 'disabled', 'true');
      }
    }

    // Dispatch theme change event for custom elements that might need it
    document.dispatchEvent(
      new CustomEvent('themeChange', {
        detail: { theme: isDark ? 'dark' : 'light' },
      })
    );
  }

  /**
   * Listen for system theme preference changes
   */
  private listenForSystemChanges(): void {
    if (window.matchMedia) {
      const darkModeMediaQuery = window.matchMedia(
        '(prefers-color-scheme: dark)'
      );

      // Modern API
      try {
        darkModeMediaQuery.addEventListener('change', (e) => {
          if (this.getCurrentTheme() === 'system') {
            this.applyTheme('system');
          }
        });
      } catch (e) {
        // Fallback for older browsers
        darkModeMediaQuery.addListener((e) => {
          if (this.getCurrentTheme() === 'system') {
            this.applyTheme('system');
          }
        });
      }
    }
  }
}
