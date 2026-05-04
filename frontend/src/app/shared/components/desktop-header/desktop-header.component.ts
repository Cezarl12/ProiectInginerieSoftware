import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-desktop-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="hidden md:flex bg-background z-50 sticky top-0
                   justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto tracking-tight">
      <!-- Brand + Search -->
      <div class="flex items-center gap-8 flex-1">
        <a routerLink="/home" class="text-2xl font-black tracking-tighter text-on-surface shrink-0">
          ActiveZone
        </a>
        <div class="hidden lg:flex flex-1 max-w-md relative">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            type="text"
            placeholder="Search courts, clubs, or sports..."
            class="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-full focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all duration-300 text-sm placeholder:text-outline-variant"
          />
        </div>
      </div>

      <!-- Nav links -->
      <nav class="hidden md:flex items-center gap-6 mx-6">
        <a routerLink="/home" routerLinkActive="border-b-2 border-on-surface text-on-surface"
           class="text-on-surface-variant font-semibold transition-colors px-1 py-0.5">
          Home
        </a>
        <a routerLink="/activities" routerLinkActive="border-b-2 border-on-surface text-on-surface"
           class="text-on-surface-variant font-semibold transition-colors px-1 py-0.5">
          Activities
        </a>
        <a routerLink="/profile" routerLinkActive="border-b-2 border-on-surface text-on-surface"
           class="text-on-surface-variant font-semibold transition-colors px-1 py-0.5">
          My Profile
        </a>
      </nav>

      <!-- Right actions -->
      <div class="flex items-center gap-3">
        <button class="p-2 text-on-surface hover:bg-surface-container-low rounded-full transition-all active:scale-95">
          <span class="material-symbols-outlined">notifications</span>
        </button>
        <button
          (click)="logout()"
          class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-fixed text-sm font-bold hover:bg-primary hover:text-on-primary transition-all"
        >
          {{ initials() }}
        </button>
      </div>
    </header>
  `,
})
export class DesktopHeaderComponent {
  private auth = inject(AuthService);

  initials() {
    const name = this.auth.currentUser()?.username ?? '';
    return name.slice(0, 2).toUpperCase() || 'AZ';
  }

  logout() {
    this.auth.logout();
  }
}
