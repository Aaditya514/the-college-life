import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-guidelines',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="guidelines-page">
      <div class="container-narrow">
        <!-- Header -->
        <header class="guidelines-header">
          <span class="pillar-badge unsaid">Editorial Principles</span>
          <h1 class="guidelines-title">Community Guidelines & Honor Code</h1>
          <p class="guidelines-lead">
            This archive was built on a single promise: to provide a safe, dignified space where college students and alumni can be radically honest about what they actually experienced.
          </p>
        </header>

        <hr class="editorial-divider">

        <article class="guidelines-content">
          <!-- Rule 1 -->
          <section class="rule-section">
            <div class="rule-number">01</div>
            <div class="rule-body">
              <h2 class="rule-title">Empathy Over Gossip</h2>
              <p>
                We are a memory vault, not a campus gossip tabloid. Stories should focus on <em>your</em> emotions, your growth, your regrets, and your reflections. Do not use this platform to expose, embarrass, or take revenge on former classmates, exes, or roommates.
              </p>
            </div>
          </section>

          <!-- Rule 2 -->
          <section class="rule-section">
            <div class="rule-number">02</div>
            <div class="rule-body">
              <h2 class="rule-title">Strict Prohibition of Real Names & Doxxing</h2>
              <p>
                To protect both contributors and individuals mentioned in stories:
              </p>
              <ul class="rule-list">
                <li>Never post real full names of students, professors, or administrative staff.</li>
                <li>Never share phone numbers, social media handles, email addresses, or room numbers.</li>
                <li>Avoid overly specific institutional combinations that would allow someone to deduce an individual’s identity without consent.</li>
                <li>Use aliases (e.g., <em>"Aman"</em>, <em>"Prof. S"</em>) instead of real names.</li>
              </ul>
            </div>
          </section>

          <!-- Rule 3 -->
          <section class="rule-section">
            <div class="rule-number">03</div>
            <div class="rule-body">
              <h2 class="rule-title">Vulnerability is Welcome, Hate is Not</h2>
              <p>
                Writing about feeling lonely, failing an exam, crying on the hostel stairs, or feeling inadequate during placement season takes bravery. We honor vulnerability.
              </p>
              <p>
                Conversely, hate speech, casteism, religious intolerance, sexism, cyberbullying, and harassment will lead to immediate story removal and contributor suspension.
              </p>
            </div>
          </section>

          <!-- Rule 4 -->
          <section class="rule-section">
            <div class="rule-number">04</div>
            <div class="rule-body">
              <h2 class="rule-title">Use Content Warnings Responsibly</h2>
              <p>
                College life can encompass dark moments, including severe academic pressure, panic attacks, depression, or loss. When sharing stories that touch on sensitive subjects, add an appropriate Content Notice so sensitive readers can make an informed choice before reading.
              </p>
            </div>
          </section>

          <!-- Rule 5 -->
          <section class="rule-section">
            <div class="rule-number">05</div>
            <div class="rule-body">
              <h2 class="rule-title">How Moderation Works</h2>
              <p>
                Every submission enters an editorial moderation queue before going live. Our human moderators review each story for privacy adherence and guideline compliance. If a story requires editing (such as removing an accidental real name), you will receive feedback in your <a routerLink="/my-stories">My Stories</a> dashboard.
              </p>
            </div>
          </section>

          <div class="guidelines-cta-card">
            <h3>Ready to share your memory in accordance with our guidelines?</h3>
            <p>Your story might be the exact reassurance another student needs to read tonight.</p>
            <a routerLink="/share" class="btn btn-primary btn-lg">Write a story under your pseudonym</a>
          </div>
        </article>
      </div>
    </div>
  `,
  styles: [`
    .guidelines-page {
      padding: var(--space-3xl) 0 var(--space-4xl);
    }

    .guidelines-header {
      text-align: center;
      margin-bottom: var(--space-2xl);
    }

    .guidelines-title {
      font-size: 2.75rem;
      margin: 12px 0 16px;
    }

    .guidelines-lead {
      font-size: 1.18rem;
      color: var(--color-ink-secondary);
      line-height: 1.65;
    }

    .guidelines-content {
      display: flex;
      flex-direction: column;
      gap: 36px;
    }

    .rule-section {
      display: flex;
      gap: 24px;
      align-items: flex-start;
    }

    .rule-number {
      font-family: var(--font-mono);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--color-accent-primary);
      background-color: var(--color-accent-subtle);
      width: 48px;
      height: 48px;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .rule-body {
      flex: 1;
    }

    .rule-title {
      font-size: 1.6rem;
      margin-bottom: 10px;
    }

    .rule-body p {
      font-size: 1.05rem;
      line-height: 1.7;
      margin-bottom: 12px;
    }

    .rule-list {
      padding-left: 20px;
      margin-bottom: 12px;
    }
    .rule-list li {
      font-size: 0.95rem;
      line-height: 1.6;
      color: var(--color-ink-secondary);
      margin-bottom: 6px;
    }

    .guidelines-cta-card {
      background-color: #FAF4EB;
      border: 1px solid #EBE1D3;
      border-radius: var(--radius-lg);
      padding: 36px 32px;
      text-align: center;
      margin-top: 24px;
    }
    .guidelines-cta-card h3 {
      font-size: 1.45rem;
      margin-bottom: 8px;
    }
    .guidelines-cta-card p {
      font-size: 1rem;
      margin-bottom: 20px;
    }
  `]
})
export class GuidelinesComponent {}
