import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoryService } from '../../services/story.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="site-header">
      <div class="prototype-notice">
        <span><strong>Phase 0 Prototype</strong> — Representative layout & visual architecture preview</span>
        <a routerLink="/admin/moderation" class="admin-quick-link">Admin Console &rarr;</a>
      </div>

      <div class="container header-inner">
        <a routerLink="/" class="brand-group">
          <span class="brand-monogram">C·L</span>
          <div class="brand-text">
            <span class="brand-title">The College Life We Didn't Have</span>
            <span class="brand-tagline">An anonymous memory vault & archive</span>
          </div>
        </a>

        <!-- Desktop Navigation -->
        <nav class="nav-links" [class.mobile-open]="mobileMenuOpen">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMenu()">Home</a>
          <a routerLink="/explore" routerLinkActive="active" (click)="closeMenu()">Explore Archive</a>
          <a routerLink="/categories/love-crushes-friendships" routerLinkActive="active" (click)="closeMenu()">Categories</a>
          <a routerLink="/guidelines" routerLinkActive="active" (click)="closeMenu()">Guidelines</a>
          
          <div class="nav-right-actions">
            <!-- Theme Toggle Button in Header -->
            <button 
              type="button" 
              class="header-theme-btn" 
              (click)="themeService.toggleTheme()" 
              [title]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
              aria-label="Toggle theme mode">
              @if (themeService.isDark()) {
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#E25C70" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="4"/>
                  <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
                </svg>
                <span class="theme-btn-label">Light Mode</span>
              } @else {
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
                <span class="theme-btn-label">Dark Mode</span>
              }
            </button>

            <a routerLink="/saved" class="saved-link" routerLinkActive="active" (click)="closeMenu()" title="Your Saved Stories">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
              <span>Saved</span>
              @if (storyService.savedCount() > 0) {
                <span class="saved-badge">{{ storyService.savedCount() }}</span>
              }
            </a>

            @if (authService.isLoggedIn()) {
              <a routerLink="/profile" class="pseudonym-pill" title="My Author Profile" (click)="closeMenu()">
                <span class="user-dot"></span>
                &#64;{{ storyService.currentPseudonym() }}
              </a>
              <button type="button" class="btn btn-ghost btn-sm" (click)="authService.logout(); closeMenu()" title="Sign Out">
                Log Out
              </button>
            } @else {
              <a routerLink="/login" class="btn btn-secondary btn-sm" (click)="closeMenu()">
                Sign In
              </a>
            }

            <a routerLink="/share" class="btn btn-primary btn-sm submit-btn" (click)="closeMenu()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              <span>Share Story</span>
            </a>
          </div>
        </nav>

        <!-- Mobile Header Actions (Quick Theme Toggle + Menu Hamburger) -->
        <div class="mobile-header-actions">
          <button 
            type="button" 
            class="mobile-quick-theme-toggle" 
            (click)="themeService.toggleTheme()" 
            [title]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
            aria-label="Toggle theme">
            @if (themeService.isDark()) {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#E25C70" stroke-width="2">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
            } @else {
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            }
          </button>

          <button class="mobile-toggle" (click)="toggleMenu()" aria-label="Toggle navigation">
            @if (!mobileMenuOpen) {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
              </svg>
            } @else {
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6 6 18M6 6l12 12"/>
              </svg>
            }
          </button>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .site-header {
      background-color: var(--color-header-bg, rgba(250, 248, 245, 0.94));
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(8px);
    }

    .prototype-notice {
      background-color: #F4ECE0;
      border-bottom: 1px solid var(--color-border-subtle);
      padding: 5px 24px;
      font-size: 0.76rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--color-ink-secondary);
    }
    .prototype-notice strong {
      color: var(--color-accent-primary);
    }
    .admin-quick-link {
      font-weight: 600;
      color: var(--color-accent-primary);
      text-decoration: underline;
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 72px;
      gap: 16px;
    }

    .brand-group {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }

    .brand-monogram {
      width: 38px;
      height: 38px;
      border: 1.5px solid var(--color-accent-primary);
      color: var(--color-accent-primary);
      font-family: var(--font-serif);
      font-weight: 700;
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      background-color: var(--color-accent-subtle);
      letter-spacing: -0.05em;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-family: var(--font-serif);
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--color-ink);
      line-height: 1.15;
    }

    .brand-tagline {
      font-size: 0.75rem;
      color: var(--color-ink-muted);
      letter-spacing: 0.02em;
      text-transform: uppercase;
      font-weight: 500;
    }

    .nav-links {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .nav-links a:not(.btn):not(.brand-group):not(.admin-quick-link):not(.pseudonym-pill) {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--color-ink-secondary);
      padding: 6px 0;
      position: relative;
    }

    .nav-links a:not(.btn):not(.brand-group):not(.admin-quick-link):not(.pseudonym-pill):hover {
      color: var(--color-ink);
    }

    .nav-links a.active:not(.btn):not(.brand-group):not(.admin-quick-link):not(.pseudonym-pill) {
      color: var(--color-accent-primary);
      font-weight: 600;
    }
    .nav-links a.active:not(.btn):not(.brand-group):not(.admin-quick-link):not(.pseudonym-pill)::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--color-accent-primary);
    }

    .nav-right-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-left: 8px;
    }

    .saved-link {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.85rem;
      color: var(--color-ink-secondary);
    }
    .saved-badge {
      background-color: var(--color-accent-primary);
      color: white;
      font-size: 0.7rem;
      padding: 1px 6px;
      border-radius: var(--radius-full);
      font-weight: 700;
    }

    .pseudonym-pill {
      display: flex;
      align-items: center;
      gap: 7px;
      padding: 6px 12px;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--color-ink);
      transition: all 0.15s ease;
    }
    .pseudonym-pill:hover {
      border-color: var(--color-accent-primary);
      background-color: var(--color-canvas-subtle);
    }
    .user-dot {
      width: 7px;
      height: 7px;
      background-color: #2E7D32;
      border-radius: 50%;
    }

    .header-theme-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      color: var(--color-ink-secondary);
      cursor: pointer;
      font-size: 0.825rem;
      font-weight: 600;
      transition: all 0.15s ease;
    }
    .header-theme-btn:hover {
      border-color: var(--color-accent-primary);
      color: var(--color-ink);
      background-color: var(--color-canvas-subtle);
    }
    .theme-btn-label {
      display: none;
    }

    .mobile-header-actions {
      display: none;
      align-items: center;
      gap: 6px;
    }

    .mobile-quick-theme-toggle {
      background: none;
      border: none;
      color: var(--color-ink);
      cursor: pointer;
      padding: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      transition: transform 0.15s ease;
    }
    .mobile-quick-theme-toggle:active {
      transform: scale(0.92);
    }

    .mobile-toggle {
      background: none;
      border: none;
      color: var(--color-ink);
      cursor: pointer;
      padding: 6px;
    }

    @media (max-width: 992px) {
      .mobile-header-actions {
        display: flex;
      }
      .theme-btn-label {
        display: inline;
      }
      .header-theme-btn {
        width: 100%;
        justify-content: flex-start;
        padding: 10px 14px;
      }
      .brand-tagline {
        display: none;
      }
      .nav-links {
        position: fixed;
        top: 102px;
        left: 0;
        right: 0;
        background-color: var(--color-canvas);
        border-bottom: 2px solid var(--color-border);
        flex-direction: column;
        align-items: flex-start;
        padding: 24px;
        gap: 18px;
        box-shadow: var(--shadow-card);
        display: none;
      }
      .nav-links.mobile-open {
        display: flex;
      }
      .nav-right-actions {
        flex-direction: column;
        align-items: flex-start;
        width: 100%;
        margin-left: 0;
        padding-top: 16px;
        border-top: 1px solid var(--color-border);
      }
      .submit-btn {
        width: 100%;
      }
    }
  `]
})
export class HeaderComponent {
  storyService = inject(StoryService);
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  mobileMenuOpen = false;

  toggleMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMenu() {
    this.mobileMenuOpen = false;
  }
}
