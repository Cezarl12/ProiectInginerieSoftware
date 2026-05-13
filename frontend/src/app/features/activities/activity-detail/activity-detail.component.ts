import {
  Component, inject, OnInit, signal, computed,
  ChangeDetectionStrategy, DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ParticipationsService } from '../../../core/services/participations.service';
import { AuthService } from '../../../core/services/auth.service';
import { UsersService } from '../../../core/services/users.service';
import { ToastService } from '../../../core/services/toast.service';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../../shared/components/desktop-header/desktop-header.component';
import { ActivityType } from '../../../core/models/activity.model';
import type { Activity } from '../../../core/models/activity.model';
import type { User } from '../../../core/models/user.model';
import { sportColor as getSportColor, sportIcon as getSportIcon, sportGradient as getSportGradient, sportPhoto as getSportPhoto, FALLBACK_PHOTO } from '../../../core/utils/sport-utils';


function userInitials(username: string): string {
  const parts = (username ?? '').trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (username ?? '').slice(0, 2).toUpperCase();
}

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BottomNavComponent, DesktopHeaderComponent, DatePipe, RouterLink],
  template: `
    <div class="min-h-screen bg-background flex flex-col">
      <app-desktop-header />

      <!-- Mobile header -->
      <header class="sticky top-0 z-40 bg-background/95 backdrop-blur-md md:hidden shrink-0 border-b border-outline-variant/10">
        <div class="flex items-center gap-3 px-4 py-3">
          <button (click)="goBack()"
                  class="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full active:scale-95 transition-transform shrink-0">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div class="flex-1 min-w-0">
            <p class="text-[10px] font-bold uppercase tracking-widest text-primary leading-none">Active Event</p>
            @if (activity()) {
              <h1 class="text-sm font-bold tracking-tight text-on-surface truncate leading-tight">{{ activity()!.title }}</h1>
            }
          </div>
          <a routerLink="/profile" class="w-9 h-9 rounded-full overflow-hidden border-2 border-outline-variant/20 bg-primary-container flex items-center justify-center shrink-0">
            @if (meUser()?.profilePhotoUrl) {
              <img [src]="meUser()!.profilePhotoUrl!" alt="You" class="w-full h-full object-cover"
                   (error)="onImgError($event, 'https://ui-avatars.com/api/?name=' + (meUser()!.username || 'Me') + '&size=64&background=random')" />
            } @else {
              <span class="text-[10px] font-bold text-on-primary-container">{{ currentUserInitials() }}</span>
            }
          </a>
        </div>
      </header>

      @if (loading()) {
        <div class="flex-1 flex items-center justify-center">
          <div class="flex flex-col items-center gap-4 text-on-surface-variant">
            <span class="material-symbols-outlined text-5xl animate-pulse text-primary">fitness_center</span>
            <p class="text-sm font-medium">Loading activity…</p>
          </div>
        </div>

      } @else if (error()) {
        <div class="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <span class="material-symbols-outlined text-5xl text-error">error_outline</span>
          <p class="text-on-surface-variant text-sm">{{ error() }}</p>
          <button (click)="goBack()"
                  class="bg-primary text-on-primary px-6 py-3 rounded-full font-bold active:scale-95 transition-all">
            Go back
          </button>
        </div>

      } @else if (activity()) {

        <!-- ════ MOBILE LAYOUT ════ -->
        <main class="flex-1 overflow-y-auto pb-44 md:hidden" style="scrollbar-width: none;">
          <!-- Hero -->
          <div class="px-6 pt-2">
            <div class="relative h-48 rounded-xl overflow-hidden shadow-sm">
              @if (activity()!.location?.mainPhotoUrl) {
                <img [src]="activity()!.location!.mainPhotoUrl!" [alt]="activity()!.location!.name" class="w-full h-full object-cover"
                     (error)="onImgError($event, heroPhoto())" />
              } @else {
                <img [src]="heroPhoto()" [alt]="activity()!.sport" class="w-full h-full object-cover"
                     (error)="onImgError($event, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&q=80')" />
              }
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

              <div class="absolute top-3 left-3">
                <span class="bg-white/20 backdrop-blur-sm text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-white/20">
                  {{ activity()!.sport }}
                </span>
              </div>

              @if (activity()!.type === ActivityType.Private) {
                <div class="absolute top-3 right-3">
                  <span class="flex items-center gap-1 bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <span class="material-symbols-outlined text-[12px]">lock</span>
                    Private
                  </span>
                </div>
              }

              <div class="absolute bottom-3 left-3 space-y-1">
                <div class="flex items-center gap-1.5 text-white text-xs font-semibold">
                  <span class="material-symbols-outlined text-[14px]">schedule</span>
                  {{ activity()!.dateTime | date:'EEE, d MMM · HH:mm' }}
                </div>
                @if (activity()!.location) {
                  <div class="flex items-center gap-1.5 text-white/80 text-xs font-medium">
                    <span class="material-symbols-outlined text-[14px]">location_on</span>
                    {{ activity()!.location!.name }}
                  </div>
                }
              </div>

              @if (mapsUrl()) {
                <a [href]="mapsUrl()!" target="_blank" rel="noopener"
                   class="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white text-on-surface text-[11px] font-bold px-3 py-1.5 rounded-full shadow-md active:scale-95 transition-all">
                  <span class="material-symbols-outlined text-[14px] text-primary">map</span>
                  Open in Maps
                </a>
              }
            </div>
          </div>

          <!-- Athletes -->
          <section class="mt-8 px-6">
            <div class="flex items-baseline gap-2 mb-4">
              <h2 class="text-2xl font-black tracking-tight text-on-surface">Athletes</h2>
              <span class="text-outline text-lg">({{ activity()!.participantCount }}/{{ activity()!.maxParticipants }})</span>
            </div>

            @if (activity()!.participantCount === 0) {
              <div class="bg-surface-container-low rounded-xl p-6 text-center">
                <span class="material-symbols-outlined text-4xl text-outline block mb-2">group_add</span>
                <p class="text-sm text-on-surface-variant font-medium">No athletes yet — be the first to join!</p>
              </div>
            } @else {
              <div class="flex gap-4 overflow-x-auto pb-3" style="scrollbar-width:none;">
                @for (p of participants(); track p.id) {
                  <a [routerLink]="userLink(p.id)" class="flex-shrink-0 flex flex-col items-center gap-2">
                    <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-surface bg-primary-container flex items-center justify-center"
                         [class]="p.id === activity()!.organizerId ? 'ring-2 ring-primary ring-offset-2' : ''">
                      @if (p.profilePhotoUrl) {
                        <img [src]="p.profilePhotoUrl" [alt]="p.username" class="w-full h-full object-cover"
                             (error)="onImgError($event, 'https://ui-avatars.com/api/?name=' + p.username + '&size=64&background=random')" />
                      } @else {
                        <span class="text-sm font-bold text-on-primary-container">{{ userInitials(p.username) }}</span>
                      }
                    </div>
                    <span class="text-[10px] font-bold text-on-surface-variant tracking-tight text-center max-w-[60px] truncate">
                      {{ p.id === activity()!.organizerId ? 'Host' : p.username }}
                    </span>
                  </a>
                }
                @for (i of emptySlots(); track i) {
                  <div class="flex-shrink-0 flex flex-col items-center gap-2 opacity-30">
                    <div class="w-16 h-16 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center">
                      <span class="material-symbols-outlined text-xl text-outline-variant">add</span>
                    </div>
                    <span class="text-[10px] font-bold text-outline tracking-tight">open</span>
                  </div>
                }
              </div>
              @if (activity()!.organizer?.username) {
                <p class="text-xs text-outline mt-2">
                  Organised by <a [routerLink]="userLink(activity()!.organizerId)" class="font-bold text-on-surface hover:text-primary transition-colors">{{ activity()!.organizer!.username }}</a>
                </p>
              }
            }
          </section>

          <div class="mx-6 mt-6 h-px bg-surface-container-high/50"></div>

          @if (activity()!.description) {
            <section class="px-6 mt-6">
              <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-3">About</p>
              <div class="bg-surface-container-low rounded-xl p-4">
                <p class="text-sm text-on-surface leading-relaxed">{{ activity()!.description }}</p>
              </div>
            </section>
          }

          <div class="mt-4 flex flex-col gap-6 px-6 pb-4">
            <div class="w-full h-px bg-surface-container-high/50"></div>
            <div class="flex items-center justify-center gap-3 py-4">
              <div class="bg-surface-container-low rounded-2xl p-6 text-center w-full">
                <span class="material-symbols-outlined text-4xl text-outline mb-3 block">lock</span>
                <p class="font-bold text-on-surface">Group Chat</p>
                <p class="text-sm text-on-surface-variant mt-1">Join the activity to access the group chat</p>
              </div>
            </div>
          </div>
        </main>

        <!-- Mobile fixed bottom action bar -->
        <div class="fixed bottom-20 left-0 right-0 px-6 z-50 md:hidden">
          <div class="bg-surface-container-lowest/90 backdrop-blur-xl rounded-full p-2 flex items-center gap-3 shadow-xl border border-outline-variant/10">
            <div class="flex-1 px-3 min-w-0">
              @if (joined()) {
                <p class="text-sm font-bold text-secondary truncate">You've joined!</p>
                <p class="text-xs text-on-surface-variant">{{ activity()!.dateTime | date:'EEE, d MMM • HH:mm' }}</p>
              } @else {
                <p class="text-sm font-semibold text-on-surface">{{ spotsLeft() }} spots left</p>
                <p class="text-xs text-on-surface-variant">{{ activity()!.dateTime | date:'EEE, d MMM • HH:mm' }}</p>
              }
            </div>
            @if (joined()) {
              <button (click)="leave()"
                      class="shrink-0 px-6 py-3 bg-error text-on-error rounded-full font-bold text-sm active:scale-95 transition-all">
                Leave
              </button>
            } @else {
              <button (click)="join()"
                      [disabled]="joining() || spotsLeft() === 0"
                      class="shrink-0 px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                {{ joining() ? 'Joining…' : spotsLeft() === 0 ? 'Full' : 'Join' }}
              </button>
            }
          </div>
        </div>

        <!-- ════ DESKTOP LAYOUT ════ -->
        <div class="hidden md:flex flex-col flex-1 overflow-hidden">

          <section class="bg-surface-container-low px-10 py-8 border-b border-outline-variant/10">
            <div class="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center gap-8">

              <div class="flex items-start gap-6 flex-1 min-w-0">
                <div class="w-20 h-20 rounded-xl flex items-center justify-center shrink-0"
                     [style.background]="sportGradient()">
                  <span class="material-symbols-outlined text-4xl text-white"
                        style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 48;">
                    {{ sportIcon() }}
                  </span>
                </div>
                <div class="flex-1 min-w-0 space-y-2">
                  <p class="text-[10px] font-black uppercase tracking-widest text-outline">{{ activity()!.sport }}</p>
                  <h1 class="text-4xl md:text-5xl font-black tracking-tight text-on-surface leading-none">{{ activity()!.title }}</h1>
                  <div class="flex flex-wrap items-center gap-4 text-sm text-on-surface-variant">
                    <span class="flex items-center gap-1.5">
                      <span class="material-symbols-outlined text-[16px] text-primary">schedule</span>
                      {{ activity()!.dateTime | date:'EEE, d MMM · HH:mm' }}
                    </span>
                    @if (activity()!.location) {
                      <a [routerLink]="['/locations', activity()!.location!.id]"
                         class="flex items-center gap-1.5 hover:text-primary transition-colors">
                        <span class="material-symbols-outlined text-[16px] text-primary">location_on</span>
                        {{ activity()!.location!.name }}
                      </a>
                      @if (mapsUrl()) {
                        <a [href]="mapsUrl()!" target="_blank" rel="noopener"
                           class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-outline-variant/30 text-xs font-bold text-on-surface hover:bg-surface-container active:scale-95 transition-all">
                          <span class="material-symbols-outlined text-[14px] text-primary">map</span>
                          Open in Maps
                        </a>
                      }
                    }
                    <span class="flex items-center gap-1.5"
                          [class]="spotsLeft() > 0 ? 'text-secondary' : 'text-error'">
                      <span class="material-symbols-outlined text-[16px]">group</span>
                      {{ activity()!.participantCount }}/{{ activity()!.maxParticipants }} joined
                    </span>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-6 shrink-0">
                <div class="flex items-center -space-x-3">
                  @for (p of participants().slice(0, 5); track p.id) {
                    <a [routerLink]="userLink(p.id)"
                       class="w-10 h-10 rounded-full border-2 border-surface-container-low overflow-hidden bg-primary-container flex items-center justify-center">
                      @if (p.profilePhotoUrl) {
                        <img [src]="p.profilePhotoUrl" [alt]="p.username" class="w-full h-full object-cover"
                             (error)="onImgError($event, 'https://ui-avatars.com/api/?name=' + p.username + '&size=40&background=random')" />
                      } @else {
                        <span class="text-[10px] font-bold text-on-primary-container">{{ userInitials(p.username) }}</span>
                      }
                    </a>
                  }
                  @if (activity()!.participantCount > 5) {
                    <div class="w-10 h-10 rounded-full bg-surface-container-high border-2 border-surface-container-low flex items-center justify-center text-[10px] font-bold text-outline">
                      +{{ activity()!.participantCount - 5 }}
                    </div>
                  }
                </div>

                @if (joined()) {
                  <button (click)="leave()"
                          class="px-8 py-3 bg-error text-on-error rounded-full font-bold text-sm active:scale-95 transition-all">
                    Leave Activity
                  </button>
                } @else {
                  <button (click)="join()"
                          [disabled]="joining() || spotsLeft() === 0"
                          class="px-8 py-3 bg-primary text-on-primary rounded-full font-bold text-sm active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-primary/20">
                    {{ joining() ? 'Joining…' : spotsLeft() === 0 ? 'Activity Full' : 'Join Activity' }}
                  </button>
                }
              </div>
            </div>
          </section>

          <div class="flex-1 overflow-y-auto" style="scrollbar-width:thin;">
            <div class="max-w-7xl mx-auto px-10 py-8 grid lg:grid-cols-12 gap-8">

              <div class="lg:col-span-7 space-y-6">
                <div class="relative h-72 rounded-2xl overflow-hidden shadow-md">
                  @if (activity()!.location?.mainPhotoUrl) {
                    <img [src]="activity()!.location!.mainPhotoUrl!" [alt]="activity()!.location!.name" class="w-full h-full object-cover"
                         (error)="onImgError($event, heroPhoto())" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div class="absolute bottom-4 left-4 text-white">
                      <p class="text-[10px] font-bold uppercase tracking-widest opacity-70">Location</p>
                      <p class="font-bold text-lg">{{ activity()!.location!.name }}</p>
                    </div>
                  } @else {
                    <img [src]="heroPhoto()" [alt]="activity()!.sport" class="w-full h-full object-cover"
                         (error)="onImgError($event, 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop&q=80')" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  }
                </div>

                @if (activity()!.description) {
                  <div class="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
                    <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-3">About</p>
                    <p class="text-sm text-on-surface leading-relaxed">{{ activity()!.description }}</p>
                  </div>
                }
              </div>

              <div class="lg:col-span-5 space-y-6">
                <div class="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
                  <div class="flex items-baseline gap-2 mb-4">
                    <h2 class="text-lg font-black tracking-tight text-on-surface">Athletes</h2>
                    <span class="text-outline text-sm">({{ activity()!.participantCount }}/{{ activity()!.maxParticipants }})</span>
                  </div>
                  @if (activity()!.participantCount === 0) {
                    <p class="text-sm text-on-surface-variant text-center py-4">No athletes yet</p>
                  } @else {
                    <div class="flex flex-wrap gap-3">
                      @for (p of participants(); track p.id) {
                        <a [routerLink]="userLink(p.id)" class="flex flex-col items-center gap-1 group">
                          <div class="w-12 h-12 rounded-full overflow-hidden border-2 bg-primary-container flex items-center justify-center transition-all group-hover:scale-105"
                               [class]="p.id === activity()!.organizerId ? 'border-primary' : 'border-outline-variant/10'">
                            @if (p.profilePhotoUrl) {
                              <img [src]="p.profilePhotoUrl" [alt]="p.username" class="w-full h-full object-cover"
                                   (error)="onImgError($event, 'https://ui-avatars.com/api/?name=' + p.username + '&size=48&background=random')" />
                            } @else {
                              <span class="text-xs font-bold text-on-primary-container">{{ userInitials(p.username) }}</span>
                            }
                          </div>
                          <span class="text-[9px] font-bold text-outline truncate max-w-[48px]">
                            {{ p.id === activity()!.organizerId ? 'Host' : p.username }}
                          </span>
                        </a>
                      }
                    </div>
                    @if (activity()!.organizer?.username) {
                      <p class="text-xs text-outline mt-4">
                        Organised by <a [routerLink]="userLink(activity()!.organizerId)" class="font-bold text-on-surface hover:text-primary transition-colors">{{ activity()!.organizer!.username }}</a>
                      </p>
                    }
                  }
                </div>

                <div class="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10 shadow-sm">
                  <div class="bg-surface-container-low rounded-2xl p-8 text-center">
                    <span class="material-symbols-outlined text-4xl text-outline mb-3 block">lock</span>
                    <p class="font-bold text-on-surface">Group Chat</p>
                    <p class="text-sm text-on-surface-variant mt-1">Join the activity to access the group chat</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }
  

      <app-bottom-nav />
    </div>
  `,
})
export class ActivityDetailComponent implements OnInit {
  protected ActivityType = ActivityType;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private activitiesService = inject(ActivitiesService);
  private participationsService = inject(ParticipationsService);
  private auth = inject(AuthService);
  private usersService = inject(UsersService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  activity = signal<Activity | null>(null);
  participants = signal<User[]>([]);
  meUser = signal<User | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  joined = signal(false);
  joining = signal(false);

  sportColor = computed(() => getSportColor(this.activity()?.sport ?? ''));
  sportIcon = computed(() => getSportIcon(this.activity()?.sport ?? ''));
  sportGradient = computed(() => getSportGradient(this.activity()?.sport ?? ''));
  heroPhoto = computed(() => getSportPhoto(this.activity()?.sport ?? ''));

  currentUserInitials = computed(() => {
    const name = this.auth.currentUser()?.username ?? '';
    return name.slice(0, 2).toUpperCase() || 'ME';
  });

  emptySlots = computed(() => {
    const a = this.activity();
    if (!a) return [];
    const empty = Math.min(a.maxParticipants - a.participantCount, 3);
    return Array.from({ length: Math.max(0, empty) }, (_, i) => i + 1);
  });

  spotsLeft = computed(() => {
    const a = this.activity();
    return a ? a.maxParticipants - a.participantCount : 0;
  });

  /** Google Maps URL for the activity's location, if any. */
  mapsUrl = computed<string | null>(() => {
    const loc = this.activity()?.location;
    if (!loc) return null;
    if (typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
      const q = `${loc.latitude}, ${loc.longitude}`;
      return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
    }
    const text = [loc.name, loc.address].filter(Boolean).join(', ');
    return text
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`
      : null;
  });

  ngOnInit(): void {
    this.usersService.getMe().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => EMPTY),
    ).subscribe(u => this.meUser.set(u));

    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.activitiesService.getById(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.error.set('This activity is private. You need to be a mutual friend of the organizer to view it.');
        } else if (err.status === 404) {
          this.error.set('Activity not found.');
        } else {
          this.error.set('Something went wrong. Please try again.');
        }
        this.loading.set(false);
        return EMPTY;
      }),
    ).subscribe(a => {
      this.activity.set(a);
      this.loading.set(false);
      this.loadParticipants(id);
    });
  }

  private loadParticipants(activityId: number): void {
    this.activitiesService.getParticipants(activityId).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => EMPTY),
    ).subscribe(result => {
      this.participants.set([...result.items]);
      const myId = this.auth.currentUser()?.userId;
      if (myId) {
        this.joined.set(result.items.some(p => p.id === myId));
      }
    });
  }

  join(): void {
    const id = this.activity()?.id;
    if (!id) return;
    this.joining.set(true);
    this.participationsService.join(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.joining.set(false);
        this.toast.error('Could not join. Please try again.');
        return EMPTY;
      }),
    ).subscribe(() => {
      this.joined.set(true);
      this.joining.set(false);
      this.activity.update(a => a ? { ...a, participantCount: a.participantCount + 1 } : a);
      this.loadParticipants(id);
      this.toast.success("You've joined the activity!", this.activity()?.title);
    });
  }

  leave(): void {
    const id = this.activity()?.id;
    if (!id) return;
    this.participationsService.leave(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.toast.error('Could not leave. Please try again.');
        return EMPTY;
      }),
    ).subscribe(() => {
      this.joined.set(false);
      this.activity.update(a => a ? { ...a, participantCount: Math.max(0, a.participantCount - 1) } : a);
      this.loadParticipants(id);
      this.toast.info("You've left the activity.");
    });
  }

  goBack(): void {
    if (window.history.length > 1) window.history.back();
    else this.router.navigate(['/home']);
  }

  userInitials(username: string): string { return userInitials(username); }

  /** Self-aware: route to /profile when clicking on yourself. */
  userLink(userId: number): (string | number)[] {
    const me = this.auth.currentUser()?.userId;
    return me === userId ? ['/profile'] : ['/users', userId];
  }

  /** Replace a broken image with a fallback src; prevents infinite loops. */
  onImgError(event: Event, fallback: string): void {
    const img = event.target as HTMLImageElement;
    // Try the passed-in fallback first; if that also fails, use the global fallback.
    if (img.src !== fallback) {
      img.src = fallback;
    } else if (img.src !== FALLBACK_PHOTO) {
      img.src = FALLBACK_PHOTO;
    }
  }
}
