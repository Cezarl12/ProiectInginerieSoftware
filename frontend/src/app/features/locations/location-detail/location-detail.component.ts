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
  Tennis:     '#FFEB3B', Football:   '#43A047', Basketball: '#FF9800',
  Padel:      '#00897B', Running:    '#FF7043', Swimming:   '#00BCD4',
  Cycling:    '#E91E63', Yoga:       '#9C27B0', default:    '#1a6ef5',
};

const SPORT_ICONS: Record<string, string> = {
  Tennis:     'sports_tennis', Football:   'sports_soccer',   Basketball: 'sports_basketball',
  Padel:      'sports_tennis', Running:    'directions_run',  Swimming:   'pool',
  Cycling:    'directions_bike', Yoga:     'self_improvement', default:   'fitness_center',
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

      <!-- ── LOADING ── -->
      @if (loading()) {
        <div class="flex items-center justify-center min-h-[60vh]">
          <div class="flex flex-col items-center gap-4 text-on-surface-variant">
            <span class="material-symbols-outlined text-5xl text-primary animate-pulse">location_on</span>
            <p class="text-sm font-medium">Loading location…</p>
          </div>
        </div>
      }

      <!-- ── ERROR ── -->
      @else if (error()) {
        <div class="flex items-center justify-center min-h-[60vh] px-6">
          <div class="text-center space-y-4">
            <span class="material-symbols-outlined text-5xl text-error">error</span>
            <p class="text-on-surface-variant">{{ error() }}</p>
            <button (click)="goBack()"
              class="bg-primary text-on-primary px-6 py-3 rounded-full font-bold">
              Go back
            </button>
          </div>
        </div>
      }

      <!-- ── CONTENT ── -->
      @else if (loc()) {

        <!-- Mobile top bar -->
        <header class="md:hidden fixed top-0 left-0 w-full z-50
                       bg-background/80 backdrop-blur-md border-b border-outline-variant/10">
          <div class="flex justify-between items-center px-5 py-3">
            <button (click)="goBack()"
              class="w-9 h-9 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
              <span class="material-symbols-outlined text-[20px] text-on-surface">arrow_back</span>
            </button>
            <span class="text-sm font-black tracking-tight text-on-surface truncate mx-4">{{ loc()!.name }}</span>
            <div class="w-9 h-9"></div>
          </div>
        </header>

        <!-- Hero -->
        <section class="relative w-full h-64 md:h-[420px] overflow-hidden md:mt-0 mt-0">
          @if (loc()!.mainPhotoUrl) {
            <img [src]="loc()!.mainPhotoUrl" [alt]="loc()!.name"
                 class="w-full h-full object-cover" />
          } @else {
            <div class="w-full h-full flex items-center justify-center"
                 [style.background]="'linear-gradient(135deg,' + primarySportColor() + '18 0%,' + primarySportColor() + '08 100%)'">
              <span class="material-symbols-outlined text-[100px] opacity-20 text-on-surface"
                style="font-variation-settings:'FILL' 1,'wght' 300,'GRAD' 0,'opsz' 48;">
                {{ primarySportIcon() }}
              </span>
            </div>
          }
          <div class="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent"></div>
        </section>

        <!-- Main content -->
        <main class="relative -mt-16 px-5 md:px-12 max-w-4xl mx-auto space-y-8">

          <!-- Title block -->
          <div class="space-y-3">
            <!-- Sport tags -->
            <div class="flex flex-wrap gap-2">
              @for (sport of sports(); track sport) {
                <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest"
                  [style.background-color]="sColor(sport) + '20'"
                  [style.color]="sColor(sport)">
                  <span class="w-1.5 h-1.5 rounded-full" [style.background-color]="sColor(sport)"></span>
                  {{ sport }}
                </span>
              }
            </div>

            <div class="flex justify-between items-end gap-4">
              <div>
                <h1 class="text-3xl md:text-4xl font-black tracking-tighter text-on-surface leading-none">
                  {{ loc()!.name }}
                </h1>
                <div class="flex items-center gap-1 text-outline mt-2">
                  <span class="material-symbols-outlined text-[16px]">location_on</span>
                  <span class="text-sm font-medium">{{ loc()!.address }}</span>
                </div>
              </div>
              <!-- Status badge -->
              <div class="shrink-0 px-4 py-2 rounded-xl text-center"
                [class]="loc()!.status === 'Approved' ? 'bg-secondary/10' : 'bg-surface-container-high'">
                <span class="material-symbols-outlined text-[20px] block"
                  [class]="loc()!.status === 'Approved' ? 'text-secondary' : 'text-outline'"
                  style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24;">
                  {{ loc()!.status === 'Approved' ? 'verified' : 'pending' }}
                </span>
                <span class="text-[9px] font-bold uppercase tracking-widest mt-0.5 block"
                  [class]="loc()!.status === 'Approved' ? 'text-secondary' : 'text-outline'">
                  {{ loc()!.status }}
                </span>
              </div>
            </div>
          </div>

          <!-- Info grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="col-span-2 bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 shadow-sm">
              <p class="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Facilities</p>
              <div class="flex flex-wrap gap-4">
                @if (loc()!.hasLights) {
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span class="material-symbols-outlined text-[16px] text-primary"
                        style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20;">
                        wb_sunny
                      </span>
                    </div>
                    <span class="text-xs font-semibold text-on-surface">Floodlights</span>
                  </div>
                }
                @if (loc()!.surface) {
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span class="material-symbols-outlined text-[16px] text-primary"
                        style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20;">
                        layers
                      </span>
                    </div>
                    <span class="text-xs font-semibold text-on-surface">{{ loc()!.surface }}</span>
                  </div>
                }
                <div class="flex items-center gap-2">
                  <div class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span class="material-symbols-outlined text-[16px] text-primary"
                      style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20;">
                      sports
                    </span>
                  </div>
                  <span class="text-xs font-semibold text-on-surface">
                    {{ activities().length }} activit{{ activities().length === 1 ? 'y' : 'ies' }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Coordinates card -->
            <div class="col-span-2 bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 shadow-sm">
              <p class="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">Location</p>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-primary text-[20px]"
                    style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24;">
                    map
                  </span>
                </div>
                <div>
                  <p class="text-xs font-semibold text-on-surface">
                    {{ loc()!.latitude.toFixed(5) }}°N
                  </p>
                  <p class="text-xs font-semibold text-on-surface">
                    {{ loc()!.longitude.toFixed(5) }}°E
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- About -->
          @if (loc()!.details) {
            <div class="bg-surface-container-lowest rounded-2xl p-5 border border-outline-variant/10 shadow-sm">
              <p class="text-[10px] font-bold uppercase tracking-widest text-outline mb-3">About</p>
              <p class="text-sm text-on-surface leading-relaxed">{{ loc()!.details }}</p>
            </div>
          }

          <!-- Photo gallery -->
          @if (loc()!.secondaryPhotoUrls.length) {
            <div class="space-y-3">
              <p class="text-[10px] font-bold uppercase tracking-widest text-outline">Gallery</p>
              <div class="flex gap-3 overflow-x-auto pb-1" style="scrollbar-width:none;">
                @for (url of loc()!.secondaryPhotoUrls; track url) {
                  <img [src]="url" class="h-24 w-36 rounded-xl object-cover shrink-0 border border-outline-variant/10" />
                }
              </div>
            </div>
          }

          <!-- Upcoming activities -->
          <section class="space-y-4">
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-black tracking-tight text-on-surface">Upcoming Activities</h2>
              <a routerLink="/activities/create"
                class="flex items-center gap-1 text-xs font-bold text-primary">
                <span class="material-symbols-outlined text-[16px]">add</span> Create
              </a>
            </div>

            @if (activitiesLoading()) {
              <div class="flex items-center gap-3 py-4 text-on-surface-variant">
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
                    class="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/10 shadow-sm
                           hover:shadow-md cursor-pointer active:scale-[0.99] transition-all flex gap-4"
                    (click)="goToActivity(activity.id)"
                  >
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      [style.background-color]="sColor(activity.sport) + '18'">
                      <span class="material-symbols-outlined text-xl"
                        [style.color]="sColor(activity.sport)"
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

  primarySportColor = computed(() => sColor(this.sports()[0] ?? 'default'));
  primarySportIcon  = computed(() => sIcon(this.sports()[0] ?? 'default'));

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
    ).subscribe(loc => {
      this.loc.set(loc);
      this.loading.set(false);

      this.activitiesService.getAll({ locationId: id }).pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this.activitiesLoading.set(false);
          this.toast.error('Could not load activities for this location.');
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
    this.toast.info(`Join is available on the activity page.`, activity.title);
    this.router.navigate(['/activities', activity.id]);
  }

  goBack(): void { history.length > 1 ? history.back() : this.router.navigate(['/home']); }
  goToActivity(id: number): void { this.router.navigate(['/activities', id]); }
  sColor(sport: string): string { return sColor(sport); }
  sIcon(sport: string): string  { return sIcon(sport); }
}
