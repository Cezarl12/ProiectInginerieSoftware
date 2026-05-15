import {
  Component, inject, OnInit, signal, computed, ChangeDetectionStrategy, DestroyRef,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { catchError, EMPTY } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsersService } from '../../core/services/users.service';
import { LocationsService } from '../../core/services/locations.service';
import { ToastService } from '../../core/services/toast.service';
import { DesktopHeaderComponent } from '../../shared/components/desktop-header/desktop-header.component';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import type { User } from '../../core/models/user.model';
import type { Location } from '../../core/models/location.model';

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
            <h1 class="text-sm font-bold tracking-tight text-on-surface">Admin Panel</h1>
          </div>
          <span class="material-symbols-outlined text-primary">admin_panel_settings</span>
        </div>
      </header>

      <div class="flex-1 max-w-5xl mx-auto w-full px-4 md:px-8 py-6 pb-28 md:pb-8">

        <!-- Page title desktop -->
        <div class="hidden md:flex items-center gap-3 mb-8">
          <span class="material-symbols-outlined text-3xl text-primary">admin_panel_settings</span>
          <div>
            <h1 class="text-3xl font-black tracking-tight text-on-surface">Admin Panel</h1>
            <p class="text-sm text-on-surface-variant">Manage users and review location proposals</p>
          </div>
        </div>

        <!-- Stats bar -->
        <div class="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6">
          <div class="bg-surface-container-low rounded-2xl p-4">
            <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Users</p>
            <p class="text-2xl font-black text-on-surface">{{ totalUsers() }}</p>
          </div>
          <div class="bg-surface-container-low rounded-2xl p-4">
            <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Admins</p>
            <p class="text-2xl font-black text-primary">{{ adminCount() }}</p>
          </div>
          <div class="bg-surface-container-low rounded-2xl p-4">
            <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Pending</p>
            <p class="text-2xl font-black text-tertiary">{{ pendingLocations().length }}</p>
          </div>
          <div class="hidden md:block bg-surface-container-low rounded-2xl p-4">
            <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-1">Regular</p>
            <p class="text-2xl font-black text-on-surface">{{ totalUsers() - adminCount() }}</p>
          </div>
        </div>

        <!-- Tabs -->
        <div class="flex gap-1 bg-surface-container-low rounded-xl p-1 mb-6">
          <button (click)="activeTab.set('users')"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all"
                  [class]="activeTab() === 'users' ? 'bg-background shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'">
            <span class="material-symbols-outlined text-[18px]">group</span>
            Users
          </button>
          <button (click)="activeTab.set('locations'); loadPending()"
                  class="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all relative"
                  [class]="activeTab() === 'locations' ? 'bg-background shadow-sm text-primary' : 'text-on-surface-variant hover:text-on-surface'">
            <span class="material-symbols-outlined text-[18px]">location_on</span>
            Pending Locations
            @if (pendingLocations().length > 0) {
              <span class="absolute top-1.5 right-3 w-4 h-4 bg-error text-white text-[9px] font-black rounded-full flex items-center justify-center">
                {{ pendingLocations().length }}
              </span>
            }
          </button>
        </div>

        <!-- ══════ USERS TAB ══════ -->
        @if (activeTab() === 'users') {
          @if (loadingUsers()) {
            <div class="flex items-center justify-center py-20">
              <span class="material-symbols-outlined text-5xl animate-pulse text-primary">group</span>
            </div>
          } @else {
            <div class="relative mb-4">
              <span class="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
              <input type="text" placeholder="Search users..."
                     [value]="search()"
                     (input)="search.set($any($event.target).value); userPage.set(1)"
                     class="w-full pl-11 pr-4 py-3 bg-surface-container-low rounded-full text-sm outline-none focus:bg-surface-container-lowest transition-all"
                     style="border:none;box-shadow:none;" />
            </div>

            <div class="space-y-3">
              @for (user of pagedUsers(); track user.id) {
                <div class="bg-surface-container-lowest rounded-2xl p-4 flex items-center gap-4 border border-outline-variant/10">
                  <a [routerLink]="['/users', user.id]"
                     class="w-12 h-12 rounded-full shrink-0 bg-primary-container flex items-center justify-center overflow-hidden border-2"
                     [class]="user.role === 'Admin' ? 'border-primary' : 'border-outline-variant/10'">
                    @if (user.profilePhotoUrl) {
                      <img [src]="user.profilePhotoUrl" [alt]="user.username" class="w-full h-full object-cover" (error)="onImgError($event)" />
                    } @else {
                      <span class="text-sm font-bold text-on-primary-container">{{ initials(user.username) }}</span>
                    }
                  </a>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <p class="font-bold text-on-surface text-sm truncate">{{ user.username }}</p>
                      @if (user.role === 'Admin') {
                        <span class="flex items-center gap-0.5 bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                          <span class="material-symbols-outlined text-[12px]">verified</span>Admin
                        </span>
                      }
                    </div>
                    <p class="text-xs text-on-surface-variant truncate">{{ user.email }}</p>
                    <p class="text-[10px] text-outline mt-0.5">Joined {{ user.createdAt | date:'d MMM yyyy' }}</p>
                  </div>
                  <div class="shrink-0">
                    @if (user.role !== 'Admin') {
                      <button (click)="promote(user)" [disabled]="promoting().has(user.id)"
                              class="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-2 rounded-full hover:bg-primary hover:text-on-primary active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
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

              @if (filteredUsers().length === 0) {
                <div class="text-center py-12 text-on-surface-variant">
                  <span class="material-symbols-outlined text-4xl block mb-2">search_off</span>
                  <p class="text-sm font-medium">No users found</p>
                </div>
              }
            </div>

            <!-- Pagination -->
            @if (totalUserPages() > 1) {
              <div class="flex flex-col items-center gap-3 mt-6">
                <!-- Page X of Y -->
                <p class="text-xs text-on-surface-variant font-medium">
                  Page <span class="font-black text-on-surface">{{ userPage() }}</span> of <span class="font-black text-on-surface">{{ totalUserPages() }}</span>
                  <span class="text-outline"> · {{ filteredUsers().length }} users</span>
                </p>
                <!-- Arrows + number buttons -->
                <div class="flex items-center gap-1">
                  <!-- First page -->
                  <button (click)="userPage.set(1)" [disabled]="userPage() === 1"
                          class="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container active:scale-90 transition-all"
                          title="First page">
                    <span class="material-symbols-outlined text-[18px]">first_page</span>
                  </button>
                  <!-- Prev -->
                  <button (click)="userPage.update(p => p - 1)" [disabled]="userPage() === 1"
                          class="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container active:scale-90 transition-all">
                    <span class="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>

                  @for (p of pageRange(); track $index) {
                    @if (p === '…') {
                      <span class="w-9 h-9 flex items-center justify-center text-outline font-bold select-none">…</span>
                    } @else {
                      <button (click)="userPage.set(p)"
                              class="w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all"
                              [class]="userPage() === p ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-low text-on-surface hover:bg-surface-container active:scale-90'">
                        {{ p }}
                      </button>
                    }
                  }

                  <!-- Next -->
                  <button (click)="userPage.update(p => p + 1)" [disabled]="userPage() === totalUserPages()"
                          class="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container active:scale-90 transition-all">
                    <span class="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                  <!-- Last page -->
                  <button (click)="userPage.set(totalUserPages())" [disabled]="userPage() === totalUserPages()"
                          class="w-9 h-9 flex items-center justify-center rounded-xl bg-surface-container-low text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container active:scale-90 transition-all"
                          title="Last page">
                    <span class="material-symbols-outlined text-[18px]">last_page</span>
                  </button>
                </div>
              </div>
            }
          }
        }

        <!-- ══════ LOCATIONS TAB ══════ -->
        @if (activeTab() === 'locations') {
          @if (loadingLocations()) {
            <div class="flex items-center justify-center py-20">
              <span class="material-symbols-outlined text-5xl animate-pulse text-tertiary">location_on</span>
            </div>
          } @else if (pendingLocations().length === 0) {
            <div class="text-center py-16 text-on-surface-variant">
              <span class="material-symbols-outlined text-5xl block mb-3 text-outline">check_circle</span>
              <p class="font-bold text-on-surface">All clear!</p>
              <p class="text-sm mt-1">No pending location proposals.</p>
            </div>
          } @else {
            <div class="space-y-4">
              @for (loc of pendingLocations(); track loc.id) {
                <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 overflow-hidden shadow-sm">

                  <!-- Header: who proposed + when -->
                  <div class="flex items-center justify-between gap-3 px-4 py-3 bg-primary/5 border-b border-outline-variant/10">
                    @if (loc.proposedByUserId) {
                      <a [routerLink]="['/users', loc.proposedByUserId]"
                         class="flex items-center gap-2.5 min-w-0 group">
                        <div class="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0 border-2 border-primary/20 group-hover:border-primary transition-colors">
                          <span class="text-xs font-bold text-on-primary-container">{{ initials(loc.proposedByUsername || '?') }}</span>
                        </div>
                        <div class="min-w-0">
                          <p class="text-[9px] font-black uppercase tracking-widest text-primary leading-none">Proposed by</p>
                          <p class="text-sm font-bold text-on-surface truncate group-hover:text-primary transition-colors">
                            {{ loc.proposedByUsername || 'Unknown user' }}
                          </p>
                        </div>
                      </a>
                    } @else {
                      <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center shrink-0">
                          <span class="material-symbols-outlined text-outline text-[18px]">person_off</span>
                        </div>
                        <div class="min-w-0">
                          <p class="text-[9px] font-black uppercase tracking-widest text-outline leading-none">Anonymous</p>
                          <p class="text-sm font-bold text-on-surface-variant truncate">No proposer linked</p>
                        </div>
                      </div>
                    }
                    <span class="text-[10px] text-outline font-medium shrink-0 flex items-center gap-1">
                      <span class="material-symbols-outlined text-[12px]">schedule</span>
                      {{ loc.createdAt | date:'d MMM yyyy, HH:mm' }}
                    </span>
                  </div>

                  <div class="flex gap-4 p-4">
                    <!-- Thumbnail / map preview -->
                    <a [routerLink]="['/locations', loc.id]"
                       class="w-24 h-24 rounded-xl shrink-0 overflow-hidden bg-surface-container-low flex items-center justify-center relative group">
                      @if (loc.mainPhotoUrl) {
                        <img [src]="loc.mainPhotoUrl" [alt]="loc.name" class="w-full h-full object-cover group-hover:scale-105 transition-transform" (error)="onImgError($event)" />
                      } @else {
                        <img [src]="mapPreviewUrl(loc)" [alt]="'Map of ' + loc.name"
                             class="w-full h-full object-cover group-hover:scale-105 transition-transform"
                             (error)="onImgError($event)" />
                        <span class="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <span class="material-symbols-outlined text-3xl text-primary drop-shadow"
                                style="font-variation-settings:'FILL' 1,'wght' 600,'GRAD' 0,'opsz' 24;">place</span>
                        </span>
                      }
                    </a>
                    <!-- Info -->
                    <div class="flex-1 min-w-0">
                      <h3 class="font-black text-on-surface text-base leading-tight truncate">{{ loc.name }}</h3>
                      <p class="text-xs text-on-surface-variant mt-0.5 truncate flex items-center gap-1">
                        <span class="material-symbols-outlined text-[12px]">location_on</span>{{ loc.address }}
                      </p>
                      <div class="flex flex-wrap gap-1.5 mt-2">
                        @for (sport of loc.sports.split(','); track sport) {
                          <span class="bg-surface-container text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">{{ sport.trim() }}</span>
                        }
                        @if (loc.surface) {
                          <span class="bg-surface-container text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full">{{ loc.surface }}</span>
                        }
                        @if (loc.hasLights) {
                          <span class="bg-surface-container text-primary text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <span class="material-symbols-outlined text-[11px]">light_mode</span>Lights
                          </span>
                        }
                      </div>
                      @if (loc.details) {
                        <p class="text-xs text-on-surface-variant mt-2 line-clamp-2">{{ loc.details }}</p>
                      }
                    </div>
                  </div>

                  <!-- Coords + actions -->
                  <div class="flex items-center justify-between gap-2 px-4 py-3 border-t border-outline-variant/10 bg-surface-container/30 flex-wrap">
                    <div class="flex items-center gap-2 text-[10px] font-mono">
                      <span class="text-outline">{{ loc.latitude }}, {{ loc.longitude }}</span>
                      <a [href]="osmLink(loc)" target="_blank" rel="noopener"
                         title="View on OpenStreetMap"
                         class="flex items-center gap-0.5 text-primary font-bold hover:underline">
                        <span class="material-symbols-outlined text-[13px]">open_in_new</span>
                        Map
                      </a>
                      <a [routerLink]="['/locations', loc.id]"
                         title="Preview public page"
                         class="flex items-center gap-0.5 text-primary font-bold hover:underline">
                        <span class="material-symbols-outlined text-[13px]">visibility</span>
                        Preview
                      </a>
                    </div>
                    <div class="flex gap-2">
                      <button (click)="rejectLocation(loc)"
                              [disabled]="processingLocations().has(loc.id)"
                              class="flex items-center gap-1 bg-error/10 text-error text-xs font-bold px-3 py-1.5 rounded-full hover:bg-error hover:text-white active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        @if (processingLocations().has(loc.id)) {
                          <span class="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                        } @else {
                          <span class="material-symbols-outlined text-[14px]">close</span>
                        }
                        Deny
                      </button>
                      <button (click)="approveLocation(loc)"
                              [disabled]="processingLocations().has(loc.id)"
                              class="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full hover:bg-primary hover:text-on-primary active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                        @if (processingLocations().has(loc.id)) {
                          <span class="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
                        } @else {
                          <span class="material-symbols-outlined text-[14px]">check</span>
                        }
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              }
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
  private locationsService = inject(LocationsService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  activeTab = signal<'users' | 'locations'>('users');

  // ── Users ──
  users            = signal<User[]>([]);
  loadingUsers     = signal(true);
  promoting        = signal(new Set<number>());
  search           = signal('');
  userPage         = signal(1);
  totalUsers       = signal(0);
  readonly pageSize = 10;

  adminCount = () => this.users().filter(u => u.role === 'Admin').length;

  filteredUsers = computed(() => {
    const q = this.search().toLowerCase();
    return q ? this.users().filter(u => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) : this.users();
  });

  totalUserPages = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / this.pageSize)));

  pagedUsers = computed(() => {
    const start = (this.userPage() - 1) * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  /**
   * Classic paginator output. Returns page numbers with `'…'` separators
   * when there are gaps, e.g. 1 … 4 5 6 … 20.
   */
  pageRange = computed<(number | '…')[]>(() => {
    const total = this.totalUserPages();
    const cur = this.userPage();
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

    const result: (number | '…')[] = [];
    const window = 1; // pages on each side of current
    const left = Math.max(2, cur - window);
    const right = Math.min(total - 1, cur + window);

    result.push(1);
    if (left > 2) result.push('…');
    for (let p = left; p <= right; p++) result.push(p);
    if (right < total - 1) result.push('…');
    result.push(total);
    return result;
  });

  // ── Locations ──
  pendingLocations    = signal<Location[]>([]);
  loadingLocations    = signal(false);
  processingLocations = signal(new Set<number>());
  private pendingLoaded = false;

  ngOnInit(): void {
    this.fetchUsers();
  }

  private fetchUsers(): void {
    this.loadingUsers.set(true);
    this.usersService.getAll(1, 500).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.loadingUsers.set(false);
        this.toast.error('Could not load users.');
        return EMPTY;
      }),
    ).subscribe(result => {
      this.users.set(result.items);
      this.totalUsers.set(result.totalCount ?? result.items.length);
      this.loadingUsers.set(false);
    });
  }

  loadPending(): void {
    if (this.pendingLoaded) return;
    this.pendingLoaded = true;
    this.loadingLocations.set(true);
    this.locationsService.getPending(1, 100).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.loadingLocations.set(false);
        this.toast.error('Could not load pending locations.');
        return EMPTY;
      }),
    ).subscribe(result => {
      this.pendingLocations.set(result.items);
      this.loadingLocations.set(false);
    });
  }

  approveLocation(loc: Location): void {
    this.processingLocations.update(s => new Set(s).add(loc.id));
    this.locationsService.approve(loc.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.processingLocations.update(s => { const n = new Set(s); n.delete(loc.id); return n; });
        this.toast.error('Could not approve location.');
        return EMPTY;
      }),
    ).subscribe(() => {
      this.pendingLocations.update(list => list.filter(l => l.id !== loc.id));
      this.processingLocations.update(s => { const n = new Set(s); n.delete(loc.id); return n; });
      this.toast.success(`"${loc.name}" approved!`);
    });
  }

  rejectLocation(loc: Location): void {
    this.processingLocations.update(s => new Set(s).add(loc.id));
    this.locationsService.reject(loc.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.processingLocations.update(s => { const n = new Set(s); n.delete(loc.id); return n; });
        this.toast.error('Could not reject location.');
        return EMPTY;
      }),
    ).subscribe(() => {
      this.pendingLocations.update(list => list.filter(l => l.id !== loc.id));
      this.processingLocations.update(s => { const n = new Set(s); n.delete(loc.id); return n; });
      this.toast.info(`"${loc.name}" rejected.`);
    });
  }

  promote(user: User): void {
    this.promoting.update(s => new Set(s).add(user.id));
    this.usersService.promoteToAdmin(user.id).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.promoting.update(s => { const n = new Set(s); n.delete(user.id); return n; });
        this.toast.error('Could not promote user.');
        return EMPTY;
      }),
    ).subscribe(() => {
      this.users.update(list => list.map(u => u.id === user.id ? { ...u, role: 'Admin' } : u));
      this.promoting.update(s => { const n = new Set(s); n.delete(user.id); return n; });
      this.toast.success(`${user.username} is now an Admin!`);
    });
  }

  initials(username: string): string { return (username ?? '').slice(0, 2).toUpperCase(); }

  /** Static OSM map snapshot — gives admins a quick visual to verify the spot. */
  mapPreviewUrl(loc: Location): string {
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${loc.latitude},${loc.longitude}&zoom=15&size=200x200&markers=${loc.latitude},${loc.longitude},red-pushpin`;
  }

  /** Deep link into OSM so admins can verify the coordinates are sensible. */
  osmLink(loc: Location): string {
    return `https://www.openstreetmap.org/?mlat=${loc.latitude}&mlon=${loc.longitude}#map=17/${loc.latitude}/${loc.longitude}`;
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.display = 'none';
  }
}
