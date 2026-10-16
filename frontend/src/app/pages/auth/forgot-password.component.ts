import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

type ResetStep = 'email' | 'otp' | 'password' | 'success';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="auth-page">
      <div class="container-sm">
        <div class="auth-card card-editorial">
          
          <div class="auth-header">
            <span class="brand-monogram">C·L</span>
            <h1 class="auth-title">
              @if (currentStep() === 'email') { Reset Password }
              @else if (currentStep() === 'otp') { Enter Verification Code }
              @else if (currentStep() === 'password') { Choose New Password }
              @else { Password Reset Complete }
            </h1>
            <p class="auth-subtitle">
              @if (currentStep() === 'email') {
                Enter your registered email address to receive a 6-digit verification code.
              } @else if (currentStep() === 'otp') {
                We've dispatched a code to <strong class="highlight-email">{{ email }}</strong>.
              } @else if (currentStep() === 'password') {
                Create a strong new password for your pseudonymous archive account.
              } @else {
                Your credentials have been securely updated in the archive.
              }
            </p>
          </div>

          <!-- Step Progress Dots -->
          @if (currentStep() !== 'success') {
            <div class="step-progress-row">
              <div class="step-dot" [class.active]="currentStep() === 'email'" [class.completed]="currentStep() === 'otp' || currentStep() === 'password'">
                <span>1</span>
              </div>
              <div class="step-line" [class.completed]="currentStep() === 'otp' || currentStep() === 'password'"></div>
              <div class="step-dot" [class.active]="currentStep() === 'otp'" [class.completed]="currentStep() === 'password'">
                <span>2</span>
              </div>
              <div class="step-line" [class.completed]="currentStep() === 'password'"></div>
              <div class="step-dot" [class.active]="currentStep() === 'password'">
                <span>3</span>
              </div>
            </div>
          }

          <!-- Error Alert Banner -->
          @if (errorMessage()) {
            <div class="alert-banner error-banner fade-in" id="forgotErrorMessage">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <!-- Info / Demo Alert Banner -->
          @if (infoMessage() && !errorMessage()) {
            <div class="alert-banner info-banner fade-in">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>{{ infoMessage() }}</span>
            </div>
          }

          <!-- STEP 1: Email Form -->
          @if (currentStep() === 'email') {
            <form (ngSubmit)="onRequestOtp()" class="auth-form">
              <div class="form-group">
                <label class="form-label" for="resetEmail">Registered Email Address</label>
                <input 
                  id="resetEmail"
                  type="email" 
                  class="form-input" 
                  [(ngModel)]="email" 
                  name="email" 
                  placeholder="e.g. aanandaaditya5@gmail.com" 
                  required
                  autocomplete="email"
                  autofocus>
                <span class="form-hint">A 6-digit code will be sent to this address to verify ownership.</span>
              </div>

              <button type="submit" class="btn btn-primary btn-lg auth-submit-btn" [disabled]="isLoading()">
                {{ isLoading() ? 'Sending Code...' : 'Send Verification Code' }}
              </button>
            </form>
          }

          <!-- STEP 2: OTP Verification Form -->
          @if (currentStep() === 'otp') {
            <form (ngSubmit)="onVerifyOtp()" class="auth-form">
              <div class="otp-attempt-badge" [class.danger]="attemptsUsed() >= 1">
                <span>🛡️ Security Policy: Maximum 2 Attempts Allowed</span>
                <strong>
                  @if (attemptsUsed() === 0) {
                    2 tries remaining
                  } @else if (attemptsUsed() === 1 && !isLockedOut()) {
                    ⚠️ 1 final try remaining
                  } @else {
                    🔒 Code Invalidated
                  }
                </strong>
              </div>

              <div class="form-group">
                <label class="form-label text-center" for="resetOtp">Enter 6-Digit Code</label>
                <input 
                  id="resetOtp"
                  type="text" 
                  class="form-input otp-code-input" 
                  [(ngModel)]="otpCode" 
                  name="otp" 
                  maxlength="6"
                  placeholder="••••••" 
                  [disabled]="isLockedOut()"
                  autocomplete="one-time-code"
                  autofocus>
                <span class="form-hint text-center">Codes expire after 10 minutes.</span>
              </div>

              @if (!isLockedOut()) {
                <button type="submit" class="btn btn-primary btn-lg auth-submit-btn" [disabled]="isLoading() || otpCode.trim().length !== 6">
                  {{ isLoading() ? 'Verifying Code...' : 'Verify Code & Proceed' }}
                </button>
              } @else {
                <button type="button" class="btn btn-secondary btn-lg auth-submit-btn" (click)="onRequestOtp(true)">
                  🔄 Request a New Code
                </button>
              }

              <div class="otp-helper-row">
                <button type="button" class="btn-link" (click)="currentStep.set('email'); errorMessage.set('')">
                  ← Change Email Address
                </button>
                <button type="button" class="btn-link" (click)="onRequestOtp(true)" [disabled]="isLoading()">
                  Resend Code
                </button>
              </div>
            </form>
          }

          <!-- STEP 3: Set New Password Form -->
          @if (currentStep() === 'password') {
            <form (ngSubmit)="onResetPassword()" class="auth-form">
              <div class="form-group">
                <label class="form-label" for="newPassword">New Password</label>
                <input 
                  id="newPassword"
                  type="password" 
                  class="form-input" 
                  [(ngModel)]="newPassword" 
                  name="newPassword" 
                  placeholder="Minimum 6 characters" 
                  required
                  autocomplete="new-password"
                  autofocus>
              </div>

              <div class="form-group">
                <label class="form-label" for="confirmPassword">Confirm New Password</label>
                <input 
                  id="confirmPassword"
                  type="password" 
                  class="form-input" 
                  [(ngModel)]="confirmPassword" 
                  name="confirmPassword" 
                  placeholder="Re-enter your new password" 
                  required
                  autocomplete="new-password">
              </div>

              <button type="submit" class="btn btn-primary btn-lg auth-submit-btn" [disabled]="isLoading()">
                {{ isLoading() ? 'Updating Password...' : 'Save Password & Sign In' }}
              </button>
            </form>
          }

          <!-- STEP 4: Success View -->
          @if (currentStep() === 'success') {
            <div class="success-screen">
              <div class="success-icon-wrap">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3 class="success-title">Password Reset Complete!</h3>
              <p class="success-desc">
                Your password has been successfully updated. You can now access your memory archive securely.
              </p>
              <button type="button" class="btn btn-primary btn-lg auth-submit-btn" (click)="goToLogin()">
                Sign In to Archive &rarr;
              </button>
            </div>
          }

          <div class="auth-footer-links">
            <span>Remembered your password?</span>
            <a routerLink="/login" class="login-link">Return to Sign In &rarr;</a>
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
      margin-bottom: 22px;
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
      font-family: var(--font-serif);
      font-size: 1.85rem;
      font-weight: 700;
      margin: 0 0 8px 0;
      color: var(--color-ink);
    }

    .auth-subtitle {
      font-size: 0.88rem;
      color: var(--color-ink-secondary);
      line-height: 1.5;
      margin: 0;
    }

    .highlight-email {
      color: var(--color-accent-primary);
    }

    /* Step Dots */
    .step-progress-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 22px;
    }
    .step-dot {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.78rem;
      font-weight: 700;
      background-color: var(--color-canvas-subtle);
      border: 1.5px solid var(--color-border);
      color: var(--color-ink-muted);
      transition: all 0.2s ease;
    }
    .step-dot.active {
      background-color: var(--color-accent-primary);
      border-color: var(--color-accent-primary);
      color: #ffffff;
      box-shadow: 0 0 0 4px var(--color-accent-subtle);
    }
    .step-dot.completed {
      background-color: #10b981;
      border-color: #10b981;
      color: #ffffff;
    }
    .step-line {
      width: 32px;
      height: 2px;
      background-color: var(--color-border);
      transition: background-color 0.2s ease;
    }
    .step-line.completed {
      background-color: #10b981;
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
    .info-banner {
      background-color: rgba(59, 130, 246, 0.12);
      color: #60a5fa;
      border: 1px solid rgba(59, 130, 246, 0.3);
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

    .form-label {
      font-size: 0.825rem;
      font-weight: 600;
      color: var(--color-ink);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .text-center {
      text-align: center;
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

    .otp-code-input {
      text-align: center;
      font-size: 1.5rem;
      letter-spacing: 0.45em;
      font-weight: 700;
      font-family: monospace;
      height: 52px;
    }

    .otp-attempt-badge {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background-color: var(--color-canvas-subtle);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      color: var(--color-ink-secondary);
    }
    .otp-attempt-badge.danger {
      background-color: rgba(239, 68, 68, 0.1);
      border-color: rgba(239, 68, 68, 0.3);
      color: #f87171;
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

    .otp-helper-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 4px;
    }

    .btn-link {
      background: none;
      border: none;
      padding: 0;
      font-size: 0.82rem;
      color: var(--color-accent-primary);
      cursor: pointer;
      font-weight: 600;
    }
    .btn-link:hover {
      text-decoration: underline;
    }

    .success-screen {
      text-align: center;
      padding: 12px 0 20px;
    }
    .success-icon-wrap {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background-color: rgba(16, 185, 129, 0.15);
      color: #10b981;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
      border: 1.5px solid rgba(16, 185, 129, 0.3);
    }
    .success-title {
      font-family: var(--font-serif);
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--color-ink);
      margin: 0 0 8px;
    }
    .success-desc {
      font-size: 0.88rem;
      color: var(--color-ink-secondary);
      line-height: 1.5;
      margin: 0 0 22px;
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
    .login-link {
      font-weight: 700;
      color: var(--color-accent-primary);
      text-decoration: none;
    }
    .login-link:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .auth-page {
        padding: 16px 14px calc(24px + env(safe-area-inset-bottom, 0px));
        min-height: calc(100vh - max(env(safe-area-inset-top, 0px), 38px) - 8px);
      }
      .auth-card {
        padding: 22px 16px;
      }
      .auth-title {
        font-size: 1.5rem;
      }
    }
  `]
})
export class ForgotPasswordComponent {
  private authService = inject(AuthService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  email = '';
  otpCode = '';
  newPassword = '';
  confirmPassword = '';
  resetToken = '';

  readonly currentStep = signal<ResetStep>('email');
  readonly errorMessage = signal('');
  readonly infoMessage = signal('');
  readonly isLoading = signal(false);
  readonly attemptsUsed = signal(0);
  readonly isLockedOut = signal(false);

  async onRequestOtp(isResend = false): Promise<void> {
    this.errorMessage.set('');
    this.infoMessage.set('');
    this.isLoading.set(true);
    this.cdr.detectChanges();

    try {
      const res = await this.authService.requestPasswordResetOtp(this.email);
      if (res.success) {
        this.currentStep.set('otp');
        this.attemptsUsed.set(0);
        this.isLockedOut.set(false);
        this.otpCode = '';
        this.infoMessage.set(`✉️ A 6-digit verification code has been dispatched to ${this.email}. Please check your email inbox (and spam folder).`);
      } else {
        this.errorMessage.set(res.error || 'No registered account found with that email.');
      }
    } catch {
      this.errorMessage.set('Unable to process your request. Please check your network connection.');
    } finally {
      this.isLoading.set(false);
      this.cdr.detectChanges();
    }
  }

  async onVerifyOtp(): Promise<void> {
    this.errorMessage.set('');
    this.isLoading.set(true);
    this.cdr.detectChanges();

    try {
      const res = await this.authService.verifyPasswordResetOtp(this.email, this.otpCode);
      if (res.success && res.resetToken) {
        this.resetToken = res.resetToken;
        this.currentStep.set('password');
        this.infoMessage.set('');
      } else {
        const nextAttempts = this.attemptsUsed() + 1;
        this.attemptsUsed.set(nextAttempts);

        if (nextAttempts >= 2) {
          this.isLockedOut.set(true);
          this.errorMessage.set('Maximum 2 attempts reached. This code is now invalidated. Please request a new code.');
        } else {
          this.errorMessage.set(res.error || 'Incorrect verification code. You have 1 try remaining.');
        }
      }
    } catch {
      this.errorMessage.set('Network error verifying code. Please try again.');
    } finally {
      this.isLoading.set(false);
      this.cdr.detectChanges();
    }
  }

  async onResetPassword(): Promise<void> {
    this.errorMessage.set('');

    if (this.newPassword.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters long.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match. Please re-enter.');
      return;
    }

    this.isLoading.set(true);
    this.cdr.detectChanges();

    try {
      const res = await this.authService.resetPassword(this.email, this.resetToken, this.newPassword);
      if (res.success) {
        this.currentStep.set('success');
      } else {
        this.errorMessage.set(res.error || 'Failed to update password. Please try again.');
      }
    } catch {
      this.errorMessage.set('Network error updating password. Please try again.');
    } finally {
      this.isLoading.set(false);
      this.cdr.detectChanges();
    }
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
