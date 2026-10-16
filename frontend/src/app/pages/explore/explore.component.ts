import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { StoryService } from '../../services/story.service';
import { StoryCardComponent } from '../../components/story-card/story-card.component';
import { Story } from '../../models/story.model';

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, FormsModule, StoryCardComponent],
  template: `
    <div class="explore-page">
      <div class="container-narrow">
        <!-- Header -->
        <header class="explore-header">
          <h1 class="explore-title">Explore Honest Stories</h1>
          <p class="explore-subtitle">
            Browse through unfiltered memories, unvoiced feelings, and college realities shared by students and graduates.
          </p>
        </header>

        <!-- Clean Full-Width Search Bar -->
        <div class="search-bar-wrap">
          <div class="search-input-group">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input 
              type="text" 
              class="search-input" 
              [(ngModel)]="searchQuery" 
              placeholder="Search by title, narrative, or @username...">
            @if (searchQuery()) {
              <button class="clear-search" (click)="clearSearch()" aria-label="Clear search input">✕</button>
            }
          </div>
        </div>

        <!-- Trending Tags Horizontal Pill Rail -->
        <div class="trending-tags-wrap">
          <div class="trending-label-row">
            <span class="trending-flair">🔥</span>
            <span class="trending-label">Trending on campus:</span>
          </div>
          <div class="trending-tags-track">
            @for (tag of trendingTags(); track tag) {
              <button 
                type="button" 
                class="trending-tag-pill" 
                [class.active]="selectedTag()?.toLowerCase() === tag.toLowerCase()"
                (click)="toggleTag(tag)"
                title="Filter stories by #{{ tag }}">
                #{{ tag }}
              </button>
            }
          </div>
        </div>

        <!-- Feed Content Area -->
        <div class="feed-container">
          <div class="feed-meta-bar">
            <div class="results-count">
              Showing <strong>{{ filteredStories().length }}</strong> {{ filteredStories().length === 1 ? 'story' : 'stories' }}
              @if (selectedTag()) {
                <span class="active-pill-chip">
                  #{{ selectedTag() }}
                  <button type="button" class="remove-filter-x" (click)="clearTag()" aria-label="Remove tag filter">✕</button>
                </span>
              }
              @if (searchQuery().trim()) {
                <span class="active-filter-tag">for "{{ searchQuery().trim() }}"</span>
              }
            </div>

            @if (searchQuery().trim() || selectedTag()) {
              <button class="reset-filters-btn" (click)="clearAllFilters()">
                Reset filters
              </button>
            }
          </div>

          <!-- Stories Feed -->
          @if (filteredStories().length > 0) {
            <div class="stories-feed-column">
              @for (story of displayedStories(); track story.id) {
                <app-story-card [story]="story"></app-story-card>
              }
            </div>

            <!-- Load more button if applicable -->
            @if (hasMoreStories()) {
              <div class="load-more-wrap">
                <button 
                  class="btn btn-secondary" 
                  [disabled]="isLoadingMore"
                  (click)="loadMore()">
                  {{ isLoadingMore ? 'Loading memories...' : 'Load more stories' }}
                </button>
              </div>
            }
          } @else {
            <!-- Empty state -->
            <div class="empty-state-box">
              <span class="empty-icon">🍂</span>
              <h3 class="empty-title">No memories found</h3>
              <p class="empty-desc">
                @if (selectedTag() || searchQuery().trim()) {
                  No stories match your current filter. Try searching for a different keyword or explore all campus stories.
                } @else {
                  The archive is quiet for now. Be the first to share an honest story from your campus days.
                }
              </p>
              <div class="empty-actions">
                @if (selectedTag() || searchQuery().trim()) {
                  <button class="btn btn-secondary" (click)="clearAllFilters()">
                    Clear all filters
                  </button>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .explore-page {
      padding-top: var(--space-xl);
      padding-bottom: var(--space-3xl);
    }

    .explore-header {
      margin-bottom: var(--space-xl);
      text-align: center;
    }

    .explore-title {
      font-size: clamp(2rem, 3.5vw, 2.75rem);
      margin-bottom: var(--space-xs);
      font-family: var(--font-serif);
    }

    .explore-subtitle {
      font-size: 1.05rem;
      color: var(--color-ink-secondary);
      max-width: 580px;
      margin: 0 auto;
      line-height: 1.6;
    }

    .search-bar-wrap {
      max-width: 620px;
      margin: 0 auto 16px;
    }

    .search-input-group {
      position: relative;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--color-ink-muted);
    }

    .search-input {
      width: 100%;
      padding: 13px 44px 13px 48px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      font-size: 0.98rem;
      background-color: var(--color-surface);
      color: var(--color-ink);
      box-shadow: var(--shadow-subtle);
      transition: all 0.15s ease;
      box-sizing: border-box;
    }
    .search-input:focus {
      outline: none;
      border-color: var(--color-accent-primary);
      box-shadow: 0 0 0 3px var(--color-accent-subtle);
    }
    .search-input::placeholder {
      color: var(--color-ink-muted);
    }

    .clear-search {
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--color-ink-muted);
      cursor: pointer;
      font-size: 1rem;
      padding: 4px;
    }

    /* Trending Tags Rail */
    .trending-tags-wrap {
      max-width: 620px;
      margin: 0 auto 24px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .trending-label-row {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-ink-muted);
    }
    .trending-flair {
      font-size: 0.85rem;
    }
    .trending-tags-track {
      display: flex;
      gap: 7px;
      overflow-x: auto;
      padding-bottom: 6px;
      scrollbar-width: thin;
      -webkit-overflow-scrolling: touch;
    }
    .trending-tags-track::-webkit-scrollbar {
      height: 4px;
    }
    .trending-tags-track::-webkit-scrollbar-thumb {
      background: var(--color-border);
      border-radius: 4px;
    }
    .trending-tag-pill {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      color: var(--color-ink-secondary);
      padding: 4px 11px;
      border-radius: 14px;
      font-size: 0.8rem;
      font-weight: 600;
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .trending-tag-pill:hover {
      border-color: var(--color-accent-primary);
      color: var(--color-accent-primary);
      background: var(--color-accent-subtle);
    }
    .trending-tag-pill.active {
      background: var(--color-accent-primary);
      color: #FFFFFF;
      border-color: var(--color-accent-primary);
      box-shadow: 0 2px 6px rgba(139, 38, 53, 0.25);
    }

    /* Feed Meta */
    .feed-meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      font-size: 0.85rem;
      color: var(--color-ink-muted);
      padding: 0 4px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .results-count {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .active-pill-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: var(--color-accent-subtle);
      color: var(--color-accent-primary);
      border: 1px solid var(--color-accent-border);
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 700;
    }
    .remove-filter-x {
      background: none;
      border: none;
      color: var(--color-accent-primary);
      cursor: pointer;
      font-size: 0.75rem;
      padding: 0 2px;
      display: inline-flex;
      align-items: center;
    }
    .active-filter-tag {
      color: var(--color-accent-primary);
      font-weight: 600;
    }
    .reset-filters-btn {
      background: none;
      border: none;
      color: var(--color-accent-primary);
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: underline;
    }

    /* Feed Column */
    .stories-feed-column {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: var(--space-2xl);
    }

    .load-more-wrap {
      text-align: center;
      margin: var(--space-2xl) 0;
    }

    /* Empty state */
    .empty-state-box {
      background-color: var(--color-surface);
      border: 1px dashed var(--color-border);
      border-radius: var(--radius-lg);
      padding: 56px 24px;
      text-align: center;
      max-width: 540px;
      margin: 40px auto;
    }
    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 14px;
    }
    .empty-title {
      font-size: 1.4rem;
      margin-bottom: 8px;
    }
    .empty-desc {
      font-size: 0.95rem;
      color: var(--color-ink-secondary);
      margin-bottom: 24px;
    }
    .empty-actions {
      display: flex;
      gap: 12px;
      justify-content: center;
      flex-wrap: wrap;
    }

    @media (max-width: 640px) {
      .explore-page {
        padding: 16px 12px calc(72px + env(safe-area-inset-bottom, 0px));
      }
      .explore-header {
        margin-bottom: 18px;
      }
      .explore-title {
        font-size: 1.85rem;
      }
      .search-bar-wrap {
        margin-bottom: 14px;
      }
      .search-input-group {
        padding: 8px 12px;
      }
      .search-input {
        font-size: 0.95rem;
      }
      .trending-tags-wrap {
        margin-bottom: 16px;
      }
      .stories-feed-column {
        gap: 14px;
      }
    }
  `]
})
export class ExploreComponent implements OnInit, OnDestroy {
  storyService = inject(StoryService);
  route = inject(ActivatedRoute);
  router = inject(Router);

  searchQuery = signal<string>('');
  selectedTag = signal<string | null>(null);
  pageSize = signal<number>(6);
  isLoadingMore = false;
  private querySub?: Subscription;

  // Dynamically computed list of the most-used tags on campus
  trendingTags = computed(() => this.storyService.popularTags());

  ngOnInit(): void {
    this.querySub = this.route.queryParams.subscribe(params => {
      if (params['tag']) {
        this.selectedTag.set(params['tag']);
        this.storyService.loadStoriesByTag(params['tag']);
      } else {
        this.selectedTag.set(null);
      }

      if (params['search'] || params['q']) {
        const queryTerm = params['search'] || params['q'];
        this.searchQuery.set(queryTerm);
        this.storyService.loadStoriesBySearch(queryTerm);
      }
    });
  }

  ngOnDestroy(): void {
    this.querySub?.unsubscribe();
  }

  filteredStories = computed(() => {
    let list = [...this.storyService.stories()];
    const query = this.searchQuery().toLowerCase().trim();
    const tagFilter = this.selectedTag()?.toLowerCase().trim();

    if (tagFilter) {
      list = list.filter(s =>
        s.tags && s.tags.some(t => t.toLowerCase() === tagFilter)
      );
    }

    if (query) {
      list = list.filter(s =>
        s.title.toLowerCase().includes(query) ||
        s.authorPseudonym.toLowerCase().includes(query) ||
        (s.tags && s.tags.some(t => t.toLowerCase().includes(query)))
      );
    }
    return list;
  });

  displayedStories = computed(() => {
    return this.filteredStories().slice(0, this.pageSize());
  });

  hasMoreStories = computed(() => {
    return this.filteredStories().length > this.pageSize();
  });

  toggleTag(tag: string): void {
    if (this.selectedTag()?.toLowerCase() === tag.toLowerCase()) {
      this.clearTag();
    } else {
      this.selectedTag.set(tag);
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tag: tag },
        queryParamsHandling: 'merge'
      });
    }
  }

  clearTag(): void {
    this.selectedTag.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tag: null },
      queryParamsHandling: 'merge'
    });
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { search: null, q: null },
      queryParamsHandling: 'merge'
    });
  }

  clearAllFilters(): void {
    this.searchQuery.set('');
    this.selectedTag.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tag: null, search: null, q: null }
    });
  }

  loadMore(): void {
    this.isLoadingMore = true;
    setTimeout(() => {
      this.pageSize.update(size => size + 6);
      this.isLoadingMore = false;
    }, 300);
  }
}
