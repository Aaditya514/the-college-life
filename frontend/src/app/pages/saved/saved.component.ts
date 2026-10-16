import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StoryService } from '../../services/story.service';
import { StoryCardComponent } from '../../components/story-card/story-card.component';
import { SavedCollection, Story } from '../../models/story.model';

@Component({
  selector: 'app-saved',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, StoryCardComponent],
  template: `
    <div class="saved-page">
      <div class="container">
        
        <!-- Top Header (Instagram Style) -->
        <header class="saved-header">
          <div class="saved-header-top">
            <div class="header-title-group">
              <div class="saved-badge">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                </svg>
                <span>Private Archive</span>
              </div>
              <h1 class="saved-title">Saved</h1>
              <p class="saved-subtitle">
                Organize your bookmarked confessions, memories, and quiet reminders into custom collections.
              </p>
            </div>

            <!-- New Collection CTA Button -->
            <button class="btn btn-primary btn-new-col" (click)="openCreateModal()">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <span>New Collection</span>
            </button>
          </div>
        </header>

        <!-- VIEW 1: COLLECTIONS GRID OVERVIEW -->
        @if (currentView() === 'collections') {
          <section class="collections-overview fade-in">
            <div class="collections-grid">
              
              <!-- Card 1: All Posts (Default System Folder) -->
              <div class="collection-folder-card all-posts-card" (click)="selectCollection(null)">
                <div class="folder-cover">
                  <div class="cover-layers">
                    <div class="stack-layer layer-3"></div>
                    <div class="stack-layer layer-2"></div>
                    <div class="stack-layer layer-1">
                      <div class="cover-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                          <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="folder-info">
                  <h3 class="folder-name">All Posts</h3>
                  <span class="folder-count">{{ storyService.savedCount() }} {{ storyService.savedCount() === 1 ? 'story' : 'stories' }}</span>
                </div>
              </div>

              <!-- User Custom Collections -->
              @for (col of storyService.collections(); track col.id) {
                <div class="collection-folder-card" (click)="selectCollection(col.id)">
                  <div class="folder-cover custom-cover">
                    <span class="collection-emoji">{{ col.emoji }}</span>
                    <div class="card-action-overlay">
                      <button 
                        class="folder-act-btn edit-col-btn" 
                        (click)="openEditModal(col, $event)" 
                        title="Edit name and icon">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button 
                        class="folder-act-btn delete-col-btn" 
                        (click)="onDeleteCollection(col.id, $event)" 
                        title="Delete this collection">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div class="folder-info">
                    <h3 class="folder-name">{{ col.name }}</h3>
                    <span class="folder-count">{{ col.storyIds.length }} {{ col.storyIds.length === 1 ? 'story' : 'stories' }}</span>
                  </div>
                </div>
              }

              <!-- Add New Collection Card Tile -->
              <div class="collection-folder-card new-folder-tile" (click)="openCreateModal()">
                <div class="new-folder-inner">
                  <div class="plus-icon-box">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                  </div>
                  <span class="new-tile-label">New Collection</span>
                </div>
              </div>

            </div>
          </section>
        }

        <!-- VIEW 2: COLLECTION DETAIL / STORIES VIEW -->
        @if (currentView() === 'detail') {
          <section class="collection-detail-view fade-in">
            <!-- Back navigation & collection toolbar -->
            <div class="detail-nav-bar">
              <button class="back-to-cols-btn" (click)="backToCollections()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
                <span>All Collections</span>
              </button>

              <div class="detail-actions-right">
                @if (activeCollection()) {
                  <button class="btn btn-secondary btn-sm edit-collection-btn" (click)="openEditModal(activeCollection()!)">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    <span>Edit Collection</span>
                  </button>
                  <button class="btn btn-ghost btn-sm text-danger" (click)="onDeleteCollection(activeCollection()!.id)">
                    Delete
                  </button>
                }
              </div>
            </div>

            <!-- Collection Header Banner -->
            <div class="collection-banner">
              <div class="banner-title-row">
                @if (activeCollection()) {
                  <div 
                    class="banner-emoji-wrapper" 
                    (click)="openEditModal(activeCollection()!)" 
                    title="Click to edit icon & name">
                    <span class="banner-emoji">{{ activeCollection()!.emoji }}</span>
                    <span class="emoji-edit-badge" title="Change icon">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </span>
                  </div>
                  <div 
                    class="banner-title-wrapper" 
                    (click)="openEditModal(activeCollection()!)" 
                    title="Click to edit name & icon">
                    <h2 class="banner-title">{{ activeCollection()!.name }}</h2>
                    <span class="title-edit-pencil">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </span>
                  </div>
                } @else {
                  <span class="banner-icon">🔖</span>
                  <h2 class="banner-title">All Posts</h2>
                }
              </div>
              <p class="banner-subtitle">
                {{ activeStories().length }} {{ activeStories().length === 1 ? 'saved story' : 'saved stories' }}
                @if (activeCollection() && activeCollection()!.description) {
                  &bull; {{ activeCollection()!.description }}
                }
              </p>
            </div>

            <!-- Stories List -->
            @if (activeStories().length > 0) {
              <div class="collection-stories-feed">
                @for (story of activeStories(); track story.id) {
                  <div class="col-story-item">
                    <app-story-card [story]="story"></app-story-card>
                  </div>
                }
              </div>
            } @else {
              <!-- Empty Collection State -->
              <div class="empty-collection-box card-editorial text-center">
                <div class="empty-emoji">📂</div>
                <h3 class="empty-title">This collection is empty</h3>
                <p class="empty-desc">
                  @if (activeCollection()) {
                    Add stories to this collection anytime while browsing by tapping the 📁 folder icon on any saved post.
                  } @else {
                    You haven't bookmarked any stories yet. Explore confessions and tap the save icon to build your library.
                  }
                </p>
                <div class="empty-actions">
                  @if (activeCollection()) {
                    <button class="btn btn-secondary" (click)="selectCollection(null)">
                      View All Saved Posts
                    </button>
                    <a routerLink="/explore" class="btn btn-primary">Explore Stories</a>
                  } @else {
                    <a routerLink="/explore" class="btn btn-primary">Explore Stories</a>
                  }
                </div>
              </div>
            }
          </section>
        }

      </div>
    </div>

    <!-- MODAL: CREATE OR EDIT COLLECTION -->
    @if (isModalOpen()) {
      <div class="modal-backdrop fade-in" (click)="onBackdropClick($event)">
        <div class="collection-modal-card scale-in">
          
          <div class="modal-header">
            <span class="modal-badge">{{ modalMode() === 'edit' ? 'Edit' : 'Organize' }}</span>
            <h3 class="modal-heading">{{ modalMode() === 'edit' ? 'Edit Collection' : 'New Collection' }}</h3>
            <button class="close-modal-btn" (click)="closeModal()">✕</button>
          </div>

          <div class="modal-body">
            <!-- Live Preview -->
            <div class="collection-live-preview">
              <span class="preview-emoji">{{ formCollectionEmoji || '📁' }}</span>
              <div class="preview-text">
                <span class="preview-label">Live Preview</span>
                <span class="preview-title">{{ formCollectionName.trim() || 'Collection Name' }}</span>
              </div>
            </div>

            <!-- Name Input -->
            <div class="form-group">
              <label class="form-label">Collection Name</label>
              <input 
                type="text" 
                class="form-input" 
                [(ngModel)]="formCollectionName" 
                placeholder="e.g. FRNDS, Hostel Nights, Quiet Regrets..."
                maxlength="40"
                autofocus>
            </div>

            <!-- Emoji Preset Selector -->
            <div class="form-group">
              <label class="form-label">Choose Icon</label>
              <div class="emoji-picker-row">
                @for (em of presetEmojis; track em) {
                  <button 
                    type="button" 
                    class="emoji-chip" 
                    [class.selected]="formCollectionEmoji === em" 
                    (click)="formCollectionEmoji = em">
                    {{ em }}
                  </button>
                }
              </div>

              <!-- Custom Emoji Input -->
              <div class="custom-emoji-row">
                <span class="custom-emoji-label">Custom emoji / symbol:</span>
                <input 
                  type="text" 
                  class="custom-emoji-field" 
                  [(ngModel)]="formCollectionEmoji" 
                  placeholder="📁" 
                  maxlength="4"
                />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Cancel</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              [disabled]="!formCollectionName.trim()" 
              (click)="saveCollection()">
              {{ modalMode() === 'edit' ? 'Save Changes' : 'Create Collection' }}
            </button>
          </div>

        </div>
      </div>
    }
  `,
  styles: [`
    .saved-page {
      padding: 32px 16px 80px;
    }

    /* Header */
    .saved-header {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .saved-header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      flex-wrap: wrap;
      gap: 20px;
    }
    .saved-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-accent-primary);
      margin-bottom: 6px;
    }
    .saved-title {
      font-size: clamp(2.2rem, 4vw, 2.8rem);
      margin-bottom: 8px;
    }
    .saved-subtitle {
      font-size: 1rem;
      color: var(--color-ink-secondary);
      max-width: 580px;
      line-height: 1.5;
    }
    .btn-new-col {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: var(--radius-full);
      font-weight: 600;
    }

    /* Grid of Collections (Instagram Style) */
    .collections-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 24px;
      margin-top: 8px;
    }

    .collection-folder-card {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      display: flex;
      flex-direction: column;
    }
    .collection-folder-card:hover {
      transform: translateY(-3px);
      box-shadow: var(--shadow-card);
      border-color: #D4CCC1;
    }

    /* Cover Styling */
    .folder-cover {
      height: 170px;
      background: linear-gradient(135deg, #F9F5EC 0%, #EFE7DA 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .custom-cover {
      background: linear-gradient(135deg, #FAF7F2 0%, #EFE8DC 100%);
    }
    .collection-emoji {
      font-size: 3.5rem;
      user-select: none;
      transition: transform 0.2s ease;
    }
    .collection-folder-card:hover .collection-emoji {
      transform: scale(1.12);
    }

    /* All Posts Layer Stack Cover */
    .cover-layers {
      position: relative;
      width: 70px;
      height: 85px;
    }
    .stack-layer {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      background: #FFFFFF;
      border: 1px solid var(--color-border);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
    }
    .layer-3 {
      top: -8px;
      left: 8px;
      transform: rotate(6deg);
      opacity: 0.6;
    }
    .layer-2 {
      top: -4px;
      left: 4px;
      transform: rotate(3deg);
      opacity: 0.8;
    }
    .layer-1 {
      top: 0;
      left: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-accent-primary);
    }

    .card-action-overlay {
      position: absolute;
      top: 10px;
      right: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
      opacity: 0;
      transition: opacity 0.15s ease;
    }
    .collection-folder-card:hover .card-action-overlay {
      opacity: 1;
    }
    .folder-act-btn {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.92);
      border: 1px solid var(--color-border);
      color: var(--color-ink-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
      padding: 0;
    }
    .folder-act-btn:hover {
      transform: scale(1.08);
    }
    .edit-col-btn:hover {
      background: var(--color-accent-subtle);
      color: var(--color-accent-primary);
      border-color: var(--color-accent-primary);
    }
    .delete-col-btn:hover {
      background: #FFE8E8;
      color: #D32F2F;
      border-color: #FFAAAA;
    }

    .folder-info {
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .folder-name {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .folder-count {
      font-size: 0.825rem;
      color: var(--color-ink-muted);
      font-family: var(--font-sans);
    }

    /* Add New Folder Card Tile */
    .new-folder-tile {
      border: 2px dashed var(--color-border);
      background-color: transparent;
      justify-content: center;
      align-items: center;
      min-height: 240px;
    }
    .new-folder-tile:hover {
      border-color: var(--color-accent-primary);
      background-color: var(--color-surface);
    }
    .new-folder-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 24px;
    }
    .plus-icon-box {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background-color: var(--color-canvas);
      border: 1px solid var(--color-border);
      color: var(--color-accent-primary);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.2s ease;
    }
    .new-folder-tile:hover .plus-icon-box {
      transform: scale(1.1);
      background-color: var(--color-accent-subtle);
    }
    .new-tile-label {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--color-ink);
    }

    /* Detail View */
    .detail-nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      flex-wrap: wrap;
      gap: 12px;
    }
    .back-to-cols-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-ink-secondary);
      cursor: pointer;
      padding: 6px 0;
      transition: color 0.15s ease;
    }
    .back-to-cols-btn:hover {
      color: var(--color-accent-primary);
    }
    .detail-actions-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .text-danger {
      color: #C0392B !important;
    }

    .collection-banner {
      margin-bottom: 28px;
      padding-bottom: 16px;
      border-bottom: 1px solid var(--color-border-subtle);
    }
    .banner-title-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 6px;
    }
    .banner-emoji, .banner-icon {
      font-size: 2.2rem;
      line-height: 1;
    }
    .banner-emoji-wrapper {
      position: relative;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 2px 4px;
      border-radius: var(--radius-sm);
      transition: transform 0.15s ease;
    }
    .banner-emoji-wrapper:hover {
      transform: scale(1.1);
    }
    .emoji-edit-badge {
      position: absolute;
      bottom: -2px;
      right: -4px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--color-accent-primary);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
      border: 1.5px solid var(--color-surface);
    }
    .banner-title-wrapper {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      transition: color 0.15s ease;
    }
    .banner-title {
      font-size: 2rem;
      margin: 0;
      transition: color 0.15s ease;
    }
    .title-edit-pencil {
      color: var(--color-ink-muted);
      opacity: 0.5;
      transition: all 0.15s ease;
      display: inline-flex;
      align-items: center;
    }
    .banner-title-wrapper:hover .title-edit-pencil {
      opacity: 1;
      color: var(--color-accent-primary);
      transform: scale(1.15);
    }
    .banner-title-wrapper:hover .banner-title {
      color: var(--color-accent-primary);
    }
    .banner-subtitle {
      font-size: 0.95rem;
      color: var(--color-ink-muted);
      margin: 0;
    }
    .edit-collection-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .collection-live-preview {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 12px 16px;
      background: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      margin-bottom: 20px;
    }
    .preview-emoji {
      font-size: 2.2rem;
      line-height: 1;
    }
    .preview-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .preview-label {
      font-size: 0.72rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--color-ink-muted);
    }
    .preview-title {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--color-ink);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .custom-emoji-row {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
    }
    .custom-emoji-label {
      font-size: 0.8rem;
      color: var(--color-ink-muted);
      font-weight: 500;
    }
    .custom-emoji-field {
      width: 54px;
      padding: 4px 8px;
      font-size: 1.1rem;
      text-align: center;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      outline: none;
      font-family: inherit;
    }
    .custom-emoji-field:focus {
      border-color: var(--color-accent-primary);
    }

    .collection-stories-feed {
      max-width: 680px;
      margin: 0 auto;
    }
    .col-story-item {
      margin-bottom: 24px;
    }


    /* Empty Box */
    .empty-collection-box {
      max-width: 520px;
      margin: 48px auto;
      padding: 56px 24px;
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-lg);
    }
    .empty-emoji {
      font-size: 3rem;
      margin-bottom: 16px;
    }
    .empty-title {
      font-size: 1.5rem;
      margin-bottom: 8px;
    }
    .empty-desc {
      font-size: 0.95rem;
      color: var(--color-ink-secondary);
      margin-bottom: 24px;
      line-height: 1.55;
    }

    /* Modal Backdrop & Card */
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
      z-index: var(--z-modal);
      padding: 16px;
    }
    .collection-modal-card {
      background-color: var(--color-surface);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-modal);
      width: 100%;
      max-width: 440px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .modal-header {
      padding: 18px 24px;
      border-bottom: 1px solid var(--color-border-subtle);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-badge {
      font-size: 0.725rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-accent-primary);
    }
    .modal-heading {
      font-size: 1.25rem;
      margin: 0;
    }
    .close-modal-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      color: var(--color-ink-muted);
      cursor: pointer;
    }

    .modal-body {
      padding: 24px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 700;
      margin-bottom: 8px;
      color: var(--color-ink);
    }
    .form-input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      font-size: 0.95rem;
      background-color: var(--color-canvas);
      outline: none;
      transition: border-color 0.15s ease;
    }
    .form-input:focus {
      border-color: var(--color-accent-primary);
    }

    /* Emoji row */
    .emoji-picker-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .emoji-chip {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      border: 1px solid var(--color-border);
      background-color: var(--color-canvas);
      font-size: 1.3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .emoji-chip:hover {
      background-color: var(--color-surface);
      transform: scale(1.08);
    }
    .emoji-chip.selected {
      border-color: var(--color-accent-primary);
      background-color: var(--color-accent-subtle);
      box-shadow: 0 0 0 2px var(--color-accent-border);
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--color-border-subtle);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      background-color: var(--color-surface);
    }

    /* Mobile Responsive Polish */
    @media (max-width: 640px) {
      .saved-page {
        padding: 16px 12px calc(72px + env(safe-area-inset-bottom, 0px));
      }
      .saved-header {
        margin-bottom: 20px;
        padding-bottom: 16px;
      }
      .saved-title {
        font-size: 2rem;
      }
      .saved-header-top {
        flex-direction: column;
        align-items: stretch;
        gap: 14px;
      }
      .btn-new-col {
        width: 100%;
        justify-content: center;
        padding: 12px 20px;
      }
      .collections-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      .folder-cover {
        height: 120px;
      }
      .collection-emoji {
        font-size: 2.4rem;
      }
      .folder-info {
        padding: 10px 12px;
      }
      .folder-name {
        font-size: 0.92rem;
      }
      .new-folder-tile {
        min-height: 180px;
      }
      .new-folder-inner {
        padding: 14px;
        gap: 8px;
      }
      .plus-icon-box {
        width: 42px;
        height: 42px;
      }

      /* Collection Modal Bottom Sheet on Mobile */
      .modal-backdrop {
        padding: 0;
        align-items: flex-end;
      }
      .collection-modal-card {
        border-radius: 20px 20px 0 0;
        width: 100%;
        max-width: 100%;
        border-bottom: none;
        border-left: none;
        border-right: none;
        animation: slideUpSheet 0.22s cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      .modal-header {
        padding: 14px 18px;
      }
      .modal-body {
        padding: 16px 18px;
      }
      .modal-footer {
        padding: 14px 18px calc(14px + env(safe-area-inset-bottom, 8px));
      }
    }

    @keyframes slideUpSheet {
      from { transform: translateY(100%); }
      to { transform: translateY(0); }
    }
  `]
})
export class SavedComponent {
  storyService = inject(StoryService);

  // View state: 'collections' (folder grid) | 'detail' (stories inside selected folder)
  currentView = signal<'collections' | 'detail'>('collections');
  selectedCollectionId = signal<string | null>(null);

  // Modal state
  isModalOpen = signal<boolean>(false);
  modalMode = signal<'create' | 'edit'>('create');
  editingCollectionId: string | null = null;

  // Collection Form Fields
  formCollectionName = '';
  formCollectionEmoji = '📁';

  readonly presetEmojis = ['📁', '☕', '💌', '🌙', '🎓', '🫂', '🌧️', '💭', '🖤', '🕯️', '🎧', '🎒', '✨', '⚡', '🍕', '💔'];

  // Active Collection
  activeCollection = computed(() => {
    const id = this.selectedCollectionId();
    if (!id) return null;
    return this.storyService.collections().find(c => c.id === id) || null;
  });

  // Active Stories for the current view
  activeStories = computed(() => {
    const colId = this.selectedCollectionId();
    if (!colId) {
      // 'All Posts'
      return this.storyService.savedStories();
    }
    return this.storyService.getStoriesForCollection(colId);
  });

  selectCollection(id: string | null): void {
    this.selectedCollectionId.set(id);
    this.currentView.set('detail');
  }

  backToCollections(): void {
    this.currentView.set('collections');
    this.selectedCollectionId.set(null);
  }

  openCreateModal(): void {
    this.modalMode.set('create');
    this.editingCollectionId = null;
    this.formCollectionName = '';
    this.formCollectionEmoji = '📁';
    this.isModalOpen.set(true);
  }

  openEditModal(col: SavedCollection, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.modalMode.set('edit');
    this.editingCollectionId = col.id;
    this.formCollectionName = col.name;
    this.formCollectionEmoji = col.emoji || '📁';
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.editingCollectionId = null;
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }

  saveCollection(): void {
    const trimmed = this.formCollectionName.trim();
    if (!trimmed) return;
    const emoji = this.formCollectionEmoji.trim() || '📁';

    if (this.modalMode() === 'create') {
      const created = this.storyService.createCollection(trimmed, emoji, []);
      this.closeModal();
      this.selectCollection(created.id);
    } else if (this.modalMode() === 'edit' && this.editingCollectionId) {
      this.storyService.updateCollection(this.editingCollectionId, {
        name: trimmed,
        emoji: emoji
      });
      this.closeModal();
    }
  }

  onDeleteCollection(collectionId: string, event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (confirm('Delete this collection? (Saved stories will remain in All Posts)')) {
      this.storyService.deleteCollection(collectionId);
      if (this.selectedCollectionId() === collectionId) {
        this.backToCollections();
      }
    }
  }
}
