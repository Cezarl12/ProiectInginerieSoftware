import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-desktop-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="hidden md:flex bg-background z-50 sticky top-0
                   justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto tracking-tight border-b border-outline-variant/10">
      <!-- Brand + Search -->
      <div class="flex items-center gap-8 flex-1">
        <a routerLink="/home" class="text-2xl font-black tracking-tighter text-on-surface shrink-0">
          SportMap
        </a>
        <div class="hidden lg:flex flex-1 max-w-md relative">
          <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            type="text"
            [value]="searchValue()"
            (input)="searchValue.set($any($event.target).value)"
            (keyup.enter)="onSearchSubmit()"
            placeholder="Search activities, venues, sports…"
            class="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-full
                   focus:bg-surface-container-lowest focus:outline-none focus:ring-0
                   transition-all duration-300 text-sm placeholder:text-outline-variant"
          />
          @if (searchValue()) {
            <button (click)="clearSearch()"
                    class="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          }
        </div>
      </div>

      <!-- Nav links -->
      <nav class="hidden md:flex items-center gap-6 mx-6">
        <a routerLink="/home" routerLinkActive="text-on-surface border-b-2 border-primary"
           class="text-on-surface-variant font-semibold transition-colors px-1 py-0.5 text-sm">
          Home
        </a>
        <a routerLink="/activities" routerLinkActive="text-on-surface border-b-2 border-primary"
           class="text-on-surface-variant font-semibold transition-colors px-1 py-0.5 text-sm">
          Activities
        </a>
        <a routerLink="/profile" routerLinkActive="text-on-surface border-b-2 border-primary"
           class="text-on-surface-variant font-semibold transition-colors px-1 py-0.5 text-sm">
          My Profile
        </a>
        @if (isAdmin()) {
          <a routerLink="/admin" routerLinkActive="text-on-surface border-b-2 border-primary"
             class="flex items-center gap-1 text-primary font-semibold transition-colors px-1 py-0.5 text-sm">
            <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            Admin
          </a>
        }
      </nav>

      <!-- Right actions -->
      <div class="flex items-center gap-3">
        <a routerLink="/activities/create"
           class="hidden lg:flex items-center gap-1.5 bg-primary text-on-primary text-sm font-bold px-5 py-2 rounded-full
                  hover:opacity-90 active:scale-95 transition-all shadow-sm shadow-primary/20">
          <span class="material-symbols-outlined text-[16px]">add</span>
          New Activity
        </a>
        <button class="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-all active:scale-95">
          <span class="material-symbols-outlined">notifications</span>
        </button>
        <button
          (click)="logout()"
          title="Sign out"
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
  private router = inject(Router);

  searchValue = signal('');

  isAdmin = () => this.auth.currentUser()?.role === 'Admin';

  initials() {
    const name = this.auth.currentUser()?.username ?? '';
    return name.slice(0, 2).toUpperCase() || 'SM';
  }

  onSearchSubmit() {
    this.searchValue.set('');
  }

  clearSearch() {
    this.searchValue.set('');
  }

  logout() {
    this.auth.logout();
  }
}
