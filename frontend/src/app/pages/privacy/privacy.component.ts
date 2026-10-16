import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="privacy-page">
      <div class="container-narrow">
        <!-- Draft Alert Banner -->
        <div class="draft-warning-banner">
          <div class="warning-tag">DRAFT DOCUMENT &bull; SUBJECT TO LEGAL REVIEW</div>
          <p>
            This document represents the planned architectural privacy charter for Phase 0. It must undergo formal legal and regulatory review prior to commercial production launch.
          </p>
        </div>

        <header class="privacy-header">
          <span class="pillar-badge unsaid">Data & Trust Charter</span>
          <h1 class="privacy-title">Privacy & Anonymity Policy</h1>
          <p class="privacy-date">Last Updated: October 2026 &bull; Draft v0.9</p>
        </header>

        <hr class="editorial-divider">

        <article class="privacy-content">
          <section class="privacy-block">
            <h2>1. The Core Philosophy: Pseudonymity vs. Anonymity</h2>
            <p>
              We believe genuine emotional sharing requires a shield. However, we also believe in total transparency about how that shield operates:
            </p>
            <div class="clarity-box">
              <div class="clarity-item">
                <h4>What Readers & Peers See</h4>
                <p>
                  Only your chosen public pen name (e.g. <code>&#64;terrace_philosopher</code>) and your optional graduation batch. Your real identity, legal name, email address, IP address, and private account credentials are <strong>never</strong> displayed, queried, or exposed through public APIs.
                </p>
              </div>
              <div class="clarity-item">
                <h4>What the System Retains Internally</h4>
                <p>
                  To prevent coordinated spam attacks, malicious defamation, and legal violations, our secure database maintains an encrypted user identifier and standard server audit logs. Pseudonymity is not a legal shield for hate speech or criminal misconduct.
                </p>
              </div>
            </div>
          </section>

          <section class="privacy-block">
            <h2>2. Information We Collect</h2>
            <p>We minimize data collection by deliberate design:</p>
            <ul>
              <li><strong>Account Credentials:</strong> Email address (stored securely with bcrypt password hashing) solely for login and password reset.</li>
              <li><strong>User Generated Content:</strong> Story titles, narratives, narrative pillars, categories, and tags submitted by you.</li>
              <li><strong>Reaction Logs:</strong> Anonymous aggregate counters for <em>Relatable</em>, <em>Felt This</em>, <em>Support</em>, and <em>Laugh</em>.</li>
              <li><strong>Private Bookmarks:</strong> Saved story IDs associated with your pseudonymous profile.</li>
            </ul>
          </section>

          <section class="privacy-block">
            <h2>3. Information We Explicitly DO NOT Collect</h2>
            <ul>
              <li>Student ID cards, college roll numbers, or GPA transcripts.</li>
              <li>Geolocation or precise GPS tracking.</li>
              <li>Third-party ad-tracking cookies or data brokerage pixels.</li>
              <li>Contact books or social media profile links.</li>
            </ul>
          </section>

          <section class="privacy-block">
            <h2>4. Your Rights: Editing & Deletion</h2>
            <p>
              You own your story. Through your <a routerLink="/my-stories">My Stories</a> dashboard, you retain the continuous right to:
            </p>
            <ul>
              <li><strong>Edit:</strong> Update narratives or anonymize accidental references.</li>
              <li><strong>Delete (Right to be Forgotten):</strong> Permanently delete your contribution from the archive. When deleted, the content is purged from our production database.</li>
              <li><strong>Withdraw:</strong> Remove pending stories from the moderation queue before publication.</li>
            </ul>
          </section>

          <section class="privacy-block">
            <h2>5. Reporting & Content Removal</h2>
            <p>
              If a story mentions you or someone you know in a manner that reveals private identifying information or causes harm, you can use the <strong>Report</strong> button on any story to alert our human moderation team for urgent review and takedown.
            </p>
          </section>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .privacy-page {
      padding: var(--space-3xl) 0 var(--space-4xl);
    }

    .draft-warning-banner {
      background-color: #FEF3C7;
      border: 1px solid #FCD34D;
      border-radius: var(--radius-md);
      padding: 16px 20px;
      margin-bottom: var(--space-2xl);
    }
    .warning-tag {
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.06em;
      color: #92400E;
      margin-bottom: 4px;
    }
    .draft-warning-banner p {
      font-size: 0.88rem;
      color: #78350F;
      margin: 0;
    }

    .privacy-header {
      text-align: center;
      margin-bottom: var(--space-xl);
    }
    .privacy-title {
      font-size: 2.75rem;
      margin: 12px 0 8px;
    }
    .privacy-date {
      font-size: 0.85rem;
      color: var(--color-ink-muted);
    }

    .privacy-content {
      display: flex;
      flex-direction: column;
      gap: 36px;
    }

    .privacy-block h2 {
      font-size: 1.6rem;
      margin-bottom: 12px;
      color: var(--color-ink);
    }
    .privacy-block p {
      font-size: 1.05rem;
      line-height: 1.7;
      margin-bottom: 14px;
    }
    .privacy-block ul {
      padding-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .privacy-block li {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--color-ink-secondary);
    }

    .clarity-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin: 20px 0;
    }
    .clarity-item {
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 20px;
    }
    .clarity-item h4 {
      font-size: 1.05rem;
      margin-bottom: 8px;
    }
    .clarity-item p {
      font-size: 0.88rem;
      line-height: 1.6;
      margin: 0;
    }
    .clarity-item code {
      background-color: var(--color-canvas-subtle);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 0.85rem;
    }

    @media (max-width: 680px) {
      .clarity-box {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PrivacyComponent {}
