import {
  Component, inject, signal, computed,
  ChangeDetectionStrategy, DestroyRef, OnInit,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, catchError, EMPTY } from 'rxjs';
import { UsersService } from '../../core/services/users.service';
import { FriendsService } from '../../core/services/friends.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../shared/components/desktop-header/desktop-header.component';
import type { User } from '../../core/models/user.model';
import type { Activity } from '../../core/models/activity.model';
import { getSport, sportColor, sportIcon, sportGradient } from '../../core/utils/sport-utils';

const FALLBACK_AVATAR_BG = ['#FFE0B2', '#C8E6C9', '#BBDEFB', '#F8BBD0', '#D1C4E9', '#FFCCBC', '#B2EBF2', '#DCEDC8'];

function userInitials(username: string): string {
  const u = (username ?? '').trim();
  if (!u) return 'SM';
  const parts = u.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return u.slice(0, 2).toUpperCase();
}

function avatarBgFor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) hash = (hash * 31 + username.charCodeAt(i)) | 0;
  return FALLBACK_AVATAR_BG[Math.abs(hash) % FALLBACK_AVATAR_BG.length];
}

function relativeDate(dateStr: string): string {
  const d = new Date(dateStr).getTime();
  const diff = Date.now() - d;
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}

@Component({
  selector: 'app-athlete-profile',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, BottomNavComponent, DesktopHeaderComponent],
  template: `
    <div class="min-h-screen bg-background pb-32 md:pb-12">
      <app-desktop-header />

      @if (loading()) {
        <div class="flex items-center justify-center min-h-[70vh]">
          <span class="material-symbols-outlined animate-spin text-5xl text-primary">progress_activity</span>
        </div>

      } @else if (!athlete()) {
        <div class="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-6 text-center">
          <div class="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center">
            <span class="material-symbols-outlined text-4xl text-outline">person_off</span>
          </div>
          <p class="text-lg font-bold text-on-surface">Athlete not found</p>
          <a routerLink="/home" class="text-primary font-bold hover:underline">Go back home</a>
        </div>

      } @else {
        <!-- ════ HERO ════ -->
        <section class="relative overflow-hidden">
          <div class="h-44 md:h-72 w-full relative"
               [style.background]="heroGradient()">
            <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.18)_0%,transparent_60%)]"></div>
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-background/95"></div>
            @if (favSports().length > 0) {
              <span class="material-symbols-outlined absolute -bottom-4 -right-4 text-[180px] text-white/10 select-none pointer-events-none"
                    style="font-variation-settings:'FILL' 1,'wght' 600,'GRAD' 0,'opsz' 48;">
                {{ heroIcon() }}
              </span>
            }
          </div>

          <button (click)="goBack()"
                  class="md:hidden absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-md active:scale-95 z-10">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>

          <div class="max-w-5xl mx-auto px-5 md:px-12">
            <div class="flex flex-col md:flex-row md:items-end gap-5 md:gap-8 -mt-20 md:-mt-24 pb-8">

              <div class="relative shrink-0 mx-auto md:mx-0">
                <div class="w-32 h-32 md:w-40 md:h-40 rounded-3xl overflow-hidden border-4 border-background shadow-xl flex items-center justify-center"
                     [style.background-color]="avatarBg()">
                  @if (athlete()!.profilePhotoUrl && !photoFailed()) {
                    <img [src]="athlete()!.profilePhotoUrl!"
                         [alt]="athlete()!.username"
                         (error)="photoFailed.set(true)"
                         class="w-full h-full object-cover" />
                  } @else {
                    <span class="text-4xl md:text-5xl font-black text-on-primary-container">
                      {{ initials() }}
                    </span>
                  }
                </div>
                @if (isOwnProfile()) {
                  <a routerLink="/profile"
                     class="absolute -bottom-2 -right-2 w-9 h-9 bg-primary text-on-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                    <span class="material-symbols-outlined text-[16px]">edit</span>
                  </a>
                }
              </div>

              <div class="flex-1 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 text-center md:text-left">
                <div class="space-y-2">
                  <span class="inline-block bg-primary-container/60 text-on-primary-container text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                    Athlete
                  </span>
                  <h1 class="text-3xl md:text-4xl font-black tracking-tighter text-on-surface leading-tight">
                    {{ athlete()!.username }}
                  </h1>
                  <p class="text-sm md:text-base text-on-surface-variant">
                    {{ favSports().length > 0 ? favSports().join(' · ') : 'SportMap athlete' }}
                  </p>
                  <p class="text-xs text-outline">
                    Joined {{ athlete()!.createdAt | date:'MMM yyyy' }}
                  </p>
                </div>

                <div class="flex items-center gap-3 justify-center md:justify-end">
                  @if (!isOwnProfile()) {
                    <button (click)="toggleFollow()"
                            [disabled]="followLoading()"
                            class="px-7 py-3 rounded-full font-bold text-sm transition-all active:scale-95 disabled:opacity-60 flex items-center gap-2"
                            [class]="isFollowing()
                              ? 'bg-surface-container border-2 border-outline-variant/40 text-on-surface hover:border-error/50 hover:text-error'
                              : 'bg-primary text-on-primary shadow-md shadow-primary/20 hover:opacity-90'">
                      @if (followLoading()) {
                        <span class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      } @else {
                        <span class="material-symbols-outlined text-[18px]">{{ isFollowing() ? 'check' : 'add' }}</span>
                      }
                      {{ isFollowing() ? 'Following' : 'Follow' }}
                    </button>
                  } @else {
                    <a routerLink="/profile"
                       class="px-7 py-3 rounded-full font-bold text-sm border-2 border-outline-variant/40 text-on-surface hover:bg-surface-container-low transition-all active:scale-95 flex items-center gap-2">
                      <span class="material-symbols-outlined text-[18px]">edit</span>
                      Edit profile
                    </a>
                  }
                </div>
              </div>
            </div>

            @if (favSports().length > 0) {
              <div class="flex flex-wrap gap-2 justify-center md:justify-start mb-8">
                @for (s of favSports(); track s) {
                  <span class="bg-surface-container-low px-4 py-2 rounded-full flex items-center gap-2 text-xs font-bold border border-outline-variant/10 shadow-sm">
                    <span class="w-2 h-2 rounded-full shrink-0" [style.background-color]="getSportColor(s)"></span>
                    {{ s }}
                  </span>
                }
              </div>
            }

            <div class="grid grid-cols-3 gap-2 md:gap-4 mb-10">
              <button (click)="toggleFollowers()"
                      class="p-4 md:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                      [class.ring-2]="showFollowers()"
                      [class.ring-primary]="showFollowers()">
                <div class="flex items-center gap-2 justify-center md:justify-start mb-1">
                  <span class="material-symbols-outlined text-[16px] text-primary">group</span>
                  <span class="text-[10px] font-black uppercase tracking-widest text-outline">Followers</span>
                </div>
                <p class="text-2xl md:text-3xl font-black text-on-surface text-center md:text-left">{{ followerCount() }}</p>
              </button>
              <button (click)="toggleFollowing()"
                      class="p-4 md:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm hover:shadow-md active:scale-[0.98] transition-all"
                      [class.ring-2]="showFollowing()"
                      [class.ring-primary]="showFollowing()">
                <div class="flex items-center gap-2 justify-center md:justify-start mb-1">
                  <span class="material-symbols-outlined text-[16px] text-primary">person_add</span>
                  <span class="text-[10px] font-black uppercase tracking-widest text-outline">Following</span>
                </div>
                <p class="text-2xl md:text-3xl font-black text-on-surface text-center md:text-left">{{ followingCount() }}</p>
              </button>
              <div class="p-4 md:p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/10 shadow-sm">
                <div class="flex items-center gap-2 justify-center md:justify-start mb-1">
                  <span class="material-symbols-outlined text-[16px] text-primary">sports</span>
                  <span class="text-[10px] font-black uppercase tracking-widest text-outline">Activities</span>
                </div>
                <p class="text-2xl md:text-3xl font-black text-on-surface text-center md:text-left">{{ activities().length }}</p>
              </div>
            </div>
          </div>
        </section>

        <div class="max-w-5xl mx-auto px-5 md:px-12">

          @if (showFollowers() || showFollowing()) {
            <section class="bg-surface-container-lowest rounded-3xl border border-outline-variant/10 shadow-lg overflow-hidden mb-8">
              <div class="flex items-center px-2 md:px-3 pt-3 bg-surface-container-low">
                <button (click)="toggleFollowers()"
                        class="flex-1 md:flex-initial md:min-w-[180px] px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        [class]="showFollowers()
                          ? 'bg-surface-container-lowest text-primary shadow-sm'
                          : 'text-outline hover:text-on-surface'">
                  <span class="material-symbols-outlined text-[16px]">group</span>
                  Followers · {{ followerCount() }}
                </button>
                <button (click)="toggleFollowing()"
                        class="flex-1 md:flex-initial md:min-w-[180px] px-4 py-2.5 rounded-t-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                        [class]="showFollowing()
                          ? 'bg-surface-container-lowest text-primary shadow-sm'
                          : 'text-outline hover:text-on-surface'">
                  <span class="material-symbols-outlined text-[16px]">person_add</span>
                  Following · {{ followingCount() }}
                </button>
                <div class="flex-1 hidden md:block"></div>
                <button (click)="closeLists()"
                        class="w-9 h-9 ml-1 mb-1 flex items-center justify-center rounded-full text-outline hover:bg-surface-container active:scale-95 transition-all">
                  <span class="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              <div class="p-4 md:p-6 max-h-[60vh] overflow-y-auto">
                @if (showFollowers()) {
                  @if (followersList().length === 0) {
                    <div class="flex flex-col items-center gap-3 py-10 text-center">
                      <div class="w-14 h-14 rounded-3xl bg-surface-container flex items-center justify-center">
                        <span class="material-symbols-outlined text-2xl text-outline">group_off</span>
                      </div>
                      <p class="text-sm font-bold text-on-surface">No followers yet</p>
                    </div>
                  } @else {
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                      @for (u of followersList(); track u.id) {
                        <a [routerLink]="userLink(u.id)"
                           class="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-container-low active:scale-[0.99] transition-all border border-transparent hover:border-outline-variant/20">
                          <div class="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-surface-container-lowest"
                               [style.background-color]="getAvatarBg(u.username)">
                            @if (u.profilePhotoUrl) {
                              <img [src]="u.profilePhotoUrl" [alt]="u.username" class="w-full h-full object-cover" />
                            } @else {
                              <span class="text-sm font-black text-on-primary-container">{{ getInitials(u.username) }}</span>
                            }
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="font-bold text-sm text-on-surface truncate">{{ atSign(u.username) }}</p>
                            <p class="text-[11px] text-outline truncate">{{ u.favoriteSports || 'Athlete on SportMap' }}</p>
                          </div>
                          <span class="material-symbols-outlined text-[20px] text-outline-variant shrink-0">chevron_right</span>
                        </a>
                      }
                    </div>
                  }
                } @else {
                  @if (followingList().length === 0) {
                    <div class="flex flex-col items-center gap-3 py-10 text-center">
                      <div class="w-14 h-14 rounded-3xl bg-surface-container flex items-center justify-center">
                        <span class="material-symbols-outlined text-2xl text-outline">person_search</span>
                      </div>
                      <p class="text-sm font-bold text-on-surface">Not following anyone yet</p>
                    </div>
                  } @else {
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3">
                      @for (u of followingList(); track u.id) {
                        <a [routerLink]="userLink(u.id)"
                           class="flex items-center gap-3 p-3 rounded-2xl hover:bg-surface-container-low active:scale-[0.99] transition-all border border-transparent hover:border-outline-variant/20">
                          <div class="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center shrink-0 ring-2 ring-surface-container-lowest"
                               [style.background-color]="getAvatarBg(u.username)">
                            @if (u.profilePhotoUrl) {
                              <img [src]="u.profilePhotoUrl" [alt]="u.username" class="w-full h-full object-cover" />
                            } @else {
                              <span class="text-sm font-black text-on-primary-container">{{ getInitials(u.username) }}</span>
                            }
                          </div>
                          <div class="flex-1 min-w-0">
                            <p class="font-bold text-sm text-on-surface truncate">{{ atSign(u.username) }}</p>
                            <p class="text-[11px] text-outline truncate">{{ u.favoriteSports || 'Athlete on SportMap' }}</p>
                          </div>
                          <span class="material-symbols-outlined text-[20px] text-outline-variant shrink-0">chevron_right</span>
                        </a>
                      }
                    </div>
                  }
                }
              </div>
            </section>
          }

          <!-- Activities -->
          <section>
            <div class="flex items-center justify-between mb-5">
              <h2 class="text-xl md:text-2xl font-black tracking-tight text-on-surface">Activities</h2>
              @if (activities().length > 0) {
                <span class="text-xs font-bold text-outline uppercase tracking-widest">{{ activities().length }} total</span>
              }
            </div>

            @if (activitiesLoading()) {
              <div class="flex items-center gap-3 py-10 text-on-surface-variant justify-center">
                <span class="material-symbols-outlined animate-pulse text-primary">sports</span>
                <p class="text-sm">Loading activities…</p>
              </div>

            } @else if (activities().length === 0) {
              <div class="bg-surface-container-lowest rounded-2xl p-10 text-center border border-outline-variant/10">
                <div class="w-16 h-16 rounded-3xl bg-surface-container flex items-center justify-center mx-auto mb-3">
                  <span class="material-symbols-outlined text-3xl text-outline">event_busy</span>
                </div>
                <p class="text-sm font-bold text-on-surface">No public activities yet</p>
                <p class="text-xs text-outline mt-1">Check back later — they may have private ones in the works.</p>
              </div>

            } @else {
              <div class="grid gap-3 md:grid-cols-2">
                @for (activity of activities(); track activity.id) {
                  <a [routerLink]="['/activities', activity.id]"
                     class="group flex items-stretch gap-4 bg-surface-container-lowest hover:bg-surface-container-low transition-all rounded-2xl overflow-hidden border border-outline-variant/10 shadow-sm hover:shadow-md">

                    <div class="w-1.5 shrink-0" [style.background]="getSportGradient(activity.sport)"></div>

                    <div class="w-14 h-14 my-3 rounded-2xl flex items-center justify-center shrink-0"
                         [style.background]="getSportGradient(activity.sport)">
                      <span class="material-symbols-outlined text-white text-[24px]"
                            style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24;">
                        {{ getSportIcon(activity.sport) }}
                      </span>
                    </div>

                    <div class="flex-1 min-w-0 py-3 pr-3 flex flex-col justify-between">
                      <div>
                        <h4 class="font-black text-on-surface text-sm md:text-base leading-tight truncate group-hover:text-primary transition-colors">
                          {{ activity.title }}
                        </h4>
                        <p class="text-[11px] font-bold text-outline mt-0.5 uppercase tracking-widest">{{ activity.sport }}</p>
                      </div>
                      <div class="flex items-center gap-3 mt-2 text-xs text-on-surface-variant">
                        <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-[14px]">schedule</span>
                          {{ activity.dateTime | date:'d MMM · HH:mm' }}
                        </span>
                        <span class="flex items-center gap-1">
                          <span class="material-symbols-outlined text-[14px]">groups</span>
                          {{ activity.participantCount }}/{{ activity.maxParticipants }}
                        </span>
                        <span class="ml-auto text-[10px] font-bold text-outline">{{ getRelativeDate(activity.dateTime) }}</span>
                      </div>
                    </div>
                  </a>
                }
              </div>
            }
          </section>
        </div>
      }

      <div class="md:hidden">
        <app-bottom-nav />
      </div>
    </div>
  `,
})
export class AthleteProfileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private usersService = inject(UsersService);
  private friendsService = inject(FriendsService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  athlete = signal<User | null>(null);
  loading = signal(true);
  activitiesLoading = signal(true);
  photoFailed = signal(false);

  followerCount = signal(0);
  followingCount = signal(0);
  followersList = signal<User[]>([]);
  followingList = signal<User[]>([]);
  showFollowers = signal(false);
  showFollowing = signal(false);

  isFollowing = signal(false);
  followLoading = signal(false);

  activities = signal<Activity[]>([]);

  isOwnProfile = computed(() => {
    const me = this.auth.currentUser()?.userId;
    return me !== undefined && me === this.athlete()?.id;
  });

  initials = computed(() => userInitials(this.athlete()?.username ?? ''));
  avatarBg = computed(() => avatarBgFor(this.athlete()?.username ?? ''));

  favSports = computed(() => {
    const raw = this.athlete()?.favoriteSports ?? '';
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  });

  heroGradient = computed(() => {
    const sports = this.favSports();
    if (sports.length === 0) {
      return 'linear-gradient(135deg, #5C6BC0 0%, #283593 100%)';
    }
    return getSport(sports[0]).gradient;
  });

  heroIcon = computed(() => {
    const sports = this.favSports();
    return sports.length > 0 ? getSport(sports[0]).icon : 'sports';
  });

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      const id = Number(params.get('id'));
      if (!id) { this.router.navigate(['/home']); return; }

      const me = this.auth.currentUser()?.userId;
      if (me === id) {
        this.router.navigate(['/profile'], { replaceUrl: true });
        return;
      }

      this.load(id);
    });
  }

  private load(id: number): void {
    this.loading.set(true);
    this.activitiesLoading.set(true);
    this.photoFailed.set(false);

    forkJoin({
      user: this.usersService.getById(id),
      followers: this.friendsService.getFollowers(id).pipe(catchError(() => EMPTY)),
      following: this.friendsService.getFollowing(id).pipe(catchError(() => EMPTY)),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ user, followers, following }) => {
          this.athlete.set(user);
          if (followers) {
            this.followerCount.set(followers.totalCount);
            this.followersList.set([...followers.items]);
          }
          if (following) {
            this.followingCount.set(following.totalCount);
            this.followingList.set([...following.items]);
          }
          this.loading.set(false);

          const me = this.auth.currentUser()?.userId;
          if (me && me !== id) {
            this.friendsService.isFollowing(id)
              .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => EMPTY))
              .subscribe(r => this.isFollowing.set(!!r?.isFollowing));
          }
        },
        error: () => {
          this.athlete.set(null);
          this.loading.set(false);
        },
      });

    this.friendsService.getUserActivities(id)
      .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => {
        this.activitiesLoading.set(false);
        return EMPTY;
      }))
      .subscribe(acts => {
        this.activities.set(acts);
        this.activitiesLoading.set(false);
      });
  }

  toggleFollow(): void {
    const id = this.athlete()?.id;
    if (!id) return;
    this.followLoading.set(true);
    const wasFollowing = this.isFollowing();
    const action = wasFollowing
      ? this.friendsService.unfollow(id)
      : this.friendsService.follow(id);

    action.pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.toast.error('Could not update follow. Try again.');
        this.followLoading.set(false);
        return EMPTY;
      }),
    ).subscribe(() => {
      this.isFollowing.set(!wasFollowing);
      this.followerCount.update(c => wasFollowing ? Math.max(0, c - 1) : c + 1);
      this.followLoading.set(false);
    });
  }

  toggleFollowers(): void {
    this.showFollowers.update(v => !v);
    if (this.showFollowing()) this.showFollowing.set(false);
  }

  toggleFollowing(): void {
    this.showFollowing.update(v => !v);
    if (this.showFollowers()) this.showFollowers.set(false);
  }

  closeLists(): void {
    this.showFollowers.set(false);
    this.showFollowing.set(false);
  }

  goBack(): void {
    if (window.history.length > 1) window.history.back();
    else this.router.navigate(['/home']);
  }

  userLink(userId: number): (string | number)[] {
    const me = this.auth.currentUser()?.userId;
    return me === userId ? ['/profile'] : ['/users', userId];
  }

  getInitials(username: string): string { return userInitials(username); }
  getAvatarBg(username: string): string { return avatarBgFor(username); }
  getSportColor(sport: string): string { return sportColor(sport); }
  getSportIcon(sport: string): string { return sportIcon(sport); }
  getSportGradient(sport: string): string { return sportGradient(sport); }
  getRelativeDate(s: string): string { return relativeDate(s); }
  atSign(username: string): string { return '@' + username; }
}
