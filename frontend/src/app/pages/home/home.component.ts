import { Component, inject, OnInit, AfterViewInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StoryService } from '../../services/story.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { StoryCardComponent } from '../../components/story-card/story-card.component';
import { Story } from '../../models/story.model';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, StoryCardComponent],
  template: `
    <div 
      class="insta-feed-layout"
      (touchstart)="onTouchStart($event)"
      (touchmove)="onTouchMove($event)"
      (touchend)="onTouchEnd()"
      (touchcancel)="onTouchEnd()"
      (mousedown)="onMouseDown($event)"
      (mousemove)="onMouseMove($event)"
      (mouseup)="onMouseUp()"
      (mouseleave)="onMouseUp()">
      <!-- Center Main Feed Column -->
      <div class="feed-column">
        <!-- Instagram-Style Pull-To-Refresh Indicator -->
        <div 
          class="pull-refresh-container"
          [class.active]="pullDistance > 0 || isRefreshing"
          [class.dragging]="isDragging"
          [class.refreshing]="isRefreshing"
          [style.height.px]="pullDistance"
          [style.opacity]="pullDistance > 6 ? 1 : 0">
          <div 
            class="pull-refresh-badge"
            [class.spinner-active]="isRefreshing"
            [style.transform]="'scale(' + spinnerScale + ') rotate(' + spinnerRotation + 'deg)'">
            <svg class="refresh-spinner-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle class="spinner-track" cx="12" cy="12" r="9" stroke-width="2.5"/>
              <path class="spinner-arc" d="M12 3a9 9 0 0 1 9 9" stroke-width="2.5" stroke-linecap="round"/>
            </svg>
          </div>
          @if (pullDistance >= pullThreshold && !isRefreshing) {
            <span class="pull-refresh-text">Release to reload stories</span>
          } @else if (isRefreshing) {
            <span class="pull-refresh-text">Fetching latest stories...</span>
          }
        </div>

        <!-- Top Punchy App Brand Header with Mobile Theme Toggle -->
        <header class="feed-masthead">
          <div class="masthead-row">
            <h1 class="feed-brand-title">
              The College Life
              <span class="feed-brand-punch">We Didn't Have.</span>
            </h1>
            <button 
              type="button" 
              class="mobile-masthead-theme-btn" 
              (click)="themeService.toggleTheme()" 
              [title]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
              @if (themeService.isDark()) {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
                </svg>
              } @else {
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                </svg>
              }
            </button>
          </div>
        </header>

        <!-- Stories Feed -->
        <div class="stories-feed-list">
          @for (story of displayedStories; track story.id) {
            <app-story-card [story]="story"></app-story-card>
          } @empty {
            <div class="feed-empty-vault-card">
              <div class="empty-vault-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                  <path d="M6 6h10"/>
                  <path d="M6 10h10"/>
                </svg>
              </div>
              <h2 class="empty-vault-title">No Stories in the Vault Yet</h2>
              <p class="empty-vault-desc">
                Every college memory begins with someone brave enough to remember. Spill the first secret, regret, or unspoken confession.
              </p>
              <div class="empty-vault-actions">
                <button type="button" class="btn-empty-spill" (click)="storyService.openCreateModal()">
                  ✨ Spill the First Story
                </button>
                <button type="button" class="btn-empty-reload" (click)="performRefresh()">
                  ↻ Refresh Vault
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Infinite Scroll Sentinel Element -->
        <div #infiniteSentinel class="feed-infinite-sentinel"></div>

        <!-- Infinite Scroll Loading Indicator -->
        @if (storyService.isLoadingMore()) {
          <div class="infinite-scroll-loading">
            <div class="insta-pulse-dots">
              <span class="dot"></span>
              <span class="dot"></span>
              <span class="dot"></span>
            </div>
            <span class="loading-label">Loading more memories...</span>
          </div>
        }

        <!-- Instagram-Style End-of-Feed Banner -->
        @if (!storyService.hasMoreStories() && displayedStories.length > 0) {
          <div class="feed-caught-up-card">
            <div class="caught-up-icon-circle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path d="M20 6 9 17l-5-5"/>
              </svg>
            </div>
            <h3 class="caught-up-title">You're All Caught Up</h3>
            <p class="caught-up-subtitle">You've explored all recent campus stories from the community.</p>
            <button type="button" class="caught-up-reload-btn" (click)="performRefresh()">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                <path d="M3 3v5h5"/>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
                <path d="M16 21h5v-5"/>
              </svg>
              Check for Recent Stories
            </button>
          </div>
        }
      </div>

      <!-- Right Rail (User Profile & Mini Footer) -->
      <aside class="right-rail">
        <!-- Contributor Profile Card -->
        <div class="user-rail-card card-editorial">
          <a routerLink="/profile" class="rail-user-meta-link">
            <div class="rail-user-meta">
              <div class="rail-avatar">
                @if (authService.currentUser()?.avatarUrl) {
                  <img [src]="authService.currentUser()!.avatarUrl" alt="Avatar" class="rail-avatar-img">
                } @else {
                  <span>{{ (storyService.currentPseudonym().slice(0, 2) || 'CL').toUpperCase() }}</span>
                }
              </div>
              <div class="rail-meta-text">
                <div class="rail-handle">&#64;{{ storyService.currentPseudonym() }}</div>
                <div class="rail-label">{{ authService.currentUser()?.email || 'Anonymous Contributor' }}</div>
              </div>
            </div>
          </a>
          <div class="rail-user-actions">
            <a routerLink="/profile" class="rail-link">Profile</a>
            <span class="dot">&bull;</span>
            <a routerLink="/my-stories" class="rail-link">My Stories</a>
            <span class="dot">&bull;</span>
            <a routerLink="/saved" class="rail-link">
              Saved ({{ storyService.savedCount() }})
            </a>
          </div>
        </div>

        <!-- Live Community Telemetry Card -->
        @if (storyService.platformStats(); as stats) {
          <div class="community-telemetry-card card-editorial">
            <div class="telemetry-header">
              <span class="telemetry-indicator"></span>
              <span class="telemetry-title">Campus Pulse & Telemetry</span>
            </div>
            
            <div class="telemetry-grid">
              <div class="telemetry-stat">
                <span class="stat-number">{{ stats.totalStories }}</span>
                <span class="stat-label">Stories Preserved</span>
              </div>
              <div class="telemetry-stat">
                <span class="stat-number">{{ stats.totalReactions }}</span>
                <span class="stat-label">Empathy Signals</span>
              </div>
              <div class="telemetry-stat">
                <span class="stat-number">{{ stats.totalViews }}</span>
                <span class="stat-label">Campus Reads</span>
              </div>
              <div class="telemetry-stat">
                <span class="stat-number">{{ stats.contributorCount || 1 }}</span>
                <span class="stat-label">Voices Active</span>
              </div>
            </div>

            @if (stats.topTrendingTag) {
              <div class="telemetry-trending-pill">
                <span class="fire-icon">🔥</span>
                <span>Trending: <strong>#{{ stats.topTrendingTag }}</strong></span>
              </div>
            }
          </div>
        }

        <!-- Mini Footer -->
        <div class="rail-footer">
          <div class="rail-footer-links">
            <a routerLink="/guidelines">Guidelines</a>
            <a routerLink="/privacy">Privacy</a>
            <a routerLink="/admin/moderation">Admin Queue</a>
          </div>
          <div class="rail-copyright">&copy; 2026 The College Life We Didn't Have</div>
        </div>
      </aside>
    </div>
  `,
  styles: [`
    .insta-feed-layout {
      display: flex;
      justify-content: center;
      gap: 32px;
      padding: 32px 24px 64px;
      max-width: 1080px;
      margin: 0 auto;
      user-select: none;
    }

    /* Center Feed Column */
    .feed-column {
      flex: 1;
      max-width: 650px;
      min-width: 0;
      position: relative;
    }

    /* Pull-To-Refresh Indicator */
    .pull-refresh-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      pointer-events: none;
      transition: height 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.2s ease;
      will-change: height, opacity;
      width: 100%;
    }
    .pull-refresh-container.dragging {
      transition: none !important;
    }
    .pull-refresh-badge {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-accent-primary);
      transition: transform 0.1s linear;
      will-change: transform;
    }
    .refresh-spinner-svg {
      width: 20px;
      height: 20px;
    }
    .spinner-track {
      stroke: var(--color-border-subtle);
    }
    .spinner-arc {
      stroke: var(--color-accent-primary);
    }
    .spinner-active .refresh-spinner-svg {
      animation: insta-spin 0.75s linear infinite;
    }
    @keyframes insta-spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    .pull-refresh-text {
      font-size: 0.75rem;
      color: var(--color-ink-muted);
      font-weight: 500;
      margin-top: 5px;
      letter-spacing: 0.01em;
    }

    /* Punchy App Brand Header */
    .feed-masthead {
      margin-bottom: 24px;
      padding: 12px 4px 18px;
      border-bottom: 1px solid var(--color-border);
      text-align: left;
    }
    .masthead-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .mobile-masthead-theme-btn {
      display: none;
    }
    .feed-brand-title {
      font-family: var(--font-serif);
      font-size: clamp(2rem, 5vw, 2.75rem);
      font-weight: 600;
      letter-spacing: -0.03em;
      line-height: 1.1;
      color: var(--color-ink);
      margin: 0;
    }
    .feed-brand-punch {
      display: block;
      color: var(--color-accent-primary);
      font-style: italic;
      font-weight: 500;
      letter-spacing: -0.015em;
    }

    /* Right Rail (Instagram Web Style) */
    .right-rail {
      width: 300px;
      flex-shrink: 0;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .user-rail-card {
      padding: 16px;
    }
    .rail-user-meta-link {
      text-decoration: none;
      color: inherit;
      display: block;
      transition: opacity 0.15s ease;
    }
    .rail-user-meta-link:hover {
      opacity: 0.85;
    }
    .rail-user-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .rail-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background-color: var(--color-accent-subtle);
      color: var(--color-accent-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 0.9rem;
      overflow: hidden;
      flex-shrink: 0;
    }
    .rail-avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }
    .rail-meta-text {
      min-width: 0;
      overflow: hidden;
    }
    .rail-handle {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--color-ink);
    }
    .rail-label {
      font-size: 0.75rem;
      color: var(--color-ink-muted);
    }
    .rail-user-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.825rem;
      padding-top: 10px;
      border-top: 1px solid var(--color-border-subtle);
    }
    .rail-link {
      color: var(--color-accent-primary);
      font-weight: 600;
    }

    .dot {
      color: var(--color-ink-muted);
    }

    /* Telemetry Card */
    .community-telemetry-card {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .telemetry-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .telemetry-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #10b981;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
      animation: pulse-dot 2s infinite ease-in-out;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.6; transform: scale(0.9); }
    }
    .telemetry-title {
      font-size: 0.76rem;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: 700;
      color: var(--color-ink-muted);
    }
    .telemetry-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .telemetry-stat {
      background: var(--color-surface);
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-sm, 6px);
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
    }
    .stat-number {
      font-family: var(--font-serif);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-ink);
      line-height: 1.2;
    }
    .stat-label {
      font-size: 0.7rem;
      color: var(--color-ink-muted);
      margin-top: 2px;
    }
    .telemetry-trending-pill {
      font-size: 0.78rem;
      color: var(--color-ink-secondary);
      background: var(--color-accent-subtle);
      padding: 6px 10px;
      border-radius: var(--radius-sm, 6px);
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* Rail Footer */
    .rail-footer {
      padding: 0 4px;
      font-size: 0.75rem;
      color: var(--color-ink-muted);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .rail-footer-links {
      display: flex;
      gap: 10px;
    }
    .rail-footer-links a {
      color: var(--color-ink-muted);
      text-decoration: none;
    }
    .rail-footer-links a:hover {
      color: var(--color-ink);
    }

    /* Infinite Scroll Sentinel & Loader */
    .feed-infinite-sentinel {
      width: 100%;
      height: 20px;
      margin-top: -10px;
      pointer-events: none;
      visibility: hidden;
    }
    .infinite-scroll-loading {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 10px;
      padding: 24px 0 16px;
    }
    .insta-pulse-dots {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .insta-pulse-dots .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-accent-primary);
      animation: insta-pulse-wave 1.2s infinite ease-in-out;
    }
    .insta-pulse-dots .dot:nth-child(2) {
      animation-delay: 0.2s;
    }
    .insta-pulse-dots .dot:nth-child(3) {
      animation-delay: 0.4s;
    }
    @keyframes insta-pulse-wave {
      0%, 80%, 100% {
        transform: scale(0.65);
        opacity: 0.35;
      }
      40% {
        transform: scale(1.15);
        opacity: 1;
      }
    }
    .loading-label {
      font-size: 0.75rem;
      color: var(--color-ink-muted);
      font-weight: 500;
      letter-spacing: 0.02em;
    }

    /* Instagram-Style Caught Up Card */
    .feed-caught-up-card {
      margin: 28px 0 16px;
      padding: 28px 20px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md, 12px);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.03);
    }
    .caught-up-icon-circle {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      background: var(--color-accent-subtle);
      color: var(--color-accent-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 12px;
    }
    .caught-up-title {
      font-family: var(--font-serif);
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-ink);
      margin: 0 0 4px;
    }
    .caught-up-subtitle {
      font-size: 0.825rem;
      color: var(--color-ink-muted);
      margin: 0 0 14px;
      max-width: 320px;
      line-height: 1.4;
    }
    .caught-up-reload-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-accent-primary);
      background: var(--color-accent-subtle);
      border: 1px solid var(--color-border);
      border-radius: 20px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .caught-up-reload-btn:hover {
      opacity: 0.88;
      transform: translateY(-1px);
    }

    /* Empty Vault Card */
    .feed-empty-vault-card {
      margin: 20px 0;
      padding: 38px 24px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg, 16px);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }
    .empty-vault-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: var(--color-accent-subtle);
      color: var(--color-accent-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .empty-vault-title {
      font-family: var(--font-serif);
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--color-ink);
      margin: 0 0 8px;
    }
    .empty-vault-desc {
      font-size: 0.88rem;
      color: var(--color-ink-muted);
      line-height: 1.5;
      max-width: 380px;
      margin: 0 0 22px;
    }
    .empty-vault-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      justify-content: center;
    }
    .btn-empty-spill {
      padding: 10px 20px;
      background: var(--color-accent-primary);
      color: #fff;
      border: none;
      border-radius: 24px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      box-shadow: 0 4px 14px rgba(225, 29, 72, 0.35);
      transition: all 0.2s ease;
    }
    .btn-empty-spill:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 18px rgba(225, 29, 72, 0.45);
    }
    .btn-empty-reload {
      padding: 10px 18px;
      background: var(--color-surface);
      color: var(--color-ink-secondary);
      border: 1px solid var(--color-border);
      border-radius: 24px;
      font-weight: 600;
      font-size: 0.88rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-empty-reload:hover {
      background: var(--color-accent-subtle);
      color: var(--color-accent-primary);
    }

    /* Responsive */
    @media (max-width: 960px) {
      .right-rail {
        display: none;
      }
      .feed-column {
        max-width: 100%;
      }
      .insta-feed-layout {
        padding: 20px 16px 48px;
      }
    }

    @media (max-width: 640px) {
      .insta-feed-layout {
        padding: 16px 14px calc(76px + env(safe-area-inset-bottom, 0px));
        max-width: 100vw;
        overflow-x: hidden;
      }
      .feed-masthead {
        margin-bottom: 20px;
        padding: 14px 4px 16px;
      }
      .feed-brand-title {
        font-size: clamp(1.85rem, 6.5vw, 2.35rem);
      }
      .mobile-masthead-theme-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: 1px solid var(--color-border);
        background-color: var(--color-surface);
        color: var(--color-ink);
        cursor: pointer;
        flex-shrink: 0;
        margin-top: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        touch-action: manipulation;
      }
    }
  `]
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  storyService = inject(StoryService);
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  @ViewChild('infiniteSentinel') infiniteSentinel?: ElementRef<HTMLDivElement>;

  // Pull-To-Refresh State
  pullDistance = 0;
  isDragging = false;
  isRefreshing = false;
  spinnerRotation = 0;
  spinnerScale = 0;
  readonly pullThreshold = 65;

  private touchStartY = 0;
  private touchStartX = 0;
  private canPull = false;
  private thresholdReached = false;

  private isMouseDown = false;
  private mouseStartY = 0;

  // Infinite Scroll Observer & Window Scroll Fallback
  private observer?: IntersectionObserver;
  private scrollCheckHandler?: () => void;

  get displayedStories(): Story[] {
    return this.storyService.stories();
  }

  ngOnInit(): void {
    // Make sure first page is fresh
    if (this.storyService.stories().length <= 6) {
      this.storyService.loadBackendStories(0, false);
    }
  }

  ngAfterViewInit(): void {
    // 1. Modern IntersectionObserver for Infinite Scroll
    if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
      this.observer = new IntersectionObserver((entries) => {
        const [entry] = entries;
        if (entry && entry.isIntersecting) {
          this.triggerInfiniteScroll();
        }
      }, {
        root: null,
        rootMargin: '250px 0px 250px 0px',
        threshold: 0.01
      });

      if (this.infiniteSentinel?.nativeElement) {
        this.observer.observe(this.infiniteSentinel.nativeElement);
      }
    }

    // 2. Window Scroll Fallback Listener for high-reliability pagination
    if (typeof window !== 'undefined') {
      this.scrollCheckHandler = () => {
        const scrollY = window.scrollY || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;
        if (scrollY + windowHeight >= docHeight - 350) {
          this.triggerInfiniteScroll();
        }
      };
      window.addEventListener('scroll', this.scrollCheckHandler, { passive: true });
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    if (this.scrollCheckHandler && typeof window !== 'undefined') {
      window.removeEventListener('scroll', this.scrollCheckHandler);
    }
  }

  /**
   * Infinite scroll trigger guard
   */
  triggerInfiniteScroll(): void {
    if (
      !this.storyService.isLoadingMore() &&
      this.storyService.hasMoreStories() &&
      !this.isRefreshing &&
      !this.storyService.isRefreshing()
    ) {
      this.storyService.loadMoreStories();
    }
  }

  /**
   * Touchstart handler: Enables pull only if starting strictly at the topmost
   */
  onTouchStart(e: TouchEvent): void {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY <= 0 && e.touches.length === 1) {
      this.touchStartY = e.touches[0].clientY;
      this.touchStartX = e.touches[0].clientX;
      this.canPull = true;
      this.isDragging = true;
    } else {
      this.canPull = false;
      this.isDragging = false;
    }
  }

  /**
   * Touchmove handler: Applies Instagram rubber-band damping and rotation
   */
  onTouchMove(e: TouchEvent): void {
    if (!this.canPull || this.isRefreshing) return;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY > 0) {
      this.resetPull();
      return;
    }

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - this.touchStartY;
    const deltaX = Math.abs(currentX - this.touchStartX);

    if (deltaY > 0 && deltaY > deltaX) {
      if (e.cancelable) {
        e.preventDefault();
      }
      this.pullDistance = Math.min(deltaY * 0.42, 85);
      this.spinnerRotation = this.pullDistance * 4.2;
      this.spinnerScale = Math.min(0.4 + (this.pullDistance / this.pullThreshold) * 0.6, 1.0);

      if (this.pullDistance >= this.pullThreshold && !this.thresholdReached) {
        this.thresholdReached = true;
        try {
          Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
        } catch {
          // Web fallback
        }
      } else if (this.pullDistance < this.pullThreshold) {
        this.thresholdReached = false;
      }
    }
  }

  /**
   * Touchend handler: Triggers reload if pulled past threshold
   */
  onTouchEnd(): void {
    this.isDragging = false;
    if (!this.canPull || this.isRefreshing) return;
    if (this.pullDistance >= this.pullThreshold) {
      this.performRefresh();
    } else {
      this.resetPull();
    }
  }

  /**
   * Mouse events for desktop testing of pull-to-refresh
   */
  onMouseDown(e: MouseEvent): void {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY <= 0 && e.button === 0) {
      this.isMouseDown = true;
      this.mouseStartY = e.clientY;
      this.canPull = true;
      this.isDragging = true;
    }
  }

  onMouseMove(e: MouseEvent): void {
    if (!this.isMouseDown || !this.canPull || this.isRefreshing) return;
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    if (scrollY > 0) {
      this.resetPull();
      this.isMouseDown = false;
      return;
    }

    const deltaY = e.clientY - this.mouseStartY;
    if (deltaY > 0) {
      this.pullDistance = Math.min(deltaY * 0.42, 85);
      this.spinnerRotation = this.pullDistance * 4.2;
      this.spinnerScale = Math.min(0.4 + (this.pullDistance / this.pullThreshold) * 0.6, 1.0);

      if (this.pullDistance >= this.pullThreshold && !this.thresholdReached) {
        this.thresholdReached = true;
        try {
          Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
        } catch {}
      } else if (this.pullDistance < this.pullThreshold) {
        this.thresholdReached = false;
      }
    }
  }

  onMouseUp(): void {
    if (!this.isMouseDown) return;
    this.isMouseDown = false;
    this.isDragging = false;
    if (this.pullDistance >= this.pullThreshold && !this.isRefreshing) {
      this.performRefresh();
    } else {
      this.resetPull();
    }
  }

  resetPull(): void {
    this.pullDistance = 0;
    this.spinnerRotation = 0;
    this.spinnerScale = 0;
    this.canPull = false;
    this.thresholdReached = false;
    this.isDragging = false;
  }

  /**
   * Performs the reload with Instagram-style spring easing and minimum feedback duration
   */
  async performRefresh(): Promise<void> {
    if (this.isRefreshing) return;
    this.isRefreshing = true;
    this.pullDistance = 56;
    this.spinnerScale = 1.0;
    const startTime = Date.now();

    try {
      await this.storyService.refreshStories();
    } finally {
      const elapsed = Date.now() - startTime;
      if (elapsed < 500) {
        await new Promise(res => setTimeout(res, 500 - elapsed));
      }
      this.pullDistance = 0;
      setTimeout(() => {
        this.isRefreshing = false;
        this.resetPull();
      }, 250);
    }
  }
}
