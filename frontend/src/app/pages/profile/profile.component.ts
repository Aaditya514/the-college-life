import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StoryService } from '../../services/story.service';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { Story } from '../../models/story.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="profile-page">
      <div class="container profile-container">

        <!-- Top Instagram-style Profile Header -->
        <header class="profile-hero-card">
          <!-- Left: Big Avatar with Interactive Ring & Camera Icon -->
          <div class="hero-avatar-col">
            <div 
              class="profile-avatar-ring" 
              (click)="openAvatarMenu()" 
              title="Click to view, change, or remove photo">
              @if (displayAvatarUrl()) {
                <img [src]="displayAvatarUrl()!" alt="Profile Avatar" class="profile-avatar-img">
              } @else {
                <div class="profile-avatar-fallback">
                  {{ (displayPseudonym().slice(0, 2) || 'CL').toUpperCase() }}
                </div>
              }
              @if (isOwnProfile()) {
                <div class="avatar-camera-pill" title="Update photo">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                    <circle cx="12" cy="13" r="4"/>
                  </svg>
                </div>
              }
            </div>

            <!-- Hidden input for photo upload -->
            <input #fileInput type="file" accept="image/*" (change)="onAvatarSelected($event)" hidden>
          </div>

          <!-- Right: Profile Info, Bio, Stats, Actions -->
          <div class="hero-details-col">
            <!-- Top Username + Action Buttons Bar -->
            <div class="hero-action-bar">
              <div class="username-group">
                <h1 class="profile-username">&#64;{{ displayPseudonym() }}</h1>
                <span class="verified-alumni-badge" title="Verified Alumni Contributor">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>Contributor</span>
                </span>
              </div>

              <!-- Action Buttons -->
              <div class="profile-actions-row">
                @if (isOwnProfile()) {
                  <button type="button" class="btn btn-secondary btn-sm" (click)="openEditModal()">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <span>Edit Profile</span>
                  </button>

                  <button type="button" class="btn btn-secondary btn-sm" (click)="openPasswordModal()" title="Change Password">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <span>Change Password</span>
                  </button>

                  <a routerLink="/my-stories" class="btn btn-primary btn-sm btn-workspace" title="Go to Submissions Desk">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                      <path d="M6 6h10"/><path d="M6 10h10"/>
                    </svg>
                    <span>Workspace Desk</span>
                  </a>

                  <button type="button" class="btn btn-ghost btn-sm btn-share-icon" (click)="shareProfile()" title="Share Profile">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </button>

                  <button 
                    type="button" 
                    class="btn btn-secondary btn-sm btn-theme-toggle" 
                    (click)="themeService.toggleTheme()" 
                    [title]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
                    @if (themeService.isDark()) {
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
                      </svg>
                      <span>Light</span>
                    } @else {
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                      </svg>
                      <span>Dark</span>
                    }
                  </button>
                } @else {
                  <button type="button" class="btn btn-primary btn-sm" (click)="toggleFollow()">
                    {{ isFollowed() ? 'Following' : 'Follow Author' }}
                  </button>
                  <button type="button" class="btn btn-ghost btn-sm btn-share-icon" (click)="shareProfile()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                    </svg>
                  </button>
                  <button 
                    type="button" 
                    class="btn btn-secondary btn-sm btn-theme-toggle" 
                    (click)="themeService.toggleTheme()" 
                    [title]="themeService.isDark() ? 'Switch to Light Mode' : 'Switch to Dark Mode'">
                    @if (themeService.isDark()) {
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
                      </svg>
                    } @else {
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                      </svg>
                    }
                  </button>
                }
              </div>
            </div>

            <!-- Instagram-style Numeric Stats Row -->
            <div class="profile-stats-counters">
              <div class="stat-pill">
                <span class="stat-num">{{ publishedStories().length }}</span>
                <span class="stat-text">stories</span>
              </div>
              <div class="stat-pill">
                <span class="stat-num">{{ totalReactionsEarned() }}</span>
                <span class="stat-text">reactions</span>
              </div>
              <div class="stat-pill">
                <span class="stat-num">{{ storyService.savedCount() }}</span>
                <span class="stat-text">saved</span>
              </div>
            </div>

            <!-- Bio Block & Metadata -->
            <div class="profile-bio-box">
              <p class="bio-text">
                {{ displayBio() || 'Alumni recollecting the chapters that never made it to the yearbooks. Sharing anonymous memories and unconfessed regrets.' }}
              </p>

              <div class="bio-meta-row">
                <span class="meta-tag">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                    <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                  </svg>
                  {{ displayJoined() }}
                </span>

                @if (isOwnProfile() && authService.currentUser()?.email) {
                  <span class="meta-tag email-tag">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {{ authService.currentUser()!.email }}
                  </span>
                }
              </div>
            </div>
          </div>
        </header>

        <!-- Toast Notification for Copying / Feedback -->
        @if (toastMessage()) {
          <div class="profile-toast fade-in">
            <span>{{ toastMessage() }}</span>
          </div>
        }

        <!-- Instagram Profile Navigation Tabs -->
        <nav class="profile-nav-tabs">
          <button 
            type="button" 
            class="tab-link" 
            [class.active]="activeTab() === 'grid'"
            (click)="activeTab.set('grid')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>Stories Grid</span>
          </button>

          <button 
            type="button" 
            class="tab-link" 
            [class.active]="activeTab() === 'feed'"
            (click)="activeTab.set('feed')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            <span>Detailed Feed</span>
          </button>

          @if (isOwnProfile()) {
            <button 
              type="button" 
              class="tab-link" 
              [class.active]="activeTab() === 'saved'"
              (click)="activeTab.set('saved')">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
              <span>Saved Archive</span>
            </button>
          }

          <button 
            type="button" 
            class="tab-link" 
            [class.active]="activeTab() === 'about'"
            (click)="activeTab.set('about')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>About Persona</span>
          </button>
        </nav>

        <!-- Content Area: Tab 1: Instagram 3-Column Stories Grid -->
        @if (activeTab() === 'grid') {
          @if (publishedStories().length > 0) {
            <div class="insta-stories-grid">
              @for (story of publishedStories(); track story.id) {
                <article class="grid-story-tile card-editorial" [routerLink]="['/stories', story.id]">
                  <h3 class="tile-title">{{ story.title }}</h3>
                  <p class="tile-excerpt">{{ story.excerpt }}</p>

                  <div class="tile-footer-hover">
                    <span class="hover-stat">🤝 {{ story.reactions.relatable }}</span>
                    <span class="hover-stat">🖤 {{ story.reactions.feltThis }}</span>
                    <span class="hover-stat">🫂 {{ story.reactions.support }}</span>
                    <span class="read-hint">Read &rarr;</span>
                  </div>
                </article>
              }
            </div>
          } @else {
            <div class="empty-profile-box">
              <div class="empty-icon-bubble">📖</div>
              <h3>No public stories yet</h3>
              <p>When &#64;{{ displayPseudonym() }} publishes memories, they will appear in this author grid.</p>
              @if (isOwnProfile()) {
                <a routerLink="/share" class="btn btn-primary">Publish your first story</a>
              }
            </div>
          }
        }

        <!-- Content Area: Tab 2: Detailed Feed List -->
        @if (activeTab() === 'feed') {
          @if (publishedStories().length > 0) {
            <div class="feed-stories-list">
              @for (story of publishedStories(); track story.id) {
                <article class="feed-story-card card-editorial">
                  <div class="feed-card-header">
                    <span class="time-read">{{ story.readingTime }}</span>
                  </div>

                  <h2 class="feed-title">
                    <a [routerLink]="['/stories', story.id]">{{ story.title }}</a>
                  </h2>

                  <p class="feed-excerpt">{{ story.excerpt }}</p>

                  <div class="feed-card-footer">
                    <div class="reactions-chips">
                      <span class="r-chip">🤝 {{ story.reactions.relatable }} Relatable</span>
                      <span class="r-chip">🖤 {{ story.reactions.feltThis }} Felt This</span>
                      <span class="r-chip">🫂 {{ story.reactions.support }} Support</span>
                    </div>

                    <a [routerLink]="['/stories', story.id]" class="btn btn-secondary btn-sm">Read Full Story</a>
                  </div>
                </article>
              }
            </div>
          } @else {
            <div class="empty-profile-box">
              <p>No stories available in feed.</p>
            </div>
          }
        }

        <!-- Content Area: Tab 3: Saved Archive -->
        @if (activeTab() === 'saved') {
          @if (storyService.savedStories().length > 0) {
            <div class="saved-preview-grid">
              @for (saved of storyService.savedStories(); track saved.id) {
                <div class="saved-preview-card card-editorial" [routerLink]="['/stories', saved.id]">
                  <span class="saved-badge">Saved</span>
                  <h4 class="saved-card-title">{{ saved.title }}</h4>
                  <p class="saved-card-excerpt">{{ saved.excerpt }}</p>
                  <span class="saved-author">&#64;{{ saved.authorPseudonym }}</span>
                </div>
              }
            </div>
            <div class="saved-cta-row">
              <a routerLink="/saved" class="btn btn-secondary">Open Full Collections & Saved Desk &rarr;</a>
            </div>
          } @else {
            <div class="empty-profile-box">
              <div class="empty-icon-bubble">🔖</div>
              <h3>No saved memories</h3>
              <p>Explore the archive and bookmark stories you resonate with to see them here.</p>
              <a routerLink="/explore" class="btn btn-secondary">Explore Stories</a>
            </div>
          }
        }

        <!-- Content Area: Tab 4: About Persona -->
        @if (activeTab() === 'about') {
          <div class="about-persona-card card-editorial">
            <h3 class="about-title">About the Storyteller</h3>
            <p class="about-lead">
              {{ displayBio() }}
            </p>

            <div class="about-traits-grid">
              <div class="trait-box">
                <span class="trait-lbl">Pen Name</span>
                <span class="trait-val">&#64;{{ displayPseudonym() }}</span>
              </div>
              <div class="trait-box">
                <span class="trait-lbl">Identity Status</span>
                <span class="trait-val">Protected & Anonymous</span>
              </div>
              <div class="trait-box">
                <span class="trait-lbl">Member Since</span>
                <span class="trait-val">{{ displayJoined() }}</span>
              </div>
              <div class="trait-box">
                <span class="trait-lbl">Total Contributions</span>
                <span class="trait-val">{{ publishedStories().length }} Archived Memories</span>
              </div>
            </div>

            <div class="anonymity-notice">
              <strong>🔒 Anonymity Shield:</strong>
              <p>
                In accordance with our Community Honor Code, this author's real legal identity and college enrollment records are permanently decouple-encrypted. All stories are vetted to protect living individuals.
              </p>
            </div>
          </div>
        }

      </div>
    </div>

    <!-- EDIT PROFILE MODAL -->
    @if (isEditModalOpen()) {
      <div class="modal-backdrop fade-in" (click)="closeEditModal()">
        <div class="edit-modal-card scale-in" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Edit Profile</h3>
            <button type="button" class="close-modal-btn" (click)="closeEditModal()">✕</button>
          </div>

          <div class="modal-body">
            <!-- Pen Name Field -->
            <div class="form-group">
              <label class="form-label">Pen Name / Handle</label>
              <div class="input-prefix-wrap">
                <span class="input-prefix">&#64;</span>
                <input 
                  type="text" 
                  class="form-input with-prefix" 
                  [(ngModel)]="editPseudonym" 
                  placeholder="pen_name"
                  maxlength="30">
              </div>
              <span class="form-hint">This anonymous handle will appear on all your stories and comments.</span>
            </div>

            <!-- Bio Field -->
            <div class="form-group">
              <label class="form-label">Bio (Public Reflection)</label>
              <textarea 
                class="form-textarea" 
                rows="4" 
                [(ngModel)]="editBio" 
                placeholder="Share your college background, regrets, or what you learned after convocation..."
                maxlength="240"></textarea>
              <span class="form-hint">{{ 240 - editBio.length }} characters remaining</span>
            </div>


          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" (click)="closeEditModal()">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveProfile()">Save Changes</button>
          </div>
        </div>
      </div>
    }

    <!-- CHANGE PASSWORD MODAL -->
    @if (isPasswordModalOpen()) {
      <div class="modal-backdrop fade-in" (click)="closePasswordModal()">
        <div class="card-editorial edit-profile-modal scale-in" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">🔐 Change Password</h3>
            <button type="button" class="close-btn" (click)="closePasswordModal()">✕</button>
          </div>

          <div class="modal-body">
            @if (passwordErrorMessage()) {
              <div class="alert-banner error-banner fade-in" style="margin-bottom: 16px; padding: 10px 14px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 8px; color: #ef4444; font-size: 0.88rem;">
                <span>{{ passwordErrorMessage() }}</span>
              </div>
            }

            <form (ngSubmit)="submitChangePassword()" class="edit-profile-form">
              <div class="form-group">
                <label class="form-label" for="currentPassInput">Current Password</label>
                <input 
                  id="currentPassInput"
                  type="password" 
                  class="form-input" 
                  [(ngModel)]="currentPasswordInput" 
                  name="currentPass" 
                  placeholder="Enter current password" 
                  required>
              </div>

              <div class="form-group">
                <label class="form-label" for="newPassInput">New Password</label>
                <input 
                  id="newPassInput"
                  type="password" 
                  class="form-input" 
                  [(ngModel)]="newPasswordInput" 
                  name="newPass" 
                  placeholder="Minimum 6 characters" 
                  required>
              </div>

              <div class="form-group">
                <label class="form-label" for="confirmPassInput">Confirm New Password</label>
                <input 
                  id="confirmPassInput"
                  type="password" 
                  class="form-input" 
                  [(ngModel)]="confirmNewPasswordInput" 
                  name="confirmPass" 
                  placeholder="Repeat new password" 
                  required>
              </div>

              <div class="modal-footer" style="padding-top: 16px;">
                <button type="button" class="btn btn-ghost" (click)="closePasswordModal()" [disabled]="isSavingPassword()">Cancel</button>
                <button type="submit" class="btn btn-primary" [disabled]="isSavingPassword()">
                  {{ isSavingPassword() ? 'Updating...' : 'Update Password' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- AVATAR ACTION SHEET -->
    @if (isAvatarMenuOpen()) {
      <div class="modal-backdrop fade-in" (click)="closeAvatarMenu()">
        <div class="avatar-action-sheet scale-in" (click)="$event.stopPropagation()">
          <div class="sheet-header">
            <h3 class="sheet-title">Profile Photo</h3>
            <p class="sheet-sub">&#64;{{ displayPseudonym() }}</p>
          </div>

          <div class="sheet-options-list">
            @if (displayAvatarUrl()) {
              <button type="button" class="sheet-option-btn primary-action" (click)="viewPhoto()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
                <span>View Profile Photo</span>
              </button>
            }

            @if (isOwnProfile()) {
              <button type="button" class="sheet-option-btn" (click)="triggerPhotoUpload(fileInput)">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="4"/>
                </svg>
                <span>{{ displayAvatarUrl() ? 'Change Profile Photo' : 'Upload Profile Photo' }}</span>
              </button>

              @if (displayAvatarUrl()) {
                <button type="button" class="sheet-option-btn text-danger" (click)="removePhoto()">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  <span>Remove Current Photo</span>
                </button>
              }
            }
          </div>

          <div class="sheet-footer">
            <button type="button" class="sheet-cancel-btn" (click)="closeAvatarMenu()">Cancel</button>
          </div>
        </div>
      </div>
    }

    <!-- FULL PHOTO VIEWER LIGHTBOX MODAL -->
    @if (isPhotoViewerOpen() && displayAvatarUrl()) {
      <div class="photo-viewer-backdrop fade-in" (click)="closePhotoViewer()">
        <div class="photo-viewer-card scale-in" (click)="$event.stopPropagation()">
          <div class="viewer-header">
            <div class="viewer-user-tag">
              <span class="viewer-handle">&#64;{{ displayPseudonym() }}</span>
              <span class="viewer-sub">Author Profile Picture</span>
            </div>
            <button type="button" class="viewer-close-btn" (click)="closePhotoViewer()" title="Close">✕</button>
          </div>
          
          <div class="viewer-image-box">
            <img [src]="displayAvatarUrl()!" alt="Full Profile" class="viewer-full-img">
          </div>

          @if (isOwnProfile()) {
            <div class="viewer-footer-actions">
              <button type="button" class="btn btn-secondary btn-sm" (click)="triggerPhotoUpload(fileInput); closePhotoViewer()">
                Change Photo
              </button>
              <button type="button" class="btn btn-ghost btn-sm text-danger" (click)="removePhoto(); closePhotoViewer()">
                Remove Photo
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .profile-page {
      padding: var(--space-2xl) 16px var(--space-4xl);
      min-height: 80vh;
    }

    .profile-container {
      max-width: 920px;
      margin: 0 auto;
    }

    /* Instagram-Style Hero Header */
    .profile-hero-card {
      display: flex;
      gap: 36px;
      padding-bottom: 32px;
      border-bottom: 1px solid var(--color-border);
      align-items: flex-start;
    }

    .hero-avatar-col {
      flex-shrink: 0;
    }

    .profile-avatar-ring {
      position: relative;
      width: 120px;
      height: 120px;
      border-radius: 50%;
      cursor: pointer;
      padding: 4px;
      background: linear-gradient(135deg, #8B2635 0%, #D4A373 50%, #6E1A27 100%);
      box-shadow: 0 4px 16px rgba(139, 38, 53, 0.18);
      transition: transform 0.2s ease;
    }
    .profile-avatar-ring:hover {
      transform: scale(1.03);
    }

    .profile-avatar-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      background: var(--color-surface);
      border: 3px solid var(--color-surface);
    }

    .profile-avatar-fallback {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: var(--color-accent-subtle);
      border: 3px solid var(--color-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--color-accent-primary);
      font-size: 2.2rem;
    }

    .avatar-camera-pill {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background-color: var(--color-accent-primary);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--color-surface);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    }

    .hero-details-col {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .hero-action-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 14px;
    }

    .username-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .profile-username {
      font-size: 1.85rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0;
      line-height: 1.15;
    }

    .verified-alumni-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 8px;
      background: #E8F8F0;
      color: #1E824C;
      border-radius: 12px;
    }

    .profile-actions-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn-workspace {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn-share-icon {
      padding: 7px 10px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Counters Row (Instagram Style) */
    .profile-stats-counters {
      display: flex;
      align-items: center;
      gap: 28px;
    }

    .stat-pill {
      display: flex;
      align-items: baseline;
      gap: 6px;
      font-size: 0.95rem;
    }

    .stat-num {
      font-weight: 700;
      font-size: 1.15rem;
      color: var(--color-ink);
    }

    .stat-text {
      color: var(--color-ink-secondary);
    }

    /* Bio Block */
    .profile-bio-box {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .bio-text {
      font-size: 0.95rem;
      line-height: 1.55;
      color: var(--color-ink);
      margin: 0;
      white-space: pre-line;
      max-width: 650px;
    }

    .bio-meta-row {
      display: flex;
      align-items: center;
      gap: 14px;
      flex-wrap: wrap;
    }

    .meta-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.78rem;
      color: var(--color-ink-muted);
      font-weight: 500;
    }

    .email-tag {
      background: var(--color-canvas);
      padding: 2px 8px;
      border-radius: 10px;
      border: 1px solid var(--color-border-subtle);
    }

    /* Toast */
    .profile-toast {
      background: var(--color-ink);
      color: #FFFFFF;
      padding: 10px 18px;
      border-radius: var(--radius-md);
      font-size: 0.86rem;
      margin-top: 14px;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    /* Tabs Navigation (Instagram Style) */
    .profile-nav-tabs {
      display: flex;
      justify-content: center;
      gap: 36px;
      border-bottom: 1px solid var(--color-border);
      margin-top: 8px;
      margin-bottom: 28px;
    }

    .tab-link {
      background: none;
      border: none;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 14px 4px;
      font-size: 0.88rem;
      font-weight: 600;
      color: var(--color-ink-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      cursor: pointer;
      position: relative;
      transition: color 0.15s ease;
    }
    .tab-link:hover {
      color: var(--color-ink);
    }
    .tab-link.active {
      color: var(--color-accent-primary);
    }
    .tab-link.active::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2.5px;
      background-color: var(--color-accent-primary);
      border-radius: 2px 2px 0 0;
    }

    /* 3-Column Stories Grid (Instagram Style) */
    .insta-stories-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }

    .grid-story-tile {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 200px;
      cursor: pointer;
      text-decoration: none;
      position: relative;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    }
    .grid-story-tile:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
      border-color: var(--color-accent-primary);
    }

    .tile-top-pill {
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 8px;
      display: inline-block;
      color: var(--color-accent-primary);
    }

    .tile-title {
      font-family: var(--font-serif);
      font-size: 1.15rem;
      line-height: 1.35;
      color: var(--color-ink);
      margin: 0 0 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tile-excerpt {
      font-size: 0.85rem;
      color: var(--color-ink-muted);
      line-height: 1.45;
      margin: 0 0 14px 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tile-footer-hover {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-top: 10px;
      border-top: 1px solid var(--color-border-subtle);
      font-size: 0.78rem;
      color: var(--color-ink-muted);
    }
    .read-hint {
      margin-left: auto;
      font-weight: 600;
      color: var(--color-accent-primary);
    }

    /* Detailed Feed List */
    .feed-stories-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .feed-story-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 24px;
    }

    .feed-card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      flex-wrap: wrap;
    }

    .pillar-tag {
      font-size: 0.72rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      background: var(--color-canvas);
      color: var(--color-ink);
    }

    .story-category-tag {
      font-size: 0.75rem;
      color: var(--color-ink-muted);
    }

    .time-read {
      font-size: 0.75rem;
      color: var(--color-ink-subtle);
      margin-left: auto;
    }

    .feed-title {
      font-size: 1.35rem;
      margin: 0 0 8px;
    }
    .feed-title a {
      color: var(--color-ink);
      text-decoration: none;
    }
    .feed-title a:hover {
      color: var(--color-accent-primary);
    }

    .feed-excerpt {
      font-family: var(--font-serif);
      font-size: 0.98rem;
      color: var(--color-ink-secondary);
      line-height: 1.6;
      margin: 0 0 16px;
    }

    .feed-card-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid var(--color-border-subtle);
      flex-wrap: wrap;
      gap: 12px;
    }

    .reactions-chips {
      display: flex;
      gap: 10px;
      font-size: 0.82rem;
      color: var(--color-ink-secondary);
    }

    /* Saved Tab Preview Grid */
    .saved-preview-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }

    .saved-preview-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 18px;
      cursor: pointer;
      text-decoration: none;
      transition: transform 0.15s ease;
    }
    .saved-preview-card:hover {
      transform: translateY(-2px);
      border-color: var(--color-accent-primary);
    }
    .saved-badge {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--color-accent-primary);
      text-transform: uppercase;
    }
    .saved-card-title {
      font-size: 1.1rem;
      margin: 6px 0;
      color: var(--color-ink);
    }
    .saved-card-excerpt {
      font-size: 0.85rem;
      color: var(--color-ink-muted);
      line-height: 1.45;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      margin: 0 0 8px;
    }
    .saved-author {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--color-ink-secondary);
    }
    .saved-cta-row {
      text-align: center;
      margin-top: 16px;
    }

    /* About Tab */
    .about-persona-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 32px;
    }

    .about-title {
      font-size: 1.4rem;
      margin: 0 0 12px;
    }

    .about-lead {
      font-family: var(--font-serif);
      font-size: 1.1rem;
      line-height: 1.7;
      color: var(--color-ink-secondary);
      margin-bottom: 24px;
    }

    .about-traits-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }

    .trait-box {
      background: var(--color-canvas);
      padding: 14px 16px;
      border-radius: var(--radius-md);
      border: 1px solid var(--color-border-subtle);
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .trait-lbl {
      font-size: 0.72rem;
      text-transform: uppercase;
      font-weight: 700;
      color: var(--color-ink-muted);
      letter-spacing: 0.05em;
    }

    .trait-val {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-ink);
    }

    .anonymity-notice {
      background-color: #F8F9FA;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 16px 18px;
      font-size: 0.88rem;
      color: var(--color-ink-secondary);
      line-height: 1.5;
    }
    .anonymity-notice strong {
      color: var(--color-ink);
      display: block;
      margin-bottom: 4px;
    }
    .anonymity-notice p {
      margin: 0;
    }

    /* Empty Box */
    .empty-profile-box {
      text-align: center;
      padding: 48px 24px;
      background: var(--color-surface);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-lg);
    }
    .empty-icon-bubble {
      font-size: 2.8rem;
      margin-bottom: 12px;
    }

    /* Edit Profile Modal */
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

    .edit-modal-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.2);
      overflow: hidden;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 18px 24px;
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .modal-title {
      font-size: 1.25rem;
      margin: 0;
      color: var(--color-ink);
    }
    .close-modal-btn {
      background: none;
      border: none;
      font-size: 1.1rem;
      color: var(--color-ink-muted);
      cursor: pointer;
    }

    .modal-body {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-ink);
    }

    .input-prefix-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-prefix {
      position: absolute;
      left: 12px;
      font-weight: 700;
      color: var(--color-ink-muted);
    }
    .form-input.with-prefix {
      padding-left: 30px;
    }

    .form-input, .form-textarea {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 0.95rem;
      background: var(--color-canvas);
      color: var(--color-ink);
      font-family: inherit;
      outline: none;
      transition: border-color 0.15s ease;
      box-sizing: border-box;
    }
    .form-input:focus, .form-textarea:focus {
      border-color: var(--color-accent-primary);
      background: var(--color-surface);
    }

    .form-hint {
      font-size: 0.75rem;
      color: var(--color-ink-muted);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 16px 24px;
      border-top: 1px solid var(--color-border-subtle);
      background: var(--color-canvas);
    }

    /* Avatar Action Sheet */
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
    }

    /* Lightbox Photo Viewer */
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
      z-index: 2001;
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

    /* Animations */
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

    /* Responsive */
    @media (max-width: 768px) {
      .profile-page {
        padding: 16px 12px calc(72px + env(safe-area-inset-bottom, 0px));
      }
      .profile-hero-card {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 16px;
        padding-bottom: 20px;
      }
      .hero-details-col {
        align-items: center;
        width: 100%;
      }
      .hero-action-bar {
        flex-direction: column;
        align-items: center;
        gap: 12px;
        width: 100%;
      }
      .profile-actions-row {
        justify-content: center;
        width: 100%;
        flex-wrap: wrap;
        gap: 8px;
      }
      .profile-stats-counters {
        justify-content: center;
        gap: 18px;
        width: 100%;
      }
      .bio-meta-row {
        justify-content: center;
      }
      .insta-stories-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .saved-preview-grid {
        grid-template-columns: 1fr;
      }
      .about-traits-grid {
        grid-template-columns: 1fr;
      }

      /* Mobile Modal Bottom Sheets */
      .modal-backdrop {
        padding: 0;
        align-items: flex-end;
      }
      .edit-modal-card {
        border-radius: 20px 20px 0 0;
        width: 100%;
        max-width: 100%;
        border-bottom: none;
        border-left: none;
        border-right: none;
        animation: slideUpSheet 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
      .modal-footer {
        padding-bottom: calc(16px + env(safe-area-inset-bottom, 8px));
      }
      .sheet-footer {
        padding-bottom: calc(14px + env(safe-area-inset-bottom, 8px));
      }
    }

    @media (max-width: 480px) {
      .profile-avatar-ring {
        width: 90px;
        height: 90px;
      }
      .profile-username {
        font-size: 1.45rem;
      }
      .insta-stories-grid {
        grid-template-columns: 1fr;
      }
      .profile-nav-tabs {
        gap: 8px;
        overflow-x: auto;
        padding-bottom: 4px;
      }
      .tab-link {
        padding: 8px 10px;
      }
      .tab-link span {
        font-size: 0.76rem;
      }
    }

    @keyframes slideUpSheet {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `]
})
export class ProfileComponent implements OnInit {
  storyService = inject(StoryService);
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  route = inject(ActivatedRoute);

  // Active tab in profile
  activeTab = signal<'grid' | 'feed' | 'saved' | 'about'>('grid');

  // Author handle from route param (optional)
  routeHandle = signal<string | null>(null);

  // Edit Profile Modal
  isEditModalOpen = signal<boolean>(false);
  editPseudonym = '';
  editBio = '';

  // Change Password Modal
  isPasswordModalOpen = signal<boolean>(false);
  isSavingPassword = signal<boolean>(false);
  currentPasswordInput = '';
  newPasswordInput = '';
  confirmNewPasswordInput = '';
  passwordErrorMessage = signal<string | null>(null);

  // Avatar and Lightbox Modals
  isAvatarMenuOpen = signal<boolean>(false);
  isPhotoViewerOpen = signal<boolean>(false);

  // Toast feedback
  toastMessage = signal<string | null>(null);

  // Follow state for external author
  isFollowed = signal<boolean>(false);

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const handle = params['handle'];
      if (handle) {
        this.routeHandle.set(handle.replace(/^@/, ''));
      } else {
        this.routeHandle.set(null);
      }
    });
  }

  isOwnProfile = computed(() => {
    const handle = this.routeHandle();
    if (!handle) return true;
    const current = this.storyService.currentPseudonym().toLowerCase();
    return handle.toLowerCase() === current;
  });

  displayPseudonym = computed(() => {
    return this.routeHandle() || this.storyService.currentPseudonym();
  });

  displayAvatarUrl = computed(() => {
    if (this.isOwnProfile()) {
      return this.authService.currentUser()?.avatarUrl || '';
    }
    return '';
  });

  displayBio = computed(() => {
    if (this.isOwnProfile()) {
      return this.authService.currentUser()?.bio || 'Alumni recollecting the chapters that never made it to the yearbooks. Sharing anonymous memories and unconfessed regrets.';
    }
    return 'Anonymous storyteller contributing to the collective student archive.';
  });

  displayJoined = computed(() => {
    if (this.isOwnProfile()) {
      return this.authService.currentUser()?.joinedAt || 'Joined Archive';
    }
    return 'Active Contributor';
  });

  publishedStories = computed(() => {
    const handle = this.displayPseudonym().toLowerCase();
    if (this.isOwnProfile()) {
      return this.storyService.myStories().filter(s => s.status === 'published');
    }
    return this.storyService.stories().filter(s => s.authorPseudonym.toLowerCase() === handle);
  });

  totalReactionsEarned = computed(() => {
    return this.publishedStories().reduce((acc, s) =>
      acc + s.reactions.relatable + s.reactions.feltThis + s.reactions.support + s.reactions.laugh, 0
    );
  });

  openEditModal(): void {
    const user = this.authService.currentUser();
    this.editPseudonym = this.storyService.currentPseudonym();
    this.editBio = user?.bio || '';
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
  }

  async saveProfile(): Promise<void> {
    const trimmedPseudo = this.editPseudonym.trim().replace(/^@/, '');
    if (!trimmedPseudo || trimmedPseudo.length < 3) {
      alert('Pen name must be at least 3 characters long.');
      return;
    }

    const res = await this.authService.updateProfile({
      pseudonym: trimmedPseudo,
      bio: this.editBio.trim()
    });

    this.closeEditModal();
    if (res.success) {
      this.showToast('Profile updated successfully!');
    } else {
      this.showToast(res.error || 'Profile updated.');
    }
  }

  openPasswordModal(): void {
    this.currentPasswordInput = '';
    this.newPasswordInput = '';
    this.confirmNewPasswordInput = '';
    this.passwordErrorMessage.set(null);
    this.isPasswordModalOpen.set(true);
  }

  closePasswordModal(): void {
    this.isPasswordModalOpen.set(false);
    this.passwordErrorMessage.set(null);
  }

  async submitChangePassword(): Promise<void> {
    this.passwordErrorMessage.set(null);

    if (!this.currentPasswordInput) {
      this.passwordErrorMessage.set('Please enter your current password.');
      return;
    }
    if (!this.newPasswordInput || this.newPasswordInput.length < 6) {
      this.passwordErrorMessage.set('New password must be at least 6 characters.');
      return;
    }
    if (this.newPasswordInput !== this.confirmNewPasswordInput) {
      this.passwordErrorMessage.set('New passwords do not match.');
      return;
    }

    this.isSavingPassword.set(true);
    try {
      const res = await this.authService.changePassword(this.currentPasswordInput, this.newPasswordInput);
      if (res.success) {
        this.closePasswordModal();
        this.showToast('Password updated successfully!');
      } else {
        this.passwordErrorMessage.set(res.error || res.message || 'Failed to change password. Please check your current password.');
      }
    } catch (err: any) {
      this.passwordErrorMessage.set(err?.error?.message || err?.message || 'Error changing password.');
    } finally {
      this.isSavingPassword.set(false);
    }
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
    this.showToast('Profile photo removed.');
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
      this.showToast('Profile photo updated!');
    };
    reader.readAsDataURL(file);
  }

  shareProfile(): void {
    const url = window.location.origin + '/profile/' + this.displayPseudonym();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        this.showToast('Author profile link copied to clipboard!');
      });
    } else {
      this.showToast(`Profile: ${url}`);
    }
  }

  toggleFollow(): void {
    this.isFollowed.update(f => !f);
    this.showToast(this.isFollowed() ? 'Following author updates!' : 'Unfollowed author.');
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3200);
  }
}
