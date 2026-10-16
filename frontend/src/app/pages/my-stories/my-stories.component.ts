import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoryService } from '../../services/story.service';
import { AuthService } from '../../services/auth.service';
import { Story, PillarType } from '../../models/story.model';

@Component({
  selector: 'app-my-stories',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="my-stories-page">
      <div class="container">
        <!-- Dashboard Header -->
        <header class="dashboard-header">
          <!-- Left: Avatar + User Details -->
          <div class="header-user-info">
            <!-- Profile Photo Container with Click Menu Trigger -->
            <div class="user-avatar-wrapper" (click)="openAvatarMenu()" title="Click to view, change, or remove profile photo">
              @if (authService.currentUser()?.avatarUrl) {
                <img [src]="authService.currentUser()!.avatarUrl" alt="Avatar" class="user-avatar-img">
              } @else {
                <div class="user-avatar-fallback">
                  {{ (storyService.currentPseudonym().slice(0, 2) || 'CL').toUpperCase() }}
                </div>
              }
              <div class="avatar-camera-btn" title="Profile photo options">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
              </div>
            </div>

            <!-- Hidden file input for uploading photo -->
            <input #avatarFileInput type="file" accept="image/*" (change)="onAvatarSelected($event)" hidden>

            <div class="user-meta-details">
              <div class="user-badge-row">
                <span class="eyebrow-tag">Contributor Workspace</span>
                
                <span class="user-email-chip">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  {{ authService.currentUser()?.email || 'wanderer42@alumni.ac.in' }}
                </span>

                <a routerLink="/profile" class="profile-switch-chip" title="View Public Instagram-style Profile">
                  <span>Public Profile &rarr;</span>
                </a>
              </div>

              <h1 class="user-heading">&#64;{{ storyService.currentPseudonym() }}</h1>
              <p class="user-sub">All your written memories, automated reviews, and published stories in one private place.</p>
            </div>
          </div>

          <!-- Right Column: Top Log Out + Primary Write Story -->
          <div class="header-actions-col">
            <!-- Top Right Log Out Button (Repositioned to far top-right edge away from Write Story) -->
            <button type="button" class="top-logout-btn" (click)="authService.logout()" title="Sign out of account">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Log Out</span>
            </button>

            <!-- Hero Write Story Button -->
            <a routerLink="/share" class="btn btn-primary btn-action">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>Write Story</span>
            </a>
          </div>
        </header>

        <!-- Stats Overview Bar (3 blocks: Published, Needs Attention, Reactions) -->
        <div class="stats-overview-grid">
          <div class="stat-box">
            <span class="stat-val">{{ publishedStories.length }}</span>
            <span class="stat-lbl">Published</span>
          </div>
          <div class="stat-box">
            <span class="stat-val rejected-color">{{ rejectedStories.length }}</span>
            <span class="stat-lbl">Needs Attention</span>
          </div>
          <div class="stat-box">
            <span class="stat-val">{{ totalReactions }}</span>
            <span class="stat-lbl">Total Reactions</span>
          </div>
        </div>

        <!-- Tab Filters (Published vs Needs Edit / Rejected) -->
        <div class="tabs-nav-bar">
          <button 
            class="tab-btn" 
            [class.active]="selectedTab === 'published'"
            (click)="selectedTab = 'published'">
            Published ({{ publishedStories.length }})
          </button>
          <button 
            class="tab-btn" 
            [class.active]="selectedTab === 'rejected'"
            (click)="selectedTab = 'rejected'">
            Needs Edit / Rejected ({{ rejectedStories.length }})
          </button>
        </div>

        <!-- Stories Content List -->
        <div class="stories-list-container">
          <!-- Published Tab -->
          @if (selectedTab === 'published') {
            @if (publishedStories.length > 0) {
              <div class="story-items-list">
                @for (story of publishedStories; track story.id) {
                  <div class="my-story-card card-editorial">
                    <div class="story-item-top">
                      <div class="status-badge published">✓ Live in Archive</div>
                      <span class="story-date">Published {{ story.publishedAt || 'Recently' }}</span>
                    </div>

                    <div class="story-item-content">
                      <h3 class="story-title">{{ story.title }}</h3>
                      <p class="story-excerpt">{{ story.excerpt }}</p>
                    </div>

                    <div class="story-item-footer">
                      <div class="reactions-count-row">
                        <span>🤝 {{ story.reactions.relatable }} Relatable</span>
                        <span>🖤 {{ story.reactions.feltThis }} Felt This</span>
                        <span>🫂 {{ story.reactions.support }} Support</span>
                      </div>

                      <div class="action-buttons-group">
                        <a [routerLink]="['/stories', story.id]" class="btn btn-secondary btn-sm">View Story</a>
                        <button class="btn btn-ghost btn-sm" (click)="openEditModal(story)">Edit</button>
                        <button class="btn btn-ghost btn-sm text-danger" (click)="onDelete(story.id)">Delete</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-tab-box">
                <p>You have no published stories yet.</p>
                <a routerLink="/share" class="btn btn-primary">Share your first story</a>
              </div>
            }
          }

          <!-- Rejected / Needs Edit Tab -->
          @if (selectedTab === 'rejected') {
            @if (rejectedStories.length > 0) {
              <div class="story-items-list">
                @for (story of rejectedStories; track story.id) {
                  <div class="my-story-card card-editorial rejected-border">
                    <div class="story-item-top">
                      <div class="status-badge rejected">⚠️ Action Needed</div>
                      <span class="story-date">Reviewed Automatically</span>
                    </div>

                    <div class="story-item-content">
                      <h3 class="story-title">{{ story.title }}</h3>
                      <p class="story-excerpt">{{ story.excerpt }}</p>
                    </div>

                    <div class="rejection-reason-callout">
                      <strong>AI Safety Notice:</strong>
                      <p>{{ story.rejectionReason || 'Flagged for potential identifying details or community guideline violation. Edit to resolve.' }}</p>
                    </div>

                    <div class="story-item-footer">
                      <span class="guidelines-link-hint">Review our <a routerLink="/guidelines">Community Guidelines</a></span>
                      <div class="action-buttons-group">
                        @if (story.appealStatus === 'PENDING') {
                          <span class="appeal-badge pending">⚖️ Appeal Pending Review</span>
                        } @else if (story.appealStatus === 'APPROVED') {
                          <span class="appeal-badge approved">✓ Appeal Approved</span>
                        } @else {
                          <button class="btn btn-secondary btn-sm appeal-btn" (click)="openAppealModal(story)">
                            ⚖️ Appeal Decision
                          </button>
                        }
                        <button class="btn btn-primary btn-sm" (click)="openEditModal(story)">Edit & Resubmit</button>
                        <button class="btn btn-ghost btn-sm text-danger" (click)="onDelete(story.id)">Delete Draft</button>
                      </div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="empty-tab-box">
                <p>No rejected submissions. All your stories meet our guidelines!</p>
              </div>
            }
          }
        </div>

        <!-- Safe Bottom Account Footer -->
        <div class="workspace-account-footer">
          <span>Signed in as <strong>{{ authService.currentUser()?.email || 'wanderer42@alumni.ac.in' }}</strong></span>
          <button type="button" class="btn-logout-link" (click)="authService.logout()">
            Log out of &#64;{{ storyService.currentPseudonym() }}
          </button>
        </div>
      </div>
    </div>

    <!-- APPEAL DISPUTE MODAL -->
    @if (selectedAppealStory) {
      <div class="modal-backdrop fade-in" (click)="closeAppealModal()">
        <div class="appeal-modal-card scale-in" (click)="$event.stopPropagation()">
          <div class="appeal-modal-header">
            <div>
              <span class="eyebrow-tag">Dispute Resolution</span>
              <h3 class="appeal-modal-title">Appeal AI Safety Flag</h3>
            </div>
            <button class="close-modal-btn" (click)="closeAppealModal()">✕</button>
          </div>

          <div class="appeal-modal-body">
            <div class="appeal-story-summary">
              <div class="summary-title"><strong>Headline:</strong> {{ selectedAppealStory.title }}</div>
              <div class="appeal-flag-reason">
                <span class="flag-icon">⚠️</span>
                <span>{{ selectedAppealStory.rejectionReason || selectedAppealStory.moderationNote || 'Flagged by automated safety filters.' }}</span>
              </div>
            </div>

            <p class="appeal-guide-text">
              Our safety filters sometimes flag innocent locations (e.g. <em>Anand</em>, Gujarat), creative metaphors, or fictional characters. Explain the context below for our editorial team to review and overrule the AI flag.
            </p>

            <div class="appeal-field-group">
              <label class="form-label">Why should this story be approved?</label>
              <textarea 
                class="form-textarea appeal-textarea"
                [(ngModel)]="appealReason"
                placeholder="Explain why this content adheres to guidelines (e.g. 'Anand is a campus town, not a person', or 'This is an allegorical story without identifying any student')..."
                rows="4"></textarea>
            </div>

            @if (appealSuccessMessage) {
              <div class="appeal-success-banner fade-in">
                ✓ {{ appealSuccessMessage }}
              </div>
            }
          </div>

          <div class="appeal-modal-footer">
            <button type="button" class="btn btn-ghost" (click)="closeAppealModal()">Cancel</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              [disabled]="!appealReason.trim() || isSubmittingAppeal"
              (click)="submitAppeal()">
              {{ isSubmittingAppeal ? 'Submitting Appeal...' : 'Submit to Editorial Desk' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- EDIT & RESUBMIT STORY MODAL -->
    @if (selectedEditStory) {
      <div class="modal-backdrop fade-in" (click)="closeEditModal()">
        <div class="edit-modal-card scale-in" (click)="$event.stopPropagation()">
          <div class="edit-modal-header">
            <div>
              <span class="eyebrow-tag">{{ selectedEditStory.status === 'rejected' ? 'Revise & Resubmit' : 'Edit Story' }}</span>
              <h3 class="edit-modal-title">{{ selectedEditStory.status === 'rejected' ? 'Fix AI Safety Issues' : 'Edit Your Story' }}</h3>
            </div>
            <button class="close-modal-btn" (click)="closeEditModal()" title="Close">✕</button>
          </div>

          <div class="edit-modal-body">
            <!-- AI Warning notice if story was flagged -->
            @if (selectedEditStory.status === 'rejected' || selectedEditStory.rejectionReason) {
              <div class="edit-safety-warning-banner">
                <div class="warning-banner-top">
                  <span class="warning-icon">⚠️</span>
                  <strong class="warning-title">AI Safety Notice</strong>
                </div>
                <p class="warning-text">
                  {{ selectedEditStory.rejectionReason || selectedEditStory.moderationNote || 'Contains identifying personal details or guideline violations.' }}
                </p>
                <div class="warning-advice">
                  💡 <strong>Tip:</strong> Remove any real personal names (e.g. your name or friends' names), phone numbers, or room numbers to protect campus anonymity.
                </div>
              </div>
            }

            <!-- Title Field -->
            <div class="form-group">
              <label class="form-label">Headline / Title</label>
              <input 
                type="text" 
                class="form-input edit-title-input" 
                [(ngModel)]="editTitle" 
                placeholder="Enter story title..."
                maxlength="150">
            </div>

            <!-- Content Field -->
            <div class="form-group">
              <div class="label-row">
                <label class="form-label">Story Narrative</label>
                <span class="char-counter">{{ editContent.length }} characters</span>
              </div>
              <textarea 
                class="form-textarea edit-content-textarea" 
                [(ngModel)]="editContent" 
                rows="7"
                placeholder="Share what happened without naming real people..."></textarea>
            </div>

            <!-- Pillar & Category Selectors -->
            <div class="form-row-2col">
              <div class="form-group">
                <label class="form-label">Emotional Pillar</label>
                <select class="form-select" [(ngModel)]="editPillar">
                  <option value="lived">The Life I Actually Lived</option>
                  <option value="imagined">The Life I Imagined</option>
                  <option value="unsaid">Things I Never Said</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Category</label>
                <select class="form-select" [(ngModel)]="editCategorySlug">
                  @for (cat of storyService.categories(); track cat.slug) {
                    <option [value]="cat.slug">{{ cat.name }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- Tag Chips Input -->
            <div class="form-group">
              <label class="form-label">Tags</label>
              <div class="tags-container-box">
                @for (tag of editTags; track $index) {
                  <span class="tag-chip">
                    #{{ tag }}
                    <button type="button" class="tag-chip-remove" (click)="removeEditTag($index)">✕</button>
                  </span>
                }
                <input 
                  type="text" 
                  class="tag-inline-input"
                  [(ngModel)]="editTagInput" 
                  (keydown)="onEditTagKeydown($event)" 
                  placeholder="Type tag & press Enter...">
              </div>
            </div>

            <!-- Error / Status Message -->
            @if (editErrorMessage) {
              <div class="edit-error-banner fade-in">
                ⚠️ {{ editErrorMessage }}
              </div>
            }
          </div>

          <div class="edit-modal-footer">
            <button type="button" class="btn btn-ghost" (click)="closeEditModal()" [disabled]="isSavingEdit">
              Cancel
            </button>
            <button 
              type="button" 
              class="btn btn-primary" 
              (click)="saveStoryEdit()" 
              [disabled]="isSavingEdit || !editTitle.trim() || editContent.trim().length < 20">
              @if (isSavingEdit) {
                <span class="saving-spinner"></span>
                <span>Verifying with AI Engine...</span>
              } @else {
                <span>{{ selectedEditStory.status === 'rejected' ? 'Re-Submit & Verify' : 'Save Changes' }}</span>
              }
            </button>
          </div>
        </div>
      </div>
    }

    <!-- AVATAR ACTION SHEET / POPUP (View, Change, Remove) -->
    @if (isAvatarMenuOpen()) {
      <div class="modal-backdrop fade-in" (click)="closeAvatarMenu()">
        <div class="avatar-action-sheet scale-in" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3 class="sheet-title">Profile Photo</h3>
            <p class="sheet-sub">&#64;{{ storyService.currentPseudonym() }}</p>
          </div>

          <div class="sheet-options-list">
            <!-- 1. View Photo (if user has photo) -->
            @if (authService.currentUser()?.avatarUrl) {
              <button type="button" class="sheet-option-btn primary-action" (click)="viewPhoto()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>View Profile Photo</span>
              </button>
            }

            <!-- 2. Upload / Change Photo -->
            <button type="button" class="sheet-option-btn" (click)="triggerPhotoUpload(avatarFileInput)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
              <span>{{ authService.currentUser()?.avatarUrl ? 'Change Profile Photo' : 'Upload Profile Photo' }}</span>
            </button>

            <!-- 3. Remove Photo (if user has photo) -->
            @if (authService.currentUser()?.avatarUrl) {
              <button type="button" class="sheet-option-btn text-danger" (click)="removePhoto()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                <span>Remove Current Photo</span>
              </button>
            }
          </div>

          <div class="sheet-footer">
            <button type="button" class="sheet-cancel-btn" (click)="closeAvatarMenu()">
              Cancel
            </button>
          </div>
        </div>
      </div>
    }

    <!-- FULL PHOTO VIEWER LIGHTBOX MODAL -->
    @if (isPhotoViewerOpen() && authService.currentUser()?.avatarUrl) {
      <div class="photo-viewer-backdrop fade-in" (click)="closePhotoViewer()">
        <div class="photo-viewer-card scale-in" (click)="$event.stopPropagation()">
          <div class="viewer-header">
            <div class="viewer-user-tag">
              <span class="viewer-handle">&#64;{{ storyService.currentPseudonym() }}</span>
              <span class="viewer-sub">{{ authService.currentUser()?.email }}</span>
            </div>
            <button type="button" class="viewer-close-btn" (click)="closePhotoViewer()" title="Close">✕</button>
          </div>
          
          <div class="viewer-image-box">
            <img [src]="authService.currentUser()!.avatarUrl" alt="Full Profile" class="viewer-full-img">
          </div>

          <div class="viewer-footer-actions">
            <button type="button" class="btn btn-secondary btn-sm" (click)="triggerPhotoUpload(avatarFileInput); closePhotoViewer()">
              Change Photo
            </button>
            <button type="button" class="btn btn-ghost btn-sm text-danger" (click)="removePhoto(); closePhotoViewer()">
              Remove Photo
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .my-stories-page {
      padding: var(--space-2xl) 16px var(--space-4xl);
    }

    /* Dashboard Header */
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: var(--space-2xl);
      gap: 24px;
      position: relative;
    }

    .header-user-info {
      display: flex;
      align-items: center;
      gap: 18px;
      flex: 1;
      min-width: 0;
    }

    /* Profile Photo / Avatar with interactive click state */
    .user-avatar-wrapper {
      position: relative;
      width: 70px;
      height: 70px;
      flex-shrink: 0;
      cursor: pointer;
      border-radius: 50%;
      transition: transform 0.15s ease;
    }
    .user-avatar-wrapper:hover {
      transform: scale(1.05);
    }

    .user-avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-border);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    }

    .user-avatar-fallback {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: var(--color-accent-subtle);
      border: 2px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--color-accent-primary);
      font-size: 1.35rem;
    }

    .avatar-camera-btn {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background-color: var(--color-accent-primary);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--color-surface);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      transition: transform 0.15s ease;
    }
    .user-avatar-wrapper:hover .avatar-camera-btn {
      transform: scale(1.12);
    }

    .user-meta-details {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .user-badge-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .eyebrow-tag {
      font-size: 0.72rem;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--color-ink-muted);
      letter-spacing: 0.05em;
    }

    .user-email-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.75rem;
      background: var(--color-canvas);
      padding: 3px 10px;
      border-radius: 12px;
      color: var(--color-ink-secondary);
      border: 1px solid var(--color-border-subtle);
    }

    .profile-switch-chip {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--color-accent-primary);
      text-decoration: underline;
      display: inline-flex;
      align-items: center;
      padding: 2px 4px;
      transition: color 0.15s ease;
    }
    .profile-switch-chip:hover {
      color: #6E1A27;
    }

    .user-heading {
      font-size: 1.85rem;
      line-height: 1.15;
      margin: 2px 0 4px;
      color: var(--color-ink);
    }
    .user-sub {
      font-size: 0.88rem;
      color: var(--color-ink-secondary);
      margin: 0;
      max-width: 580px;
      line-height: 1.45;
    }

    /* Actions in header: Right Column with top-aligned Log Out and bottom-aligned Write Story */
    .header-actions-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      justify-content: space-between;
      min-height: 84px;
      gap: 16px;
      flex-shrink: 0;
    }

    .top-logout-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      font-weight: 600;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 14px;
      padding: 4px 12px;
      color: var(--color-ink-muted);
      cursor: pointer;
      transition: all 0.15s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
    }
    .top-logout-btn:hover {
      color: #C0392B;
      border-color: #E74C3C;
      background-color: #FFF5F5;
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(192, 57, 43, 0.12);
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 10px 18px;
      font-size: 0.92rem;
      white-space: nowrap;
    }

    /* Modal Backdrop & Animations */
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

    .fade-in {
      animation: fadeIn 0.2s ease-out;
    }
    .scale-in {
      animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleUp {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }

    /* Stats 3-column Grid */
    .stats-overview-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: var(--space-xl);
    }

    .stat-box {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 16px 18px;
      display: flex;
      flex-direction: column;
    }
    .stat-val {
      font-family: var(--font-serif);
      font-size: 1.7rem;
      font-weight: 700;
      color: var(--color-ink);
    }
    .rejected-color { color: #B91C1C; }
    .stat-lbl {
      font-size: 0.76rem;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--color-ink-muted);
      letter-spacing: 0.04em;
      margin-top: 2px;
    }

    /* Tabs */
    .tabs-nav-bar {
      display: flex;
      border-bottom: 1px solid var(--color-border);
      margin-bottom: 24px;
      gap: 24px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }
    .tab-btn {
      background: none;
      border: none;
      padding: 12px 4px;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-ink-secondary);
      cursor: pointer;
      position: relative;
      white-space: nowrap;
      transition: color 0.15s ease;
    }
    .tab-btn:hover {
      color: var(--color-ink);
    }
    .tab-btn.active {
      color: var(--color-accent-primary);
    }
    .tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2.5px;
      background-color: var(--color-accent-primary);
      border-radius: 2px 2px 0 0;
    }

    /* Story Card */
    .my-story-card {
      padding: 22px;
      margin-bottom: 20px;
      border-radius: var(--radius-lg);
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
    }
    .rejected-border {
      border-left: 4px solid #B91C1C;
    }

    .story-item-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .status-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .status-badge.published {
      background-color: #E8F8F0;
      color: #1E824C;
    }
    .status-badge.rejected {
      background-color: #FEE2E2;
      color: #B91C1C;
    }
    .story-date {
      font-size: 0.8rem;
      color: var(--color-ink-muted);
    }

    .tags-row {
      display: flex;
      gap: 8px;
      margin-bottom: 8px;
      flex-wrap: wrap;
    }
    .pillar-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 7px;
      border-radius: 3px;
      background: var(--color-canvas);
      color: var(--color-ink);
    }
    .category-pill {
      font-size: 0.7rem;
      color: var(--color-ink-muted);
      padding: 2px 0;
    }

    .story-title {
      font-size: 1.25rem;
      margin-bottom: 8px;
      line-height: 1.3;
      color: var(--color-ink);
    }
    .story-excerpt {
      font-family: var(--font-serif);
      font-size: 0.96rem;
      color: var(--color-ink-secondary);
      line-height: 1.55;
      margin-bottom: 16px;
    }

    .rejection-reason-callout {
      background-color: #FFF5F5;
      border: 1px solid #FED7D7;
      border-radius: var(--radius-sm);
      padding: 12px 14px;
      margin-bottom: 16px;
      font-size: 0.85rem;
      color: #9B2C2C;
    }
    .rejection-reason-callout strong {
      display: block;
      margin-bottom: 4px;
    }
    .rejection-reason-callout p {
      margin: 0;
      line-height: 1.45;
    }

    .story-item-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid var(--color-border-subtle);
      flex-wrap: wrap;
      gap: 12px;
    }

    .reactions-count-row {
      display: flex;
      gap: 12px;
      font-size: 0.82rem;
      color: var(--color-ink-secondary);
      flex-wrap: wrap;
    }

    .action-buttons-group {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .text-danger {
      color: #C0392B !important;
    }

    .guidelines-link-hint {
      font-size: 0.8rem;
      color: var(--color-ink-muted);
    }
    .guidelines-link-hint a {
      color: var(--color-accent-primary);
      text-decoration: underline;
    }

    .empty-tab-box {
      background-color: var(--color-surface);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-md);
      padding: 44px 24px;
      text-align: center;
    }
    .empty-tab-box p {
      margin-bottom: 16px;
    }

    /* Safe Bottom Account Footer */
    .workspace-account-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 28px 0 12px;
      margin-top: 40px;
      border-top: 1px solid var(--color-border-subtle);
      font-size: 0.86rem;
      color: var(--color-ink-muted);
      flex-wrap: wrap;
      gap: 12px;
    }
    .btn-logout-link {
      background: none;
      border: none;
      color: #C0392B;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      transition: background-color 0.15s ease;
    }
    .btn-logout-link:hover {
      background-color: #FEE2E2;
      text-decoration: underline;
    }

    /* Avatar Action Sheet Modal */
    .avatar-action-sheet {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 360px;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.2);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }
    .sheet-header {
      padding: 20px 24px 14px;
      text-align: center;
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .sheet-title {
      font-size: 1.15rem;
      margin: 0 0 4px 0;
      color: var(--color-ink);
    }
    .sheet-sub {
      font-size: 0.8rem;
      color: var(--color-ink-muted);
      margin: 0;
    }
    .sheet-options-list {
      display: flex;
      flex-direction: column;
    }
    .sheet-option-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      padding: 14px 24px;
      background: none;
      border: none;
      border-bottom: 1px solid var(--color-border-subtle);
      font-size: 0.92rem;
      font-weight: 600;
      color: var(--color-ink);
      cursor: pointer;
      text-align: left;
      transition: background-color 0.12s ease;
    }
    .sheet-option-btn:hover {
      background-color: var(--color-canvas);
    }
    .sheet-option-btn.primary-action {
      color: var(--color-accent-primary);
    }
    .sheet-option-btn.text-danger {
      color: #C0392B;
    }
    .sheet-footer {
      padding: 12px 16px;
      background-color: var(--color-canvas);
    }
    .sheet-cancel-btn {
      width: 100%;
      padding: 10px;
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--color-ink-secondary);
      cursor: pointer;
      transition: all 0.12s ease;
    }
    .sheet-cancel-btn:hover {
      background-color: var(--color-border-subtle);
      color: var(--color-ink);
    }

    /* Photo Viewer Modal Lightbox */
    .photo-viewer-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(18, 20, 24, 0.85);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
      padding: 16px;
      backdrop-filter: blur(5px);
    }
    .photo-viewer-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 440px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }
    .viewer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .viewer-user-tag {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .viewer-handle {
      font-size: 0.98rem;
      font-weight: 700;
      color: var(--color-ink);
    }
    .viewer-sub {
      font-size: 0.78rem;
      color: var(--color-ink-muted);
    }
    .viewer-close-btn {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-canvas);
      border: 1px solid var(--color-border);
      font-size: 0.9rem;
      color: var(--color-ink-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
    }
    .viewer-close-btn:hover {
      background-color: var(--color-accent-subtle);
      color: var(--color-accent-primary);
    }
    .viewer-image-box {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #0F1113;
      padding: 16px;
      min-height: 280px;
      max-height: 420px;
    }
    .viewer-full-img {
      max-width: 100%;
      max-height: 380px;
      object-fit: contain;
      border-radius: var(--radius-sm);
    }
    .viewer-footer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 20px;
      border-top: 1px solid var(--color-border-subtle);
      background-color: var(--color-canvas);
    }

    /* Mobile Responsive Polish (Phone Friendly) */
    @media (max-width: 640px) {
      .my-stories-page {
        padding: 16px 12px calc(72px + env(safe-area-inset-bottom, 0px));
      }
      .dashboard-header {
        flex-direction: column;
        align-items: stretch;
        gap: 16px;
        position: relative;
        padding-top: 32px;
      }
      .top-logout-btn {
        position: absolute;
        top: 0;
        right: 0;
      }
      .header-actions-col {
        width: 100%;
        align-items: stretch;
        min-height: auto;
      }
      .header-actions-col .btn-action {
        width: 100%;
        justify-content: center;
      }
      .stats-overview-grid {
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
      }
      .stat-box {
        padding: 12px 10px;
      }
      .stat-val {
        font-size: 1.35rem;
      }
      .stat-lbl {
        font-size: 0.68rem;
      }
      .my-story-card {
        padding: 16px 14px;
        border-radius: var(--radius-md);
      }
      .story-item-footer {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .action-buttons-group {
        width: 100%;
        justify-content: flex-end;
      }
      .workspace-account-footer {
        flex-direction: column;
        align-items: flex-start;
      }

      /* Bottom Sheet Avatar Sheet on Mobile */
      .modal-backdrop {
        padding: 0;
        align-items: flex-end;
      }
      .avatar-action-sheet {
        border-radius: 20px 20px 0 0;
        width: 100%;
        max-width: 100%;
        border-bottom: none;
        border-left: none;
        border-right: none;
        animation: slideUpSheet 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .sheet-footer {
        padding-bottom: calc(14px + env(safe-area-inset-bottom, 8px));
      }
    }

    @keyframes slideUpSheet {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    @media (max-width: 420px) {
      .header-user-info {
        flex-direction: row;
        gap: 12px;
      }
      .user-avatar-wrapper {
        width: 58px;
        height: 58px;
      }
      .user-heading {
        font-size: 1.5rem;
      }
      .stats-overview-grid {
        grid-template-columns: 1fr 1fr 1fr;
      }
    }

    /* Appeal Dispute Styles */
    .appeal-btn {
      background-color: var(--color-canvas);
      border-color: var(--color-accent-border);
      color: var(--color-accent-primary);
    }
    .appeal-btn:hover {
      background-color: var(--color-accent-subtle);
    }
    .appeal-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.76rem;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: var(--radius-full);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .appeal-badge.pending {
      background-color: rgba(217, 119, 6, 0.12);
      color: #B45309;
      border: 1px solid rgba(217, 119, 6, 0.3);
    }
    .appeal-badge.approved {
      background-color: rgba(16, 185, 129, 0.12);
      color: #047857;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .appeal-modal-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 520px;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }
    .appeal-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 20px 24px;
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .appeal-modal-title {
      font-size: 1.25rem;
      font-family: var(--font-serif);
      margin: 4px 0 0;
    }
    .close-modal-btn {
      background: none;
      border: none;
      font-size: 1.1rem;
      cursor: pointer;
      color: var(--color-ink-muted);
      padding: 4px 8px;
    }
    .appeal-modal-body {
      padding: 20px 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .appeal-story-summary {
      background-color: var(--color-canvas);
      padding: 12px 14px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border-subtle);
      font-size: 0.88rem;
    }
    .appeal-flag-reason {
      margin-top: 6px;
      font-size: 0.82rem;
      color: #C0392B;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .appeal-guide-text {
      font-size: 0.86rem;
      color: var(--color-ink-secondary);
      line-height: 1.5;
      margin: 0;
    }
    .appeal-field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .appeal-textarea {
      width: 100%;
      padding: 10px 12px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--color-border);
      background-color: var(--color-canvas);
      font-family: var(--font-sans);
      font-size: 0.9rem;
      resize: vertical;
    }
    .appeal-textarea:focus {
      outline: none;
      border-color: var(--color-accent-primary);
    }
    .appeal-success-banner {
      background-color: rgba(16, 185, 129, 0.12);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #047857;
      padding: 10px 14px;
      border-radius: var(--radius-sm);
      font-size: 0.88rem;
      font-weight: 600;
    }
    .appeal-modal-footer {
      padding: 14px 24px;
      border-top: 1px solid var(--color-border-subtle);
      background-color: var(--color-canvas);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    /* Edit Story Modal */
    .edit-modal-card {
      background: var(--color-surface);
      border-radius: var(--radius-lg, 16px);
      width: 100%;
      max-width: 580px;
      max-height: 90vh;
      box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35);
      border: 1px solid var(--color-border);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    .edit-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 18px 24px;
      border-bottom: 1px solid var(--color-border-subtle);
      background-color: var(--color-surface);
    }
    .edit-modal-title {
      font-size: 1.25rem;
      font-family: var(--font-serif);
      margin: 4px 0 0;
      color: var(--color-ink);
    }
    .edit-modal-body {
      padding: 18px 24px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .edit-safety-warning-banner {
      background: rgba(239, 68, 68, 0.08);
      border: 1px solid rgba(239, 68, 68, 0.25);
      border-radius: var(--radius-sm, 8px);
      padding: 12px 14px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .warning-banner-top {
      display: flex;
      align-items: center;
      gap: 6px;
      color: #ef4444;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .warning-text {
      font-size: 0.825rem;
      color: var(--color-ink);
      margin: 0;
      line-height: 1.45;
    }
    .warning-advice {
      font-size: 0.775rem;
      color: var(--color-ink-muted);
      margin-top: 2px;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .form-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-ink);
    }
    .char-counter {
      font-size: 0.72rem;
      color: var(--color-ink-muted);
    }
    .form-input, .edit-title-input {
      background: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm, 8px);
      padding: 10px 12px;
      font-size: 0.95rem;
      color: var(--color-ink);
      font-family: inherit;
    }
    .form-input:focus, .edit-title-input:focus {
      outline: none;
      border-color: var(--color-accent-primary);
    }
    .form-textarea, .edit-content-textarea {
      background: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm, 8px);
      padding: 12px;
      font-size: 0.925rem;
      color: var(--color-ink);
      font-family: inherit;
      line-height: 1.5;
      resize: vertical;
    }
    .form-textarea:focus, .edit-content-textarea:focus {
      outline: none;
      border-color: var(--color-accent-primary);
    }
    .form-row-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    .form-select {
      background: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm, 8px);
      padding: 8px 10px;
      font-size: 0.85rem;
      color: var(--color-ink);
      font-family: inherit;
    }
    .form-select:focus {
      outline: none;
      border-color: var(--color-accent-primary);
    }
    .tags-container-box {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      background: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm, 8px);
      padding: 8px 10px;
      min-height: 42px;
    }
    .tag-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--color-accent-subtle);
      color: var(--color-accent-primary);
      padding: 3px 8px;
      border-radius: 16px;
      font-size: 0.775rem;
      font-weight: 600;
    }
    .tag-chip-remove {
      background: none;
      border: none;
      color: inherit;
      cursor: pointer;
      padding: 0;
      font-size: 0.75rem;
      opacity: 0.75;
    }
    .tag-chip-remove:hover {
      opacity: 1;
    }
    .tag-inline-input {
      flex: 1;
      min-width: 110px;
      background: none;
      border: none;
      color: var(--color-ink);
      font-size: 0.825rem;
      outline: none;
      font-family: inherit;
    }
    .edit-error-banner {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid #ef4444;
      color: #ef4444;
      border-radius: var(--radius-sm, 8px);
      padding: 10px 12px;
      font-size: 0.825rem;
      font-weight: 500;
    }
    .edit-modal-footer {
      padding: 14px 24px;
      border-top: 1px solid var(--color-border-subtle);
      background-color: var(--color-canvas);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .saving-spinner {
      width: 14px;
      height: 14px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
      display: inline-block;
      margin-right: 6px;
      vertical-align: middle;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    @media (max-width: 640px) {
      .edit-modal-card {
        max-height: 94vh;
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
        margin-top: auto;
      }
      .form-row-2col {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MyStoriesComponent {
  storyService = inject(StoryService);
  authService = inject(AuthService);
  selectedTab: 'published' | 'rejected' = 'published';

  // Avatar Menu & Photo Viewer Modals
  isAvatarMenuOpen = signal<boolean>(false);
  isPhotoViewerOpen = signal<boolean>(false);

  // Appeal Dispute Modal
  selectedAppealStory: Story | null = null;
  appealReason = '';
  isSubmittingAppeal = false;
  appealSuccessMessage = '';

  get publishedStories(): Story[] {
    return this.storyService.myStories().filter(s => s.status === 'published');
  }

  get rejectedStories(): Story[] {
    return this.storyService.myStories().filter(s => s.status === 'rejected' || s.status === 'pending');
  }

  openAppealModal(story: Story): void {
    this.selectedAppealStory = story;
    this.appealReason = '';
    this.appealSuccessMessage = '';
    this.isSubmittingAppeal = false;
  }

  closeAppealModal(): void {
    this.selectedAppealStory = null;
  }

  submitAppeal(): void {
    if (!this.selectedAppealStory || !this.appealReason.trim()) return;
    this.isSubmittingAppeal = true;
    const storyId = this.selectedAppealStory.id;
    this.storyService.submitAppeal(storyId, this.appealReason.trim()).then((success) => {
      this.isSubmittingAppeal = false;
      if (success) {
        if (this.selectedAppealStory) {
          this.selectedAppealStory.appealStatus = 'PENDING';
        }
        this.appealSuccessMessage = 'Your appeal has been lodged with the Editorial Desk. The reviewer will inspect the context and notify you.';
        setTimeout(() => {
          this.closeAppealModal();
        }, 2200);
      } else {
        alert('Could not submit appeal. Please try again.');
      }
    });
  }

  get totalReactions(): number {
    return this.publishedStories.reduce((acc, s) =>
      acc + s.reactions.relatable + s.reactions.feltThis + s.reactions.support + s.reactions.laugh, 0
    );
  }

  openAvatarMenu(): void {
    this.isAvatarMenuOpen.set(true);
  }

  closeAvatarMenu(): void {
    this.isAvatarMenuOpen.set(false);
  }

  viewPhoto(): void {
    this.closeAvatarMenu();
    this.isPhotoViewerOpen.set(true);
  }

  closePhotoViewer(): void {
    this.isPhotoViewerOpen.set(false);
  }

  triggerPhotoUpload(fileInput: HTMLInputElement): void {
    this.closeAvatarMenu();
    fileInput.click();
  }

  removePhoto(): void {
    this.closeAvatarMenu();
    this.authService.updateAvatar('');
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.authService.updateAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  // Edit & Resubmit Modal State
  selectedEditStory: Story | null = null;
  editTitle = '';
  editContent = '';
  editPillar: PillarType = 'lived';
  editCategorySlug = '';
  editTags: string[] = [];
  editTagInput = '';
  editContentWarning = '';
  editErrorMessage = '';
  isSavingEdit = false;

  openEditModal(story: Story): void {
    this.selectedEditStory = story;
    this.editTitle = story.title;
    this.editContent = story.content;
    this.editPillar = story.pillar;
    this.editCategorySlug = story.categorySlug;
    this.editTags = [...(story.tags || [])];
    this.editTagInput = '';
    this.editContentWarning = story.contentWarning || '';
    this.editErrorMessage = '';
    this.isSavingEdit = false;
  }

  closeEditModal(): void {
    this.selectedEditStory = null;
    this.editErrorMessage = '';
    this.isSavingEdit = false;
  }

  onEditTagKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = this.editTagInput.replace(/^[#,]/, '').trim();
      if (val && !this.editTags.includes(val) && this.editTags.length < 8) {
        this.editTags.push(val);
        this.editTagInput = '';
      }
    } else if (e.key === 'Backspace' && !this.editTagInput && this.editTags.length > 0) {
      this.editTags.pop();
    }
  }

  removeEditTag(index: number): void {
    this.editTags.splice(index, 1);
  }

  async saveStoryEdit(): Promise<void> {
    if (!this.selectedEditStory) return;
    if (!this.editTitle.trim() || this.editTitle.trim().length < 5) {
      this.editErrorMessage = 'Title must contain at least 5 characters.';
      return;
    }
    if (!this.editContent.trim() || this.editContent.trim().length < 20) {
      this.editErrorMessage = 'Story narrative must contain at least 20 characters.';
      return;
    }

    this.isSavingEdit = true;
    this.editErrorMessage = '';

    try {
      const updated = await this.storyService.updateMyStory(this.selectedEditStory.id, {
        title: this.editTitle,
        content: this.editContent,
        pillar: this.editPillar,
        categorySlug: this.editCategorySlug,
        contentWarning: this.editContentWarning,
        tags: this.editTags
      });

      if (updated.status === 'published') {
        this.selectedTab = 'published';
        this.closeEditModal();
      } else if (updated.status === 'rejected') {
        this.selectedEditStory = updated;
        this.editErrorMessage = updated.rejectionReason || 'Still flagged for guideline issues. Please remove identifying names.';
      } else {
        this.closeEditModal();
      }
    } catch (err: any) {
      this.editErrorMessage = err?.error?.detail || err?.message || 'Failed to update story. Please try again.';
    } finally {
      this.isSavingEdit = false;
    }
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this story?')) {
      this.storyService.deleteMyStory(id);
    }
  }
}
