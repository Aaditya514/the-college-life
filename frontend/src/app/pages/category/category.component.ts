import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StoryService } from '../../services/story.service';
import { StoryCategory, Story } from '../../models/story.model';
import { StoryCardComponent } from '../../components/story-card/story-card.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterLink, StoryCardComponent],
  template: `
    <div class="category-page">
      <div class="container">
        @if (category) {
          <!-- Header -->
          <header class="category-header">
            <div class="category-eyebrow">
              <a routerLink="/explore" class="back-link">&larr; All Archive Chapters</a>
              <span class="count-badge">{{ category.storyCount }} Stories Archived</span>
            </div>

            <h1 class="category-title">{{ category.name }}</h1>
            <p class="category-lead">{{ category.tagline }}</p>
            <p class="category-desc">{{ category.description }}</p>

            <!-- Quick chapter switch pills -->
            <div class="category-switch-bar">
              <span class="switch-label">Other Chapters:</span>
              <div class="switch-chips">
                @for (cat of storyService.categories(); track cat.slug) {
                  <a 
                    [routerLink]="['/categories', cat.slug]" 
                    class="switch-chip" 
                    [class.active]="cat.slug === category.slug">
                    {{ cat.name }}
                  </a>
                }
              </div>
            </div>
          </header>

          <!-- Stories Grid -->
          <div class="category-stories-section">
            <div class="section-title-bar">
              <h3>Stories in this chapter</h3>
              <a routerLink="/share" class="btn btn-primary btn-sm">Contribute to this chapter</a>
            </div>

            @if (stories.length > 0) {
              <div class="stories-grid">
                @for (story of stories; track story.id) {
                  <app-story-card [story]="story"></app-story-card>
                }
              </div>
            } @else {
              <div class="card-editorial text-center empty-category-box">
                <p>No stories found under this category yet.</p>
                <a routerLink="/share" class="btn btn-primary">Share the first memory here</a>
              </div>
            }
          </div>
        } @else {
          <div class="not-found-box text-center">
            <h2>Category not found</h2>
            <p>The chapter you are looking for does not exist.</p>
            <a routerLink="/explore" class="btn btn-primary">Browse All Stories</a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .category-page {
      padding: var(--space-3xl) 0 var(--space-4xl);
    }

    .category-header {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: 40px;
      margin-bottom: var(--space-3xl);
    }

    .category-eyebrow {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }
    .back-link {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-ink-secondary);
      text-decoration: underline;
    }
    .count-badge {
      font-size: 0.75rem;
      font-weight: 700;
      background-color: var(--color-canvas-subtle);
      border: 1px solid var(--color-border);
      padding: 3px 10px;
      border-radius: var(--radius-full);
      color: var(--color-ink-muted);
      text-transform: uppercase;
    }

    .category-title {
      font-size: 2.75rem;
      margin-bottom: 8px;
    }
    .category-lead {
      font-size: 1.25rem;
      color: var(--color-accent-primary);
      font-family: var(--font-serif);
      font-style: italic;
      margin-bottom: 14px;
    }
    .category-desc {
      font-size: 1rem;
      color: var(--color-ink-secondary);
      max-width: 680px;
      line-height: 1.6;
      margin-bottom: 28px;
    }

    .category-switch-bar {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-top: 20px;
      border-top: 1px solid var(--color-border-subtle);
      flex-wrap: wrap;
    }
    .switch-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-ink-muted);
      text-transform: uppercase;
    }
    .switch-chips {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .switch-chip {
      font-size: 0.8rem;
      padding: 4px 12px;
      background-color: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-full);
      color: var(--color-ink-secondary);
      text-decoration: none;
      transition: all 0.15s ease;
    }
    .switch-chip:hover {
      border-color: var(--color-ink);
      color: var(--color-ink);
    }
    .switch-chip.active {
      background-color: var(--color-accent-primary);
      border-color: var(--color-accent-primary);
      color: white;
      font-weight: 600;
    }

    .section-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .section-title-bar h3 {
      font-size: 1.5rem;
    }

    .stories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 24px;
    }

    .empty-category-box {
      padding: 60px 20px;
    }
    .not-found-box {
      padding: 60px 0;
    }

    @media (max-width: 768px) {
      .category-header {
        padding: 24px;
      }
      .stories-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CategoryComponent implements OnInit {
  storyService = inject(StoryService);
  route = inject(ActivatedRoute);

  category: StoryCategory | undefined;
  stories: Story[] = [];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.category = this.storyService.getCategoryBySlug(slug);
        this.stories = this.storyService.getStoriesByCategory(slug);
      }
    });
  }
}
