import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoryService } from '../../services/story.service';
import { AuthService } from '../../services/auth.service';
import { PillarType, Story } from '../../models/story.model';

@Component({
  selector: 'app-share',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="share-page">
      <div class="container-narrow">
        <!-- Minimal Hero -->
        <header class="share-header">
          <span class="whisper-badge">Instant Anonymous Sharing</span>
          <h1 class="share-title">Spill it out.</h1>
          <p class="share-subtitle">
            No forms to fill, no categories to pick. College is already stressful enough — just write what's on your mind on a whim.
          </p>
        </header>

        @if (!submittedStory) {
          <!-- Instant Writing Canvas (Instagram / Threads style) -->
          <div class="card-editorial share-canvas fade-in">
            <!-- Author Identity Strip -->
            <div class="author-strip">
              <div class="author-pill">
                @if (authService.currentUser()?.avatarUrl) {
                  <img [src]="authService.currentUser()!.avatarUrl" alt="Avatar" class="user-avatar-sm-img">
                } @else {
                  <span class="user-avatar-sm">{{ currentPseudonym.slice(0, 2).toUpperCase() }}</span>
                }
                <span class="pseudonym-name">&#64;{{ currentPseudonym }}</span>
              </div>
            </div>

            <!-- Optional Title -->
            <div class="title-row">
              <input 
                type="text" 
                class="story-title-input" 
                [(ngModel)]="title" 
                placeholder="Give it a title (or leave blank to auto-title)..." 
                maxlength="120">
            </div>

            <!-- Story Body Textarea -->
            <div class="body-row">
              <textarea 
                class="story-textarea" 
                [(ngModel)]="content" 
                rows="8"
                placeholder="What happened? That 3:00 AM terrace panic, the silent crush in LT-2, the exam you bombed, or the friends who drifted away after convocation..."></textarea>
            </div>

            <!-- Interactive Tag Chips Field -->
            <div class="tags-field-wrapper">
              <label class="tags-field-label">Tags (Optional)</label>
              <div class="tags-chip-box" (click)="focusTagInput()">
                @for (tag of tags; track $index) {
                  <span class="tag-chip scale-in">
                    <span class="tag-chip-hash">#</span>{{ tag }}
                    <button type="button" class="remove-chip-btn" (click)="removeTag($index, $event)" title="Remove tag">✕</button>
                  </span>
                }
                @if (tags.length < 5) {
                  <div class="tag-input-inline-wrap">
                    <span class="tag-hash-prefix">#</span>
                    <input 
                      #tagInputRef
                      type="text" 
                      class="tag-inline-input" 
                      [(ngModel)]="currentTagInput" 
                      (keydown)="onTagInputKeyDown($event)"
                      placeholder="{{ tags.length === 0 ? 'Type tag & press Enter (e.g. hostel, placement)...' : 'Add another tag...' }}"
                      maxlength="30">
                  </div>
                }
              </div>
              <span class="tags-hint-text">
                {{ tags.length }}/5 tags &bull; Press <kbd>Enter</kbd> or <kbd>,</kbd> to add tag
              </span>
            </div>

            <!-- Optional Content Warning Toggle -->
            @if (showWarningInput) {
              <div class="optional-warning-box fade-in">
                <span class="warning-icon">⚠️</span>
                <input 
                  type="text" 
                  class="warning-input" 
                  [(ngModel)]="contentWarning" 
                  placeholder="Optional content notice (e.g. mentions placement depression, burnout)...">
                <button type="button" class="close-warning-btn" (click)="showWarningInput = false">✕</button>
              </div>
            }

            <!-- Canvas Bottom Controls -->
            <div class="canvas-bottom-bar">
              <div class="meta-counters">
                <span class="word-count">{{ wordCount }} words</span>
                @if (wordCount > 0) {
                  <span class="dot">&bull;</span>
                  <span class="reading-time">~{{ readingTimeEst }} min read</span>
                }
                @if (!showWarningInput) {
                  <span class="dot">&bull;</span>
                  <button type="button" class="add-warning-btn" (click)="showWarningInput = true">
                    + Add trigger notice
                  </button>
                }
              </div>

              <div class="action-buttons">
                @if (content.trim()) {
                  <button 
                    type="button" 
                    class="btn btn-ghost btn-sm" 
                    (click)="togglePreview()">
                    {{ isPreviewMode ? 'Back to editing' : 'Preview' }}
                  </button>
                }

                <button 
                  type="button" 
                  class="btn btn-primary btn-post" 
                  [disabled]="!content.trim() || isSubmitting"
                  (click)="onPost()">
                  @if (isSubmitting) {
                    <span>Posting...</span>
                  } @else {
                    <span>Post Anonymously</span>
                  }
                </button>
              </div>
            </div>

          </div>

          <!-- Preview Card (if toggled) -->
          @if (isPreviewMode && content.trim()) {
            <div class="preview-box fade-in">
              <div class="preview-label">READER PREVIEW:</div>
              <article class="card-editorial preview-card">
                <div class="preview-author-meta">
                  <span class="p-author">&#64;{{ currentPseudonym }}</span>
                  <span>&bull;</span>
                  <span>Just now</span>
                </div>
                <h2 class="p-title">{{ effectiveTitle }}</h2>
                <div class="p-content">
                  @for (p of previewParagraphs; track $index) {
                    <p>{{ p }}</p>
                  }
                </div>
              </article>
            </div>
          }
        } @else {
          <!-- Instant Success Screen -->
          <div class="card-editorial success-screen fade-in">
            <div class="success-header">
              <span class="celebration-icon">💌</span>
              <h2>Your story is out in the world.</h2>
              <p class="success-subtitle">
                It takes courage to speak honestly. Thank you for making someone feel less alone tonight.
              </p>
            </div>



            <div class="submitted-story-snippet">
              <h3 class="snippet-title">{{ submittedStory.title }}</h3>
              <p class="snippet-excerpt">{{ submittedStory.excerpt }}</p>
              <div class="snippet-meta">
                <span>By &#64;{{ submittedStory.authorPseudonym }}</span>
                <span>&bull;</span>
                <span class="status-live">✓ Live in Archive</span>
              </div>
            </div>

            <div class="success-actions-row">
              <button class="btn btn-primary" (click)="resetForm()">
                Write another story
              </button>
              <a [routerLink]="['/stories', submittedStory.id]" class="btn btn-secondary">
                View Published Story &rarr;
              </a>
              <a routerLink="/explore" class="btn btn-ghost">
                Browse Archive
              </a>
            </div>
          </div>
        }

        <!-- 3-4s LITERARY MEMORY VAULT VERIFICATION MODAL -->
        @if (isVerifying) {
          <div class="modal-backdrop verification-backdrop fade-in">
            <div class="card-editorial verification-card scale-in">
              <div class="vault-crest-row">
                <span class="vault-crest-icon">🏛️</span>
                <span class="whisper-badge">Memory Vault Ingestion</span>
              </div>
              <h2 class="verification-title">Preserving Memory in Vault</h2>
              <p class="verification-sub">
                Safeguarding anonymity and content purity so no student faces targeted harm.
              </p>

              <!-- Animated Progress Bar -->
              <div class="verification-progress-track">
                <div class="verification-progress-fill" [style.width.%]="verificationProgress"></div>
              </div>

              <!-- 3 Progressive Steps -->
              <div class="verification-stepper-list">
                <div class="step-item" [class.active]="verificationStep === 1" [class.done]="verificationStep > 1">
                  <div class="step-indicator">
                    @if (verificationStep > 1) { <span>✓</span> } @else { <span class="spinner-circle"></span> }
                  </div>
                  <div class="step-content">
                    <div class="step-name">1. Scanning Anonymity & Real Names</div>
                    <div class="step-desc">Protecting student peers, batchmates, and campus identifiers.</div>
                  </div>
                </div>

                <div class="step-item" [class.active]="verificationStep === 2" [class.done]="verificationStep > 2">
                  <div class="step-indicator">
                    @if (verificationStep > 2) { <span>✓</span> } @else if (verificationStep === 2) { <span class="spinner-circle"></span> } @else { <span>2</span> }
                  </div>
                  <div class="step-content">
                    <div class="step-name">2. AI Campus Safety & Abuse Analysis</div>
                    <div class="step-desc">Evaluating Hinglish slurs, harassment signals, and defamation.</div>
                  </div>
                </div>

                <div class="step-item" [class.active]="verificationStep === 3" [class.done]="verificationProgress >= 100">
                  <div class="step-indicator">
                    @if (verificationProgress >= 100) { <span>✓</span> } @else if (verificationStep === 3) { <span class="spinner-circle"></span> } @else { <span>3</span> }
                  </div>
                  <div class="step-content">
                    <div class="step-name">3. Sealing into College Archive</div>
                    <div class="step-desc">Committing verified memory to permanent campus repository.</div>
                  </div>
                </div>
              </div>

              <div class="verification-footer-note">
                <span>🔒 Cryptographically protected pen name</span>
                <span>&bull;</span>
                <span>Zero personal telemetry</span>
              </div>
            </div>
          </div>
        }

        <!-- FLAGGED / ACTION NEEDED MODAL (Friendly Anonymization Guidance) -->
        @if (flaggedStory) {
          <div class="modal-backdrop fade-in" (click)="closeFlaggedModal()">
            <div class="flagged-guidance-card scale-in" (click)="$event.stopPropagation()">
              <div class="flagged-header">
                <div class="flagged-icon-badge">⚠️</div>
                <div>
                  <span class="eyebrow-tag danger-tag">Review & Anonymization Suggested</span>
                  <h3 class="flagged-modal-title">Identifying Details Detected</h3>
                </div>
              </div>

              <div class="flagged-modal-body">
                <div class="flagged-notice-quote">
                  <span class="quote-title">AI Safety Engine Flag:</span>
                  <p>{{ flaggedReason }}</p>
                </div>

                <div class="guidance-tips-box">
                  <div class="tips-heading">💡 How to resolve this easily:</div>
                  <ul class="tips-list">
                    <li>Replace student names with generic terms: <em>"my roommate"</em>, <em>"the CR"</em>, <em>"a batchmate"</em>, or <em>"a senior"</em>.</li>
                    <li>Remove specific hostel room numbers or private contact details.</li>
                    <li>If the flagged word is actually a campus town (e.g. <em>Anand</em>, Gujarat) or literary character, you can dispute the flag!</li>
                  </ul>
                </div>

                @if (showAppealInShare) {
                  <div class="share-appeal-form fade-in">
                    <label class="form-label">Explain your context to editorial reviewers:</label>
                    <textarea 
                      class="form-textarea" 
                      [(ngModel)]="shareAppealReason" 
                      placeholder="e.g. 'Anand is a campus town, not a person's name'..."
                      rows="3"></textarea>
                    
                    @if (shareAppealSubmitted) {
                      <div class="appeal-success-inline">
                        ✓ Appeal lodged with editorial desk. Track it under 'My Stories'.
                      </div>
                    }
                  </div>
                }
              </div>

              <div class="flagged-modal-footer">
                @if (!showAppealInShare) {
                  <button type="button" class="btn btn-secondary" (click)="showAppealInShare = true">
                    ⚖️ Dispute / Appeal Flag
                  </button>
                } @else if (!shareAppealSubmitted) {
                  <button 
                    type="button" 
                    class="btn btn-secondary" 
                    [disabled]="!shareAppealReason.trim()"
                    (click)="submitShareAppeal()">
                    Submit Dispute Note
                  </button>
                }
                <button type="button" class="btn btn-primary" (click)="closeFlaggedModal()">
                  ✏️ Quick Edit & Anonymize
                </button>
              </div>
            </div>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .share-page {
      padding: var(--space-3xl) 0 var(--space-4xl);
    }

    .share-header {
      text-align: center;
      margin-bottom: var(--space-2xl);
    }

    .whisper-badge {
      display: inline-block;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-accent-primary);
      background-color: var(--color-accent-subtle);
      border: 1px solid var(--color-accent-border);
      padding: 3px 12px;
      border-radius: var(--radius-full);
      margin-bottom: 12px;
    }

    .share-title {
      font-size: clamp(2.2rem, 4vw, 3rem);
      margin-bottom: 8px;
    }

    .share-subtitle {
      font-size: 1.1rem;
      color: var(--color-ink-secondary);
      max-width: 540px;
      margin: 0 auto;
      line-height: 1.55;
    }

    /* Writing Canvas */
    .share-canvas {
      padding: 28px 32px;
      border-radius: var(--radius-lg);
      background-color: var(--color-surface);
      box-shadow: var(--shadow-card);
      border: 1px solid var(--color-border);
    }

    .author-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--color-border-subtle);
      margin-bottom: 18px;
      flex-wrap: wrap;
      gap: 12px;
    }

    .author-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: var(--color-canvas);
      border: 1px solid var(--color-border);
      padding: 4px 12px 4px 6px;
      border-radius: var(--radius-full);
      font-size: 0.88rem;
      font-weight: 600;
    }

    .user-avatar-sm {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background-color: var(--color-accent-subtle);
      color: var(--color-accent-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-family: var(--font-mono);
      font-weight: 700;
    }

    .user-avatar-sm-img {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      object-fit: cover;
    }



    .title-row {
      margin-bottom: 12px;
    }

    .story-title-input {
      width: 100%;
      border: none;
      border-bottom: 1px dashed var(--color-border);
      padding: 8px 0;
      font-family: var(--font-serif);
      font-size: 1.4rem;
      font-weight: 600;
      color: var(--color-ink);
      background: transparent;
      outline: none;
      transition: border-color 0.15s ease;
    }
    .story-title-input:focus {
      border-bottom: 1px solid var(--color-accent-primary);
    }
    .story-title-input::placeholder {
      color: var(--color-ink-subtle);
      font-weight: 400;
      font-style: italic;
    }

    .story-textarea {
      width: 100%;
      border: none;
      background: transparent;
      font-family: var(--font-serif);
      font-size: 1.18rem;
      line-height: 1.8;
      color: var(--color-ink);
      resize: vertical;
      min-height: 200px;
      outline: none;
    }
    .story-textarea::placeholder {
      color: var(--color-ink-muted);
      font-size: 1.05rem;
      line-height: 1.7;
    }

    .optional-warning-box {
      display: flex;
      align-items: center;
      gap: 10px;
      background-color: #FFFBEB;
      border: 1px solid #FDE68A;
      padding: 8px 12px;
      border-radius: var(--radius-md);
      margin: 12px 0;
    }
    .warning-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.85rem;
      color: #78350F;
      outline: none;
    }
    .close-warning-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: #92400E;
      font-size: 0.9rem;
    }

    .canvas-bottom-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 18px;
      border-top: 1px solid var(--color-border-subtle);
      flex-wrap: wrap;
      gap: 14px;
    }

    .meta-counters {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: var(--color-ink-muted);
    }

    .add-warning-btn {
      background: none;
      border: none;
      color: var(--color-ink-muted);
      font-size: 0.8rem;
      cursor: pointer;
      text-decoration: underline;
    }
    .add-warning-btn:hover {
      color: var(--color-accent-primary);
    }

    .action-buttons {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .btn-post {
      padding: 10px 24px;
      font-size: 0.95rem;
      border-radius: var(--radius-full);
    }



    /* Preview Box */
    .preview-box {
      margin-top: 24px;
    }
    .preview-label {
      font-size: 0.75rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--color-ink-muted);
      margin-bottom: 8px;
    }
    .preview-card {
      padding: 32px;
    }
    .preview-author-meta {
      display: flex;
      gap: 8px;
      font-size: 0.825rem;
      color: var(--color-ink-muted);
      margin-bottom: 12px;
    }
    .preview-author-meta .p-author {
      font-weight: 600;
      color: var(--color-ink);
    }
    .p-title {
      font-size: 1.8rem;
      margin-bottom: 16px;
    }
    .p-content p {
      font-family: var(--font-serif);
      font-size: 1.1rem;
      line-height: 1.8;
      color: var(--color-ink);
      margin-bottom: 16px;
    }

    /* Success Screen */
    .success-screen {
      padding: 44px 36px;
      text-align: center;
    }
    .celebration-icon {
      font-size: 3.5rem;
      display: block;
      margin-bottom: 12px;
    }
    .success-screen h2 {
      font-size: 2.2rem;
      margin-bottom: 8px;
    }
    .success-subtitle {
      font-size: 1.05rem;
      color: var(--color-ink-secondary);
      max-width: 500px;
      margin: 0 auto 28px;
    }



    .submitted-story-snippet {
      background-color: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 20px;
      max-width: 540px;
      margin: 0 auto 32px;
      text-align: left;
    }
    .snippet-title {
      font-size: 1.25rem;
      margin-bottom: 6px;
    }
    .snippet-excerpt {
      font-size: 0.9rem;
      color: var(--color-ink-secondary);
      margin-bottom: 12px;
    }
    .snippet-meta {
      display: flex;
      gap: 8px;
      font-size: 0.78rem;
      color: var(--color-ink-muted);
    }
    .status-live {
      color: #03543F;
      font-weight: 600;
    }

    /* Interactive Tag Chips Field */
    .tags-field-wrapper {
      margin-bottom: 20px;
    }
    .tags-field-label {
      display: block;
      font-size: 0.78rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-ink-muted);
      margin-bottom: 6px;
    }
    .tags-chip-box {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      background: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      min-height: 44px;
      cursor: text;
      transition: border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
    }
    .tags-chip-box:focus-within {
      border-color: var(--color-accent-primary);
      background: var(--color-surface);
      box-shadow: 0 0 0 3px rgba(139, 38, 53, 0.08);
    }
    .tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--color-accent-subtle);
      color: var(--color-accent-primary);
      border: 1px solid var(--color-accent-border);
      font-size: 0.82rem;
      font-weight: 700;
      padding: 3px 8px 3px 10px;
      border-radius: 14px;
    }
    .tag-chip-hash {
      opacity: 0.7;
    }
    .remove-chip-btn {
      background: none;
      border: none;
      color: var(--color-accent-primary);
      cursor: pointer;
      font-size: 0.75rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 2px;
      border-radius: 50%;
      line-height: 1;
      opacity: 0.7;
      transition: opacity 0.1s ease;
    }
    .remove-chip-btn:hover {
      opacity: 1;
      color: #C0392B;
    }
    .tag-input-inline-wrap {
      display: inline-flex;
      align-items: center;
      flex: 1;
      min-width: 140px;
      gap: 4px;
    }
    .tag-hash-prefix {
      color: var(--color-ink-muted);
      font-weight: 700;
      font-size: 0.88rem;
    }
    .tag-inline-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.88rem;
      color: var(--color-ink);
      width: 100%;
      font-family: inherit;
    }
    .tag-inline-input::placeholder {
      color: var(--color-ink-muted);
      font-style: italic;
    }
    .tags-hint-text {
      display: block;
      font-size: 0.72rem;
      color: var(--color-ink-muted);
      margin-top: 5px;
    }
    .tags-hint-text kbd {
      background: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: 3px;
      padding: 1px 4px;
      font-family: var(--font-mono);
      font-size: 0.7rem;
    }

    .success-actions-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    @media (max-width: 600px) {
      .share-canvas {
        padding: 20px;
      }
      .author-strip {
        flex-direction: column;
        align-items: flex-start;
      }
      .batch-input {
        text-align: left;
        padding-left: 0;
      }
      .canvas-bottom-bar {
        flex-direction: column;
        align-items: stretch;
      }
      .action-buttons {
        justify-content: flex-end;
      }
    }

    /* Verification Stepper Modal */
    .verification-backdrop {
      background-color: rgba(18, 20, 24, 0.78);
      backdrop-filter: blur(8px);
      z-index: 1050;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .verification-card {
      width: 100%;
      max-width: 500px;
      padding: 32px 36px;
      text-align: center;
      border-radius: var(--radius-lg);
      background-color: var(--color-surface);
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
      border: 1px solid var(--color-border);
    }
    .vault-crest-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    .vault-crest-icon {
      font-size: 1.5rem;
    }
    .verification-title {
      font-size: 1.6rem;
      font-family: var(--font-serif);
      margin-bottom: 6px;
      color: var(--color-ink);
    }
    .verification-sub {
      font-size: 0.92rem;
      color: var(--color-ink-secondary);
      margin: 0 auto 24px;
      max-width: 380px;
      line-height: 1.5;
    }
    .verification-progress-track {
      width: 100%;
      height: 6px;
      background-color: var(--color-canvas);
      border-radius: var(--radius-full);
      overflow: hidden;
      margin-bottom: 24px;
      border: 1px solid var(--color-border-subtle);
    }
    .verification-progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #D97706, #059669);
      border-radius: var(--radius-full);
      transition: width 0.7s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .verification-stepper-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      text-align: left;
      margin-bottom: 24px;
      background-color: var(--color-canvas);
      border-radius: var(--radius-md);
      padding: 18px 20px;
      border: 1px solid var(--color-border-subtle);
    }
    .step-item {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      opacity: 0.45;
      transition: opacity 0.3s ease;
    }
    .step-item.active {
      opacity: 1;
    }
    .step-item.done {
      opacity: 0.9;
    }
    .step-indicator {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background-color: var(--color-surface);
      border: 1.5px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.78rem;
      font-weight: 700;
      flex-shrink: 0;
      color: var(--color-ink-secondary);
    }
    .step-item.done .step-indicator {
      background-color: #059669;
      border-color: #059669;
      color: white;
    }
    .step-item.active .step-indicator {
      border-color: #D97706;
      color: #D97706;
    }
    .spinner-circle {
      width: 12px;
      height: 12px;
      border: 2px solid #D97706;
      border-top-color: transparent;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    .step-name {
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--color-ink);
    }
    .step-desc {
      font-size: 0.78rem;
      color: var(--color-ink-secondary);
      margin-top: 2px;
      line-height: 1.4;
    }
    .verification-footer-note {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      font-size: 0.75rem;
      color: var(--color-ink-muted);
    }

    /* Flagged Guidance Modal */
    .flagged-guidance-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 520px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(220, 38, 38, 0.25);
      overflow: hidden;
      z-index: 1060;
    }
    .flagged-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border-subtle);
      background-color: rgba(220, 38, 38, 0.04);
    }
    .flagged-icon-badge {
      font-size: 1.7rem;
    }
    .danger-tag {
      background-color: rgba(220, 38, 38, 0.1);
      color: #DC2626;
      border-color: rgba(220, 38, 38, 0.25);
    }
    .flagged-modal-title {
      font-size: 1.25rem;
      font-family: var(--font-serif);
      margin: 4px 0 0;
      color: var(--color-ink);
    }
    .flagged-modal-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .flagged-notice-quote {
      background-color: rgba(220, 38, 38, 0.06);
      border-left: 3px solid #DC2626;
      padding: 12px 14px;
      border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
    }
    .quote-title {
      font-size: 0.76rem;
      font-weight: 700;
      color: #DC2626;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .flagged-notice-quote p {
      font-size: 0.9rem;
      color: var(--color-ink);
      margin: 4px 0 0;
      line-height: 1.45;
    }
    .guidance-tips-box {
      background-color: var(--color-canvas);
      border: 1px solid var(--color-border-subtle);
      padding: 14px 16px;
      border-radius: var(--radius-sm);
    }
    .tips-heading {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--color-ink);
      margin-bottom: 8px;
    }
    .tips-list {
      margin: 0;
      padding-left: 18px;
      font-size: 0.84rem;
      color: var(--color-ink-secondary);
      line-height: 1.55;
    }
    .share-appeal-form {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background-color: var(--color-canvas);
      padding: 14px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
    }
    .appeal-success-inline {
      font-size: 0.84rem;
      color: #047857;
      font-weight: 600;
      padding: 6px 0;
    }
    .flagged-modal-footer {
      padding: 14px 24px;
      border-top: 1px solid var(--color-border-subtle);
      background-color: var(--color-canvas);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      flex-wrap: wrap;
    }
  `]
})
export class ShareComponent {
  storyService = inject(StoryService);
  authService = inject(AuthService);

  title = '';
  content = '';
  contentWarning = '';
  showWarningInput = false;

  get currentPseudonym(): string {
    return this.storyService.currentPseudonym();
  }

  isPreviewMode = false;
  isSubmitting = false;
  submittedStory: Story | null = null;

  // Progressive Memory Vault Verification State
  isVerifying = false;
  verificationStep = 1;
  verificationProgress = 0;
  flaggedStory: Story | null = null;
  flaggedReason = '';
  showAppealInShare = false;
  shareAppealReason = '';
  shareAppealSubmitted = false;

  // Dedicated tag chips
  tags: string[] = [];
  currentTagInput = '';

  get wordCount(): number {
    return this.content.trim() ? this.content.trim().split(/\s+/).length : 0;
  }

  get readingTimeEst(): number {
    return Math.max(1, Math.ceil(this.wordCount / 160));
  }

  get effectiveTitle(): string {
    if (this.title.trim()) return this.title.trim();
    // Auto-generate title from first sentence if blank
    const firstSentence = this.content.trim().split(/[\.\n]/)[0];
    if (firstSentence && firstSentence.length > 5) {
      return firstSentence.length > 65 ? firstSentence.slice(0, 65) + '...' : firstSentence;
    }
    return 'Untitled Campus Memory';
  }

  get previewParagraphs(): string[] {
    return this.content.split('\n\n').filter(p => p.trim());
  }

  togglePreview(): void {
    this.isPreviewMode = !this.isPreviewMode;
  }

  /**
   * Automatic Content Classification (Simulates ML classification on ingestion)
   * Infers Pillar and Category based on textual cues without burdening the user.
   */
  private classifyContent(text: string): { pillar: PillarType; categorySlug: string } {
    const lower = text.toLowerCase();

    // Determine Pillar
    let pillar: PillarType = 'lived';
    if (lower.includes('imagined') || lower.includes('expected') || lower.includes('dreamt') || lower.includes('thought college would') || lower.includes('movies')) {
      pillar = 'imagined';
    } else if (lower.includes('never said') || lower.includes('never told') || lower.includes('crush') || lower.includes('sorry') || lower.includes('miss you') || lower.includes('promise')) {
      pillar = 'unsaid';
    }

    // Determine Category
    let categorySlug = 'hostel-midnight-chai';
    if (lower.includes('crush') || lower.includes('love') || lower.includes('friend') || lower.includes('talked')) {
      categorySlug = 'love-crushes-friendships';
    } else if (lower.includes('exam') || lower.includes('marks') || lower.includes('cgpa') || lower.includes('placement') || lower.includes('engineer') || lower.includes('study')) {
      categorySlug = 'academic-career-regrets';
    } else if (lower.includes('proxy') || lower.includes('funny') || lower.includes('laughed') || lower.includes('warden') || lower.includes('bunk')) {
      categorySlug = 'funny-chaotic-moments';
    } else if (lower.includes('graduat') || lower.includes('convocation') || lower.includes('degree') || lower.includes('adult') || lower.includes('job')) {
      categorySlug = 'understood-after-graduating';
    } else if (lower.includes('missed') || lower.includes('regret') || lower.includes('wish i had')) {
      categorySlug = 'missed-opportunities';
    }

    return { pillar, categorySlug };
  }

  onTagInputKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      event.stopPropagation();
      this.addTag();
    } else if (event.key === 'Backspace' && !this.currentTagInput && this.tags.length > 0) {
      this.tags.pop();
    }
  }

  addTag(): void {
    const raw = this.currentTagInput.trim().replace(/^#+/, '').replace(/,/g, '').trim();
    if (!raw) return;
    const clean = raw.replace(/\s+/g, '_');
    if (clean.length >= 2 && !this.tags.includes(clean) && this.tags.length < 5) {
      this.tags.push(clean);
      this.currentTagInput = '';
    }
  }

  removeTag(index: number, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.tags.splice(index, 1);
  }

  @ViewChild('tagInputRef') tagInputRef?: ElementRef<HTMLInputElement>;

  focusTagInput(): void {
    this.tagInputRef?.nativeElement?.focus();
  }

  onPost(): void {
    if (!this.content.trim()) return;

    if (this.currentTagInput.trim()) {
      this.addTag();
    }

    this.isSubmitting = true;
    this.isVerifying = true;
    this.verificationStep = 1;
    this.verificationProgress = 15;
    this.flaggedStory = null;
    this.showAppealInShare = false;
    this.shareAppealReason = '';
    this.shareAppealSubmitted = false;

    const { pillar, categorySlug } = this.classifyContent(this.content);
    const submitPromise = this.storyService.submitStory({
      title: this.effectiveTitle,
      content: this.content,
      pillar,
      categorySlug,
      pseudonym: this.currentPseudonym,
      contentWarning: this.contentWarning,
      tags: [...this.tags]
    });

    // Progressive visual steps
    setTimeout(() => {
      if (this.isVerifying) {
        this.verificationStep = 2;
        this.verificationProgress = 55;
      }
    }, 1100);

    setTimeout(() => {
      if (this.isVerifying) {
        this.verificationStep = 3;
        this.verificationProgress = 85;
      }
    }, 2200);

    setTimeout(async () => {
      try {
        const created = await submitPromise;
        this.verificationProgress = 100;

        setTimeout(() => {
          this.isVerifying = false;
          this.isSubmitting = false;

          if (created.status === 'published') {
            this.submittedStory = created;
            this.isPreviewMode = false;
          } else {
            this.flaggedStory = created;
            this.flaggedReason = created.moderationNote || created.rejectionReason || 
              'Flagged for potential student names, real batchmate identifiers, or community guideline sensitivity.';
          }
        }, 500);
      } catch {
        this.isVerifying = false;
        this.isSubmitting = false;
      }
    }, 3300);
  }

  closeFlaggedModal(): void {
    this.flaggedStory = null;
    this.showAppealInShare = false;
  }

  submitShareAppeal(): void {
    if (!this.flaggedStory || !this.shareAppealReason.trim()) return;
    this.storyService.submitAppeal(this.flaggedStory.id, this.shareAppealReason.trim()).then((success) => {
      if (success) {
        this.shareAppealSubmitted = true;
        setTimeout(() => {
          this.closeFlaggedModal();
        }, 2000);
      }
    });
  }

  resetForm(): void {
    this.title = '';
    this.content = '';
    this.contentWarning = '';
    this.showWarningInput = false;
    this.submittedStory = null;
    this.isPreviewMode = false;
    this.tags = [];
    this.currentTagInput = '';
    this.flaggedStory = null;
    this.showAppealInShare = false;
    this.shareAppealReason = '';
    this.shareAppealSubmitted = false;
  }
}
