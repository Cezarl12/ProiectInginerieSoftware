import {
  Component, inject, OnInit, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { UsersService } from '../../core/services/users.service';
import { ToastService } from '../../core/services/toast.service';
import { DesktopHeaderComponent } from '../../shared/components/desktop-header/desktop-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import type { User } from '../../core/models/user.model';

@Component({
  selector: 'app-admin',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DesktopHeaderComponent, BottomNavComponent, DatePipe, RouterLink],
  template: `
    <div class="min-h-screen bg-background flex flex-col">
      <app-desktop-header />

      <!-- Mobile header -->
      <header class="sticky top-0 z-40 bg-background/95 backdrop-blur-md md:hidden shrink-0 border-b border-outline-variant/10">
        <div class="flex items-center gap-3 px-4 py-3">
          <button (click)="router.navigate(['/home'])"
                  class="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full active:scale-95 transition-transform shrink-0">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div class="flex-1">
            <p class="text-[10px] font-bold uppercase tracking-widest text-primary leading-none">Admin</p>
            <h1 class="text-sm font-bold tracking-tight text-on-surface">User Management</h1>
          </div>
          <span class="material-symbols-outlined text-primary">admin_panel_settings</span>
        </div>
      </header>

      <div class="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-6 pb-28 md:pb-8">

        <!-- Page title (desktop) -->
        <div class="hidden md:flex items-center gap-3 mb-8">
          <span class="material-symbols-outlined text-3xl text-primary">admin_panel_settings</span>
          <div>
            <h1 class="text-3xl font-black tracking-tight text-on-surface">Admin Panel</h1>
            <p class="text-sm text-on-surface-variant">Manage users and roles</p>
          </div>
        </div>

        <!-- Stats bar -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div class="bg-surface-container-low rounded-2xl p-4">
            <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Total Users</p>
            <p class="text-3xl font-black text-on-surface">{{ users().length }}</p>
          </div>
          <div class="bg-surface-container-low rounded-2xl p-4">
            <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Admins</p>
            <p class="text-3xl font-black text-primary">{{ adminCount() }}</p>
          </div>
          <div class="hidden md:block bg-surface-container-low rounded-2xl p-4">
            <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Regular Users</p>
            <p class="text-3xl font-black text-on-surface">{{ users().length - adminCount() }}</p>
          </div>
        </div>

        @if (loading()) {
          <div class="flex items-center justify-center py-20">
            <div class="flex flex-col items-center gap-3 text-on-surface-variant">
              <span class="material-symbols-outlined text-5xl animate-pulse text-primary">group</span>
              <p class="text-sm font-medium">Loading users…</p>
            </div>
          </div>
        } @else {
          <!-- Search -->
          <div class="relative mb-4">
            <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
            <input type="text" placeholder="Search users…"
                   [value]="search()"
                   (input)="search.set($any($event.target).value)"
                   class="w-full pl-11 pr-4 py-3 bg-surface-container-low rounded-full text-sm
                          focus:outline-none focus:bg-surface-container-lowest transition-all" />
          </div>

          <!-- User list -->
          <div class="space-y-3">
            @for (user of filteredUsers(); track user.id) {
              <div class="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-4 border border-outline-variant/10">
                <!-- Avatar -->
                <a [routerLink]="['/users', user.id]"
                   class="w-12 h-12 rounded-full shrink-0 bg-primary-container flex items-center justify-center overflow-hidden border-2"
                   [class]="user.role === 'Admin' ? 'border-primary' : 'border-outline-variant/10'">
                  @if (user.profilePhotoUrl) {
                    <img [src]="user.profilePhotoUrl" [alt]="user.username" class="w-full h-full object-cover"
                         (error)="onImgError($event)" />
                  } @else {
                    <span class="text-sm font-bold text-on-primary-container">{{ initials(user.username) }}</span>
                  }
                </a>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap">
                    <p class="font-bold text-on-surface text-sm truncate">{{ user.username }}</p>
                    @if (user.role === 'Admin') {
                      <span class="flex items-center gap-0.5 bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                        <span class="material-symbols-outlined text-[12px]">verified</span>
                        Admin
                      </span>
                    }
                  </div>
                  <p class="text-xs text-on-surface-variant truncate">{{ user.email }}</p>
                  <p class="text-[10px] text-outline mt-0.5">Joined {{ user.createdAt | date:'d MMM yyyy' }}</p>
                </div>

                <!-- Actions -->
                <div class="shrink-0 flex items-center gap-2">
                  @if (user.role !== 'Admin') {
                    <button (click)="promote(user)"
                            [disabled]="promoting().has(user.id)"
                            class="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-2 rounded-full
                                   hover:bg-primary hover:text-on-primary active:scale-95 transition-all
                                   disabled:opacity-50 disabled:cursor-not-allowed">
                      @if (promoting().has(user.id)) {
                        <span class="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                      } @else {
                        <span class="material-symbols-outlined text-[14px]">shield_person</span>
                      }
                      <span class="hidden sm:inline">Make Admin</span>
                    </button>
                  } @else {
                    <span class="text-xs text-outline px-3 py-2">—</span>
                  }
                </div>
              </div>
            }

            @if (filteredUsers().length === 0 && !loading()) {
              <div class="text-center py-12 text-on-surface-variant">
                <span class="material-symbols-outlined text-4xl block mb-2">search_off</span>
                <p class="text-sm font-medium">No users found</p>
              </div>
            }
          </div>

          <!-- Load more -->
          @if (hasMore()) {
            <div class="mt-6 text-center">
              <button (click)="loadMore()"
                      [disabled]="loadingMore()"
                      class="px-8 py-3 bg-surface-container-low rounded-full text-sm font-bold text-on-surface
                             hover:bg-surface-container active:scale-95 transition-all disabled:opacity-50">
                {{ loadingMore() ? 'Loading…' : 'Load more' }}
              </button>
            </div>
          }
        }
      </div>

      <app-bottom-nav />
    </div>
  `,
})
export class AdminComponent implements OnInit {
  protected router = inject(Router);
  private usersService = inject(UsersService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  users       = signal<User[]>([]);
  loading     = signal(true);
  loadingMore = signal(false);
  promoting   = signal(new Set<number>());
  search      = signal('');
  page        = signal(1);
  hasMore     = signal(false);
  readonly pageSize = 50;

  adminCount = () => this.users().filter(u => u.role === 'Admin').length;

  filteredUsers = () => {
    const q = this.search().toLowerCase();
    if (!q) return this.users();
    return this.users().filter(u =>
      u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  };

  ngOnInit(): void {
    this.fetchUsers(1);
  }

  private fetchUsers(page: number): void {
    if (page === 1) this.loading.set(true);
    else this.loadingMore.set(true);

    this.usersService.getAll(page, this.pageSize).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.loading.set(false);
        this.loadingMore.set(false);
        this.toast.error('Could not load users.');
        return EMPTY;
      }),
    ).subscribe(result => {
      this.users.update(prev => page === 1 ? result.items : [...prev, ...result.items]);
      this.hasMore.set(result.items.length === this.pageSize);
      this.page.set(page);
      this.loading.set(false);
      this.loadingMore.set(false);
    });
  }

  loadMore(): void {
    this.fetchUsers(this.page() + 1);
  }

  promote(user: User): void {
    const prev = new Set(this.promoting());
    prev.add(user.id);
    this.promoting.set(prev);

    this.usersService.promoteToAdmin(user.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        const s = new Set(this.promoting());
        s.delete(user.id);
        this.promoting.set(s);
        this.toast.error('Could not promote user.');
        return EMPTY;
      }),
    ).subscribe(() => {
      this.users.update(list =>
        list.map(u => u.id === user.id ? { ...u, role: 'Admin' } : u)
      );
      const s = new Set(this.promoting());
      s.delete(user.id);
      this.promoting.set(s);
      this.toast.success(`${user.username} is now an Admin!`);
    });
  }

  initials(username: string): string {
    return (username ?? '').slice(0, 2).toUpperCase();
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
