import {
  Component, inject, signal, computed, OnInit,
  ChangeDetectionStrategy, DestroyRef,
} from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ToastService } from '../../../core/services/toast.service';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../../shared/components/desktop-header/desktop-header.component';
import { SPORTS, sportColor, sportIcon, sportGradient, sportPhoto, FALLBACK_PHOTO } from '../../../core/utils/sport-utils';
import type { Activity } from '../../../core/models/activity.model';

const FILTER_CHIPS = ['All', 'Football', 'Tennis', 'Basketball', 'Running', 'Swimming', 'Padel', 'Volleyball', 'Cycling', 'Yoga'];

@Component({
  selector: 'app-activities-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BottomNavComponent, DesktopHeaderComponent, RouterLink, DatePipe],
  template: `
    <div class="min-h-screen bg-background pb-28">
      <app-desktop-header />

      <!-- Mobile header -->
      <header class="sticky top-0 z-40 bg-background/95 backdrop-blur-md md:hidden border-b border-outline-variant/10">
        <div class="flex items-center justify-between px-5 py-4">
          <div>
            <p class="text-[10px] uppercase font-bold tracking-widest text-primary">Discover</p>
            <h1 class="text-lg font-black tracking-tight text-on-surface leading-none">Activities</h1>
          </div>
          <a routerLink="/activities/create"
             class="flex items-center gap-1.5 bg-primary text-on-primary px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-all shadow-sm shadow-primary/20">
            <span class="material-symbols-outlined text-[15px]">add</span>
            Create
          </a>
        </div>

        <!-- Search -->
        <div class="px-5 pb-4">
          <div class="flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-2.5">
            <span class="material-symbols-outlined text-primary text-[18px] shrink-0">search</span>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              placeholder="Search activities…"
              class="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-outline-variant outline-none text-on-surface"
            />
            @if (searchQuery()) {
              <button (click)="searchQuery.set('')" class="text-outline">
                <span class="material-symbols-outlined text-[16px]">close</span>
              </button>
            }
          </div>
        </div>
      </header>

      <!-- Desktop page title -->
      <div class="hidden md:flex max-w-7xl mx-auto px-8 pt-8 pb-4 items-end justify-between">
        <div>
          <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-1">Discover</span>
          <h2 class="text-4xl font-black tracking-tighter text-on-surface leading-none">Activities</h2>
          <p class="text-sm text-on-surface-variant mt-2">
            {{ totalCount() }} {{ activeFilter() !== 'All' ? activeFilter() : '' }} activities
          </p>
        </div>
        <div class="flex items-center gap-4">
          <!-- Desktop search -->
          <div class="flex items-center gap-2 bg-surface-container-low rounded-xl px-4 py-2.5 w-64">
            <span class="material-symbols-outlined text-primary text-[18px] shrink-0">search</span>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              placeholder="Search activities…"
              class="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-outline-variant outline-none text-on-surface"
            />
            @if (searchQuery()) {
              <button (click)="searchQuery.set('')" class="text-outline">
                <span class="material-symbols-outlined text-[16px]">close</span>
              </button>
            }
          </div>
          <a routerLink="/activities/create"
             class="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-bold active:scale-95 transition-all shadow-md shadow-primary/20">
            <span class="material-symbols-outlined text-[18px]">add</span>
            Create Activity
          </a>
        </div>
      </div>

      <!-- Sport filter chips -->
      <div class="sticky top-[0px] md:top-auto z-30 bg-background/95 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none md:static">
        <div class="px-5 md:px-8 md:max-w-7xl md:mx-auto py-3">

          <!-- Mobile: single dropdown selector -->
          <div class="relative md:hidden">
            <button (click)="mobileDropdownOpen.update(v => !v)"
                    class="w-full flex items-center justify-between gap-2 px-5 py-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 active:scale-[0.99] transition-all">
              <span class="flex items-center gap-2.5 min-w-0">
                @if (activeFilter() !== 'All') {
                  <span class="w-2.5 h-2.5 rounded-full shrink-0" [style.background-color]="sportColor(activeFilter())"></span>
                } @else {
                  <span class="material-symbols-outlined text-[18px] text-primary shrink-0">filter_list</span>
                }
                <span class="text-sm font-bold text-on-surface truncate">{{ activeFilter() }}</span>
                <span class="text-xs font-medium text-outline">· Sport</span>
              </span>
              <span class="material-symbols-outlined text-[20px] text-on-surface-variant transition-transform"
                    [class.rotate-180]="mobileDropdownOpen()">expand_more</span>
            </button>
            @if (mobileDropdownOpen()) {
              <div class="absolute top-full left-0 right-0 bg-surface-container-lowest rounded-2xl shadow-xl mt-2 z-30 border border-outline-variant/10 max-h-[60vh] overflow-y-auto">
                @for (chip of FILTER_CHIPS; track chip) {
                  <button
                    (click)="setFilter(chip)"
                    class="w-full flex items-center justify-between gap-2 px-5 py-3 text-left hover:bg-surface-container-low active:bg-surface-container transition-colors first:rounded-t-2xl last:rounded-b-2xl border-b border-outline-variant/5 last:border-0">
                    <span class="flex items-center gap-2.5 min-w-0">
                      @if (chip !== 'All') {
                        <span class="w-2.5 h-2.5 rounded-full shrink-0" [style.background-color]="sportColor(chip)"></span>
                      } @else {
                        <span class="material-symbols-outlined text-[16px] text-primary shrink-0">apps</span>
                      }
                      <span class="text-sm font-semibold"
                            [class]="activeFilter() === chip ? 'text-primary' : 'text-on-surface'">
                        {{ chip }}
                      </span>
                    </span>
                    @if (activeFilter() === chip) {
                      <span class="material-symbols-outlined text-[18px] text-primary">check</span>
                    }
                  </button>
                }
              </div>
            }
          </div>

          <!-- Desktop: full horizontal scroll -->
          <div class="hidden md:flex gap-2 overflow-x-auto" style="scrollbar-width:none;-webkit-overflow-scrolling:touch;">
            @for (chip of FILTER_CHIPS; track chip) {
              <button
                (click)="setFilter(chip)"
                class="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 border"
                [class]="activeFilter() === chip
                  ? 'bg-primary text-on-primary border-primary shadow-md shadow-primary/20'
                  : 'bg-surface-container-lowest text-on-surface-variant border-outline-variant/20 hover:border-outline-variant/50'"
              >
                @if (chip !== 'All') {
                  <span class="w-2 h-2 rounded-full shrink-0"
                    [style.background-color]="activeFilter() === chip ? 'rgba(255,255,255,0.7)' : sportColor(chip)">
                  </span>
                }
                {{ chip }}
              </button>
            }
          </div>

        </div>
      </div>

      <!-- Loading -->
      @if (loading()) {
        <div class="flex flex-col items-center justify-center py-24 gap-4 text-on-surface-variant">
          <span class="material-symbols-outlined text-5xl text-primary animate-pulse">fitness_center</span>
          <p class="text-sm font-medium">Loading activities…</p>
        </div>

      <!-- Empty state -->
      } @else if (filteredActivities().length === 0) {
        <div class="flex flex-col items-center justify-center py-24 gap-4 px-8 text-center">
          <div class="w-20 h-20 rounded-3xl bg-surface-container-low flex items-center justify-center">
            <span class="material-symbols-outlined text-4xl text-outline">sports</span>
          </div>
          <div>
            <p class="font-bold text-on-surface">No activities found</p>
            <p class="text-sm text-on-surface-variant mt-1">
              {{ searchQuery() || activeFilter() !== 'All' ? 'Try a different search or filter' : 'Be the first to create one!' }}
            </p>
          </div>
          <a routerLink="/activities/create"
             class="bg-primary text-on-primary px-6 py-2.5 rounded-full text-sm font-bold shadow-md shadow-primary/20">
            Create Activity
          </a>
        </div>

      <!-- Activity cards -->
      } @else {
        <main class="px-5 md:px-8 md:max-w-7xl md:mx-auto mt-2">
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            @for (activity of filteredActivities(); track activity.id) {
              <article
                (click)="router.navigate(['/activities', activity.id])"
                class="bg-surface-container-lowest rounded-2xl overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:shadow-lg border border-outline-variant/10 group"
              >
                <!-- Sport banner image -->
                <div class="relative h-36 overflow-hidden bg-surface-container">
                  <!-- Photo -->
                  <img [src]="activity.location?.mainPhotoUrl || sportPhoto(activity.sport)"
                       [alt]="activity.sport"
                       class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                       (error)="onBannerError($event, activity.sport)" />
                  <!-- Dark gradient overlay -->
                  <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

                  <!-- Top badges -->
                  <div class="absolute top-3 left-3 flex items-center gap-2">
                    <span class="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20">
                      {{ activity.sport }}
                    </span>
                    @if (activity.type === 1) {
                      <span class="bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                        Private
                      </span>
                    }
                  </div>

                  <!-- Participants badge -->
                  <div class="absolute top-3 right-3">
                    <div class="bg-black/30 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <span class="material-symbols-outlined text-[12px]">group</span>
                      {{ activity.participantCount }}/{{ activity.maxParticipants }}
                    </div>
                  </div>

                  <!-- Bottom gradient -->
                  <div class="absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/40 to-transparent"></div>
                </div>

                <!-- Card body -->
                <div class="p-4 space-y-3">
                  <h3 class="font-black text-on-surface text-base leading-tight tracking-tight group-hover:text-primary transition-colors">
                    {{ activity.title }}
                  </h3>

                  <div class="space-y-1.5">
                    <!-- Date -->
                    <div class="flex items-center gap-2 text-xs text-on-surface-variant">
                      <span class="material-symbols-outlined text-[14px]"
                            [style.color]="sportColor(activity.sport)">calendar_today</span>
                      {{ activity.dateTime | date:'EEE, d MMM · HH:mm' }}
                    </div>

                    <!-- Location -->
                    @if (activity.location?.name) {
                      <div class="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span class="material-symbols-outlined text-[14px]"
                              [style.color]="sportColor(activity.sport)">location_on</span>
                        {{ activity.location!.name }}
                      </div>
                    }
                  </div>

                  <!-- Footer -->
                  <div class="flex items-center justify-between pt-1 border-t border-outline-variant/10">
                    <div class="flex -space-x-1">
                      @for (i of [1,2,3]; track i) {
                        @if (i <= activity.participantCount) {
                          <div class="w-6 h-6 rounded-full border-2 border-surface-container-lowest flex items-center justify-center text-[9px] font-bold text-white"
                               [style.background]="sportColor(activity.sport)">
                            {{ i }}
                          </div>
                        }
                      }
                      @if (activity.participantCount > 3) {
                        <div class="w-6 h-6 rounded-full border-2 border-surface-container-lowest bg-surface-container flex items-center justify-center text-[9px] font-bold text-on-surface-variant">
                          +{{ activity.participantCount - 3 }}
                        </div>
                      }
                    </div>

                    <span class="text-xs font-bold px-3 py-1 rounded-full"
                          [style.background-color]="sportColor(activity.sport) + '18'"
                          [style.color]="sportColor(activity.sport)">
                      View →
                    </span>
                  </div>
                </div>
              </article>
            }
          </div>

          <!-- Load more -->
          @if (hasMore()) {
            <div class="flex justify-center mt-8">
              <button (click)="loadMore()" [disabled]="loadingMore()"
                      class="flex items-center gap-2 px-8 py-3 rounded-full border border-outline-variant/30 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low active:scale-95 transition-all disabled:opacity-50">
                @if (loadingMore()) {
                  <span class="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                  Loading…
                } @else {
                  <span class="material-symbols-outlined text-[18px]">expand_more</span>
                  Load more
                }
              </button>
            </div>
          }
        </main>
      }

      <app-bottom-nav />
    </div>
  `,
})
export class ActivitiesListComponent implements OnInit {
  protected readonly FILTER_CHIPS = FILTER_CHIPS;
  readonly router = inject(Router);
  private route = inject(ActivatedRoute);
  private activitiesService = inject(ActivitiesService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  private readonly PAGE_SIZE = 20;

  searchQuery        = signal('');
  activeFilter       = signal('All');
  mobileDropdownOpen = signal(false);
  activities         = signal<Activity[]>([]);
  loading            = signal(true);
  loadingMore        = signal(false);
  hasMore            = signal(false);
  totalCount         = signal(0);
  private currentPage = 1;

  readonly sportColor = sportColor;
  readonly sportIcon = sportIcon;

  filteredActivities = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.activities();
    return this.activities().filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.location?.name?.toLowerCase().includes(q) ?? false)
    );
  });

  ngOnInit(): void {
    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) this.searchQuery.set(q);
    this.load(true);
  }

  setFilter(chip: string): void {
    this.mobileDropdownOpen.set(false);
    if (this.activeFilter() === chip) return;
    this.activeFilter.set(chip);
    this.load(true);
  }

  loadMore(): void {
    if (this.loadingMore() || !this.hasMore()) return;
    this.load(false);
  }

  private load(reset: boolean): void {
    if (reset) {
      this.currentPage = 1;
      this.loading.set(true);
    } else {
      this.currentPage++;
      this.loadingMore.set(true);
    }

    const sport = this.activeFilter() !== 'All' ? this.activeFilter() : undefined;
    this.activitiesService.getAll({ sport }, this.currentPage, this.PAGE_SIZE).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.toast.error('Could not load activities.', 'Error');
        this.loading.set(false);
        this.loadingMore.set(false);
        return EMPTY;
      }),
    ).subscribe(paged => {
      this.activities.update(prev => reset ? paged.items : [...prev, ...paged.items]);
      this.hasMore.set(paged.hasNext);
      this.totalCount.set(paged.totalCount);
      this.loading.set(false);
      this.loadingMore.set(false);
    });
  }

  sportBannerStyle(sport: string): string {
    return sportGradient(sport);
  }

  readonly sportPhoto = sportPhoto;

  onBannerError(event: Event, sport: string): void {
    const img = event.target as HTMLImageElement;
    // If the sport-specific photo failed, try the generic fallback.
    // If that also fails, stop to prevent infinite error loops.
    if (img.src !== FALLBACK_PHOTO) {
      img.src = FALLBACK_PHOTO;
    }
  }
}
