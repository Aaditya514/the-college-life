import { Component, inject, signal, ChangeDetectorRef, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="auth-page">
      <div class="container-sm">
        <div class="auth-card card-editorial">
          
          <div class="auth-header">
            <span class="brand-monogram">C·L</span>
            <h1 class="auth-title">Join the Archive</h1>
            <p class="auth-subtitle">
              Choose your unique public pen name, add a photo, and share your memories anonymously.
            </p>
          </div>

          <!-- Error Alert Banner -->
          @if (errorMessage()) {
            <div class="alert-banner error-banner fade-in" id="registerErrorMessage">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <form (ngSubmit)="onSubmit()" class="auth-form">
            
            <!-- Optional Profile Photo Uploader -->
            <div class="avatar-select-section">
              <label class="form-label text-center">Profile Photo (Optional)</label>
              <div class="avatar-picker-row">
                <div class="avatar-preview-box">
                  @if (avatarUrl) {
                    <img [src]="avatarUrl" alt="Avatar" class="avatar-preview-img">
                  } @else {
                    <span class="avatar-preview-fallback">
                      {{ (pseudonym.slice(0, 2) || 'CL').toUpperCase() }}
                    </span>
                  }
                  <label class="avatar-upload-icon-btn" title="Choose photo from device">
                    <input type="file" accept="image/*" (change)="onAvatarSelected($event)" hidden>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                  </label>
                </div>
                <div class="avatar-picker-info">
                  <span class="avatar-picker-title">Upload a profile picture</span>
                  <span class="avatar-picker-sub">Or keep the default pen-name initials.</span>
                  @if (avatarUrl) {
                    <button type="button" class="btn-remove-avatar" (click)="avatarUrl = ''">
                      ✕ Remove photo
                    </button>
                  }
                </div>
              </div>
            </div>

            <!-- Public Pen Name (Pseudonym) -->
            <div class="form-group">
              <div class="label-row">
                <label class="form-label" for="regPseudonym">Public Pen Name</label>
                <button type="button" class="dice-btn-subtle" (click)="rollName()">
                  🎲 Suggest pen name
                </button>
              </div>
              <div class="input-prefix-wrap">
                <span class="input-prefix">&#64;</span>
                <input 
                  id="regPseudonym"
                  type="text" 
                  class="form-input with-prefix" 
                  [(ngModel)]="pseudonym" 
                  name="pseudonym" 
                  placeholder="e.g. terrace_philosopher"
                  required
                  maxlength="30"
                  autofocus>
              </div>
              <span class="form-hint">Shown publicly on all your stories. Never your real name.</span>
            </div>

            <!-- Private Email (The ONLY login identifier) -->
            <div class="form-group">
              <label class="form-label" for="regEmail">Email Address</label>
              <input 
                id="regEmail"
                type="email" 
                class="form-input" 
                [(ngModel)]="email" 
                name="email" 
                placeholder="you@alumni.ac.in" 
                required
                autocomplete="email">
              <span class="form-hint">The only identifier used to sign in. Kept 100% confidential. No phone number required.</span>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label class="form-label" for="regPassword">Password</label>
              <input 
                id="regPassword"
                type="password" 
                class="form-input" 
                [(ngModel)]="password" 
                name="password" 
                placeholder="At least 6 characters" 
                required
                autocomplete="new-password">
            </div>

            <!-- Community Guidelines Checkbox -->
            <div class="checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" [(ngModel)]="agreeGuidelines" name="agreeGuidelines" required>
                <span>I agree to the <a routerLink="/guidelines" target="_blank">Community Guidelines</a> and will never publish real identifying names of peers.</span>
              </label>
            </div>

            <button type="submit" class="btn btn-primary btn-lg auth-submit-btn" [disabled]="isLoading()">
              {{ isLoading() ? 'Creating Account...' : 'Create Pseudonymous Account' }}
            </button>
          </form>

          <div class="auth-footer-links">
            <div class="footer-account-switch">
              <span>Already have a pen name account?</span>
              <a routerLink="/login" class="login-link">Sign in here &rarr;</a>
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
      max-width: 460px;
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

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
      margin-bottom: 20px;
    }

    /* Avatar section */
    .avatar-select-section {
      background: var(--color-canvas);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      padding: 14px;
    }
    .avatar-picker-row {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-top: 6px;
    }
    .avatar-preview-box {
      position: relative;
      width: 58px;
      height: 58px;
      flex-shrink: 0;
    }
    .avatar-preview-img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--color-border);
    }
    .avatar-preview-fallback {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: var(--color-accent-subtle);
      border: 2px solid var(--color-border);
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--color-accent-primary);
      font-size: 1.15rem;
    }
    .avatar-upload-icon-btn {
      position: absolute;
      bottom: -2px;
      right: -2px;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--color-accent-primary);
      color: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border: 2px solid var(--color-surface);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    .avatar-picker-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .avatar-picker-title {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--color-ink);
    }
    .avatar-picker-sub {
      font-size: 0.76rem;
      color: var(--color-ink-muted);
    }
    .btn-remove-avatar {
      background: none;
      border: none;
      color: #C0392B;
      font-size: 0.74rem;
      cursor: pointer;
      padding: 0;
      text-align: left;
      margin-top: 2px;
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

    .dice-btn-subtle {
      background: none;
      border: none;
      color: var(--color-accent-primary);
      font-size: 0.78rem;
      cursor: pointer;
      font-weight: 600;
      padding: 0;
    }
    .dice-btn-subtle:hover {
      text-decoration: underline;
    }

    .input-prefix-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-prefix {
      position: absolute;
      left: 14px;
      color: var(--color-ink-muted);
      font-weight: 700;
      pointer-events: none;
    }
    .form-input.with-prefix {
      padding-left: 32px;
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

    .checkbox-group {
      margin-top: 2px;
    }
    .checkbox-label {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      font-size: 0.82rem;
      color: var(--color-ink-secondary);
      line-height: 1.45;
      cursor: pointer;
    }
    .checkbox-label input {
      margin-top: 3px;
    }
    .checkbox-label a {
      color: var(--color-accent-primary);
      text-decoration: underline;
    }

    .auth-submit-btn {
      width: 100%;
      height: 48px;
      font-size: 0.96rem;
      font-weight: 700;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
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

    @media (max-width: 480px) {
      .auth-page {
        padding: 16px 14px calc(24px + env(safe-area-inset-bottom, 0px));
        min-height: calc(100vh - max(env(safe-area-inset-top, 0px), 38px) - 8px);
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
export class RegisterComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    try {
      document.body.classList.add('auth-screen-mode');
    } catch {}
  }

  ngOnDestroy(): void {
    try {
      document.body.classList.remove('auth-screen-mode');
    } catch {}
  }

  pseudonym = '';
  email = '';
  password = '';
  avatarUrl = '';
  agreeGuidelines = true;
  readonly errorMessage = signal('');
  readonly isLoading = signal(false);

  private readonly adjectives = ['hostel', 'midnight', 'backbench', 'campus', 'silent', 'canteen', 'terrace', 'corridor', 'library'];
  private readonly nouns = ['philosopher', 'bunker', 'listener', 'poet', 'dreamer', 'wanderer', 'writer', 'proxy', 'spectator'];

  async rollName(): Promise<void> {
    this.pseudonym = await this.authService.generatePseudonym();
    this.cdr.detectChanges();
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    const file = input.files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarUrl = reader.result as string;
      this.cdr.detectChanges();
    };
    reader.readAsDataURL(file);
  }

  async onSubmit(): Promise<void> {
    this.errorMessage.set('');

    if (!this.agreeGuidelines) {
      this.errorMessage.set('Please agree to the Community Guidelines to continue.');
      return;
    }

    this.isLoading.set(true);
    this.cdr.detectChanges();

    try {
      const res = await this.authService.register({
        email: this.email,
        password: this.password,
        pseudonym: this.pseudonym,
        avatarUrl: this.avatarUrl
      });

      if (res.success) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage.set(res.error || 'Registration failed. Please check your details.');
      }
    } catch (err: any) {
      this.errorMessage.set('Registration failed. Please check your details.');
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
