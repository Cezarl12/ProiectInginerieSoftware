import {
  Component, inject, OnInit, signal, computed,
  ChangeDetectionStrategy, DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ParticipationsService } from '../../../core/services/participations.service';
import { ToastService } from '../../../core/services/toast.service';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../../shared/components/desktop-header/desktop-header.component';
import { ActivityType } from '../../../core/models/activity.model';
import type { Activity } from '../../../core/models/activity.model';

const SPORT_COLORS: Record<string, string> = {
  Football: '#43A047', Tennis: '#F9A825', Basketball: '#FF9800',
  Running: '#FF7043', Swimming: '#00ACC1', Padel: '#26A69A',
  Cycling: '#E91E63', Yoga: '#9C27B0', Volleyball: '#1565C0',
  Handball: '#00838F', Golf: '#558B2F', Boxing: '#C62828',
  Fitness: '#5C6BC0', Badminton: '#F57F17', Rugby: '#795548',
  'Martial Arts': '#D32F2F', Skiing: '#0D47A1', Surfing: '#0277BD',
  Cricket: '#6D4C41', Athletics: '#FF8F00', default: '#2e8fa6',
};

const SPORT_ICONS: Record<string, string> = {
  Football: 'sports_soccer', Tennis: 'sports_tennis', Basketball: 'sports_basketball',
  Running: 'directions_run', Swimming: 'pool', Padel: 'sports_tennis',
  Cycling: 'directions_bike', Yoga: 'self_improvement', Volleyball: 'sports_volleyball',
  Handball: 'sports_handball', Golf: 'sports_golf', Boxing: 'sports_mma',
  Fitness: 'fitness_center', Badminton: 'sports_tennis', Rugby: 'sports_rugby',
  'Martial Arts': 'sports_martial_arts', Skiing: 'skiing', Surfing: 'surfing',
  Cricket: 'sports_cricket', Athletics: 'directions_run', default: 'sports',
};

function resolveSport<T>(map: Record<string, T>, raw: string): T {
  const key = Object.keys(map).find(k => k.toLowerCase() === raw.toLowerCase());
  return map[key ?? 'default'] ?? map['default'];
}

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BottomNavComponent, DesktopHeaderComponent, DatePipe],
  template: `
    <div class="min-h-screen bg-background flex flex-col">
      <app-desktop-header />

      <!-- Mobile header -->
      <header class="sticky top-0 z-40 bg-background/80 backdrop-blur-sm md:hidden shrink-0">
        <div class="flex items-center gap-3 px-6 py-4">
          <button (click)="goBack()"
                  class="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full active:scale-95 transition-transform shrink-0">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          @if (activity()) {
            <h1 class="text-base font-bold tracking-tight text-on-surface truncate">{{ activity()!.title }}</h1>
          }
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
          <button (click)="goBack()" class="btn-primary">Go back</button>
        </div>

      } @else if (activity()) {
        <main class="flex-1 overflow-y-auto pb-44 md:pb-12" style="scrollbar-width: none;">
          <div class="max-w-2xl mx-auto">

            <!-- Hero -->
            <section class="px-6 pt-4">
              <div class="rounded-2xl overflow-hidden h-52 relative flex flex-col items-center justify-center gap-3"
                   [style.background]="'linear-gradient(135deg, ' + sportColor() + '1a 0%, ' + sportColor() + '33 100%)'">
                <div class="w-20 h-20 rounded-full flex items-center justify-center"
                     [style.background-color]="sportColor() + '33'">
                  <span class="material-symbols-outlined text-5xl"
                        [style.color]="sportColor()">{{ sportIcon() }}</span>
                </div>
                <span class="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm"
                      [style.background-color]="sportColor()">{{ activity()!.sport }}</span>
                @if (activity()!.type === ActivityType.Private) {
                  <span class="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-on-surface/10 backdrop-blur-sm rounded-full text-[10px] font-bold text-on-surface uppercase tracking-widest">
                    <span class="material-symbols-outlined text-[12px]">lock</span>
                    Private
                  </span>
                }
              </div>
            </section>

            <!-- Title + quick-info chips -->
            <section class="px-6 mt-5">
              <h1 class="text-2xl font-black tracking-tight text-on-surface mb-3">{{ activity()!.title }}</h1>
              <div class="flex flex-wrap gap-2">
                <div class="flex items-center gap-1.5 bg-surface-container-low rounded-full px-3 py-1.5">
                  <span class="material-symbols-outlined text-[16px] text-primary">calendar_today</span>
                  <span class="text-xs font-semibold">{{ activity()!.dateTime | date:'EEE, d MMM' }}</span>
                </div>
                <div class="flex items-center gap-1.5 bg-surface-container-low rounded-full px-3 py-1.5">
                  <span class="material-symbols-outlined text-[16px] text-primary">schedule</span>
                  <span class="text-xs font-semibold">{{ activity()!.dateTime | date:'HH:mm' }}</span>
                </div>
                <div class="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                     [class]="spotsLeft() > 0 ? 'bg-secondary-container' : 'bg-error-container'">
                  <span class="material-symbols-outlined text-[16px]"
                        [class]="spotsLeft() > 0 ? 'text-on-secondary-container' : 'text-on-error-container'">group</span>
                  <span class="text-xs font-semibold"
                        [class]="spotsLeft() > 0 ? 'text-on-secondary-container' : 'text-on-error-container'">
                    {{ spotsLeft() > 0 ? spotsLeft() + ' spots left' : 'Full' }}
                  </span>
                </div>
                @if (activity()!.location) {
                  <div class="flex items-center gap-1.5 bg-surface-container-low rounded-full px-3 py-1.5">
                    <span class="material-symbols-outlined text-[16px] text-primary">location_on</span>
                    <span class="text-xs font-semibold">{{ activity()!.location!.name }}</span>
                  </div>
                }
              </div>
            </section>

            <div class="mx-6 mt-6 h-px bg-surface-container-high"></div>

            <!-- Participants -->
            <section class="px-6 mt-6">
              <div class="flex items-end justify-between mb-4">
                <div>
                  <p class="text-[10px] font-black uppercase tracking-widest text-outline">Athletes</p>
                  <h2 class="text-xl font-black tracking-tight text-on-surface">
                    {{ activity()!.participantCount }}
                    <span class="text-outline font-normal text-base">/ {{ activity()!.maxParticipants }}</span>
                  </h2>
                </div>
              </div>

              @if (activity()!.participantCount === 0) {
                <div class="bg-surface-container-low rounded-xl p-6 text-center">
                  <span class="material-symbols-outlined text-4xl text-outline block mb-2">group_add</span>
                  <p class="text-sm text-on-surface-variant font-medium">No athletes yet — be the first to join!</p>
                </div>
              } @else {
                <div class="flex gap-3 overflow-x-auto pb-2" style="scrollbar-width: none;">
                  @for (n of participantSlots(); track n) {
                    <div class="flex-shrink-0 flex flex-col items-center gap-2">
                      <div class="w-14 h-14 rounded-full flex items-center justify-center border-2 border-outline-variant/10"
                           [style.background-color]="sportColor() + '22'">
                        <span class="material-symbols-outlined text-xl" [style.color]="sportColor()">person</span>
                      </div>
                      <span class="text-[10px] font-bold text-on-surface-variant tracking-tight">#{{ n }}</span>
                    </div>
                  }
                  @for (i of emptySlots(); track i) {
                    <div class="flex-shrink-0 flex flex-col items-center gap-2 opacity-30">
                      <div class="w-14 h-14 rounded-full border-2 border-dashed border-outline-variant flex items-center justify-center">
                        <span class="material-symbols-outlined text-xl text-outline-variant">add</span>
                      </div>
                      <span class="text-[10px] font-bold text-outline tracking-tight">open</span>
                    </div>
                  }
                </div>
              }
            </section>

            <!-- Description -->
            @if (activity()!.description) {
              <section class="px-6 mt-8">
                <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-3">About</p>
                <div class="bg-surface-container-low rounded-xl p-4">
                  <p class="text-sm text-on-surface leading-relaxed">{{ activity()!.description }}</p>
                </div>
              </section>
            }

            <!-- Group chat coming-soon -->
            <section class="px-6 mt-8">
              <div class="flex items-center gap-4 bg-surface-container-low rounded-xl p-4 opacity-60 cursor-not-allowed">
                <div class="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-lg text-outline">chat</span>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-semibold text-on-surface">Group Chat</p>
                  <p class="text-xs text-on-surface-variant">Coming soon</p>
                </div>
                <span class="material-symbols-outlined text-outline shrink-0">lock</span>
              </div>
            </section>

          </div>
        </main>

        <!-- Join / Leave action bar -->
        <div class="fixed bottom-20 left-0 right-0 px-6 z-50 md:bottom-8 md:max-w-2xl md:mx-auto md:left-1/2 md:-translate-x-1/2">
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
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  activity = signal<Activity | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  joined = signal(false);
  joining = signal(false);

  sportColor = computed(() => resolveSport(SPORT_COLORS, this.activity()?.sport ?? ''));
  sportIcon  = computed(() => resolveSport(SPORT_ICONS,  this.activity()?.sport ?? ''));

  participantSlots = computed(() => {
    const count = this.activity()?.participantCount ?? 0;
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  emptySlots = computed(() => {
    const a = this.activity();
    if (!a) return [];
    const empty = Math.min(a.maxParticipants - a.participantCount, 3);
    return Array.from({ length: empty }, (_, i) => i + 1);
  });

  spotsLeft = computed(() => {
    const a = this.activity();
    return a ? a.maxParticipants - a.participantCount : 0;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.activitiesService.getById(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.error.set('Activity not found.');
        this.loading.set(false);
        return EMPTY;
      }),
    ).subscribe(a => {
      this.activity.set(a);
      this.loading.set(false);
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
      this.toast.info("You've left the activity.");
    });
  }

  goBack(): void {
    if (window.history.length > 1) window.history.back();
    else this.router.navigate(['/home']);
  }
}
