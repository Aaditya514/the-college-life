import { Component, inject, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoryService } from '../../services/story.service';
import { Story, StoryCategory } from '../../models/story.model';
import { StoryCardComponent } from '../../components/story-card/story-card.component';

@Component({
  selector: 'app-story-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StoryCardComponent],
  template: `
    <div class="story-detail-page">
      @if (story) {
        <article class="container-narrow story-article">
          <!-- Back navigation & breadcrumb -->
          <div class="story-nav-top">
            <a routerLink="/explore" class="back-link">
              &larr; Back to all stories
            </a>
            <div class="share-actions-top">
              <div class="detail-save-anchor">
                <button class="action-btn" [class.saved]="story.isSaved" (click)="onBookmarkClick($event)" title="Save story">
                  <svg width="18" height="18" viewBox="0 0 24 24" [attr.fill]="story.isSaved ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                  </svg>
                  <span>{{ story.isSaved ? 'Saved' : 'Save' }}</span>
                </button>

                <!-- Instagram-Style Collection Picker Popover -->
                @if (showCollectionMenu) {
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

                    <div class="popover-sub-note">Save to collection:</div>

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

              <button class="action-btn" (click)="onShareClick()" title="Share story link">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                  <polyline points="16 6 12 2 8 6"/>
                  <line x1="12" y1="2" x2="12" y2="15"/>
                </svg>
                <span>{{ shareBtnText }}</span>
              </button>

              <button class="action-btn" (click)="openReportModal()" title="Report story">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" x2="4" y1="22" y2="15"/>
                </svg>
                <span>Report</span>
              </button>
            </div>
          </div>

          <!-- Story Header -->
          <header class="story-header">
            <h1 class="story-headline">{{ story.title }}</h1>

            <div class="author-publication-box">
              <div class="author-avatar-badge">
                {{ story.authorPseudonym.slice(0, 2).toUpperCase() }}
              </div>
              <div class="author-details">
                <div class="author-pseudonym">
                  &#64;{{ story.authorPseudonym }}
                </div>
                <div class="publication-meta">
                  <span>Published {{ story.publishedAt }}</span>
                  <span>&bull;</span>
                  <span class="anonymous-seal">Verified Anonymous Submission</span>
                </div>
              </div>
            </div>

            @if (story.contentWarning) {
              <div class="content-warning-box">
                <span class="warning-icon">⚠️</span>
                <div>
                  <strong>Content Notice:</strong> {{ story.contentWarning }}
                </div>
              </div>
            }
          </header>

          <hr class="editorial-divider">

          <!-- Story Narrative Content -->
          <div class="story-body-content">
            @for (paragraph of storyParagraphs; track $index) {
              <p class="story-p">{{ paragraph }}</p>
            }
          </div>

          <!-- Tags list with clickable exploration -->
          @if (story.tags.length > 0) {
            <div class="story-tags-row">
              <span class="tags-label">Tags:</span>
              @for (tag of story.tags; track tag) {
                <a [routerLink]="['/explore']" [queryParams]="{ tag: tag }" class="tag-badge tag-link" title="Explore stories tagged #{{ tag }}">#{{ tag }}</a>
              }
            </div>
          }

          <!-- Reactions Engagement Bar (Maximized UI Spacing) -->
          <section class="reactions-box">
            <div class="reactions-header">
              <h3 class="reactions-title">How does this story resonate with you?</h3>
              <p class="reactions-sub">Hover or long-press an emotion to learn what it means.</p>
            </div>

            <div class="reactions-row" role="group" aria-label="Story emotional reactions">
              <!-- Relatable -->
              <div class="reaction-item">
                <button 
                  type="button"
                  class="reaction-pill-btn" 
                  [class.selected]="story.userReaction === 'relatable'"
                  (click)="react('relatable')"
                  (mouseenter)="showTooltip('relatable')"
                  (mouseleave)="hideTooltip('relatable')"
                  (focus)="showTooltip('relatable')"
                  (blur)="hideTooltip('relatable')"
                  (touchstart)="onTouchStart('relatable')"
                  (touchend)="onTouchEnd()"
                  aria-label="Relatable: {{ story.reactions.relatable }} reactions">
                  <span class="r-icon">🤝</span>
                  <span class="r-count">{{ story.reactions.relatable }}</span>
                </button>
                <div class="reaction-tooltip" [class.visible]="activeTooltip === 'relatable'">
                  <span>Relatable</span>
                </div>
              </div>

              <!-- Felt This -->
              <div class="reaction-item">
                <button 
                  type="button"
                  class="reaction-pill-btn" 
                  [class.selected]="story.userReaction === 'feltThis'"
                  (click)="react('feltThis')"
                  (mouseenter)="showTooltip('feltThis')"
                  (mouseleave)="hideTooltip('feltThis')"
                  (focus)="showTooltip('feltThis')"
                  (blur)="hideTooltip('feltThis')"
                  (touchstart)="onTouchStart('feltThis')"
                  (touchend)="onTouchEnd()"
                  aria-label="Felt This: {{ story.reactions.feltThis }} reactions">
                  <span class="r-icon">🖤</span>
                  <span class="r-count">{{ story.reactions.feltThis }}</span>
                </button>
                <div class="reaction-tooltip" [class.visible]="activeTooltip === 'feltThis'">
                  <span>Felt This</span>
                </div>
              </div>

              <!-- Sending Support -->
              <div class="reaction-item">
                <button 
                  type="button"
                  class="reaction-pill-btn" 
                  [class.selected]="story.userReaction === 'support'"
                  (click)="react('support')"
                  (mouseenter)="showTooltip('support')"
                  (mouseleave)="hideTooltip('support')"
                  (focus)="showTooltip('support')"
                  (blur)="hideTooltip('support')"
                  (touchstart)="onTouchStart('support')"
                  (touchend)="onTouchEnd()"
                  aria-label="Sending Support: {{ story.reactions.support }} reactions">
                  <span class="r-icon">🫂</span>
                  <span class="r-count">{{ story.reactions.support }}</span>
                </button>
                <div class="reaction-tooltip" [class.visible]="activeTooltip === 'support'">
                  <span>Sending Support</span>
                </div>
              </div>

              <!-- Made Me Laugh -->
              <div class="reaction-item">
                <button 
                  type="button"
                  class="reaction-pill-btn" 
                  [class.selected]="story.userReaction === 'laugh'"
                  (click)="react('laugh')"
                  (mouseenter)="showTooltip('laugh')"
                  (mouseleave)="hideTooltip('laugh')"
                  (focus)="showTooltip('laugh')"
                  (blur)="hideTooltip('laugh')"
                  (touchstart)="onTouchStart('laugh')"
                  (touchend)="onTouchEnd()"
                  aria-label="Made Me Laugh: {{ story.reactions.laugh }} reactions">
                  <span class="r-icon">😄</span>
                  <span class="r-count">{{ story.reactions.laugh }}</span>
                </button>
                <div class="reaction-tooltip" [class.visible]="activeTooltip === 'laugh'">
                  <span>Made Me Laugh</span>
                </div>
              </div>
            </div>

            @if (feedbackNotice) {
              <div class="reaction-feedback fade-in">
                <span>{{ feedbackNotice }}</span>
              </div>
            }
          </section>

          <!-- Editorial Note on No Comments -->
          <div class="no-comments-explanation">
            <div class="explanation-icon">🌿</div>
            <div class="explanation-text">
              <h4>Why are there no comments here?</h4>
              <p>
                To preserve psychological safety, we intentionally replaced public comment sections with emotional reactions. Every confession deserves to exist here without being scrutinized, debated, or questioned by strangers.
              </p>
            </div>
          </div>

          <!-- Related Stories -->
          @if (relatedStories.length > 0) {
            <section class="related-section">
              <h3 class="related-title">More from "{{ story.pillarLabel }}"</h3>
              <div class="related-grid">
                @for (rel of relatedStories; track rel.id) {
                  <app-story-card [story]="rel"></app-story-card>
                }
              </div>
            </section>
          }
        </article>

        <!-- Report Modal -->
        @if (showReportModal) {
          <div class="modal-backdrop fade-in">
            <div class="modal-card">
              <div class="modal-header">
                <h3>Report this story</h3>
                <button class="close-modal-btn" (click)="closeReportModal()">✕</button>
              </div>

              <div class="modal-body">
                <p class="modal-sub">
                  Our moderators promptly review stories violating community guidelines. Reports are anonymous.
                </p>

                <div class="form-group">
                  <label class="form-label">Reason for reporting</label>
                  <select class="form-select" [(ngModel)]="reportReason">
                    <option value="Real name / doxxing / personal details">Real name / doxxing / personal details</option>
                    <option value="Harassment or hate speech">Harassment or hate speech</option>
                    <option value="Defamatory allegations against individuals">Defamatory allegations against individuals</option>
                    <option value="Spam or commercial promotion">Spam or commercial promotion</option>
                    <option value="Other">Other violation</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label">Additional context (Optional)</label>
                  <textarea 
                    class="form-textarea" 
                    [(ngModel)]="reportDetails" 
                    placeholder="Provide any details that will help our moderation team review this..."></textarea>
                </div>
              </div>

              <div class="modal-footer">
                <button class="btn btn-secondary" (click)="closeReportModal()">Cancel</button>
                <button class="btn btn-primary" (click)="submitReport()">Submit Report</button>
              </div>
            </div>
          </div>
        }

        <!-- Report Confirmation Toast -->
        @if (reportSubmitted) {
          <div class="toast-notice fade-in">
            <span>✓ Report submitted to the moderation desk. Thank you for keeping our community safe.</span>
          </div>
        }
      } @else {
        <div class="container text-center not-found-box">
          <h2>Story not found</h2>
          <p>This memory might have been archived or removed by its contributor.</p>
          <a routerLink="/explore" class="btn btn-primary">Return to Explore</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .story-detail-page {
      padding: var(--space-3xl) 0 var(--space-4xl);
    }

    .story-nav-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--space-xl);
    }

    .back-link {
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-ink-secondary);
      text-decoration: underline;
    }
    .back-link:hover {
      color: var(--color-accent-primary);
    }

    .share-actions-top {
      display: flex;
      gap: 10px;
    }

    .detail-save-anchor {
      position: relative;
    }

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
      top: calc(100% + 8px);
      left: 0;
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
      max-height: 170px;
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

    .action-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 0.85rem;
      font-weight: 500;
      color: var(--color-ink-secondary);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .action-btn:hover {
      border-color: var(--color-ink-muted);
      color: var(--color-ink);
    }
    .action-btn.saved {
      color: var(--color-accent-primary);
      border-color: var(--color-accent-border);
      background-color: var(--color-accent-subtle);
    }

    .story-meta-tags {
      display: flex;
      gap: 10px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }

    .story-headline {
      font-size: clamp(2rem, 3.8vw, 3.25rem);
      line-height: 1.18;
      margin-bottom: 24px;
      color: var(--color-ink);
    }

    .author-publication-box {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 24px;
    }

    .author-avatar-badge {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background-color: var(--color-canvas-subtle);
      border: 1px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--color-ink);
    }

    .author-pseudonym {
      font-weight: 600;
      color: var(--color-ink);
      font-size: 0.95rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .batch-tag {
      font-size: 0.75rem;
      font-weight: 500;
      color: var(--color-ink-muted);
      background-color: var(--color-canvas-subtle);
      border: 1px solid var(--color-border);
      padding: 1px 6px;
      border-radius: var(--radius-sm);
    }

    .publication-meta {
      display: flex;
      gap: 8px;
      font-size: 0.8rem;
      color: var(--color-ink-muted);
      flex-wrap: wrap;
    }
    .anonymous-seal {
      color: #2E7D32;
      font-weight: 600;
    }

    .content-warning-box {
      background-color: var(--cat-amber-bg, #FFF9E6);
      border-left: 3px solid var(--cat-amber, #D4A017);
      padding: 12px 16px;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
      display: flex;
      gap: 10px;
      align-items: center;
      font-size: 0.85rem;
      color: var(--cat-amber, #6A4E00);
      margin-bottom: 24px;
    }

    /* Narrative Body */
    .story-body-content {
      margin: var(--space-xl) 0;
    }
    .story-p {
      font-size: 1.15rem;
      line-height: 1.85;
      color: var(--color-ink);
      margin-bottom: 24px;
      font-family: var(--font-serif);
      font-weight: 400;
    }

    .story-tags-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: var(--space-2xl);
    }
    .tags-label {
      font-size: 0.85rem;
      color: var(--color-ink-muted);
      font-weight: 600;
    }
    .tag-badge {
      font-size: 0.8rem;
      color: var(--color-ink-secondary);
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      padding: 2px 10px;
      border-radius: var(--radius-full);
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .tag-badge.tag-link:hover {
      background-color: var(--color-accent-primary);
      color: #FFFFFF;
      border-color: var(--color-accent-primary);
    }

    /* Reactions Box */
    .reactions-box {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 28px;
      margin: var(--space-2xl) 0;
      text-align: center;
    }
    .reactions-box {
      background-color: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 22px 20px 20px;
      margin: var(--space-2xl) 0;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
    }
    .reactions-header {
      margin-bottom: 16px;
    }
    .reactions-title {
      font-family: var(--font-serif);
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--color-ink);
      margin-bottom: 4px;
    }
    .reactions-sub {
      font-size: 0.86rem;
      color: var(--color-ink-muted);
    }

    .reactions-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .reaction-item {
      position: relative;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
    }

    .reaction-pill-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-width: 80px;
      height: 44px;
      padding: 0 16px;
      background-color: var(--color-canvas-subtle);
      border: 1px solid var(--color-border);
      border-radius: 9999px;
      cursor: pointer;
      font-family: inherit;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      touch-action: manipulation;
    }

    .reaction-pill-btn:hover {
      border-color: var(--color-accent-primary);
      background-color: var(--color-canvas);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
    }

    .reaction-pill-btn:active {
      transform: scale(0.96);
    }

    .reaction-pill-btn.selected {
      background-color: var(--color-accent-subtle, #F7EAE8);
      border-color: var(--color-accent-primary);
      color: var(--color-accent-primary);
      box-shadow: 0 2px 8px rgba(139, 38, 62, 0.16);
    }
    .reaction-pill-btn.selected .r-count {
      color: var(--color-accent-primary);
      font-weight: 700;
    }
    .reaction-pill-btn.selected .r-icon {
      transform: scale(1.18);
    }

    .r-icon {
      font-size: 1.25rem;
      line-height: 1;
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .r-count {
      font-family: var(--font-mono);
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-ink);
      line-height: 1;
    }

    /* Floating Tooltip (Hover & Long-Press) */
    .reaction-tooltip {
      position: absolute;
      bottom: calc(100% + 8px);
      left: 50%;
      transform: translateX(-50%) translateY(4px);
      background-color: #1E2022;
      color: #FAF8F5;
      font-size: 0.74rem;
      font-weight: 600;
      letter-spacing: 0.02em;
      white-space: nowrap;
      padding: 5px 10px;
      border-radius: 6px;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.18s ease, transform 0.18s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.18s;
      z-index: 100;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
    }

    .reaction-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border-width: 4px;
      border-style: solid;
      border-color: #1E2022 transparent transparent transparent;
    }

    .reaction-item:hover .reaction-tooltip,
    .reaction-pill-btn:focus-visible + .reaction-tooltip,
    .reaction-tooltip.visible {
      opacity: 1;
      visibility: visible;
      transform: translateX(-50%) translateY(0);
    }

    .reaction-feedback {
      margin-top: 14px;
      font-size: 0.85rem;
      color: var(--color-accent-primary);
      font-weight: 600;
      min-height: 1.2rem;
    }

    /* No comments */
    .no-comments-explanation {
      background-color: var(--color-canvas-subtle);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 20px 24px;
      display: flex;
      gap: 16px;
      align-items: flex-start;
      margin: var(--space-2xl) 0;
    }
    .explanation-icon {
      font-size: 1.75rem;
      line-height: 1;
    }
    .explanation-text h4 {
      font-size: 1.05rem;
      margin-bottom: 6px;
    }
    .explanation-text p {
      font-size: 0.88rem;
      line-height: 1.6;
      color: var(--color-ink-secondary);
    }


    /* Related */
    .related-section {
      margin-top: var(--space-3xl);
      padding-top: var(--space-2xl);
      border-top: 1px solid var(--color-border);
    }
    .related-title {
      font-size: 1.6rem;
      margin-bottom: 24px;
    }
    .related-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 20px;
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(27, 30, 33, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }
    .modal-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 500px;
      box-shadow: var(--shadow-lift);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }
    .modal-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .close-modal-btn {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      color: var(--color-ink-muted);
    }
    .modal-body {
      padding: 24px;
    }
    .modal-sub {
      font-size: 0.88rem;
      color: var(--color-ink-secondary);
      margin-bottom: 20px;
    }
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background-color: var(--color-canvas-subtle);
    }

    .toast-notice {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background-color: #1E2022;
      color: white;
      padding: 14px 20px;
      border-radius: var(--radius-md);
      box-shadow: var(--shadow-lift);
      z-index: 1100;
      font-size: 0.9rem;
    }

    .not-found-box {
      padding: 64px 0;
    }

    @media (max-width: 640px) {
      .story-article {
        padding: 16px 12px;
      }
      .story-nav-top {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      .share-actions-top {
        width: 100%;
        justify-content: flex-start;
      }
      .story-headline {
        font-size: clamp(1.65rem, 5vw, 2.3rem);
        margin-bottom: 16px;
      }
      .author-publication-box {
        gap: 10px;
        margin-bottom: 18px;
      }
      .author-avatar-badge {
        width: 36px;
        height: 36px;
        font-size: 0.78rem;
      }
      .story-p {
        font-size: 1.05rem;
        line-height: 1.75;
        margin-bottom: 18px;
      }
      .reactions-box {
        padding: 18px 12px;
        margin: var(--space-xl) 0;
      }
      .reactions-row {
        gap: 8px;
      }
      .reaction-pill-btn {
        min-width: 68px;
        padding: 0 12px;
        height: 40px;
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
export class StoryDetailComponent implements OnInit {
  storyService = inject(StoryService);
  route = inject(ActivatedRoute);

  currentStoryId = '';
  story: Story | undefined;
  storyParagraphs: string[] = [];
  relatedStories: Story[] = [];
  feedbackNotice = '';

  // Tooltip & long-press states
  activeTooltip: string | null = null;
  private longPressTimer: any = null;

  // Report modal state
  showReportModal = false;
  reportReason = 'Real name / doxxing / personal details';
  reportDetails = '';
  reportSubmitted = false;

  // Direct share state
  shareBtnText = 'Share';

  constructor() {
    effect(() => {
      const allStories = this.storyService.stories();
      if (this.currentStoryId) {
        const found = allStories.find(s => s.id === this.currentStoryId) || 
                      this.storyService.myStories().find(s => s.id === this.currentStoryId);
        if (found) {
          this.story = found;
          this.storyParagraphs = found.content.split('\n\n').filter(p => p.trim());
          this.relatedStories = this.storyService.getStoriesByPillar(found.pillar)
            .filter(s => s.id !== found.id)
            .slice(0, 2);
        }
      }
    });
  }

  showTooltip(type: string): void {
    this.activeTooltip = type;
  }

  hideTooltip(type: string): void {
    if (this.activeTooltip === type) {
      this.activeTooltip = null;
    }
  }

  onTouchStart(type: string): void {
    this.longPressTimer = setTimeout(() => {
      this.activeTooltip = type;
    }, 220);
  }

  onTouchEnd(): void {
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
    setTimeout(() => {
      this.activeTooltip = null;
    }, 1400);
  }

  onShareClick(): void {
    if (!this.story) return;
    const storyUrl = typeof window !== 'undefined' ? `${window.location.origin}/stories/${this.story.id}` : '';
    const shareText = `"${this.story.title}" — An anonymous confession by @${this.story.authorPseudonym} on The College Life We Didn't Have`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: this.story.title,
        text: shareText,
        url: storyUrl
      }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(storyUrl).then(() => {
        this.shareBtnText = '✓ Link Copied!';
        setTimeout(() => (this.shareBtnText = 'Share'), 2500);
      });
    }
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadStory(id);
      }
    });
  }

  loadStory(id: string): void {
    this.currentStoryId = id;
    this.story = this.storyService.getStoryById(id);
    if (this.story) {
      this.storyParagraphs = this.story.content.split('\n\n').filter(p => p.trim());
      this.relatedStories = this.storyService.getStoriesByPillar(this.story.pillar)
        .filter(s => s.id !== this.story?.id)
        .slice(0, 2);
    }
  }

  showCollectionMenu = false;
  isCreatingInline = false;
  inlineColName = '';

  onBookmarkClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (!this.story) return;

    if (!this.story.isSaved) {
      this.storyService.saveStory(this.story.id);
      this.story.isSaved = true;
      this.showCollectionMenu = true;
    } else {
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
    if (!this.story) return;
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
    if (!this.story) return;
    this.storyService.toggleStoryInCollection(collectionId, this.story.id);
  }

  react(type: 'relatable' | 'feltThis' | 'support' | 'laugh'): void {
    if (!this.story) return;

    const current = this.story.userReaction;
    const reactions = { ...this.story.reactions };

    if (current === type) {
      // Toggle off / undo reaction
      reactions[type] = Math.max(0, reactions[type] - 1);
      this.story = { ...this.story, userReaction: null, reactions };
      this.feedbackNotice = 'Reaction removed.';
    } else {
      // Switch from previous reaction if any
      if (current) {
        reactions[current] = Math.max(0, reactions[current] - 1);
      }
      reactions[type] = (reactions[type] || 0) + 1;
      this.story = { ...this.story, userReaction: type, reactions };

      const messages: Record<string, string> = {
        relatable: 'You related to this story.',
        feltThis: 'Emotional resonance noted.',
        support: 'Anonymous support sent to contributor.',
        laugh: 'Shared laughter recorded.'
      };
      this.feedbackNotice = messages[type] || 'Reaction recorded.';
    }

    // Call service to update reactive signals and backend persistence
    this.storyService.toggleReaction(this.story.id, type);

    setTimeout(() => {
      if (this.feedbackNotice) this.feedbackNotice = '';
    }, 3200);
  }

  openReportModal(): void {
    this.showReportModal = true;
  }

  closeReportModal(): void {
    this.showReportModal = false;
    this.reportDetails = '';
  }

  submitReport(): void {
    if (!this.story) return;
    this.storyService.reportStory(this.story.id, this.story.title, this.reportReason, this.reportDetails);
    this.showReportModal = false;
    this.reportSubmitted = true;
    setTimeout(() => this.reportSubmitted = false, 4000);
  }
}
