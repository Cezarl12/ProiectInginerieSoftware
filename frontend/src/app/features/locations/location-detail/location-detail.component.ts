import {
  Component, inject, OnInit, signal, computed, ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { LocationsService } from '../../../core/services/locations.service';
import { ActivitiesService } from '../../../core/services/activities.service';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../../shared/components/desktop-header/desktop-header.component';
import type { Location } from '../../../core/models/location.model';
import type { Activity } from '../../../core/models/activity.model';

const SPORT_COLORS: Record<string, string> = {
  Tennis: '#CDDC39', Football: '#4CAF50', Basketball: '#FF9800',
  Padel: '#2196F3', Running: '#FF7043', Swimming: '#00BCD4',
  default: '#5d5e61',
};

const AMENITY_ICONS: { icon: string; label: string }[] = [
  { icon: 'local_parking', label: 'Parking' },
  { icon: 'shower', label: 'Showers' },
  { icon: 'lock', label: 'Lockers' },
  { icon: 'wifi', label: 'WiFi' },
  { icon: 'wb_sunny', label: 'Lights' },
];

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
            <span class="material-symbols-outlined text-5xl animate-pulse">location_on</span>
            <p class="text-sm">Loading location…</p>
          </div>
        </div>
      } @else if (error()) {
        <div class="flex items-center justify-center min-h-[60vh] px-6">
          <div class="text-center">
            <span class="material-symbols-outlined text-5xl text-error">error</span>
            <p class="text-on-surface-variant mt-2">{{ error() }}</p>
            <button (click)="goBack()" class="btn-primary mt-4">Go back</button>
          </div>
        </div>
      } @else if (loc()) {
        <!-- Mobile header -->
        <header class="md:hidden fixed top-0 left-0 w-full z-50 bg-background/90 backdrop-blur-md">
          <div class="flex justify-between items-center px-6 py-4">
            <button (click)="goBack()"
                    class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
              <span class="material-symbols-outlined text-on-surface">arrow_back</span>
            </button>
            <span class="text-xl font-black tracking-tighter text-on-surface">ActiveZone</span>
            <button class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
              <span class="material-symbols-outlined text-on-surface">favorite_border</span>
            </button>
          </div>
        </header>

        <!-- Hero image -->
        <section class="relative w-full h-[280px] md:h-[400px] overflow-hidden mt-0 md:mt-0">
          @if (loc()!.mainPhotoUrl) {
            <img [src]="loc()!.mainPhotoUrl" [alt]="loc()!.name"
                 class="w-full h-full object-cover" />
          } @else {
            <div class="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center">
              <span class="material-symbols-outlined text-8xl text-on-surface-variant/30">stadium</span>
            </div>
          }
          <div class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        </section>

        <!-- Content -->
        <main class="relative -mt-12 px-6 md:px-12 max-w-4xl mx-auto space-y-10">

          <!-- Header info -->
          <div class="space-y-4">
            <div class="flex gap-2 flex-wrap">
              @for (sport of sports(); track sport) {
                <span class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5"
                      [style.background-color]="sportColor(sport) + '20'"
                      [style.color]="sportColor(sport)">
                  <span class="w-2 h-2 rounded-full animate-pulse" [style.background-color]="sportColor(sport)"></span>
                  {{ sport }}
                </span>
              }
            </div>

            <div class="flex justify-between items-end">
              <div class="space-y-2">
                <h1 class="text-4xl font-extrabold tracking-tighter text-on-surface leading-none">{{ loc()!.name }}</h1>
                <div class="flex items-center text-outline gap-1">
                  <span class="material-symbols-outlined text-sm">location_on</span>
                  <span class="text-sm font-medium">{{ loc()!.address }}</span>
                </div>
              </div>
              <div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/15 text-center shrink-0">
                <div class="text-xl font-black text-on-surface">4.9</div>
                <div class="text-[10px] font-bold text-outline uppercase tracking-widest">Rating</div>
              </div>
            </div>
          </div>

          <!-- Bento grid: amenities + map + status -->
          <div class="grid grid-cols-2 gap-4">
            <!-- Amenities -->
            <div class="col-span-2 bg-surface-container-low p-6 rounded-xl space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-widest text-outline">Amenities</h3>
              <div class="flex flex-wrap gap-6">
                @for (amenity of amenities(); track amenity.icon) {
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center">
                      <span class="material-symbols-outlined text-primary">{{ amenity.icon }}</span>
                    </div>
                    <span class="text-sm font-semibold">{{ amenity.label }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Mini map placeholder -->
            <div class="col-span-1 bg-surface-container-lowest rounded-xl overflow-hidden aspect-square shadow-sm border border-outline-variant/15 flex items-center justify-center">
              <div class="text-center text-on-surface-variant p-4">
                <span class="material-symbols-outlined text-4xl">map</span>
                <p class="text-xs mt-2">{{ loc()!.latitude.toFixed(4) }}, {{ loc()!.longitude.toFixed(4) }}</p>
              </div>
            </div>

            <!-- Status -->
            <div class="col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
              <h3 class="text-xs font-bold uppercase tracking-widest text-outline">Status</h3>
              <div>
                <div class="text-lg font-black text-secondary leading-tight">{{ loc()!.status }}</div>
                <div class="text-xs font-medium text-outline mt-1">
                  @if (loc()!.hasLights) { Lights available }
                  @else { No floodlights }
                </div>
              </div>
            </div>
          </div>

          @if (loc()!.details) {
            <div class="bg-surface-container-low p-6 rounded-xl">
              <h3 class="text-xs font-bold uppercase tracking-widest text-outline mb-3">About</h3>
              <p class="text-sm text-on-surface leading-relaxed">{{ loc()!.details }}</p>
            </div>
          }

          <!-- Upcoming activities -->
          <section class="space-y-6">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-extrabold tracking-tight">Upcoming Activities</h2>
              <a routerLink="/activities/create"
                 class="text-xs font-bold uppercase tracking-widest text-tertiary-fixed border-b border-tertiary-fixed/20 pb-1">
                + Create
              </a>
            </div>

            <div class="space-y-4">
              @for (activity of activities(); track activity.id) {
                <div class="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/15 shadow-sm
                            hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]"
                     (click)="goToActivity(activity.id)">
                  <div class="flex justify-between items-start">
                    <div class="flex gap-4">
                      <div class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-surface-container-high flex items-center justify-center">
                        <span class="material-symbols-outlined text-on-surface-variant">sports</span>
                      </div>
                      <div>
                        <h4 class="font-bold text-on-surface">{{ activity.title }}</h4>
                        <p class="text-xs font-medium text-outline">{{ activity.sport }}</p>
                        <div class="mt-2 flex gap-3 text-[10px] font-bold uppercase tracking-wider text-primary">
                          <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">schedule</span>
                            {{ activity.dateTime | date:'HH:mm' }}
                          </span>
                          <span class="flex items-center gap-1">
                            <span class="material-symbols-outlined text-[14px]">group</span>
                            {{ activity.participantCount }}/{{ activity.maxParticipants }} Joined
                          </span>
                        </div>
                      </div>
                    </div>
                    <button class="px-4 py-2 bg-surface-container-low rounded-full text-xs font-bold uppercase tracking-widest
                                   hover:bg-primary hover:text-on-primary transition-colors">
                      Join
                    </button>
                  </div>
                </div>
              }
              @if (activities().length === 0) {
                <div class="text-center py-8 text-on-surface-variant">
                  <span class="material-symbols-outlined text-4xl">sports</span>
                  <p class="text-sm mt-2">No upcoming activities at this location</p>
                </div>
              }
            </div>
          </section>
        </main>

        <!-- Create Activity FAB -->
        <div class="fixed bottom-28 right-6 z-50 md:hidden">
          <a routerLink="/activities/create"
             class="flex items-center gap-3 pl-6 pr-4 py-4 bg-primary text-on-primary rounded-full shadow-2xl active:scale-95 duration-150">
            <span class="font-bold text-sm tracking-tight">Create Activity</span>
            <div class="w-8 h-8 bg-on-primary/10 rounded-full flex items-center justify-center">
              <span class="material-symbols-outlined">add</span>
            </div>
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
  private cdr = inject(ChangeDetectorRef);

  loc = signal<Location | null>(null);
  activities = signal<Activity[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  sports = computed(() =>
    this.loc()?.sports.split(',').map(s => s.trim()).filter(Boolean) ?? [],
  );

  amenities = computed(() => {
    const l = this.loc();
    if (!l) return [];
    const result = AMENITY_ICONS.filter(a => a.label !== 'Lights');
    if (l.hasLights) result.push({ icon: 'wb_sunny', label: 'Lights' });
    return result;
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.locationsService.getById(id).subscribe({
      next: loc => {
        this.loc.set(loc);
        this.loading.set(false);
        this.cdr.markForCheck();
        this.activitiesService.getAll({ locationId: id }).subscribe({
          next: acts => { this.activities.set(acts); this.cdr.markForCheck(); },
        });
      },
      error: () => {
        this.error.set('Location not found.');
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  goBack(): void { this.router.navigate(['/home']); }
  goToActivity(id: number): void { this.router.navigate(['/activities', id]); }
  sportColor(sport: string): string { return SPORT_COLORS[sport] ?? SPORT_COLORS['default']; }
}
