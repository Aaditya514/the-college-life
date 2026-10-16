import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
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

        <!-- Top Instagram-style Profile Header Bar -->
        <header class="profile-header-bar">
          <div class="profile-top-title">
            <h2 class="top-handle">{{ cleanPseudonym() }}</h2>
          </div>

          <!-- Top Right Settings / Hamburger Button -->
          <button 
            type="button" 
            class="settings-menu-trigger" 
            (click)="openSettingsSheet()" 
            title="Settings & Options"
            aria-label="Settings">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="4" y1="12" x2="20" y2="12"/>
              <line x1="4" y1="18" x2="20" y2="18"/>
            </svg>
          </button>
        </header>

        <!-- Main Instagram-style Profile Card -->
        <section class="profile-hero-card">
          <!-- Row 1: Profile Photo on the Left, Stats Counters on the Right -->
          <div class="hero-top-row">
            <!-- Left: Avatar Circle with Ring and optional camera badge -->
            <div class="hero-avatar-col">
              <div 
                class="profile-avatar-ring" 
                (click)="openAvatarMenu()" 
                title="Click to view or change photo">
                @if (displayAvatarUrl()) {
                  <img [src]="displayAvatarUrl()!" alt="Profile Avatar" class="profile-avatar-img">
                } @else {
                  <div class="profile-avatar-fallback">
                    {{ (cleanPseudonym().slice(0, 2) || 'CL').toUpperCase() }}
                  </div>
                }
                @if (isOwnProfile()) {
                  <div class="avatar-camera-pill" title="Update photo">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </div>
                }
              </div>

              <!-- Hidden input for photo upload -->
              <input #fileInput type="file" accept="image/*" (change)="onAvatarSelected($event)" hidden>
            </div>

            <!-- Right: Stats Row (Stories & Reactions ONLY - No Saved count) -->
            <div class="profile-stats-counters">
              <div class="stat-pill">
                <span class="stat-num">{{ publishedStories().length }}</span>
                <span class="stat-text">stories</span>
              </div>
              <div class="stat-pill">
                <span class="stat-num">{{ totalReactionsEarned() }}</span>
                <span class="stat-text">reactions</span>
              </div>
            </div>
          </div>

          <!-- Row 2: Full-Width Username (No @) and Contributor Badge underneath ONLY if published stories > 0 -->
          <div class="profile-identity-block">
            <h1 class="profile-username">{{ cleanPseudonym() }}</h1>
            @if (publishedStories().length > 0) {
              <div class="contributor-badge-wrap">
                <span class="verified-alumni-badge" title="Active Contributor">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <span>Contributor</span>
                </span>
              </div>
            }
          </div>

          <!-- Row 3: Bio Text ONLY (no timestamp, no email address) -->
          @if (displayBio()) {
            <div class="profile-bio-box">
              <p class="bio-text">{{ displayBio() }}</p>
            </div>
          }

          <!-- Row 4: Clean Action Buttons (Edit Profile, or Follow if external author) -->
          <div class="profile-actions-bar">
            @if (isOwnProfile()) {
              <button type="button" class="btn btn-secondary btn-full-profile" (click)="openEditModal()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                <span>Edit Profile</span>
              </button>
            } @else {
              <button type="button" class="btn btn-primary btn-full-profile" (click)="toggleFollow()">
                {{ isFollowed() ? 'Following' : 'Follow Author' }}
              </button>
            }
          </div>
        </section>

        <!-- Toast Notification for Copying / Feedback -->
        @if (toastMessage()) {
          <div class="profile-toast fade-in">
            <span>{{ toastMessage() }}</span>
          </div>
        }

        <!-- 2 Clean Instagram-Style Tabs: [Posts Grid] and [Saved Stories] -->
        <nav class="profile-nav-tabs">
          <button 
            type="button" 
            class="tab-link" 
            [class.active]="activeTab() === 'grid'"
            (click)="activeTab.set('grid')"
            title="Stories Grid"
            aria-label="Stories">
            <!-- Grid 4-Squares Icon -->
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
            </svg>
          </button>

          @if (isOwnProfile()) {
            <button 
              type="button" 
              class="tab-link" 
              [class.active]="activeTab() === 'saved'"
              (click)="activeTab.set('saved')"
              title="Saved Stories"
              aria-label="Saved">
              <!-- Bookmark Ribbon Icon -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
              </svg>
            </button>
          }
        </nav>

        <!-- Tab 1: Stories Grid -->
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
              <p>When {{ cleanPseudonym() }} publishes memories, they will appear in this author grid.</p>
              @if (isOwnProfile()) {
                <a routerLink="/share" class="btn btn-primary" style="margin-top: 14px;">Publish your first story</a>
              }
            </div>
          }
        }

        <!-- Tab 2: Saved Archive -->
        @if (activeTab() === 'saved') {
          @if (storyService.savedStories().length > 0) {
            <div class="saved-preview-grid">
              @for (saved of storyService.savedStories(); track saved.id) {
                <div class="saved-preview-card card-editorial" [routerLink]="['/stories', saved.id]">
                  <span class="saved-badge">Saved</span>
                  <h4 class="saved-card-title">{{ saved.title }}</h4>
                  <p class="saved-card-excerpt">{{ saved.excerpt }}</p>
                  <span class="saved-author">{{ cleanString(saved.authorPseudonym) }}</span>
                </div>
              }
            </div>
            <div class="saved-cta-row">
              <a routerLink="/saved" class="btn btn-secondary">Open Full Saved Collection &rarr;</a>
            </div>
          } @else {
            <div class="empty-profile-box">
              <div class="empty-icon-bubble">🔖</div>
              <h3>No saved memories</h3>
              <p>Explore the archive and bookmark stories you resonate with to see them here.</p>
              <a routerLink="/explore" class="btn btn-secondary" style="margin-top: 14px;">Explore Stories</a>
            </div>
          }
        }

      </div>
    </div>

    <!-- SETTINGS / HAMBURGER BOTTOM SHEET MENU -->
    @if (isSettingsOpen()) {
      <div class="modal-backdrop fade-in" (click)="closeSettingsSheet()">
        <div class="settings-sheet scale-in" (click)="$event.stopPropagation()">
          <div class="sheet-handle-bar"></div>
          <div class="sheet-header">
            <h3 class="sheet-title">Settings & Activity</h3>
            <button type="button" class="close-modal-btn" (click)="closeSettingsSheet()">✕</button>
          </div>

          <div class="settings-items-list">
            @if (isOwnProfile()) {
              <!-- Edit Profile -->
              <button type="button" class="settings-item-row" (click)="openEditModal(); closeSettingsSheet()">
                <div class="settings-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </div>
                <div class="settings-item-content">
                  <span class="settings-item-label">Edit Profile</span>
                  <span class="settings-item-sub">Change pen name, bio & avatar</span>
                </div>
                <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              <!-- Change Password Option inside Edit Profile -->
              <button type="button" class="settings-item-row" (click)="openPasswordFromSettings()">
                <div class="settings-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <div class="settings-item-content">
                  <span class="settings-item-label">Change Password</span>
                  <span class="settings-item-sub">Update account password credentials</span>
                </div>
                <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>

              <!-- Workspace Desk -->
              <a routerLink="/my-stories" class="settings-item-row" (click)="closeSettingsSheet()">
                <div class="settings-item-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"/>
                    <path d="M6 6h10"/><path d="M6 10h10"/>
                  </svg>
                </div>
                <div class="settings-item-content">
                  <span class="settings-item-label">Workspace Desk</span>
                  <span class="settings-item-sub">Manage drafts and submissions</span>
                </div>
                <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </a>
            }

            <!-- Share Profile -->
            <button type="button" class="settings-item-row" (click)="shareProfile(); closeSettingsSheet()">
              <div class="settings-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
                </svg>
              </div>
              <div class="settings-item-content">
                <span class="settings-item-label">Share Profile</span>
                <span class="settings-item-sub">Copy public link to author profile</span>
              </div>
              <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>

            <!-- Theme Toggle -->
            <button type="button" class="settings-item-row" (click)="themeService.toggleTheme()">
              <div class="settings-item-icon">
                @if (themeService.isDark()) {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
                  </svg>
                } @else {
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                  </svg>
                }
              </div>
              <div class="settings-item-content">
                <span class="settings-item-label">Appearance</span>
                <span class="settings-item-sub">{{ themeService.isDark() ? 'Dark Theme (Tap for Light)' : 'Light Theme (Tap for Dark)' }}</span>
              </div>
              <span class="settings-toggle-badge">{{ themeService.isDark() ? 'Dark' : 'Light' }}</span>
            </button>

            @if (isOwnProfile()) {
              <div class="settings-divider"></div>

              <!-- Sign Out -->
              <button type="button" class="settings-item-row text-danger" (click)="handleLogout(); closeSettingsSheet()">
                <div class="settings-item-icon danger-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                </div>
                <div class="settings-item-content">
                  <span class="settings-item-label danger-text">Sign Out</span>
                  <span class="settings-item-sub">Log out of your account</span>
                </div>
              </button>
            }
          </div>
        </div>
      </div>
    }

    <!-- EDIT PROFILE MODAL (Includes Integrated Change Password Option) -->
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
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="editPseudonym" 
                placeholder="Pen Name without @"
                maxlength="30">
              <span class="form-hint">This name will appear on your stories and profile.</span>
            </div>

            <!-- Bio Field -->
            <div class="form-group">
              <label class="form-label">Bio (Public Reflection)</label>
              <textarea 
                class="form-textarea" 
                rows="3" 
                [(ngModel)]="editBio" 
                placeholder="Share your background, college thoughts, or what you learned..."
                maxlength="240"></textarea>
              <span class="form-hint">{{ 240 - editBio.length }} characters remaining</span>
            </div>

            <!-- Password Accordion / Section inside Edit Profile -->
            <div class="password-accordion-box">
              <button 
                type="button" 
                class="password-accordion-btn" 
                (click)="togglePasswordSection()">
                <div class="acc-btn-left">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <span>Change Password</span>
                </div>
                <svg 
                  class="acc-chevron" 
                  [class.rotated]="showPasswordSection()" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              @if (showPasswordSection()) {
                <div class="password-accordion-content fade-in">
                  @if (passwordErrorMessage()) {
                    <div class="pass-msg error-msg">{{ passwordErrorMessage() }}</div>
                  }
                  @if (passwordSuccessMessage()) {
                    <div class="pass-msg success-msg">{{ passwordSuccessMessage() }}</div>
                  }

                  <div class="form-group">
                    <label class="form-label">Current Password</label>
                    <input 
                      type="password" 
                      class="form-input" 
                      [(ngModel)]="currentPasswordInput" 
                      placeholder="Enter current password">
                  </div>

                  <div class="form-group">
                    <label class="form-label">New Password</label>
                    <input 
                      type="password" 
                      class="form-input" 
                      [(ngModel)]="newPasswordInput" 
                      placeholder="Minimum 6 characters">
                  </div>

                  <div class="form-group">
                    <label class="form-label">Confirm New Password</label>
                    <input 
                      type="password" 
                      class="form-input" 
                      [(ngModel)]="confirmNewPasswordInput" 
                      placeholder="Repeat new password">
                  </div>

                  <button 
                    type="button" 
                    class="btn btn-secondary btn-sm btn-update-pass" 
                    [disabled]="isSavingPassword()" 
                    (click)="submitChangePassword()">
                    {{ isSavingPassword() ? 'Updating Password...' : 'Update Password' }}
                  </button>
                </div>
              }
            </div>

          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-ghost" (click)="closeEditModal()">Cancel</button>
            <button type="button" class="btn btn-primary" (click)="saveProfile()">Save Profile</button>
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
            <p class="sheet-sub">{{ cleanPseudonym() }}</p>
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
              <span class="viewer-handle">{{ cleanPseudonym() }}</span>
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
      padding: var(--space-xl) 16px var(--space-4xl);
      min-height: 80vh;
    }

    .profile-container {
      max-width: 680px;
      margin: 0 auto;
    }

    /* Top Instagram-Style Header Bar */
    .profile-header-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 4px 0 18px 0;
      border-bottom: 1px solid var(--color-border-subtle);
      margin-bottom: 20px;
    }

    .top-handle {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0;
      letter-spacing: -0.01em;
    }

    .settings-menu-trigger {
      background: none;
      border: none;
      color: var(--color-ink);
      padding: 8px;
      border-radius: var(--radius-sm);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.15s ease, transform 0.15s ease;
    }
    .settings-menu-trigger:hover {
      background-color: var(--color-canvas);
    }
    .settings-menu-trigger:active {
      transform: scale(0.92);
    }

    /* Instagram-Style Profile Card */
    .profile-hero-card {
      display: flex;
      flex-direction: column;
      gap: 0;
      padding-bottom: 20px;
    }

    /* Top Row: Photo on Left, Stats on Right */
    .hero-top-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 28px;
    }

    .hero-avatar-col {
      flex-shrink: 0;
    }

    .profile-avatar-ring {
      position: relative;
      width: 86px;
      height: 86px;
      border-radius: 50%;
      cursor: pointer;
      padding: 3px;
      background: linear-gradient(135deg, #8B2635 0%, #D4A373 50%, #6E1A27 100%);
      box-shadow: 0 4px 14px rgba(139, 38, 53, 0.2);
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
      border: 2px solid var(--color-surface);
    }

    .profile-avatar-fallback {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: var(--color-accent-subtle);
      border: 2px solid var(--color-surface);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--color-accent-primary);
      font-size: 1.65rem;
    }

    .avatar-camera-pill {
      position: absolute;
      bottom: 0px;
      right: 0px;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background-color: var(--color-accent-primary);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--color-surface);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
    }

    /* Stats Counters Row (Stories & Reactions ONLY) */
    .profile-stats-counters {
      flex: 1;
      display: flex;
      justify-content: space-around;
      align-items: center;
      padding: 0 10px;
    }

    .stat-pill {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      gap: 2px;
    }

    .stat-num {
      font-weight: 700;
      font-size: 1.35rem;
      color: var(--color-ink);
      line-height: 1.1;
    }

    .stat-text {
      font-size: 0.85rem;
      color: var(--color-ink-secondary);
      font-weight: 500;
    }

    /* Row 2: Full-Width Username Line & Contributor Badge */
    .profile-identity-block {
      width: 100%;
      margin-top: 14px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }

    .profile-username {
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0;
      line-height: 1.2;
      width: 100%;
      text-align: left;
    }

    .contributor-badge-wrap {
      margin-top: 3px;
    }

    .verified-alumni-badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 3px 9px;
      background: #E8F8F0;
      color: #1E824C;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(30, 130, 76, 0.12);
    }

    /* Row 3: Bio Text ONLY (no timestamps, no email) */
    .profile-bio-box {
      margin-top: 8px;
      width: 100%;
      text-align: left;
    }

    .bio-text {
      font-size: 0.94rem;
      line-height: 1.5;
      color: var(--color-ink);
      margin: 0;
      white-space: pre-line;
    }

    /* Row 4: Clean Action Buttons */
    .profile-actions-bar {
      margin-top: 16px;
      width: 100%;
    }

    .btn-full-profile {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      border-radius: var(--radius-md);
      font-weight: 600;
      font-size: 0.92rem;
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

    /* 2 Icon-Only Instagram Tabs */
    .profile-nav-tabs {
      display: flex;
      border-bottom: 1px solid var(--color-border);
      margin-top: 14px;
      margin-bottom: 22px;
    }

    .tab-link {
      flex: 1;
      background: none;
      border: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 12px;
      color: var(--color-ink-muted);
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

    /* Stories Grid */
    .insta-stories-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
    }

    .grid-story-tile {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 18px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 180px;
      cursor: pointer;
      text-decoration: none;
      position: relative;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
    }
    .grid-story-tile:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
      border-color: var(--color-accent-primary);
    }

    .tile-title {
      font-family: var(--font-serif);
      font-size: 1.1rem;
      line-height: 1.35;
      color: var(--color-ink);
      margin: 0 0 8px 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tile-excerpt {
      font-size: 0.84rem;
      color: var(--color-ink-muted);
      line-height: 1.45;
      margin: 0 0 12px 0;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .tile-footer-hover {
      display: flex;
      align-items: center;
      gap: 8px;
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

    /* Saved Tab Preview Grid */
    .saved-preview-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-bottom: 20px;
    }

    .saved-preview-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 16px;
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
      font-size: 1.05rem;
      margin: 6px 0;
      color: var(--color-ink);
    }
    .saved-card-excerpt {
      font-size: 0.84rem;
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

    /* Empty Box */
    .empty-profile-box {
      text-align: center;
      padding: 44px 20px;
      background: var(--color-surface);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-lg);
    }
    .empty-icon-bubble {
      font-size: 2.6rem;
      margin-bottom: 10px;
    }

    /* Modal Backdrop */
    .modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(20, 22, 25, 0.65);
      backdrop-filter: blur(5px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
      padding: 16px;
    }

    /* Settings Sheet Modal */
    .settings-sheet {
      background-color: var(--color-surface);
      border-radius: 20px 20px 0 0;
      width: 100%;
      max-width: 440px;
      box-shadow: 0 -6px 36px rgba(0, 0, 0, 0.28);
      border: 1px solid var(--color-border);
      overflow: hidden;
      animation: slideUpSheet 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }

    .sheet-handle-bar {
      width: 40px;
      height: 4px;
      background-color: var(--color-border);
      border-radius: 2px;
      margin: 10px auto 4px auto;
    }

    .settings-items-list {
      padding: 8px 16px calc(16px + env(safe-area-inset-bottom, 8px));
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .settings-item-row {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 14px;
      border-radius: var(--radius-md);
      background: none;
      border: none;
      text-decoration: none;
      width: 100%;
      text-align: left;
      cursor: pointer;
      transition: background-color 0.15s ease;
      color: var(--color-ink);
      box-sizing: border-box;
    }
    .settings-item-row:hover {
      background-color: var(--color-canvas);
    }
    .settings-item-row:active {
      transform: scale(0.99);
    }

    .settings-item-icon {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background-color: var(--color-canvas);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-accent-primary);
      flex-shrink: 0;
      border: 1px solid var(--color-border-subtle);
    }

    .settings-item-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .settings-item-label {
      font-weight: 600;
      font-size: 0.95rem;
      color: var(--color-ink);
    }

    .settings-item-sub {
      font-size: 0.78rem;
      color: var(--color-ink-muted);
    }

    .settings-toggle-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 12px;
      background-color: var(--color-canvas);
      color: var(--color-ink);
      border: 1px solid var(--color-border-subtle);
    }

    .settings-divider {
      height: 1px;
      background-color: var(--color-border-subtle);
      margin: 6px 0;
    }

    .chevron {
      color: var(--color-ink-muted);
    }

    .danger-text {
      color: #DC2626 !important;
    }
    .danger-icon {
      color: #DC2626 !important;
      background-color: rgba(220, 38, 38, 0.08) !important;
      border-color: rgba(220, 38, 38, 0.2) !important;
    }

    /* Edit Profile Modal */
    .edit-modal-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      width: 100%;
      max-width: 480px;
      box-shadow: 0 20px 48px rgba(0, 0, 0, 0.2);
      overflow: hidden;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid var(--color-border-subtle);
      flex-shrink: 0;
    }
    .modal-title {
      font-size: 1.2rem;
      margin: 0;
      color: var(--color-ink);
      font-weight: 700;
    }
    .close-modal-btn {
      background: none;
      border: none;
      font-size: 1.15rem;
      color: var(--color-ink-muted);
      cursor: pointer;
      padding: 4px;
    }

    .modal-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow-y: auto;
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

    /* Password Accordion inside Edit Profile */
    .password-accordion-box {
      border: 1px solid var(--color-border-subtle);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-canvas);
    }

    .password-accordion-btn {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      background: none;
      border: none;
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--color-ink);
      cursor: pointer;
    }
    .acc-btn-left {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--color-ink);
    }
    .acc-chevron {
      color: var(--color-ink-muted);
      transition: transform 0.2s ease;
    }
    .acc-chevron.rotated {
      transform: rotate(180deg);
    }

    .password-accordion-content {
      padding: 14px;
      border-top: 1px solid var(--color-border-subtle);
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: var(--color-surface);
    }

    .btn-update-pass {
      margin-top: 4px;
      align-self: flex-start;
    }

    .pass-msg {
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 0.84rem;
    }
    .error-msg {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #ef4444;
    }
    .success-msg {
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      color: #16a34a;
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 20px;
      border-top: 1px solid var(--color-border-subtle);
      background: var(--color-canvas);
      flex-shrink: 0;
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
      padding: 16px 20px 12px;
      text-align: center;
      border-bottom: 1px solid var(--color-border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .sheet-title {
      font-size: 1.15rem;
      margin: 0;
      color: var(--color-ink);
      font-weight: 700;
    }
    .sheet-sub {
      font-size: 0.8rem;
      color: var(--color-ink-muted);
      margin: 0;
    }

    .sheet-options-list {
      padding: 8px 0;
      display: flex;
      flex-direction: column;
    }
    .sheet-option-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 20px;
      background: none;
      border: none;
      font-size: 0.95rem;
      color: var(--color-ink);
      cursor: pointer;
      text-align: left;
      width: 100%;
      transition: background-color 0.15s ease;
    }
    .sheet-option-btn:hover {
      background-color: var(--color-canvas);
    }
    .sheet-option-btn.primary-action {
      font-weight: 600;
      color: var(--color-accent-primary);
    }
    .sheet-option-btn.text-danger {
      color: #DC2626;
    }

    .sheet-footer {
      padding: 10px 16px;
      border-top: 1px solid var(--color-border-subtle);
      background: var(--color-canvas);
    }
    .sheet-cancel-btn {
      width: 100%;
      padding: 10px;
      border: none;
      background: none;
      font-weight: 600;
      font-size: 0.92rem;
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
      background-color: rgba(10, 12, 14, 0.88);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2100;
      padding: 16px;
    }
    .photo-viewer-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      width: 100%;
      max-width: 440px;
      box-shadow: 0 24px 64px rgba(0, 0, 0, 0.45);
      border: 1px solid var(--color-border);
      overflow: hidden;
    }
    .viewer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .viewer-user-tag {
      display: flex;
      flex-direction: column;
    }
    .viewer-handle {
      font-weight: 700;
      font-size: 0.95rem;
      color: var(--color-ink);
    }
    .viewer-sub {
      font-size: 0.76rem;
      color: var(--color-ink-muted);
    }
    .viewer-close-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: var(--color-ink-muted);
      cursor: pointer;
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
      padding: 12px 18px;
      border-top: 1px solid var(--color-border-subtle);
      background-color: var(--color-canvas);
    }

    /* Animations */
    .fade-in {
      animation: fadeIn 0.18s ease-out;
    }
    .scale-in {
      animation: scaleUp 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes scaleUp {
      from { transform: scale(0.96); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
    @keyframes slideUpSheet {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }

    /* Responsive Mobile Layout */
    @media (max-width: 768px) {
      .profile-page {
        padding: 12px 14px calc(72px + env(safe-area-inset-bottom, 0px));
      }
      .profile-header-bar {
        padding-top: 2px;
        margin-bottom: 14px;
      }
      .hero-top-row {
        gap: 20px;
      }
      .profile-avatar-ring {
        width: 80px;
        height: 80px;
      }
      .profile-username {
        font-size: 1.25rem;
      }
      .stat-num {
        font-size: 1.2rem;
      }
      .stat-text {
        font-size: 0.8rem;
      }
      .insta-stories-grid {
        grid-template-columns: 1fr;
        gap: 12px;
      }
      .saved-preview-grid {
        grid-template-columns: 1fr;
        gap: 12px;
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
      .settings-sheet {
        border-radius: 20px 20px 0 0;
        width: 100%;
        max-width: 100%;
        border-bottom: none;
        border-left: none;
        border-right: none;
      }
      .modal-footer {
        padding-bottom: calc(16px + env(safe-area-inset-bottom, 8px));
      }
      .sheet-footer {
        padding-bottom: calc(14px + env(safe-area-inset-bottom, 8px));
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  storyService = inject(StoryService);
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  // Active tab in profile: strictly 'grid' (posts) or 'saved'
  activeTab = signal<'grid' | 'saved'>('grid');

  // Author handle from route param (optional)
  routeHandle = signal<string | null>(null);

  // Settings Bottom Sheet Menu
  isSettingsOpen = signal<boolean>(false);

  // Edit Profile Modal
  isEditModalOpen = signal<boolean>(false);
  editPseudonym = '';
  editBio = '';

  // Password section inside Edit Profile
  showPasswordSection = signal<boolean>(false);
  isSavingPassword = signal<boolean>(false);
  currentPasswordInput = '';
  newPasswordInput = '';
  confirmNewPasswordInput = '';
  passwordErrorMessage = signal<string | null>(null);
  passwordSuccessMessage = signal<string | null>(null);

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
    const current = this.cleanString(this.storyService.currentPseudonym()).toLowerCase();
    return handle.toLowerCase() === current;
  });

  displayPseudonym = computed(() => {
    return this.routeHandle() || this.storyService.currentPseudonym();
  });

  cleanPseudonym = computed(() => {
    return this.cleanString(this.displayPseudonym());
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

  publishedStories = computed(() => {
    const handle = this.cleanPseudonym().toLowerCase();
    if (this.isOwnProfile()) {
      return this.storyService.myStories().filter(s => s.status === 'published');
    }
    return this.storyService.stories().filter(s => this.cleanString(s.authorPseudonym).toLowerCase() === handle);
  });

  totalReactionsEarned = computed(() => {
    return this.publishedStories().reduce((acc, s) =>
      acc + (s.reactions?.relatable || 0) + (s.reactions?.feltThis || 0) + (s.reactions?.support || 0) + (s.reactions?.laugh || 0), 0
    );
  });

  cleanString(str?: string): string {
    if (!str) return '';
    return str.replace(/^@/, '');
  }

  // Settings Bottom Sheet
  openSettingsSheet(): void {
    this.isSettingsOpen.set(true);
  }

  closeSettingsSheet(): void {
    this.isSettingsOpen.set(false);
  }

  openPasswordFromSettings(): void {
    this.closeSettingsSheet();
    this.openEditModal();
    this.showPasswordSection.set(true);
  }

  // Edit Profile Modal
  openEditModal(): void {
    const user = this.authService.currentUser();
    this.editPseudonym = this.cleanPseudonym();
    this.editBio = user?.bio || '';
    this.showPasswordSection.set(false);
    this.passwordErrorMessage.set(null);
    this.passwordSuccessMessage.set(null);
    this.currentPasswordInput = '';
    this.newPasswordInput = '';
    this.confirmNewPasswordInput = '';
    this.isEditModalOpen.set(true);
  }

  closeEditModal(): void {
    this.isEditModalOpen.set(false);
  }

  togglePasswordSection(): void {
    this.showPasswordSection.update(v => !v);
  }

  async saveProfile(): Promise<void> {
    const trimmedPseudo = this.cleanString(this.editPseudonym.trim());
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

  async submitChangePassword(): Promise<void> {
    this.passwordErrorMessage.set(null);
    this.passwordSuccessMessage.set(null);

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
        this.currentPasswordInput = '';
        this.newPasswordInput = '';
        this.confirmNewPasswordInput = '';
        this.passwordSuccessMessage.set('Password updated successfully!');
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

  // Avatar Actions
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
    const url = window.location.origin + '/profile/' + this.cleanPseudonym();
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

  handleLogout(): void {
    this.authService.logout();
    this.showToast('You have been logged out.');
    this.router.navigate(['/login']);
  }

  private showToast(msg: string): void {
    this.toastMessage.set(msg);
    setTimeout(() => {
      this.toastMessage.set(null);
    }, 3200);
  }
}
