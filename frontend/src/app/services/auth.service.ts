import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { getApiBaseUrl } from './api-config';

export interface UserProfile {
  id: string;
  email: string;
  pseudonym: string;
  avatarUrl?: string;
  avatarEmoji?: string;
  bio?: string;
  joinedAt: string;
  role?: string;
}

interface AuthResponse {
  token: string;
  tokenType: string;
  expiresIn: number;
  user: {
    id: string;
    email: string;
    pseudonym: string;
    avatarUrl?: string;
    role: string;
    createdAt: string;
  };
}

const STORAGE_SESSION_KEY = 'tcl_auth_session';
const STORAGE_TOKEN_KEY = 'tcl_jwt_token';

const DEFAULT_DEMO_USER: UserProfile = {
  id: '19f0f027-2f05-4b6f-92a7-31c963620887',
  email: 'wanderer42@alumni.ac.in',
  pseudonym: 'Hostel 4 Philosopher',
  avatarUrl: '',
  avatarEmoji: '☕',
  bio: 'Alumni recollecting the chapters that never made it to the yearbooks.',
  joinedAt: 'Joined Sep 2024'
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private get apiUrl(): string {
    return `${getApiBaseUrl()}/auth`;
  }

  // Current logged in user signal
  readonly currentUser = signal<UserProfile | null>(this.loadInitialSession());

  // Computed login status
  readonly isLoggedIn = computed(() => !!this.currentUser());

  constructor() {
    this.verifySessionWithBackend();
  }

  getToken(): string | null {
    try {
      return localStorage.getItem(STORAGE_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  private loadInitialSession(): UserProfile | null {
    try {
      const stored = localStorage.getItem(STORAGE_SESSION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Storage unavailable
    }
    return null;
  }

  private persistSession(user: UserProfile | null, token?: string): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }

      if (token) {
        localStorage.setItem(STORAGE_TOKEN_KEY, token);
      } else if (user === null) {
        localStorage.removeItem(STORAGE_TOKEN_KEY);
      }
    } catch {
      // Storage unavailable
    }
  }

  private async verifySessionWithBackend(): Promise<void> {
    const token = this.getToken();
    if (!token) return;

    try {
      const userDto = await firstValueFrom(
        this.http.get<any>(`${this.apiUrl}/me`)
      );
      if (userDto && userDto.id) {
        const profile: UserProfile = {
          id: userDto.id,
          email: userDto.email,
          pseudonym: userDto.pseudonym,
          avatarUrl: userDto.avatarUrl || '',
          avatarEmoji: '☕',
          bio: userDto.bio || this.currentUser()?.bio || 'Alumni recollecting chapters that never made it to yearbooks.',
          joinedAt: userDto.createdAt ? new Date(userDto.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recently',
          role: userDto.role
        };
        this.currentUser.set(profile);
        this.persistSession(profile);
      }
    } catch (err: any) {
      // ONLY log out if the backend explicitly reports 401 Unauthorized or 403 Forbidden.
      // Never wipe the user's session on network disconnect (status 0), cold-start latency, or 5xx gateway errors!
      if (err && (err.status === 401 || err.status === 403)) {
        this.logout();
      }
    }
  }

  async login(login: string, password: string): Promise<{ success: boolean; error?: string }> {
    const trimmedLogin = login.trim();
    if (!trimmedLogin) {
      return { success: false, error: 'Please enter your email or pen name.' };
    }
    if (!password) {
      return { success: false, error: 'Please enter your password.' };
    }

    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
          login: trimmedLogin,
          password
        })
      );

      if (res && res.token && res.user) {
        const profile: UserProfile = {
          id: res.user.id,
          email: res.user.email,
          pseudonym: res.user.pseudonym,
          avatarUrl: res.user.avatarUrl || '',
          avatarEmoji: '🎒',
          bio: 'Contributing memory keeper.',
          joinedAt: res.user.createdAt ? new Date(res.user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Just now',
          role: res.user.role
        };

        this.currentUser.set(profile);
        this.persistSession(profile, res.token);
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server.' };
    } catch (err: any) {
      const message = err.error?.message || (err.status === 401 || err.status === 403 
        ? 'Invalid email/pseudonym or password.' 
        : 'Unable to connect to authentication server.');
      return { success: false, error: message };
    }
  }

  async register(data: {
    email: string;
    password: string;
    pseudonym?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    const trimmedEmail = data.email.trim().toLowerCase();
    const trimmedPseudo = data.pseudonym ? data.pseudonym.trim().replace(/^@/, '') : '';

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please provide a valid email address.' };
    }
    if (!data.password || data.password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters.' };
    }

    try {
      const res = await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
          email: trimmedEmail,
          password: data.password,
          pseudonym: trimmedPseudo || undefined,
          avatarUrl: data.avatarUrl || undefined
        })
      );

      if (res && res.token && res.user) {
        const profile: UserProfile = {
          id: res.user.id,
          email: res.user.email,
          pseudonym: res.user.pseudonym,
          avatarUrl: res.user.avatarUrl || '',
          avatarEmoji: '🎒',
          bio: 'New storyteller contributing to the memory archive.',
          joinedAt: 'Just now',
          role: res.user.role
        };

        this.currentUser.set(profile);
        this.persistSession(profile, res.token);
        return { success: true };
      }
      return { success: false, error: 'Registration failed.' };
    } catch (err: any) {
      let message = 'Registration failed. Please check your network connection and try again.';
      if (err.error?.message) {
        message = err.error.message;
      } else if (err.status === 400 || err.status === 409) {
        message = 'Registration failed. Email or pen name may already be in use.';
      } else if (err.status === 0) {
        message = 'Unable to reach server. Please check your internet connection.';
      }
      return { success: false, error: message };
    }
  }

  async generatePseudonym(): Promise<string> {
    try {
      const res = await firstValueFrom(
        this.http.get<{ pseudonym: string }>(`${this.apiUrl}/generate-pseudonym`)
      );
      if (res && res.pseudonym) {
        return res.pseudonym;
      }
    } catch {
      // Fallback generator
    }
    const adjs = ['hostel', 'midnight', 'terrace', 'backbench', 'library', 'canteen'];
    const nouns = ['philosopher', 'dreamer', 'poet', 'coder', 'wanderer', 'bunker'];
    const num = Math.floor(Math.random() * 90) + 10;
    return `${adjs[Math.floor(Math.random() * adjs.length)]}_${nouns[Math.floor(Math.random() * nouns.length)]}_${num}`;
  }

  logout(): void {
    this.currentUser.set(null);
    this.persistSession(null);
    this.router.navigate(['/login']);
  }

  updateAvatar(avatarUrl: string): void {
    const user = this.currentUser();
    if (!user) return;

    const updated: UserProfile = { ...user, avatarUrl };
    this.currentUser.set(updated);
    this.persistSession(updated);
  }

  async updateProfile(updates: { pseudonym?: string; bio?: string; avatarUrl?: string }): Promise<{ success: boolean; error?: string }> {
    const user = this.currentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    try {
      const res = await firstValueFrom(
        this.http.put<AuthResponse>(`${this.apiUrl}/profile`, updates)
      );
      if (res && res.user) {
        const updated: UserProfile = {
          id: res.user.id,
          email: res.user.email,
          pseudonym: res.user.pseudonym,
          avatarUrl: res.user.avatarUrl || '',
          bio: (res.user as any).bio || updates.bio || user.bio || '',
          joinedAt: user.joinedAt,
          role: res.user.role
        };
        this.currentUser.set(updated);
        this.persistSession(updated);
        if (res.token) {
          localStorage.setItem(STORAGE_TOKEN_KEY, res.token);
        }
      }
      return { success: true };
    } catch (err: any) {
      const message = err.error?.message || 'Failed to update profile.';
      // Optimistic local update so UI remains responsive
      const updated: UserProfile = { ...user, ...updates };
      this.currentUser.set(updated);
      this.persistSession(updated);
      return { success: false, error: message };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    if (!currentPassword) {
      return { success: false, error: 'Current password is required.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters long.' };
    }

    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/change-password`, { currentPassword, newPassword })
      );
      return { success: true, message: res.message || 'Password changed successfully.' };
    } catch (err: any) {
      const message = err.error?.message || 'Failed to change password. Please check your current password.';
      return { success: false, error: message };
    }
  }

  async requestPasswordResetOtp(email: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/forgot-password/request`, { email: trimmedEmail })
      );
      return {
        success: true,
        message: res.message || 'Verification code sent to your email.'
      };
    } catch (err: any) {
      const message = err.error?.message || 'Unable to find an account with this email address.';
      return { success: false, error: message };
    }
  }

  async verifyPasswordResetOtp(email: string, otp: string): Promise<{ success: boolean; resetToken?: string; message?: string; error?: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedOtp = otp.trim();

    if (!trimmedOtp || trimmedOtp.length !== 6) {
      return { success: false, error: 'Please enter a valid 6-digit verification code.' };
    }

    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/forgot-password/verify-otp`, {
          email: trimmedEmail,
          otp: trimmedOtp
        })
      );
      return {
        success: true,
        resetToken: res.resetToken,
        message: res.message
      };
    } catch (err: any) {
      const message = err.error?.message || 'Invalid or expired verification code.';
      return { success: false, error: message };
    }
  }

  async resetPassword(email: string, resetToken: string, newPassword: string): Promise<{ success: boolean; message?: string; error?: string }> {
    const trimmedEmail = email.trim().toLowerCase();
    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long.' };
    }

    try {
      const res = await firstValueFrom(
        this.http.post<any>(`${this.apiUrl}/forgot-password/reset`, {
          email: trimmedEmail,
          resetToken,
          newPassword
        })
      );
      return {
        success: true,
        message: res.message || 'Password has been updated successfully.'
      };
    } catch (err: any) {
      const message = err.error?.message || 'Unable to reset password. Please start the process again.';
      return { success: false, error: message };
    }
  }
}
