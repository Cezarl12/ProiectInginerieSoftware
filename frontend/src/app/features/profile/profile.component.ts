import {
  Component, inject, signal, computed, ChangeDetectionStrategy, DestroyRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { ToastService } from '../../core/services/toast.service';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../shared/components/desktop-header/desktop-header.component';
import type { User } from '../../core/models/user.model';

const ALL_SPORTS = [
  { label: 'Tennis',     color: '#FFEB3B', icon: 'sports_tennis'   },
  { label: 'Running',    color: '#FF7043', icon: 'directions_run'   },
  { label: 'Football',   color: '#43A047', icon: 'sports_soccer'    },
  { label: 'Padel',      color: '#00897B', icon: 'sports_tennis'    },
  { label: 'Basketball', color: '#FF9800', icon: 'sports_basketball' },
  { label: 'Swimming',   color: '#00BCD4', icon: 'pool'             },
  { label: 'Cycling',    color: '#E91E63', icon: 'directions_bike'  },
  { label: 'Yoga',       color: '#9C27B0', icon: 'self_improvement' },
];

function sportMeta(label: string) {
  return ALL_SPORTS.find(s => s.label.toLowerCase() === label.toLowerCase()) ?? ALL_SPORTS[0];
}

@Component({
  selector: 'app-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BottomNavComponent, DesktopHeaderComponent, FormsModule, DatePipe],
  template: `
    <div class="min-h-screen bg-background pb-32">
      <app-desktop-header />

      <!-- Mobile header -->
      <header class="sticky top-0 z-40 bg-background/80 backdrop-blur-sm md:hidden">
        <div class="flex items-center justify-between px-6 py-4">
          <h1 class="text-base font-bold tracking-tight text-on-surface">Profile</h1>
          <button (click)="logout()"
                  class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant text-sm font-semibold active:scale-95 transition-transform">
            <span class="material-symbols-outlined text-[16px]">logout</span>
            Sign out
          </button>
        </div>
      </header>

      @if (loading()) {
        <div class="flex items-center justify-center h-64">
          <span class="material-symbols-outlined text-5xl animate-pulse text-primary">person</span>
        </div>

      } @else if (user()) {
        <main class="max-w-2xl mx-auto px-6">

          <!-- Avatar + name hero -->
          <section class="pt-6 pb-8 flex flex-col items-center gap-4">
            <div class="relative">
              <div class="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center shadow-lg overflow-hidden">
                @if (user()!.profilePhotoUrl) {
                  <img [src]="user()!.profilePhotoUrl!" alt="avatar" class="w-full h-full object-cover" />
                } @else {
                  <span class="material-symbols-outlined text-5xl text-on-primary-container">person</span>
                }
              </div>
              <button (click)="startEditPhoto()"
                      class="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm active:scale-95 transition-transform">
                <span class="material-symbols-outlined text-on-primary text-[16px]">edit</span>
              </button>
            </div>

            @if (editingPhoto()) {
              <div class="w-full max-w-xs space-y-2">
                <p class="text-xs font-bold text-on-surface-variant text-center uppercase tracking-widest">Photo URL</p>
                <input [(ngModel)]="pendingPhotoUrl"
                       type="url"
                       placeholder="https://example.com/photo.jpg"
                       class="w-full bg-surface-container-low rounded-xl px-4 py-2.5 text-sm text-on-surface border-none outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                       (keyup.enter)="savePhoto()" />
                <div class="flex gap-2">
                  <button (click)="savePhoto()"
                          [disabled]="savingPhoto()"
                          class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full bg-primary text-on-primary text-sm font-bold active:scale-95 transition-all disabled:opacity-60">
                    @if (savingPhoto()) {
                      <span class="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                    } @else {
                      <span class="material-symbols-outlined text-[16px]">check</span>
                    }
                    Save
                  </button>
                  <button (click)="cancelEditPhoto()"
                          class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full bg-surface-container-high text-on-surface text-sm font-semibold active:scale-95 transition-all">
                    <span class="material-symbols-outlined text-[16px]">close</span>
                    Cancel
                  </button>
                </div>
              </div>
            }

            @if (editingName()) {
              <div class="flex items-center gap-2 w-full max-w-xs">
                <input [(ngModel)]="pendingUsername"
                       class="flex-1 bg-surface-container-low rounded-full px-4 py-2 text-base font-bold text-on-surface text-center border-none outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                       (keyup.enter)="saveName()" />
                <button (click)="saveName()"
                        class="w-9 h-9 rounded-full bg-primary flex items-center justify-center active:scale-95 transition-transform">
                  <span class="material-symbols-outlined text-on-primary text-[18px]">check</span>
                </button>
                <button (click)="cancelEditName()"
                        class="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center active:scale-95 transition-transform">
                  <span class="material-symbols-outlined text-on-surface text-[18px]">close</span>
                </button>
              </div>
            } @else {
              <div class="text-center">
                <div class="flex items-center justify-center gap-2">
                  <h2 class="text-2xl font-black tracking-tight text-on-surface">{{ user()!.username }}</h2>
                  <button (click)="startEditName()"
                          class="w-7 h-7 rounded-full bg-surface-container-low flex items-center justify-center active:scale-95 transition-transform">
                    <span class="material-symbols-outlined text-on-surface-variant text-[14px]">edit</span>
                  </button>
                </div>
                <p class="text-sm text-on-surface-variant mt-0.5">{{ user()!.email }}</p>
              </div>
            }

            <!-- Role badge -->
            <span class="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary-container text-on-primary-container">
              {{ user()!.role }}
            </span>
          </section>

          <!-- Stats row -->
          <section class="grid grid-cols-2 gap-4 mb-8">
            <div class="bg-surface-container-lowest rounded-2xl p-5 flex flex-col items-center gap-1 shadow-sm">
              <span class="material-symbols-outlined text-2xl text-primary">calendar_today</span>
              <p class="text-[10px] font-black uppercase tracking-widest text-outline mt-1">Member Since</p>
              <p class="text-sm font-bold text-on-surface">{{ user()!.createdAt | date:'MMM yyyy' }}</p>
            </div>
            <div class="bg-surface-container-lowest rounded-2xl p-5 flex flex-col items-center gap-1 shadow-sm">
              <span class="material-symbols-outlined text-2xl text-primary">sports</span>
              <p class="text-[10px] font-black uppercase tracking-widest text-outline mt-1">Favorite Sports</p>
              <p class="text-sm font-bold text-on-surface">{{ sports().length || '—' }}</p>
            </div>
          </section>

          <!-- Favorite sports -->
          <section class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <div>
                <p class="text-[10px] font-black uppercase tracking-widest text-outline">Favorite Sports</p>
                <p class="text-sm text-on-surface-variant mt-0.5">Tap to toggle</p>
              </div>
              @if (sportsChanged()) {
                <button (click)="saveSports()"
                        [disabled]="savingSports()"
                        class="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary text-xs font-bold active:scale-95 transition-all disabled:opacity-60">
                  @if (savingSports()) {
                    <span class="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                  } @else {
                    <span class="material-symbols-outlined text-[14px]">check</span>
                  }
                  Save
                </button>
              }
            </div>

            <div class="grid grid-cols-2 gap-3">
              @for (sport of ALL_SPORTS; track sport.label) {
                <button
                  type="button"
                  (click)="toggleSport(sport.label)"
                  class="flex items-center gap-3 p-4 rounded-xl border transition-all active:scale-95"
                  [class]="pendingSports().includes(sport.label)
                    ? 'border-transparent shadow-md'
                    : 'bg-surface-container-lowest border-outline-variant/20'"
                  [style.background-color]="pendingSports().includes(sport.label) ? sport.color + '22' : ''"
                  [style.border-color]="pendingSports().includes(sport.label) ? sport.color + '66' : ''"
                >
                  <div class="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
                       [style.background-color]="sport.color + '22'">
                    <span class="material-symbols-outlined text-[18px]" [style.color]="sport.color">{{ sport.icon }}</span>
                  </div>
                  <span class="text-sm font-semibold text-on-surface flex-1 text-left">{{ sport.label }}</span>
                  @if (pendingSports().includes(sport.label)) {
                    <span class="material-symbols-outlined text-[16px]" [style.color]="sport.color">check_circle</span>
                  }
                </button>
              }
            </div>
          </section>

          <!-- Account section -->
          <section class="mb-8">
            <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-4">Account</p>
            <div class="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm divide-y divide-surface-container-low">
              <div class="flex items-center gap-4 px-5 py-4">
                <span class="material-symbols-outlined text-xl text-primary">mail</span>
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-outline">Email</p>
                  <p class="text-sm font-semibold text-on-surface truncate">{{ user()!.email }}</p>
                </div>
              </div>
              <div class="flex items-center gap-4 px-5 py-4">
                <span class="material-symbols-outlined text-xl text-primary">shield</span>
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-outline">Password</p>
                  <p class="text-sm font-semibold text-on-surface">••••••••</p>
                </div>
                <span class="text-xs font-bold text-outline bg-surface-container-low rounded-full px-3 py-1">Coming soon</span>
              </div>
              <div class="flex items-center gap-4 px-5 py-4">
                <span class="material-symbols-outlined text-xl text-primary">notifications</span>
                <div class="flex-1 min-w-0">
                  <p class="text-[10px] font-bold uppercase tracking-widest text-outline">Notifications</p>
                  <p class="text-sm font-semibold text-on-surface">Push alerts</p>
                </div>
                <span class="text-xs font-bold text-outline bg-surface-container-low rounded-full px-3 py-1">Coming soon</span>
              </div>
            </div>
          </section>

          <!-- Sign out (desktop / fallback) -->
          <div class="hidden md:block mb-8">
            <button (click)="logout()"
                    class="w-full flex items-center justify-center gap-2 py-4 rounded-full border border-outline-variant/20 text-on-surface-variant font-semibold hover:bg-surface-container-low active:scale-95 transition-all">
              <span class="material-symbols-outlined text-[18px]">logout</span>
              Sign out
            </button>
          </div>

          <!-- Danger zone -->
          <section class="mb-8">
            <p class="text-[10px] font-black uppercase tracking-widest text-error mb-4">Danger Zone</p>
            <div class="bg-error-container/20 border border-error-container/40 rounded-2xl p-5 flex items-center gap-4">
              <span class="material-symbols-outlined text-xl text-error">person_remove</span>
              <div class="flex-1">
                <p class="text-sm font-semibold text-on-surface">Delete Account</p>
                <p class="text-xs text-on-surface-variant">Permanently remove all your data.</p>
              </div>
              <span class="text-xs font-bold text-error/60 bg-error-container/30 rounded-full px-3 py-1">Coming soon</span>
            </div>
          </section>

        </main>
      }

      <app-bottom-nav />
    </div>
  `,
})
export class ProfileComponent {
  protected ALL_SPORTS = ALL_SPORTS;

  private auth = inject(AuthService);
  private usersService = inject(UsersService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  user = signal<User | null>(null);
  loading = signal(true);
  sports = signal<string[]>([]);
  pendingSports = signal<string[]>([]);
  savingSports = signal(false);
  editingName = signal(false);
  pendingUsername = '';
  editingPhoto = signal(false);
  savingPhoto = signal(false);
  pendingPhotoUrl = '';

  sportsChanged = computed(() =>
    JSON.stringify([...this.pendingSports()].sort()) !==
    JSON.stringify([...this.sports()].sort()),
  );

  constructor() {
    this.usersService.getMe().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.loading.set(false);
        return EMPTY;
      }),
    ).subscribe(u => {
      this.user.set(u);
      const parsed = u.favoriteSports?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
      this.sports.set(parsed);
      this.pendingSports.set([...parsed]);
      this.loading.set(false);
    });
  }

  toggleSport(label: string): void {
    this.pendingSports.update(arr =>
      arr.includes(label) ? arr.filter(s => s !== label) : [...arr, label],
    );
  }

  saveSports(): void {
    const u = this.user();
    if (!u) return;
    this.savingSports.set(true);
    const favoriteSports = this.pendingSports().join(', ');
    this.usersService.update({ favoriteSports }).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.toast.error('Could not save sports. Try again.');
        this.savingSports.set(false);
        return EMPTY;
      }),
    ).subscribe(updated => {
      this.user.set(updated);
      const parsed = updated.favoriteSports?.split(',').map(s => s.trim()).filter(Boolean) ?? [];
      this.sports.set(parsed);
      this.pendingSports.set([...parsed]);
      this.savingSports.set(false);
      this.toast.success('Favorite sports updated!');
    });
  }

  startEditName(): void {
    this.pendingUsername = this.user()?.username ?? '';
    this.editingName.set(true);
  }

  cancelEditName(): void { this.editingName.set(false); }

  saveName(): void {
    const u = this.user();
    const name = this.pendingUsername.trim();
    if (!u || !name || name === u.username) { this.editingName.set(false); return; }
    this.usersService.update({ username: name }).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.toast.error('Could not update username. Try again.');
        return EMPTY;
      }),
    ).subscribe(updated => {
      this.user.set(updated);
      this.editingName.set(false);
      this.toast.success('Username updated!');
    });
  }

  startEditPhoto(): void {
    this.pendingPhotoUrl = this.user()?.profilePhotoUrl ?? '';
    this.editingPhoto.set(true);
  }

  cancelEditPhoto(): void { this.editingPhoto.set(false); }

  savePhoto(): void {
    const u = this.user();
    const url = this.pendingPhotoUrl.trim();
    if (!u) { this.editingPhoto.set(false); return; }
    this.savingPhoto.set(true);
    this.usersService.update({ profilePhotoUrl: url || null }).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.toast.error('Could not update photo. Try again.');
        this.savingPhoto.set(false);
        return EMPTY;
      }),
    ).subscribe(updated => {
      this.user.set(updated);
      this.editingPhoto.set(false);
      this.savingPhoto.set(false);
      this.toast.success('Profile photo updated!');
    });
  }

  logout(): void { this.auth.logout(); }
}
