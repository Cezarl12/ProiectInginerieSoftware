import {
  Component, inject, OnInit, signal, computed, ChangeDetectionStrategy, DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { LocationsService } from '../../../core/services/locations.service';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ToastService } from '../../../core/services/toast.service';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../../shared/components/desktop-header/desktop-header.component';
import type { Location } from '../../../core/models/location.model';
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
  Cricket: 'sports_cricket', Athletics: 'directions_run', default: 'fitness_center',
};

function sColor(sport: string): string {
  const key = Object.keys(SPORT_COLORS).find(k => k.toLowerCase() === sport.trim().toLowerCase());
  return SPORT_COLORS[key ?? 'default'];
}
function sIcon(sport: string): string {
  const key = Object.keys(SPORT_ICONS).find(k => k.toLowerCase() === sport.trim().toLowerCase());
  return SPORT_ICONS[key ?? 'default'];
}

@Component({
  selector: 'app-location-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BottomNavComponent, DesktopHeaderComponent, RouterLink, DatePipe],
  template: `
    <div class="min-h-screen bg-background pb-28">
      <app-desktop-header />

      @if (loading()) {
        <div class="flex items-center justify-center min-h-[60vh]">
          <div class="flex flex-col items-center gap-4 text-on-surface-variant">
            <span class="material-symbols-outlined text-5xl text-primary animate-pulse">location_on</span>
            <p class="text-sm font-medium">Loading location…</p>
          </div>
        </div>

      } @else if (error()) {
        <div class="flex items-center justify-center min-h-[60vh] px-6">
          <div class="text-center space-y-4">
            <span class="material-symbols-outlined text-5xl text-error">error</span>
            <p class="text-on-surface-variant">{{ error() }}</p>
            <button (click)="goBack()" class="bg-primary text-on-primary px-6 py-3 rounded-full font-bold">
              Go back
            </button>
          </div>
        </div>

      } @else if (loc()) {

        <!-- ── HERO PHOTO ── -->
        <section class="relative w-full" style="height: 52vw; max-height: 480px; min-height: 240px;">
          @if (loc()!.mainPhotoUrl) {
            <img [src]="loc()!.mainPhotoUrl" [alt]="loc()!.name"
                 class="w-full h-full object-cover" />
          } @else {
            <div class="w-full h-full flex items-center justify-center"
                 [style.background]="'linear-gradient(135deg, ' + primarySportColor() + '18, ' + primarySportColor() + '35)'">
              <span class="material-symbols-outlined text-[110px] opacity-20 text-on-surface"
                    style="font-variation-settings:'FILL' 1,'wght' 300,'GRAD' 0,'opsz' 48;">
                {{ primarySportIcon() }}
              </span>
            </div>
          }
          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"></div>

          <!-- Mobile back button -->
          <button (click)="goBack()"
                  class="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm
                         flex items-center justify-center active:scale-95 transition-transform md:hidden">
            <span class="material-symbols-outlined text-white text-[20px]">arrow_back</span>
          </button>

          <!-- Status badge -->
          @if (loc()!.status === 'Approved') {
            <div class="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/90 backdrop-blur-sm">
              <span class="material-symbols-outlined text-on-secondary text-[14px]"
                    style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20;">verified</span>
              <span class="text-[10px] font-black uppercase tracking-wider text-on-secondary">Verified</span>
            </div>
          }

          <!-- Title block at bottom -->
          <div class="absolute bottom-0 left-0 right-0 px-5 pb-6 md:px-12">
            <div class="flex flex-wrap gap-1.5 mb-2">
              @for (sport of sports(); track sport) {
                <span class="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white"
                      [style.background-color]="sColor(sport)">{{ sport }}</span>
              }
            </div>
            <h1 class="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">{{ loc()!.name }}</h1>
            <div class="flex items-center gap-1 text-white/75 mt-1">
              <span class="material-symbols-outlined text-[15px]">location_on</span>
              <span class="text-sm font-medium">{{ loc()!.address }}</span>
            </div>
          </div>
        </section>

        <!-- ── PHOTO COLLAGE ── -->
        @if (loc()!.secondaryPhotoUrls.length > 0) {
          <section class="px-5 pt-4 md:px-12">
            @if (loc()!.secondaryPhotoUrls.length === 1) {
              <!-- Single photo -->
              <div class="rounded-2xl overflow-hidden h-40">
                <img [src]="loc()!.secondaryPhotoUrls[0]" class="w-full h-full object-cover" />
              </div>
            } @else if (loc()!.secondaryPhotoUrls.length === 2) {
              <!-- Two photos side by side -->
              <div class="grid grid-cols-2 gap-1 rounded-2xl overflow-hidden h-40">
                <img [src]="loc()!.secondaryPhotoUrls[0]" class="w-full h-full object-cover" />
                <img [src]="loc()!.secondaryPhotoUrls[1]" class="w-full h-full object-cover" />
              </div>
            } @else {
              <!-- 3+ photos: 2/3 left + stacked right -->
              <div class="grid grid-cols-3 grid-rows-2 gap-1 rounded-2xl overflow-hidden h-48">
                <div class="col-span-2 row-span-2">
                  <img [src]="loc()!.secondaryPhotoUrls[0]" class="w-full h-full object-cover" />
                </div>
                <div>
                  <img [src]="loc()!.secondaryPhotoUrls[1]" class="w-full h-full object-cover" />
                </div>
                <div class="relative">
                  <img [src]="loc()!.secondaryPhotoUrls[2]" class="w-full h-full object-cover" />
                  @if (loc()!.secondaryPhotoUrls.length > 3) {
                    <div class="absolute inset-0 bg-black/55 flex flex-col items-center justify-center gap-0.5">
                      <span class="material-symbols-outlined text-white text-2xl">photo_library</span>
                      <span class="text-white font-black text-base">+{{ loc()!.secondaryPhotoUrls.length - 3 }}</span>
                    </div>
                  }
                </div>
              </div>
            }
          </section>
        }

        <!-- ── MAIN CONTENT ── -->
        <main class="px-5 md:px-12 max-w-4xl mx-auto mt-6 space-y-6">

          <!-- Quick-info chips -->
          <div class="flex flex-wrap gap-2">
            @if (loc()!.hasLights) {
              <div class="flex items-center gap-1.5 bg-surface-container-lowest rounded-full px-3 py-1.5 border border-outline-variant/15">
                <span class="material-symbols-outlined text-[15px] text-primary"
                      style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20;">wb_sunny</span>
                <span class="text-xs font-semibold text-on-surface">Floodlights</span>
              </div>
            }
            @if (loc()!.surface) {
              <div class="flex items-center gap-1.5 bg-surface-container-lowest rounded-full px-3 py-1.5 border border-outline-variant/15">
                <span class="material-symbols-outlined text-[15px] text-primary"
                      style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20;">layers</span>
                <span class="text-xs font-semibold text-on-surface">{{ loc()!.surface }}</span>
              </div>
            }
            <div class="flex items-center gap-1.5 bg-surface-container-lowest rounded-full px-3 py-1.5 border border-outline-variant/15">
              <span class="material-symbols-outlined text-[15px] text-primary"
                    style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20;">sports</span>
              <span class="text-xs font-semibold text-on-surface">
                {{ activitiesLoading() ? '…' : activities().length }}
                activit{{ activities().length === 1 ? 'y' : 'ies' }}
              </span>
            </div>
          </div>

          <!-- About -->
          @if (loc()!.details) {
            <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10">
              <p class="text-[10px] font-black uppercase tracking-widest text-outline mb-3">About</p>
              <p class="text-sm text-on-surface leading-relaxed">{{ loc()!.details }}</p>
            </div>
          }

          <!-- Upcoming activities -->
          <section>
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-lg font-black tracking-tight text-on-surface">Upcoming Activities</h2>
              <a routerLink="/activities/create"
                 class="flex items-center gap-1 text-xs font-bold text-primary active:opacity-70">
                <span class="material-symbols-outlined text-[15px]">add</span> New
              </a>
            </div>

            @if (activitiesLoading()) {
              <div class="flex items-center gap-3 py-6 text-on-surface-variant">
                <span class="material-symbols-outlined animate-pulse text-primary">sports</span>
                <p class="text-sm">Loading activities…</p>
              </div>
            } @else if (activities().length === 0) {
              <div class="bg-surface-container-lowest rounded-2xl p-8 border border-outline-variant/10 text-center space-y-3">
                <div class="w-14 h-14 bg-surface-container-low rounded-2xl flex items-center justify-center mx-auto">
                  <span class="material-symbols-outlined text-2xl text-outline">sports</span>
                </div>
                <p class="text-sm font-medium text-on-surface-variant">No upcoming activities here</p>
                <a routerLink="/activities/create"
                   class="inline-flex items-center gap-1 text-xs font-bold text-primary">
                  Be the first to create one →
                </a>
              </div>
            } @else {
              <div class="space-y-3">
                @for (activity of activities(); track activity.id) {
                  <div
                    class="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10
                           hover:shadow-md cursor-pointer active:scale-[0.99] transition-all flex gap-4"
                    (click)="goToActivity(activity.id)"
                  >
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                         [style.background-color]="sColor(activity.sport) + '18'">
                      <span class="material-symbols-outlined text-xl" [style.color]="sColor(activity.sport)"
                            style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24;">
                        {{ sIcon(activity.sport) }}
                      </span>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="flex justify-between items-start gap-2">
                        <h4 class="font-bold text-on-surface text-sm leading-tight truncate">{{ activity.title }}</h4>
                        <button
                          (click)="joinActivity($event, activity)"
                          class="shrink-0 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest
                                 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary transition-colors">
                          Join
                        </button>
                      </div>
                      <div class="flex items-center gap-3 mt-1.5">
                        <span class="flex items-center gap-1 text-[11px] text-outline font-medium">
                          <span class="material-symbols-outlined text-[13px]">schedule</span>
                          {{ activity.dateTime | date:'EEE d MMM · HH:mm' }}
                        </span>
                        <span class="flex items-center gap-1 text-[11px] text-outline font-medium">
                          <span class="material-symbols-outlined text-[13px]">group</span>
                          {{ activity.participantCount }}/{{ activity.maxParticipants }}
                        </span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </section>
        </main>

        <!-- Mobile FAB -->
        <div class="fixed bottom-24 right-5 z-50 md:hidden">
          <a routerLink="/activities/create"
             [queryParams]="{ locationId: loc()!.id }"
             class="flex items-center gap-2 pl-5 pr-4 py-3.5 bg-primary text-on-primary rounded-full shadow-xl active:scale-95 transition-all">
            <span class="font-bold text-sm tracking-tight">Create Activity</span>
            <span class="material-symbols-outlined text-[18px]">add</span>
          </a>
        </div>
      }

      <app-bottom-nav />
    </div>
  `,
})
export class LocationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private locationsService = inject(LocationsService);
  private activitiesService = inject(ActivitiesService);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  loc = signal<Location | null>(null);
  activities = signal<Activity[]>([]);
  loading = signal(true);
  activitiesLoading = signal(true);
  error = signal<string | null>(null);

  sports = computed(() =>
    this.loc()?.sports.split(',').map(s => s.trim()).filter(Boolean) ?? [],
  );

  primarySportColor = computed(() => sColor(this.sports()[0] ?? ''));
  primarySportIcon  = computed(() => sIcon(this.sports()[0] ?? ''));

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.locationsService.getById(id).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.error.set('Location not found.');
        this.loading.set(false);
        this.toast.error('Could not load this location.', 'Not found');
        return EMPTY;
      }),
    ).subscribe(l => {
      this.loc.set(l);
      this.loading.set(false);

      this.activitiesService.getAll({ locationId: id }).pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.activitiesLoading.set(false);
          return EMPTY;
        }),
      ).subscribe(paged => {
        this.activities.set(paged.items);
        this.activitiesLoading.set(false);
      });
    });
  }

  joinActivity(event: Event, activity: Activity): void {
    event.stopPropagation();
    this.router.navigate(['/activities', activity.id]);
  }

  goBack(): void { history.length > 1 ? history.back() : this.router.navigate(['/home']); }
  goToActivity(id: number): void { this.router.navigate(['/activities', id]); }
  sColor(sport: string): string { return sColor(sport); }
  sIcon(sport: string): string  { return sIcon(sport); }
}
