import { inject } from '@angular/core';
import { Routes, Router, CanActivateFn } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ExploreComponent } from './pages/explore/explore.component';
import { StoryDetailComponent } from './pages/story-detail/story-detail.component';
import { ShareComponent } from './pages/share/share.component';
import { CategoryComponent } from './pages/category/category.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password.component';
import { MyStoriesComponent } from './pages/my-stories/my-stories.component';
import { SavedComponent } from './pages/saved/saved.component';
import { GuidelinesComponent } from './pages/guidelines/guidelines.component';
import { PrivacyComponent } from './pages/privacy/privacy.component';
import { ModerationComponent } from './pages/moderation/moderation.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AuthService } from './services/auth.service';

/**
 * Ensures new / unauthenticated users land on the Signup page (/register)
 * rather than an empty home feed, while returning users or guest readers enter seamlessly.
 */
export const initialLaunchGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If user is logged in, allow Home
  if (authService.isLoggedIn()) {
    return true;
  }

  // If user tapped "Explore as Guest", allow Home
  try {
    if (localStorage.getItem('tcl_guest_mode') === 'true') {
      return true;
    }
  } catch {}

  // First launch for new user: open signup page
  return router.createUrlTree(['/register']);
};

export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [initialLaunchGuard], title: 'The College Life We Didn\'t Have — An Anonymous Memory Vault' },
  { path: 'feed', component: HomeComponent, title: 'The College Life We Didn\'t Have — An Anonymous Memory Vault' },
  { path: 'explore', component: ExploreComponent, title: 'Explore Memories — The College Life' },
  { path: 'stories/:id', component: StoryDetailComponent, title: 'Story Reading — The College Life' },
  { path: 'share', component: ShareComponent, title: 'Tell Your Story — The College Life' },
  { path: 'categories/:slug', component: CategoryComponent, title: 'Archive Chapter — The College Life' },
  { path: 'login', component: LoginComponent, title: 'Sign In — The College Life' },
  { path: 'register', component: RegisterComponent, title: 'Join Archive — The College Life' },
  { path: 'forgot-password', component: ForgotPasswordComponent, title: 'Reset Password — The College Life' },
  { path: 'profile', component: ProfileComponent, title: 'Author Profile — The College Life' },
  { path: 'profile/:handle', component: ProfileComponent, title: 'Author Profile — The College Life' },
  { path: 'my-stories', component: MyStoriesComponent, title: 'Contributor Workspace — The College Life' },
  { path: 'saved', component: SavedComponent, title: 'Saved Stories — The College Life' },
  { path: 'guidelines', component: GuidelinesComponent, title: 'Community Guidelines & Honor Code' },
  { path: 'privacy', component: PrivacyComponent, title: 'Privacy Charter & Anonymity Disclosure' },
  { path: 'admin/moderation', component: ModerationComponent, title: 'Admin Moderation Workbench' },
  { path: '**', redirectTo: '' }
];
