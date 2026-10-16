import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Story } from '../../models/story.model';
import { StoryService } from '../../services/story.service';

@Component({
  selector: 'app-story-card',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <article class="card-editorial insta-story-card" [class.featured]="featured">
      <!-- Card Header: Instagram Style (Avatar + Handle + Time) -->
      <div class="card-header-bar">
        <a [routerLink]="['/profile', story.authorPseudonym]" class="author-identity-link" title="View author profile">
          <div class="author-identity-group">
            <div class="author-circle-avatar">
              {{ (story.authorPseudonym || 'CW').slice(0, 2).toUpperCase() }}
            </div>
            <div class="author-text-meta">
              <span class="author-handle">&#64;{{ story.authorPseudonym }}</span>
              <span class="time-label">{{ story.publishedAt }}</span>
            </div>
          </div>
        </a>
      </div>

      <!-- Narrative Content Body -->
      <div class="card-narrative-body">
        <a [routerLink]="['/stories', story.id]" class="headline-link">
          <h3 class="story-headline">{{ story.title }}</h3>
        </a>

        <p class="story-text-preview">
          {{ story.excerpt }}
          <a [routerLink]="['/stories', story.id]" class="more-story-link">...more</a>
        </p>

        <!-- Hashtags with Clickable Exploration -->
        @if (story.tags && story.tags.length > 0) {
          <div class="story-tags-strip">
            @for (tag of story.tags; track tag) {
              <a [routerLink]="['/explore']" [queryParams]="{ tag: tag }" class="hash-tag" (click)="$event.stopPropagation()" title="Explore stories tagged #{{ tag }}">#{{ tag }}</a>
            }
          </div>
        }
      </div>

      <!-- Action Bar (Reactions row + Save bookmark) -->
      <div class="card-action-bar">
        <div class="reactions-strip">
          <!-- Relatable -->
          <button 
            class="action-react-btn" 
            [class.active]="story.userReaction === 'relatable'" 
            (click)="onReact('relatable', $event)" 
            title="Relatable">
            <span class="react-emoji">🤝</span>
            <span class="react-count">{{ story.reactions.relatable }}</span>
          </button>

          <!-- Felt This -->
          <button 
            class="action-react-btn" 
            [class.active]="story.userReaction === 'feltThis'" 
            (click)="onReact('feltThis', $event)" 
            title="Felt This">
            <span class="react-emoji">🖤</span>
            <span class="react-count">{{ story.reactions.feltThis }}</span>
          </button>

          <!-- Sending Support -->
          <button 
            class="action-react-btn" 
            [class.active]="story.userReaction === 'support'" 
            (click)="onReact('support', $event)" 
            title="Sending Support">
            <span class="react-emoji">🫂</span>
            <span class="react-count">{{ story.reactions.support }}</span>
          </button>

          <!-- Made Me Laugh -->
          <button 
            class="action-react-btn" 
            [class.active]="story.userReaction === 'laugh'" 
            (click)="onReact('laugh', $event)" 
            title="Made Me Laugh">
            <span class="react-emoji">😄</span>
            <span class="react-count">{{ story.reactions.laugh }}</span>
          </button>
        </div>

        <div class="right-actions">
          <button 
            type="button" 
            class="action-share-link-btn" 
            (click)="onShareClick($event)" 
            title="Share story link">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
              <polyline points="16 6 12 2 8 6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            @if (copiedToast) {
              <span class="share-toast-pill scale-in">✓ Link copied</span>
            }
          </button>

          <a [routerLink]="['/stories', story.id]" class="view-detail-link" title="Full story">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </a>

          <div class="bookmark-group-anchor">
            <button 
              class="action-bookmark-btn" 
              [class.saved]="story.isSaved" 
              (click)="onBookmarkClick($event)" 
              [title]="story.isSaved ? 'Manage saved collections' : 'Save memory'">
              <svg width="20" height="20" viewBox="0 0 24 24" [attr.fill]="story.isSaved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
            </button>

            <!-- Instagram-Style Collection Picker (Floating Popover on Desktop, Native Bottom Sheet on Mobile) -->
            @if (showCollectionMenu) {
              <!-- Backdrop that catches clicks elsewhere -->
              <div class="popover-backdrop" (click)="closeCollectionMenu($event)"></div>

              <div class="collection-popover fade-in" (click)="$event.stopPropagation()">
                <div class="popover-handle-bar"></div>
                <div class="popover-header">
                  <div class="popover-status-group">
                    <span class="popover-saved-check">✓</span>
                    <span class="popover-title">Saved</span>
                  </div>
                  <div class="popover-header-actions">
                    <button 
                      type="button" 
                      class="popover-create-btn" 
                      [class.active]="isCreatingInline"
                      (click)="toggleInlineCreate($event)" 
                      title="Create new collection">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                    </button>
                    <button 
                      type="button" 
                      class="popover-close-btn" 
                      (click)="closeCollectionMenu($event)" 
                      title="Close">
                      ✕
                    </button>
                  </div>
                </div>

                @if (isCreatingInline) {
                  <div class="inline-create-box">
                    <input 
                      type="text" 
                      class="inline-create-input" 
                      [(ngModel)]="inlineColName" 
                      placeholder="Collection name..." 
                      (keydown.enter)="createInlineCollection($event)"
                      (keydown.escape)="isCreatingInline = false"
                      (click)="$event.stopPropagation()"
                      autofocus
                    />
                    <button 
                      type="button" 
                      class="inline-create-submit" 
                      [disabled]="!inlineColName.trim()"
                      (click)="createInlineCollection($event)"
                      title="Save collection">
                      Add
                    </button>
                  </div>
                }

                <div class="popover-sub-note">
                  Save to collection:
                </div>

                <div class="popover-list">
                  @for (col of storyService.collections(); track col.id) {
                    <button 
                      type="button"
                      class="popover-item" 
                      [class.in-col]="storyService.isStoryInCollection(col.id, story.id)"
                      (click)="onToggleInCollection(col.id, $event)">
                      <span class="popover-emoji">{{ col.emoji }}</span>
                      <span class="popover-name">{{ col.name }}</span>
                      <span class="popover-check-mark">
                        {{ storyService.isStoryInCollection(col.id, story.id) ? '✓' : '+' }}
                      </span>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </article>
  `,
  styles: [`
    .insta-story-card {
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      border-radius: var(--radius-lg);
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      transition: all 0.2s ease;
    }
    .insta-story-card:hover {
      box-shadow: var(--shadow-card);
      border-color: #D6CEC3;
    }

    /* Header Bar */
    .card-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }

    .author-identity-link {
      text-decoration: none;
      color: inherit;
      display: inline-block;
      transition: opacity 0.15s ease;
    }
    .author-identity-link:hover .author-handle {
      color: var(--color-accent-primary);
      text-decoration: underline;
    }

    .author-identity-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .author-circle-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 0.85rem;
      border: 1.5px solid var(--color-border);
      background-color: var(--color-accent-subtle);
      color: var(--color-accent-primary);
    }

    .author-text-meta {
      display: flex;
      flex-direction: column;
    }

    .author-handle {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--color-ink);
    }

    .time-label {
      font-size: 0.78rem;
      color: var(--color-ink-muted);
    }

    /* Narrative Body */
    .card-narrative-body {
      margin-bottom: 18px;
    }

    .headline-link {
      text-decoration: none;
      display: block;
      margin-bottom: 8px;
    }
    .story-headline {
      font-size: 1.35rem;
      line-height: 1.3;
      color: var(--color-ink);
      transition: color 0.15s ease;
    }
    .headline-link:hover .story-headline {
      color: var(--color-accent-primary);
    }

    .story-text-preview {
      font-family: var(--font-serif);
      font-size: 1.05rem;
      line-height: 1.7;
      color: var(--color-ink);
    }

    .more-story-link {
      color: var(--color-ink-muted);
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      padding: 0 4px;
      font-family: var(--font-sans);
      text-decoration: underline;
      display: inline;
      transition: color 0.15s ease;
    }
    .more-story-link:hover {
      color: var(--color-accent-primary);
    }

    /* Hashtags only */
    .story-tags-strip {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 14px;
      flex-wrap: wrap;
    }
    .hash-tag {
      font-size: 0.825rem;
      color: var(--color-accent-primary);
      font-weight: 600;
      text-decoration: none;
      transition: opacity 0.15s ease;
    }
    .hash-tag:hover {
      text-decoration: underline;
      opacity: 0.8;
    }

    /* Action Bar */
    .card-action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid var(--color-border-subtle);
      flex-wrap: wrap;
      gap: 12px;
    }

    .reactions-strip {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .action-react-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: none;
      border: 1px solid transparent;
      padding: 6px 10px;
      border-radius: var(--radius-full);
      cursor: pointer;
      font-size: 0.825rem;
      color: var(--color-ink-secondary);
      transition: all 0.15s ease;
    }
    .action-react-btn:hover {
      background-color: var(--color-canvas-subtle);
      border-color: var(--color-border);
      color: var(--color-ink);
    }
    .action-react-btn.active {
      background-color: var(--color-accent-subtle);
      border-color: var(--color-accent-border);
      color: var(--color-accent-primary);
      font-weight: 700;
    }

    .react-emoji {
      font-size: 1rem;
    }
    .react-count {
      font-family: var(--font-mono);
      font-size: 0.825rem;
      font-weight: 600;
    }

    .right-actions {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .view-detail-link {
      color: var(--color-ink-muted);
      display: flex;
      align-items: center;
      transition: color 0.15s ease;
    }
    .view-detail-link:hover {
      color: var(--color-ink);
    }

    .action-share-link-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-ink-muted);
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px;
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;
      position: relative;
    }
    .action-share-link-btn:hover {
      color: var(--color-accent-primary);
    }
    .share-toast-pill {
      position: absolute;
      bottom: calc(100% + 6px);
      right: 0;
      background: #1E2022;
      color: #FFFFFF;
      font-size: 0.72rem;
      font-weight: 600;
      padding: 3px 8px;
      border-radius: var(--radius-full);
      white-space: nowrap;
      pointer-events: none;
      box-shadow: var(--shadow-card);
      z-index: 10;
    }

    .action-bookmark-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-ink-muted);
      display: flex;
      align-items: center;
      padding: 4px;
      border-radius: var(--radius-sm);
      transition: all 0.15s ease;
    }
    .action-bookmark-btn:hover {
      color: var(--color-accent-primary);
    }
    .action-bookmark-btn.saved {
      color: var(--color-accent-primary);
    }

    .bookmark-group-anchor {
      position: relative;
      display: flex;
      align-items: center;
    }

    /* Popover & Mobile Bottom Sheet */
    .popover-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 998;
      background: transparent;
    }

    .popover-handle-bar {
      display: none;
    }

    .collection-popover {
      position: absolute;
      bottom: calc(100% + 10px);
      right: 0;
      width: 270px;
      max-width: min(280px, calc(100vw - 32px));
      box-sizing: border-box;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
      z-index: 999;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .popover-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .popover-header-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .popover-close-btn {
      display: none;
      background: none;
      border: none;
      font-size: 1rem;
      color: var(--color-ink-muted);
      cursor: pointer;
      padding: 4px;
      line-height: 1;
      border-radius: 4px;
    }
    .popover-close-btn:hover {
      color: var(--color-ink);
    }
    .popover-status-group {
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }
    .popover-saved-check {
      width: 19px;
      height: 19px;
      border-radius: 50%;
      background-color: #2ECC71;
      color: #FFFFFF;
      font-size: 0.72rem;
      font-weight: 800;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .popover-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--color-ink);
    }
    .popover-create-btn {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 1px solid var(--color-border);
      background-color: var(--color-canvas);
      color: var(--color-ink);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      transition: all 0.15s ease;
    }
    .popover-create-btn:hover {
      background-color: var(--color-accent-subtle);
      border-color: var(--color-accent-primary);
      color: var(--color-accent-primary);
      transform: scale(1.05);
    }
    .popover-create-btn.active {
      background-color: var(--color-accent-primary);
      border-color: var(--color-accent-primary);
      color: #FFFFFF;
    }
    .inline-create-box {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 8px;
      background-color: var(--color-canvas);
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
    }
    .inline-create-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.82rem;
      font-family: inherit;
      color: var(--color-ink);
      outline: none;
      min-width: 0;
    }
    .inline-create-submit {
      border: none;
      background-color: var(--color-accent-primary);
      color: #FFFFFF;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 4px 9px;
      border-radius: 4px;
      cursor: pointer;
      transition: opacity 0.15s ease;
    }
    .inline-create-submit:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }
    .popover-sub-note {
      font-size: 0.76rem;
      color: var(--color-ink-muted);
      font-weight: 500;
    }
    .popover-list {
      max-height: 190px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-right: 2px;
    }
    .popover-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      text-align: left;
      background: none;
      border: 1px solid transparent;
      padding: 8px 10px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      font-size: 0.85rem;
      color: var(--color-ink);
      transition: all 0.12s ease;
    }
    .popover-item:hover {
      background-color: var(--color-canvas);
    }
    .popover-item.in-col {
      background-color: var(--color-canvas-subtle);
      border-color: var(--color-accent-border);
      color: var(--color-accent-primary);
      font-weight: 600;
    }
    .popover-name {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .popover-check-mark {
      font-weight: 800;
      font-size: 0.88rem;
      color: var(--color-accent-primary);
    }

    .insta-story-card.featured {
      background-color: var(--color-canvas-subtle);
      border-color: var(--color-border);
    }

    /* Mobile-first bottom sheet and card sizing */
    @media (max-width: 640px) {
      .insta-story-card {
        padding: 16px 14px;
        margin-bottom: 16px;
        border-radius: var(--radius-md);
      }
      .card-author-bar {
        margin-bottom: 12px;
      }
      .card-author-left {
        gap: 10px;
      }
      .card-avatar-sm {
        width: 32px;
        height: 32px;
        font-size: 0.75rem;
      }
      .author-name {
        font-size: 0.88rem;
      }
      .card-story-title {
        font-size: 1.25rem;
        margin-bottom: 8px;
        line-height: 1.25;
      }
      .card-story-excerpt {
        font-size: 0.98rem;
        line-height: 1.6;
        margin-bottom: 14px;
      }
      .card-action-bar {
        padding-top: 12px;
        gap: 8px;
      }
      .reactions-strip {
        gap: 6px;
      }
      .action-react-btn {
        padding: 5px 8px;
        font-size: 0.8rem;
        gap: 4px;
      }
      .react-emoji {
        font-size: 0.95rem;
      }
      .react-count {
        font-size: 0.78rem;
      }
      .right-actions {
        gap: 8px;
      }

      /* Native-feel Bottom Sheet for Mobile Collections */
      .popover-backdrop {
        background: rgba(0, 0, 0, 0.65);
        backdrop-filter: blur(4px);
        z-index: 1200;
      }
      .popover-handle-bar {
        display: block;
        width: 36px;
        height: 4px;
        background-color: var(--color-border);
        border-radius: 2px;
        margin: 0 auto 10px;
      }
      .popover-close-btn {
        display: flex;
      }
      .collection-popover {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        top: auto;
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 20px 20px 0 0;
        border-bottom: none;
        border-left: none;
        border-right: none;
        padding: 14px 18px calc(18px + env(safe-area-inset-bottom, 12px));
        box-shadow: 0 -12px 40px rgba(0, 0, 0, 0.4);
        z-index: 1201;
        animation: slideUpSheet 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        max-height: 75vh;
      }
      .popover-title {
        font-size: 1rem;
      }
      .popover-list {
        max-height: 42vh;
      }
      .popover-item {
        padding: 11px 12px;
        font-size: 0.92rem;
      }
    }

    @keyframes slideUpSheet {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `]
})
export class StoryCardComponent {
  @Input({ required: true }) story!: Story;
  @Input() featured = false;

  storyService = inject(StoryService);
  showCollectionMenu = false;
  isCreatingInline = false;
  inlineColName = '';
  copiedToast = false;

  onShareClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const storyUrl = typeof window !== 'undefined' ? `${window.location.origin}/stories/${this.story.id}` : '';
    const shareText = `"${this.story.title}" — An anonymous campus memory by @${this.story.authorPseudonym}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: this.story.title,
        text: shareText,
        url: storyUrl
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(storyUrl).then(() => {
        this.copiedToast = true;
        setTimeout(() => (this.copiedToast = false), 2200);
      });
    }
  }

  onReact(type: 'relatable' | 'feltThis' | 'support' | 'laugh', event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.storyService.toggleReaction(this.story.id, type);
  }

  onBookmarkClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.story.isSaved) {
      // 1. Immediately save to All Posts
      this.storyService.saveStory(this.story.id);
      // 2. Open collection prompt (if clicked elsewhere, remains saved in All Posts)
      this.showCollectionMenu = true;
    } else {
      // Already saved: toggle collection popover to manage collection assignments
      this.showCollectionMenu = !this.showCollectionMenu;
    }
  }

  toggleInlineCreate(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.isCreatingInline = !this.isCreatingInline;
    if (!this.isCreatingInline) {
      this.inlineColName = '';
    }
  }

  createInlineCollection(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const name = this.inlineColName.trim();
    if (!name) return;

    this.storyService.createCollection(name, '📁', [this.story.id]);
    this.inlineColName = '';
    this.isCreatingInline = false;
  }

  closeCollectionMenu(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.showCollectionMenu = false;
    this.isCreatingInline = false;
    this.inlineColName = '';
  }

  onToggleInCollection(collectionId: string, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    // Toggles story in/out of this collection; story remains saved in All Posts
    this.storyService.toggleStoryInCollection(collectionId, this.story.id);
  }
}
