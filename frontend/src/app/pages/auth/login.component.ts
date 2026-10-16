import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="auth-page">
      <div class="container-sm">
        <div class="auth-card card-editorial">
          
          <div class="auth-header">
            <span class="brand-monogram">C·L</span>
            <h1 class="auth-title">Welcome Back</h1>
            <p class="auth-subtitle">
              Sign in with your email to manage your memories, collections, and anonymous contributions.
            </p>
          </div>

          <!-- Error Alert Banner -->
          @if (errorMessage()) {
            <div class="alert-banner error-banner fade-in" id="loginErrorMessage">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- Success Alert Banner -->
          @if (successMessage()) {
            <div class="alert-banner success-banner fade-in">
              <span>✓ Signed in successfully! Redirecting...</span>
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="auth-form">
            <!-- Email (Only ID used) -->
            <div class="form-group">
              <label class="form-label" for="loginEmail">Email Address</label>
              <input 
                id="loginEmail"
                type="email" 
                class="form-input" 
                [(ngModel)]="email" 
                name="email" 
                placeholder="e.g. wanderer42@alumni.ac.in" 
                required
                autocomplete="email"
                autofocus>
              <span class="form-hint">Your email is kept strictly private and never shown on stories.</span>
            </div>

            <!-- Password -->
            <div class="form-group">
              <div class="label-row">
                <label class="form-label" for="loginPassword">Password</label>
                <a routerLink="/forgot-password" class="forgot-password-link">Forgot password?</a>
              </div>
              <input 
                id="loginPassword"
                type="password" 
                class="form-input" 
                [(ngModel)]="password" 
                name="password" 
                placeholder="••••••••••••" 
                required
                autocomplete="current-password">
            </div>

            <button type="submit" class="btn btn-primary btn-lg auth-submit-btn" [disabled]="isLoading()">
              {{ isLoading() ? 'Signing In...' : 'Sign In to Archive' }}
            </button>
          </form>

          <div class="privacy-note-card">
            <h4>🔒 Anonymity Promise</h4>
            <p>
              Your public pen name is completely separated from your email address. No phone number is ever required.
            </p>
          </div>

          <div class="auth-footer-links">
            <div class="footer-account-switch">
              <span>Don't have an account yet?</span>
              <a routerLink="/register" class="register-link">Create a pseudonymous account &rarr;</a>
            </div>
            <div class="footer-guest-divider">
              <span class="divider-line"></span>
              <span class="divider-text">OR</span>
              <span class="divider-line"></span>
            </div>
            <button type="button" class="btn-guest-browse" (click)="continueAsGuest()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/>
              </svg>
              Explore Stories as Guest
            </button>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      padding: var(--space-2xl) 16px var(--space-4xl);
      min-height: 85vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .container-sm {
      width: 100%;
      max-width: 440px;
      margin: 0 auto;
    }

    .auth-card {
      padding: 38px 32px;
      border-radius: var(--radius-lg);
      background-color: var(--color-surface);
      border: 1px solid var(--color-border);
      box-shadow: var(--shadow-card);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 24px;
    }

    .brand-monogram {
      display: inline-block;
      font-family: var(--font-serif);
      font-weight: 700;
      font-size: 1.2rem;
      letter-spacing: 0.1em;
      color: var(--color-accent-primary);
      margin-bottom: 12px;
      border: 1.5px solid var(--color-accent-border);
      padding: 4px 12px;
      border-radius: var(--radius-sm);
      background-color: var(--color-accent-subtle);
    }

    .auth-title {
      font-size: 1.85rem;
      margin-bottom: 8px;
      color: var(--color-ink);
    }

    .auth-subtitle {
      font-size: 0.88rem;
      color: var(--color-ink-secondary);
      line-height: 1.5;
      margin: 0;
    }

    /* Alert Banners */
    .alert-banner {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px 14px;
      border-radius: var(--radius-sm);
      margin-bottom: 18px;
      font-size: 0.88rem;
      font-weight: 500;
      animation: fadeIn 0.2s ease-in;
    }
    .error-banner {
      background-color: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.35);
    }
    .success-banner {
      background-color: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.35);
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
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
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--color-ink);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .forgot-password-link {
      font-size: 0.8rem;
      color: var(--color-accent-primary);
      text-decoration: none;
      font-weight: 600;
      transition: all 0.15s ease;
    }
    .forgot-password-link:hover {
      text-decoration: underline;
      opacity: 0.9;
    }

    .form-input {
      width: 100%;
      height: 46px;
      padding: 0 14px;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background-color: var(--color-canvas);
      font-size: 0.95rem;
      color: var(--color-ink);
      outline: none;
      font-family: inherit;
      transition: all 0.15s ease;
    }
    .form-input:focus {
      border-color: var(--color-accent-primary);
      background-color: var(--color-surface);
      box-shadow: 0 0 0 3px rgba(139, 38, 53, 0.1);
    }

    .form-hint {
      font-size: 0.76rem;
      color: var(--color-ink-muted);
      line-height: 1.4;
    }

    .auth-submit-btn {
      width: 100%;
      height: 48px;
      font-size: 0.98rem;
      font-weight: 700;
      margin-top: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }


    .privacy-note-card {
      background-color: var(--color-canvas-subtle);
      border: 1px solid var(--color-border);
      padding: 14px;
      border-radius: var(--radius-sm);
      margin-bottom: 20px;
    }
    .privacy-note-card h4 {
      font-size: 0.82rem;
      margin: 0 0 4px 0;
      color: var(--color-ink);
    }
    .privacy-note-card p {
      font-size: 0.78rem;
      color: var(--color-ink-secondary);
      line-height: 1.45;
      margin: 0;
    }

    .auth-footer-links {
      text-align: center;
      font-size: 0.86rem;
      color: var(--color-ink-secondary);
      padding-top: 16px;
      border-top: 1px solid var(--color-border-subtle);
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .register-link {
      font-weight: 700;
      color: var(--color-accent-primary);
      text-decoration: none;
    }
    .register-link:hover {
      text-decoration: underline;
    }
    .footer-account-switch {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-size: 0.88rem;
      color: var(--color-ink-secondary);
    }
    .footer-guest-divider {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 10px 0 6px;
    }
    .divider-line {
      flex: 1;
      height: 1px;
      background: var(--color-border-subtle);
    }
    .divider-text {
      font-size: 0.72rem;
      color: var(--color-ink-muted);
      letter-spacing: 0.08em;
      font-weight: 600;
    }
    .btn-guest-browse {
      width: 100%;
      padding: 10px 16px;
      border: 1px solid var(--color-border);
      background: var(--color-accent-subtle);
      color: var(--color-accent-primary);
      border-radius: var(--radius-md, 8px);
      font-weight: 600;
      font-size: 0.88rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-guest-browse:hover {
      background: var(--color-surface-hover, rgba(255, 255, 255, 0.06));
      transform: translateY(-1px);
    }

    /* Mobile Responsive */
    @media (max-width: 480px) {
      .auth-page {
        padding: 20px 14px calc(72px + env(safe-area-inset-bottom, 0px));
        min-height: calc(100vh - 72px);
      }
      .auth-card {
        padding: 22px 16px;
      }
      .auth-title {
        font-size: 1.6rem;
      }
    }
  `]
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  password = '';
  readonly errorMessage = signal('');
  readonly successMessage = signal(false);
  readonly isLoading = signal(false);

  async onSubmit(): Promise<void> {
    this.errorMessage.set('');
    this.isLoading.set(true);
    this.cdr.detectChanges();

    try {
      const res = await this.authService.login(this.email, this.password);
      if (res.success) {
        this.successMessage.set(true);
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 500);
      } else {
        this.errorMessage.set(res.error || 'Invalid email or password. Please check your credentials.');
      }
    } catch (err: any) {
      this.errorMessage.set('Invalid email or password. Please check your credentials.');
    } finally {
      this.isLoading.set(false);
      this.cdr.detectChanges();
    }
  }

  continueAsGuest(): void {
    try {
      localStorage.setItem('tcl_guest_mode', 'true');
    } catch {}
    this.router.navigate(['/feed']);
  }
}
