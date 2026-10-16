import { Injectable, signal, computed } from '@angular/core';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'collegelife_theme';
  
  /** Current active theme mode ('light' | 'dark') */
  readonly currentTheme = signal<ThemeMode>(this.getInitialTheme());
  
  /** True when dark theme is active */
  readonly isDark = computed(() => this.currentTheme() === 'dark');

  constructor() {
    // Apply initial theme immediately to HTML root
    this.applyTheme(this.currentTheme());

    // Listen for OS system theme changes if user hasn't chosen manually
    if (typeof window !== 'undefined' && window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem(this.STORAGE_KEY)) {
          const systemTheme: ThemeMode = e.matches ? 'dark' : 'light';
          this.setTheme(systemTheme, false);
        }
      });
    }
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const nextTheme: ThemeMode = this.currentTheme() === 'light' ? 'dark' : 'light';
    this.setTheme(nextTheme, true);
  }

  /**
   * Set a specific theme mode
   * @param theme 'light' | 'dark'
   * @param persist whether to save preference in localStorage
   */
  setTheme(theme: ThemeMode, persist = true): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    if (persist && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(this.STORAGE_KEY, theme);
      } catch (err) {
        console.warn('Could not persist theme to localStorage', err);
      }
    }
  }

  /**
   * Synchronize DOM attributes and mobile browser chrome color
   */
  private applyTheme(theme: ThemeMode): void {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);

      // Dynamically update mobile browser tab / address bar color
      const metaThemeColor = document.querySelector('meta[name="theme-color"]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', theme === 'dark' ? '#0B0F14' : '#FAF8F5');
      }
    }
  }

  /**
   * Detect theme from localStorage or OS system preference
   */
  private getInitialTheme(): ThemeMode {
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(this.STORAGE_KEY) as ThemeMode | null;
        if (stored === 'light' || stored === 'dark') {
          return stored;
        }
      } catch (err) {
        // Ignore localStorage error (e.g. incognito)
      }
    }

    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  }
}
