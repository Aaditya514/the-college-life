import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { StoryService } from '../../services/story.service';
import { AuthService } from '../../services/auth.service';
import { PillarType } from '../../models/story.model';

@Component({
  selector: 'app-create-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (storyService.isCreateModalOpen()) {
      <div class="modal-backdrop fade-in" (click)="onBackdropClick($event)">
        <div class="create-modal-card scale-in">
          <!-- Modal Header -->
          <div class="modal-header">
            <div class="modal-header-text">
              <span class="modal-badge">Anonymous Confession</span>
              <h3 class="modal-title">Spill it out.</h3>
            </div>
            <button class="close-btn" (click)="storyService.closeCreateModal()" aria-label="Close modal">✕</button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Author Identity -->
            <div class="author-row">
              <div class="author-pill">
                @if (authService.currentUser()?.avatarUrl) {
                  <img [src]="authService.currentUser()!.avatarUrl" alt="Avatar" class="avatar-sm-img">
                } @else {
                  <span class="avatar-sm">{{ currentPseudonym.slice(0, 2).toUpperCase() }}</span>
                }
                <span class="handle">&#64;{{ currentPseudonym }}</span>
              </div>
            </div>

            <!-- Optional Title -->
            <div class="title-field-wrap">
              <input 
                type="text" 
                class="modal-title-input" 
                [(ngModel)]="title" 
                placeholder="Give it a title (or leave blank to auto-title)..." 
                maxlength="120">
            </div>

            <!-- Main Narrative Textarea -->
            <div class="textarea-wrap">
              <textarea 
                class="modal-textarea" 
                [(ngModel)]="content" 
                rows="6"
                placeholder="What happened? That 3:00 AM terrace panic, the unconfessed crush in LT-2, the exam you bombed..."></textarea>
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
                      #modalTagInputRef
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

            <!-- Optional Warning input -->
            @if (showWarning) {
              <div class="warning-row fade-in">
                <span>⚠️</span>
                <input 
                  type="text" 
                  class="warning-input" 
                  [(ngModel)]="contentWarning" 
                  placeholder="Content warning (e.g. mentions placement stress)...">
                <button type="button" class="btn-clear-warning" (click)="showWarning = false">✕</button>
              </div>
            }

            <!-- Toolbar & Counters -->
            <div class="modal-toolbar">
              <div class="toolbar-left">
                <span class="counter-text">{{ wordCount }} words</span>
                @if (wordCount > 0) {
                  <span class="dot">&bull;</span>
                  <span class="counter-text">~{{ readingTimeEst }} min read</span>
                }
                @if (!showWarning) {
                  <span class="dot">&bull;</span>
                  <button type="button" class="btn-text-link" (click)="showWarning = true">
                    + Add trigger notice
                  </button>
                }
              </div>

              <button 
                type="button" 
                class="btn btn-primary post-btn" 
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
      </div>
    }
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(27, 30, 33, 0.65);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 16px;
    }

    .create-modal-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 600px;
      box-shadow: var(--shadow-lift);
      overflow: hidden;
      animation: scaleUp 0.2s ease-out forwards;
    }

    @keyframes scaleUp {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    .modal-header {
      padding: 18px 24px 14px;
      border-bottom: 1px solid var(--color-border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
    }
    .modal-header-text {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .modal-badge {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--color-accent-primary);
    }
    .modal-title {
      font-size: 1.35rem;
      color: var(--color-ink);
      line-height: 1.2;
      margin: 0;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 1.35rem;
      color: var(--color-ink-muted);
      cursor: pointer;
      padding: 2px 6px;
      line-height: 1;
      border-radius: var(--radius-sm);
      transition: color 0.15s ease;
    }
    .close-btn:hover {
      color: var(--color-ink);
    }

    .modal-body {
      padding: 24px;
    }

    .author-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 14px;
    }
    .author-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background-color: var(--color-canvas);
      border: 1px solid var(--color-border);
      padding: 3px 10px 3px 5px;
      border-radius: var(--radius-full);
      font-size: 0.85rem;
      font-weight: 600;
    }
    .avatar-sm {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: var(--color-accent-subtle);
      color: var(--color-accent-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-family: var(--font-mono);
      font-weight: 700;
    }
    .avatar-sm-img {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      object-fit: cover;
    }

    .title-field-wrap {
      margin-bottom: 12px;
    }
    .modal-title-input {
      width: 100%;
      border: none;
      border-bottom: 1px dashed var(--color-border);
      padding: 6px 0;
      font-family: var(--font-serif);
      font-size: 1.35rem;
      font-weight: 600;
      color: var(--color-ink);
      background: transparent;
      outline: none;
    }
    .modal-title-input::placeholder {
      color: var(--color-ink-subtle);
      font-weight: 400;
      font-style: italic;
    }

    .textarea-wrap {
      margin-bottom: 16px;
    }
    .modal-textarea {
      width: 100%;
      border: none;
      background: transparent;
      font-family: var(--font-serif);
      font-size: 1.15rem;
      line-height: 1.75;
      color: var(--color-ink);
      resize: vertical;
      min-height: 160px;
      outline: none;
    }
    .modal-textarea::placeholder {
      color: var(--color-ink-muted);
      font-size: 1.05rem;
    }

    /* Interactive Tag Chips Field */
    .tags-field-wrapper {
      margin-bottom: 16px;
    }
    .tags-field-label {
      display: block;
      font-size: 0.75rem;
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
      gap: 6px;
      padding: 6px 10px;
      background: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      min-height: 40px;
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
      gap: 4px;
      background: var(--color-accent-subtle);
      color: var(--color-accent-primary);
      border: 1px solid var(--color-accent-border);
      font-size: 0.78rem;
      font-weight: 700;
      padding: 2px 7px 2px 9px;
      border-radius: 12px;
    }
    .tag-chip-hash {
      opacity: 0.7;
    }
    .remove-chip-btn {
      background: none;
      border: none;
      color: var(--color-accent-primary);
      cursor: pointer;
      font-size: 0.7rem;
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
      gap: 3px;
    }
    .tag-hash-prefix {
      color: var(--color-ink-muted);
      font-weight: 700;
      font-size: 0.85rem;
    }
    .tag-inline-input {
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.85rem;
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
      font-size: 0.7rem;
      color: var(--color-ink-muted);
      margin-top: 4px;
    }
    .tags-hint-text kbd {
      background: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: 3px;
      padding: 1px 4px;
      font-family: var(--font-mono);
      font-size: 0.68rem;
    }

    .warning-row {
      display: flex;
      align-items: center;
      gap: 8px;
      background-color: var(--cat-amber-bg, #FFFBEB);
      border: 1px solid var(--cat-amber, #FDE68A);
      padding: 6px 12px;
      border-radius: var(--radius-sm);
      margin-bottom: 14px;
    }
    .warning-input {
      flex: 1;
      border: none;
      background: transparent;
      font-size: 0.825rem;
      color: var(--color-ink);
      outline: none;
    }
    .warning-input::placeholder {
      color: var(--color-ink-muted);
    }
    .btn-clear-warning {
      background: none;
      border: none;
      color: var(--cat-amber, #92400E);
      cursor: pointer;
    }

    .modal-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid var(--color-border-subtle);
      gap: 12px;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--color-ink-muted);
    }
    .btn-text-link {
      background: none;
      border: none;
      font-size: 0.8rem;
      color: var(--color-ink-muted);
      cursor: pointer;
      text-decoration: underline;
    }
    .btn-text-link:hover {
      color: var(--color-accent-primary);
    }

    .post-btn {
      padding: 8px 22px;
      border-radius: var(--radius-full);
      font-size: 0.925rem;
    }

    @media (max-width: 640px) {
      .modal-backdrop {
        padding: 0;
        align-items: flex-end;
      }
      .create-modal-card {
        border-radius: 20px 20px 0 0;
        max-height: 94vh;
        max-width: 100%;
        display: flex;
        flex-direction: column;
        border-bottom: none;
        border-left: none;
        border-right: none;
        animation: slideUpSheet 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .modal-header {
        padding: 14px 18px 12px;
      }
      .modal-title {
        font-size: 1.15rem;
      }
      .modal-body {
        padding: 14px 18px;
        max-height: calc(94vh - 60px);
        overflow-y: auto;
        -webkit-overflow-scrolling: touch;
      }
      .modal-title-input {
        font-size: 1.18rem;
      }
      .modal-textarea {
        font-size: 1.05rem;
        min-height: 140px;
        line-height: 1.65;
      }
      .modal-toolbar {
        flex-wrap: wrap;
        gap: 10px;
        padding-top: 12px;
        padding-bottom: env(safe-area-inset-bottom, 8px);
      }
      .toolbar-left {
        width: 100%;
        justify-content: space-between;
      }
      .post-btn {
        width: 100%;
        padding: 12px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    @keyframes slideUpSheet {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }


  `]
})
export class CreateModalComponent {
  storyService = inject(StoryService);
  authService = inject(AuthService);
  router = inject(Router);

  title = '';
  content = '';
  contentWarning = '';
  showWarning = false;
  isSubmitting = false;

  get currentPseudonym(): string {
    return this.storyService.currentPseudonym();
  }

  // Interactive tag chips
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
    const firstSentence = this.content.trim().split(/[\.\n]/)[0];
    if (firstSentence && firstSentence.length > 5) {
      return firstSentence.length > 65 ? firstSentence.slice(0, 65) + '...' : firstSentence;
    }
    return 'Untitled Campus Memory';
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.storyService.closeCreateModal();
    }
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

  @ViewChild('modalTagInputRef') modalTagInputRef?: ElementRef<HTMLInputElement>;

  focusTagInput(): void {
    this.modalTagInputRef?.nativeElement?.focus();
  }

  private classify(text: string): { pillar: PillarType; categorySlug: string } {
    const lower = text.toLowerCase();
    let pillar: PillarType = 'lived';
    if (lower.includes('imagined') || lower.includes('expected') || lower.includes('dreamt') || lower.includes('thought')) {
      pillar = 'imagined';
    } else if (lower.includes('never said') || lower.includes('crush') || lower.includes('sorry') || lower.includes('miss you')) {
      pillar = 'unsaid';
    }

    let categorySlug = 'hostel-midnight-chai';
    if (lower.includes('crush') || lower.includes('love') || lower.includes('friend')) {
      categorySlug = 'love-crushes-friendships';
    } else if (lower.includes('exam') || lower.includes('cgpa') || lower.includes('placement')) {
      categorySlug = 'academic-career-regrets';
    } else if (lower.includes('proxy') || lower.includes('funny') || lower.includes('warden')) {
      categorySlug = 'funny-chaotic-moments';
    } else if (lower.includes('graduat') || lower.includes('degree')) {
      categorySlug = 'understood-after-graduating';
    }
    return { pillar, categorySlug };
  }

  onPost(): void {
    if (!this.content.trim()) return;

    if (this.currentTagInput.trim()) {
      this.addTag();
    }

    this.isSubmitting = true;
    const { pillar, categorySlug } = this.classify(this.content);
    this.storyService.submitStory({
      title: this.effectiveTitle,
      content: this.content,
      pillar,
      categorySlug,
      pseudonym: this.currentPseudonym,
      contentWarning: this.contentWarning,
      tags: [...this.tags]
    }).then(created => {
      this.isSubmitting = false;
      this.storyService.closeCreateModal();
      this.title = '';
      this.content = '';
      this.contentWarning = '';
      this.showWarning = false;
      this.tags = [];
      this.currentTagInput = '';
      if (created.status === 'published') {
        this.router.navigate(['/stories', created.id]);
      } else {
        this.router.navigate(['/my-stories']);
      }
    });
  }
}
