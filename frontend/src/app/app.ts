import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { CreateModalComponent } from './components/create-modal/create-modal.component';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, CreateModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private router = inject(Router);
  readonly isAuthRoute = signal(false);

  constructor() {
    this.checkAuthRoute(this.router.url);
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkAuthRoute(event.urlAfterRedirects || event.url);
      });
  }

  private checkAuthRoute(url?: string): void {
    const raw = (url || '').toLowerCase();
    let path = '';
    try {
      path = (window.location.pathname || '').toLowerCase();
    } catch {}
    const combined = `${raw} ${path}`;
    const isAuth = combined.includes('register') || combined.includes('login') || combined.includes('forgot-password');
    this.isAuthRoute.set(isAuth);
  }

  async ngOnInit(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        await StatusBar.setOverlaysWebView({ overlay: false });
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: '#0B0C10' });
      } catch {
        // Native status bar fallback
      }
    }
  }
}
