import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink],
  template: `
    <footer class="site-footer">
      <div class="container footer-content">
        <div class="footer-top">
          <div class="footer-brand-col">
            <span class="brand-monogram">C·L</span>
            <h3 class="footer-title">The College Life We Didn't Have</h3>
            <p class="footer-desc">
              An anonymous, community-driven memory vault for students and alumni. A place to be honest about the expectations, heartbreaks, regrets, and quiet joys of college life.
            </p>
            <div class="pillar-mini-tags">
              <span class="tag-label">Pillars:</span>
              <span class="p-tag">The Life I Imagined</span>
              <span class="p-tag">The Life I Lived</span>
              <span class="p-tag">Things I Never Said</span>
            </div>
          </div>

          <div class="footer-nav-col">
            <h4 class="col-heading">Archive</h4>
            <ul class="footer-links">
              <li><a routerLink="/explore">All Stories</a></li>
              <li><a routerLink="/categories/love-crushes-friendships">Love & Friendships</a></li>
              <li><a routerLink="/categories/academic-career-regrets">Academic & Career Regrets</a></li>
              <li><a routerLink="/categories/hostel-midnight-chai">Hostel & Midnight Chai</a></li>
              <li><a routerLink="/categories/understood-after-graduating">After Graduating</a></li>
            </ul>
          </div>

          <div class="footer-nav-col">
            <h4 class="col-heading">Participate</h4>
            <ul class="footer-links">
              <li><a routerLink="/share">Share Your Story</a></li>
              <li><a routerLink="/my-stories">My Stories Dashboard</a></li>
              <li><a routerLink="/saved">Saved Stories</a></li>
              <li><a routerLink="/login">Sign In / Pseudonym</a></li>
              <li><a routerLink="/register">Create Account</a></li>
            </ul>
          </div>

          <div class="footer-nav-col">
            <h4 class="col-heading">Community & Trust</h4>
            <ul class="footer-links">
              <li><a routerLink="/guidelines">Community Guidelines</a></li>
              <li><a routerLink="/privacy">Privacy Charter (Draft)</a></li>
              <li><a routerLink="/admin/moderation">Moderation Workbench</a></li>
              <li><a href="mailto:contact@thecollegelife.org">Editorial Contact</a></li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="disclaimer-box">
            <p class="disclaimer-text">
              <strong>Safety & Privacy Notice:</strong> This platform encourages vulnerability, not gossip. Stories are published pseudonymously. Real names, phone numbers, roll numbers, or defamatory allegations against individuals are strictly prohibited and removed by moderators.
            </p>
          </div>
          <div class="footer-meta">
            <span class="copyright">&copy; 2026 The College Life We Didn't Have. Phase 0 Prototype Blueprint.</span>
            <div class="meta-links">
              <a routerLink="/guidelines">Guidelines</a>
              <span>&bull;</span>
              <a routerLink="/privacy">Privacy</a>
              <span>&bull;</span>
              <a routerLink="/admin/moderation">Admin Queue</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .site-footer {
      background-color: var(--color-canvas-subtle);
      border-top: 1px solid var(--color-border);
      padding: var(--space-3xl) 0 var(--space-xl);
      margin-top: auto;
    }

    .footer-top {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 40px;
      margin-bottom: var(--space-2xl);
    }

    .brand-monogram {
      display: inline-block;
      padding: 3px 8px;
      border: 1px solid var(--color-accent-primary);
      color: var(--color-accent-primary);
      font-family: var(--font-serif);
      font-weight: 700;
      font-size: 0.85rem;
      border-radius: var(--radius-sm);
      margin-bottom: 12px;
    }

    .footer-title {
      font-size: 1.25rem;
      margin-bottom: 10px;
    }

    .footer-desc {
      font-size: 0.9rem;
      line-height: 1.6;
      color: var(--color-ink-secondary);
      max-width: 360px;
      margin-bottom: 16px;
    }

    .pillar-mini-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
      font-size: 0.75rem;
    }
    .tag-label {
      color: var(--color-ink-muted);
      font-weight: 600;
    }
    .p-tag {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      color: var(--color-ink-secondary);
    }

    .col-heading {
      font-family: var(--font-sans);
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--color-ink);
      margin-bottom: 16px;
    }

    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .footer-links a {
      font-size: 0.88rem;
      color: var(--color-ink-secondary);
      transition: color 0.15s ease;
    }
    .footer-links a:hover {
      color: var(--color-accent-primary);
    }

    .disclaimer-box {
      background-color: var(--color-canvas-subtle, #EFE9DF);
      border: 1px solid var(--color-border);
      padding: 12px 18px;
      border-radius: var(--radius-md);
      margin-bottom: 24px;
    }
    .disclaimer-text {
      font-size: 0.8rem;
      line-height: 1.5;
      color: var(--color-ink-secondary);
    }

    .footer-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.825rem;
      color: var(--color-ink-muted);
      padding-top: 16px;
      border-top: 1px solid var(--color-border);
    }

    .meta-links {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    @media (max-width: 840px) {
      .footer-top {
        grid-template-columns: 1fr;
        gap: 24px;
      }
      .footer-meta {
        flex-direction: column;
        gap: 12px;
        text-align: center;
      }
    }
  `]
})
export class FooterComponent {}
