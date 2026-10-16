import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoryService } from '../../services/story.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- Desktop Left Collapsible Icon Dock (Expands on Hover, Closes on Mouse Leave) -->
    <aside 
      class="sidebar-dock" 
      [class.is-expanded]="isExpanded"
      (mouseenter)="onMouseEnter()" 
      (mouseleave)="onMouseLeave()">
      
      <!-- Brand Top -->
      <div class="sidebar-top">
        <a routerLink="/" class="sidebar-brand" title="The College Life We Didn't Have">
          <span class="brand-monogram">C·L</span>
          <div class="brand-text">
            <span class="brand-title">The College Life</span>
            <span class="brand-sub">We Didn't Have</span>
          </div>
        </a>
      </div>

      <!-- Navigation Items -->
      <nav class="sidebar-nav">
        <!-- Home / Feed -->
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-item" title="Home Feed">
          <div class="icon-box">
            <svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
          </div>
          <span class="nav-label">Home</span>
        </a>

        <!-- Explore / Search -->
        <a routerLink="/explore" routerLinkActive="active" class="nav-item" title="Explore Archive">
          <div class="icon-box">
            <svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
          </div>
          <span class="nav-label">Explore</span>
        </a>



        <!-- Prominent Create / Spill Button (Instagram + Create Style) -->
        <button class="nav-item create-button" (click)="storyService.openCreateModal()" title="Spill a story on a whim">
          <div class="icon-box create-icon-box">
            <svg class="nav-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </div>
          <span class="nav-label create-label">Spill a Story</span>
        </button>

        <!-- Saved / Bookmarks -->
        <a routerLink="/saved" routerLinkActive="active" class="nav-item" title="Saved Memories">
          <div class="icon-box badge-anchor">
            <svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
            </svg>
            @if (storyService.savedCount() > 0) {
              <span class="badge-dot">{{ storyService.savedCount() }}</span>
            }
          </div>
          <span class="nav-label">Saved</span>
        </a>

        <!-- My Stories (Submissions Desk) -->
        <a routerLink="/my-stories" routerLinkActive="active" class="nav-item" title="My Contributor Workspace (Submissions Desk)">
          <div class="icon-box">
            <svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
              <path d="M6 6h10"/>
              <path d="M6 10h10"/>
            </svg>
          </div>
          <span class="nav-label">My Stories</span>
        </a>

        <!-- Community Guidelines -->
        <a routerLink="/guidelines" routerLinkActive="active" class="nav-item" title="Honor Code & Guidelines">
          <div class="icon-box">
            <svg class="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
          </div>
          <span class="nav-label">Guidelines</span>
        </a>
      </nav>

      <!-- Bottom Profile & Admin Footer -->
      <div class="sidebar-bottom">
        <!-- Theme Mode Toggle -->
        <button 
          type="button" 
          class="nav-item theme-toggle-btn" 
          (click)="themeService.toggleTheme()" 
          [title]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
          <div class="icon-box">
            @if (themeService.isDark()) {
              <svg class="nav-icon sun-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2"/>
                <path d="M12 20v2"/>
                <path d="m4.93 4.93 1.41 1.41"/>
                <path d="m17.66 17.66 1.41 1.41"/>
                <path d="M2 12h2"/>
                <path d="M20 12h2"/>
                <path d="m6.34 17.66-1.41 1.41"/>
                <path d="m19.07 4.93-1.41 1.41"/>
              </svg>
            } @else {
              <svg class="nav-icon moon-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
              </svg>
            }
          </div>
          <div class="theme-expanded-info">
            <span class="nav-label">{{ themeService.isDark() ? 'Light Mode' : 'Dark Mode' }}</span>
            <span class="theme-badge">{{ themeService.isDark() ? 'Dark' : 'Light' }}</span>
          </div>
        </button>

        <a routerLink="/admin/moderation" routerLinkActive="active" class="nav-item admin-item" title="Admin Moderation Desk">
          <div class="icon-box">
            <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <span class="nav-label">Moderation</span>
        </a>

        @if (authService.isLoggedIn()) {
          <div class="user-profile-strip-wrapper">
            <a routerLink="/profile" routerLinkActive="active" class="user-profile-strip" title="View Author Profile">
              <div class="user-avatar-dot">
                @if (authService.currentUser()?.avatarUrl) {
                  <img [src]="authService.currentUser()!.avatarUrl" alt="Avatar" class="sidebar-avatar-img">
                } @else {
                  <span>{{ (storyService.currentPseudonym().slice(0, 2) || 'CL').toUpperCase() }}</span>
                }
              </div>
              <div class="user-info-text">
                <span class="user-handle">&#64;{{ storyService.currentPseudonym() }}</span>
                <span class="user-status">View Profile</span>
              </div>
            </a>
            <button 
              type="button" 
              class="sidebar-logout-btn" 
              (click)="authService.logout()" 
              title="Sign out">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        } @else {
          <a routerLink="/login" class="nav-item sign-in-item" title="Sign In">
            <div class="icon-box">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/>
                <line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </div>
            <span class="nav-label">Sign In</span>
          </a>
        }
      </div>
    </aside>

    <!-- Mobile Bottom Navigation Bar -->
    <nav class="mobile-bottom-dock">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="mobile-dock-item" title="Home">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
      </a>

      <a routerLink="/explore" routerLinkActive="active" class="mobile-dock-item" title="Explore">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      </a>

      <!-- Quick Create on Mobile -->
      <button class="mobile-dock-create" (click)="storyService.openCreateModal()" title="Spill a story">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      <a routerLink="/saved" routerLinkActive="active" class="mobile-dock-item" title="Saved">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
        </svg>
      </a>

      @if (authService.isLoggedIn()) {
        <a routerLink="/profile" routerLinkActive="active" class="mobile-dock-item" title="Author Profile">
          <div class="mobile-avatar-circle">
            @if (authService.currentUser()?.avatarUrl) {
              <img [src]="authService.currentUser()!.avatarUrl" alt="Avatar" class="mobile-avatar-img">
            } @else {
              <span>{{ (storyService.currentPseudonym().slice(0, 2) || 'CL').toUpperCase() }}</span>
            }
          </div>
        </a>
      } @else {
        <a routerLink="/login" routerLinkActive="active" class="mobile-dock-item" title="Sign In">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </a>
      }
    </nav>
  `,
  styles: [`
    /* Desktop Collapsible Icon Dock (Resting at 72px, Expands to 245px on Hover) */
    .sidebar-dock {
      width: 72px;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      background-color: var(--color-canvas);
      border-right: 1px solid var(--color-border);
      display: flex;
      flex-direction: column;
      padding: 20px 8px;
      z-index: 1000;
      box-sizing: border-box;
      transition: width 0.22s cubic-bezier(0.2, 0, 0, 1), box-shadow 0.22s ease;
      overflow-x: hidden;
    }

    .sidebar-dock.is-expanded {
      width: 245px;
      box-shadow: 0 10px 30px rgba(27, 30, 33, 0.12);
      padding: 20px 14px;
    }

    /* Brand Top */
    .sidebar-top {
      margin-bottom: 24px;
      padding: 0 4px;
    }

    .sidebar-brand {
      display: flex;
      align-items: center;
      text-decoration: none;
      min-height: 44px;
    }

    .brand-monogram {
      width: 44px;
      height: 44px;
      border: 1.5px solid var(--color-accent-primary);
      color: var(--color-accent-primary);
      font-family: var(--font-serif);
      font-weight: 700;
      font-size: 1.05rem;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-sm);
      background-color: var(--color-accent-subtle);
      flex-shrink: 0;
      transition: transform 0.15s ease;
    }
    .sidebar-dock.is-expanded .brand-monogram {
      transform: scale(0.95);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      white-space: nowrap;
      visibility: hidden;
      transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1), max-width 0.22s cubic-bezier(0.2, 0, 0, 1);
    }
    .sidebar-dock.is-expanded .brand-text {
      opacity: 1;
      max-width: 175px;
      visibility: visible;
      margin-left: 12px;
    }

    .brand-title {
      font-family: var(--font-serif);
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--color-ink);
      line-height: 1.15;
    }

    .brand-sub {
      font-size: 0.72rem;
      color: var(--color-ink-muted);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 500;
    }

    /* Navigation */
    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }

    .nav-item {
      display: flex;
      align-items: center;
      height: 48px;
      border-radius: var(--radius-md);
      color: var(--color-ink-secondary);
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      transition: all 0.15s ease;
      cursor: pointer;
      background: none;
      border: none;
      width: 100%;
      text-align: left;
      padding: 0 6px;
      box-sizing: border-box;
    }
    .nav-item:hover {
      background-color: var(--color-canvas-subtle);
      color: var(--color-ink);
    }
    .nav-item.active {
      color: var(--color-accent-primary);
      font-weight: 700;
      background-color: var(--color-accent-subtle);
    }
    .nav-item.active .nav-icon {
      stroke: var(--color-accent-primary);
      stroke-width: 2.5;
    }

    .icon-box {
      width: 44px;
      height: 44px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .nav-label {
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      white-space: nowrap;
      visibility: hidden;
      transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1), max-width 0.22s cubic-bezier(0.2, 0, 0, 1);
    }
    .sidebar-dock.is-expanded .nav-label {
      opacity: 1;
      max-width: 175px;
      visibility: visible;
      margin-left: 8px;
    }

    /* Spill a Story button */
    .create-button {
      margin: 8px 0;
      background: linear-gradient(135deg, #8B2635 0%, #6E1A27 100%);
      color: #FFFFFF !important;
      border-radius: var(--radius-full);
      box-shadow: 0 2px 8px rgba(139, 38, 53, 0.25);
    }
    .create-button:hover {
      background: linear-gradient(135deg, #7A1F2D 0%, #5C1520 100%);
      box-shadow: 0 4px 12px rgba(139, 38, 53, 0.35);
    }
    .create-button .nav-icon {
      stroke: #FFFFFF;
    }
    .create-label {
      font-weight: 700;
      letter-spacing: 0.01em;
    }

    /* Saved Badge */
    .badge-anchor {
      position: relative;
    }
    .badge-dot {
      position: absolute;
      top: 6px;
      right: 6px;
      background-color: var(--color-accent-primary);
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      padding: 1px 5px;
      border-radius: var(--radius-full);
    }

    /* Bottom section */
    .sidebar-bottom {
      border-top: 1px solid var(--color-border-subtle);
      padding-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .admin-item {
      height: 42px;
      font-size: 0.85rem;
      color: var(--color-ink-muted);
    }

    .user-profile-strip {
      display: flex;
      align-items: center;
      height: 46px;
      border-radius: var(--radius-md);
      text-decoration: none;
      transition: all 0.15s ease;
      padding: 0 4px;
    }
    .user-profile-strip:hover {
      background-color: var(--color-canvas-subtle);
    }

    .user-avatar-dot {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: var(--color-accent-subtle);
      color: var(--color-accent-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 0.8rem;
      flex-shrink: 0;
      border: 1px solid var(--color-accent-border);
    }

    .user-info-text {
      display: flex;
      flex-direction: column;
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      white-space: nowrap;
      visibility: hidden;
      transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1), max-width 0.22s cubic-bezier(0.2, 0, 0, 1);
    }
    .sidebar-dock.is-expanded .user-info-text {
      opacity: 1;
      max-width: 175px;
      visibility: visible;
      margin-left: 10px;
    }

    .user-handle {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-ink);
    }
    .user-status {
      font-size: 0.7rem;
      color: var(--color-ink-muted);
    }

    /* Mobile bottom dock (hidden on desktop/tablet) */
    .mobile-bottom-dock {
      display: none;
    }

    /* Mobile screens */
    @media (max-width: 767px) {
      .sidebar-dock {
        display: none;
      }
      .mobile-bottom-dock {
        display: flex;
        justify-content: space-around;
        align-items: center;
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: calc(58px + env(safe-area-inset-bottom, 0px));
        padding-bottom: env(safe-area-inset-bottom, 0px);
        background-color: var(--color-canvas);
        border-top: 1px solid var(--color-border);
        z-index: 1000;
        backdrop-filter: blur(12px);
      }
      .mobile-dock-item {
        color: var(--color-ink-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 8px;
        min-width: 48px;
        min-height: 48px;
        touch-action: manipulation;
        transition: color 0.15s ease;
      }
      .mobile-dock-item.active {
        color: var(--color-accent-primary);
      }
      .mobile-dock-create {
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background-color: var(--color-accent-primary);
        color: white;
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(226, 92, 112, 0.35);
        cursor: pointer;
        touch-action: manipulation;
        transition: transform 0.15s ease;
      }
      .mobile-dock-create:active {
        transform: scale(0.92);
      }
      .mobile-avatar-circle {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background-color: var(--color-accent-subtle);
        color: var(--color-accent-primary);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.7rem;
        font-weight: 700;
        border: 1px solid var(--color-accent-primary);
        overflow: hidden;
      }
    }

    .user-profile-strip-wrapper {
      display: flex;
      align-items: center;
      position: relative;
      width: 100%;
    }
    .sidebar-avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    .mobile-avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
    }
    .sidebar-logout-btn {
      background: none;
      border: none;
      color: var(--color-ink-muted);
      cursor: pointer;
      padding: 6px;
      display: none;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      border-radius: 4px;
      margin-left: 4px;
    }
    .sidebar-dock:hover .sidebar-logout-btn {
      display: flex;
    }
    .sidebar-logout-btn:hover {
      color: #C0392B;
      background: #FEE2E2;
    }

    /* Theme Toggle Button */
    .theme-toggle-btn {
      height: 44px;
      color: var(--color-ink-secondary);
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
    }
    .theme-toggle-btn:hover {
      background-color: var(--color-canvas-subtle);
      color: var(--color-accent-primary);
    }
    .sun-icon {
      color: #E25C70;
      animation: rotateIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .moon-icon {
      color: var(--color-ink);
      animation: pulseIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes rotateIn {
      0% { transform: rotate(-90deg) scale(0.6); opacity: 0; }
      100% { transform: rotate(0deg) scale(1); opacity: 1; }
    }
    @keyframes pulseIn {
      0% { transform: scale(0.6); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }
    .theme-expanded-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex: 1;
      opacity: 0;
      max-width: 0;
      overflow: hidden;
      white-space: nowrap;
      visibility: hidden;
      transition: opacity 0.2s cubic-bezier(0.2, 0, 0, 1), max-width 0.22s cubic-bezier(0.2, 0, 0, 1);
    }
    .sidebar-dock.is-expanded .theme-expanded-info {
      opacity: 1;
      max-width: 175px;
      visibility: visible;
      margin-left: 8px;
    }
    .theme-badge {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 7px;
      border-radius: var(--radius-full);
      background-color: var(--color-canvas-subtle);
      border: 1px solid var(--color-border);
      color: var(--color-ink-muted);
    }
  `]
})
export class SidebarComponent {
  storyService = inject(StoryService);
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  isExpanded = false;

  onMouseEnter(): void {
    this.isExpanded = true;
  }

  onMouseLeave(): void {
    this.isExpanded = false;
  }
}
