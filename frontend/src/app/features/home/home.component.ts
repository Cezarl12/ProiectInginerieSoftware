import {
  Component, OnInit, OnDestroy, signal, computed, inject,
  ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, SlicePipe } from '@angular/common';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../shared/components/desktop-header/desktop-header.component';
import { LocationsService } from '../../core/services/locations.service';
import { ActivitiesService } from '../../core/services/activities.service';
import type { Location } from '../../core/models/location.model';
import type { Activity } from '../../core/models/activity.model';

const BUCHAREST: L.LatLngExpression = [44.4268, 26.1025];

const SPORT_COLORS: Record<string, string> = {
  Tennis: '#FFEB3B', Football: '#4CAF50', Basketball: '#FF9800',
  Padel: '#2196F3', Running: '#FF7043', Swimming: '#00BCD4',
  Cycling: '#E91E63', Yoga: '#9C27B0', default: '#5d5e61',
};

const SPORT_ICONS: Record<string, string> = {
  Tennis: 'sports_tennis', Football: 'sports_soccer', Basketball: 'sports_basketball',
  Padel: 'sports_tennis', Running: 'directions_run', Swimming: 'pool',
  Cycling: 'directions_bike', Yoga: 'self_improvement', default: 'fitness_center',
};

const FILTER_CHIPS = ['All', 'Tennis', 'Football', 'Padel', 'Running', 'Swimming'];

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LeafletModule, BottomNavComponent, DesktopHeaderComponent, RouterLink, DatePipe, SlicePipe],
  template: `
    <div class="h-screen w-full bg-background overflow-hidden flex flex-col">
      <app-desktop-header />

      <!-- Full-height map shell -->
      <div class="relative flex-1 overflow-hidden">

        <!-- Leaflet map (fills entire area) -->
        <div
          leaflet
          class="absolute inset-0 z-0"
          [leafletOptions]="mapOptions"
          (leafletMapReady)="onMapReady($event)"
        ></div>

        <!-- Mobile top overlay: search + chips -->
        <div class="absolute top-0 left-0 w-full z-20 md:hidden p-5 space-y-4 pt-12">
          <div class="bg-surface-container-lowest/90 backdrop-blur-md rounded-full shadow-lg flex items-center px-4 py-3 gap-3">
            <span class="material-symbols-outlined text-outline text-[20px]">search</span>
            <input
              type="text"
              placeholder="Search courts, gyms, clubs..."
              class="bg-transparent border-none focus:ring-0 text-sm font-medium w-full placeholder:text-outline-variant outline-none"
            />
            <div class="h-5 w-px bg-outline-variant/30 shrink-0"></div>
            <button class="text-on-surface p-1 active:scale-95 transition-transform">
              <span class="material-symbols-outlined text-[20px]">tune</span>
            </button>
          </div>
          <div class="flex gap-2 overflow-x-auto pb-2" style="scrollbar-width: none;">
            @for (chip of FILTER_CHIPS; track chip) {
              <button
                (click)="setFilter(chip)"
                [class]="activeFilter() === chip
                  ? 'flex-shrink-0 bg-primary text-on-primary px-5 py-2 rounded-full text-xs font-bold tracking-tight shadow-md transition-all'
                  : 'flex-shrink-0 bg-surface-container-lowest/80 backdrop-blur-md text-on-surface px-5 py-2 rounded-full text-xs font-semibold hover:bg-surface-container-low transition-all flex items-center gap-2'"
              >
                @if (activeFilter() !== chip && chip !== 'All') {
                  <span class="w-2 h-2 rounded-full inline-block" [style.background-color]="sportColor(chip)"></span>
                }
                {{ chip }}
              </button>
            }
          </div>
        </div>

        <!-- Desktop: filter chips overlay (top-left) -->
        <div class="hidden md:flex absolute top-6 left-6 z-20 gap-3 overflow-x-auto pb-4" style="scrollbar-width: none;">
          @for (chip of FILTER_CHIPS; track chip) {
            <button
              (click)="setFilter(chip)"
              [class]="activeFilter() === chip
                ? 'flex items-center gap-2 px-6 py-2.5 bg-primary text-on-primary rounded-full shadow-sm font-medium whitespace-nowrap text-sm'
                : 'flex items-center gap-2 px-6 py-2.5 bg-surface-container-lowest text-on-surface rounded-full shadow-sm hover:bg-surface-container-low transition-all font-medium whitespace-nowrap text-sm'"
            >
              @if (chip !== 'All') {
                <span class="w-2 h-2 rounded-full shrink-0" [style.background-color]="sportColor(chip)"></span>
              }
              {{ chip }}
            </button>
          }
        </div>

        <!-- Desktop: right sidebar -->
        <aside class="hidden md:flex absolute top-0 right-0 bottom-0 w-96 p-6 flex-col z-20 pointer-events-none">
          <div class="flex-1 bg-surface-container-lowest/90 backdrop-blur-xl rounded-xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/10 pointer-events-auto">
            <div class="p-6 pb-2">
              <h2 class="text-2xl font-extrabold tracking-tight text-on-surface">Nearby Activities</h2>
              <p class="text-sm text-outline font-medium mt-1">{{ activities().length }} found near you</p>
            </div>
            <div class="flex-1 overflow-y-auto p-6 space-y-8" style="scrollbar-width: none;">
              @for (activity of filteredActivities(); track activity.id) {
                <div class="group cursor-pointer" (click)="goToActivity(activity.id)">
                  <div class="flex gap-4">
                    <div class="w-20 h-20 rounded-lg overflow-hidden shrink-0 bg-surface-container-high flex items-center justify-center">
                      <span class="material-symbols-outlined text-3xl text-on-surface-variant">{{ sportIcon(activity.sport) }}</span>
                    </div>
                    <div class="flex flex-col justify-between flex-1">
                      <div>
                        <div class="flex justify-between items-start">
                          <span class="text-[10px] font-bold uppercase tracking-widest mb-1" [style.color]="sportColor(activity.sport)">{{ activity.sport }}</span>
                          <span class="text-xs font-bold text-outline">{{ activity.location?.address | slice:0:10 }}</span>
                        </div>
                        <h3 class="font-bold text-on-surface leading-tight">{{ activity.title }}</h3>
                      </div>
                      <div class="flex items-center justify-between mt-2">
                        <div class="flex items-center gap-1 text-xs text-on-surface-variant font-medium">
                          <span class="material-symbols-outlined text-sm">schedule</span>
                          {{ activity.dateTime | date:'HH:mm' }}
                        </div>
                        <span class="text-[10px] font-bold text-on-surface-variant">
                          {{ activity.participantCount }}/{{ activity.maxParticipants }} joined
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              }
              @if (filteredActivities().length === 0) {
                <div class="flex flex-col items-center gap-3 py-8 text-on-surface-variant">
                  <span class="material-symbols-outlined text-4xl">sports</span>
                  <p class="text-sm">No activities found</p>
                </div>
              }
            </div>
            <div class="p-6 pt-2 border-t border-surface-container-low">
              <a routerLink="/activities/create"
                 class="w-full py-4 bg-primary text-on-primary rounded-full font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all">
                Create Activity
                <span class="material-symbols-outlined text-[18px]">add</span>
              </a>
            </div>
          </div>
        </aside>

        <!-- Mobile: bottom pull-up sheet -->
        <div class="absolute bottom-20 left-0 w-full z-30 md:hidden">
          <div class="bg-surface-container-low rounded-t-xl shadow-[0_-10px_40px_rgba(0,0,0,0.08)] pb-6">
            <div class="flex justify-center py-3">
              <div class="w-10 h-1 bg-outline-variant/40 rounded-full"></div>
            </div>
            <div class="px-6 space-y-5">
              <div class="flex justify-between items-end">
                <div>
                  <h2 class="text-2xl font-black tracking-tight text-on-surface leading-none">Nearby</h2>
                  <p class="text-xs font-medium text-outline-variant mt-1 uppercase tracking-widest">{{ activities().length }} Activities</p>
                </div>
                <a routerLink="/activities/create" class="text-tertiary text-xs font-bold border-b-2 border-tertiary/20 pb-1">+ Create</a>
              </div>
              <div class="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6" style="scrollbar-width: none;">
                @for (activity of filteredActivities().slice(0, 5); track activity.id) {
                  <div
                    class="min-w-[240px] bg-surface-container-lowest rounded-lg p-3 shadow-sm border border-outline-variant/10 cursor-pointer active:scale-95 transition-all"
                    (click)="goToActivity(activity.id)"
                  >
                    <div class="h-28 w-full rounded-md overflow-hidden mb-3 bg-surface-container-high flex items-center justify-center">
                      <span class="material-symbols-outlined text-5xl text-on-surface-variant">{{ sportIcon(activity.sport) }}</span>
                    </div>
                    <div class="space-y-1">
                      <h3 class="font-bold text-on-surface text-sm">{{ activity.title }}</h3>
                      <div class="flex items-center gap-1 text-[10px] text-outline">
                        <span class="material-symbols-outlined text-[14px]">schedule</span>
                        <span>{{ activity.dateTime | date:'EEE, HH:mm' }}</span>
                      </div>
                      <div class="pt-1 flex justify-between items-center">
                        <span class="text-xs font-bold text-on-surface">{{ activity.participantCount }}/{{ activity.maxParticipants }}</span>
                        <button class="bg-primary text-on-primary text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-widest">Join</button>
                      </div>
                    </div>
                  </div>
                }
                @if (filteredActivities().length === 0) {
                  <div class="flex items-center gap-3 py-4 text-on-surface-variant">
                    <span class="material-symbols-outlined">sports</span>
                    <p class="text-sm">No activities</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- FAB: my location -->
        <div class="absolute bottom-40 right-5 z-40 md:bottom-8 md:right-8">
          <button
            (click)="centerOnUser()"
            class="w-14 h-14 rounded-full bg-on-surface text-surface-container-lowest shadow-xl flex items-center justify-center active:scale-90 transition-transform"
          >
            <span class="material-symbols-outlined text-2xl">my_location</span>
          </button>
        </div>
      </div>

      <app-bottom-nav />
    </div>
  `,
  styles: [`
    :host ::ng-deep .leaflet-tile-pane {
      filter: grayscale(0.8) brightness(1.1) opacity(0.75);
    }
    :host ::ng-deep .leaflet-control-attribution {
      font-size: 10px;
      opacity: 0.5;
    }
  `],
})
export class HomeComponent implements OnInit, OnDestroy {
  private locationsService = inject(LocationsService);
  private activitiesService = inject(ActivitiesService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  protected FILTER_CHIPS = FILTER_CHIPS;
  activeFilter = signal('All');
  activities = signal<Activity[]>([]);
  locations = signal<Location[]>([]);
  private map: L.Map | null = null;

  filteredActivities = computed(() => {
    const f = this.activeFilter();
    const all = this.activities();
    return f === 'All' ? all : all.filter(a => a.sport === f);
  });

  mapOptions: L.MapOptions = {
    layers: [
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      }),
    ],
    zoom: 13,
    center: L.latLng(BUCHAREST as [number, number]),
    zoomControl: false,
  };

  ngOnInit(): void {
    this.loadActivities();
    this.loadLocations();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  onMapReady(map: L.Map): void {
    this.map = map;
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 14);
          this.locationsService.getNearby(latitude, longitude, 10).subscribe({
            next: locs => {
              this.locations.set(locs);
              this.addLocationMarkers(locs);
              this.cdr.markForCheck();
            },
          });
        },
        () => this.loadLocations(),
      );
    }
  }

  private loadActivities(): void {
    this.activitiesService.getAll().subscribe({
      next: acts => { this.activities.set(acts); this.cdr.markForCheck(); },
    });
  }

  private loadLocations(): void {
    this.locationsService.getAll(1, 50).subscribe({
      next: paged => {
        const locs = paged.items;
        this.locations.set(locs);
        this.addLocationMarkers(locs);
        this.cdr.markForCheck();
      },
    });
  }

  private addLocationMarkers(locations: Location[]): void {
    if (!this.map) return;
    locations.forEach(loc => {
      const sport = loc.sports?.split(',')[0]?.trim() ?? 'default';
      const color = SPORT_COLORS[sport] ?? SPORT_COLORS['default'];
      const icon = SPORT_ICONS[sport] ?? SPORT_ICONS['default'];
      const marker = L.marker([loc.latitude, loc.longitude], {
        icon: L.divIcon({
          className: '',
          html: `
            <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;">
              <div style="background:${color};color:#2b3437;padding:10px;border-radius:50%;
                          box-shadow:0 4px 12px rgba(0,0,0,0.2);border:2px solid white;">
                <span class="material-symbols-outlined" style="font-size:18px;line-height:1;">${icon}</span>
              </div>
              <div style="margin-top:4px;background:white;padding:2px 8px;border-radius:999px;
                          box-shadow:0 1px 4px rgba(0,0,0,0.1);font-size:10px;font-weight:700;
                          font-family:Inter,sans-serif;white-space:nowrap;">
                ${loc.name.slice(0, 14)}
              </div>
            </div>`,
          iconSize: [0, 0],
          iconAnchor: [20, 20],
        }),
      });
      marker.on('click', () => this.router.navigate(['/locations', loc.id]));
      marker.addTo(this.map!);
    });
  }

  centerOnUser(): void {
    if (!this.map) return;
    navigator.geolocation?.getCurrentPosition(
      pos => this.map?.setView([pos.coords.latitude, pos.coords.longitude], 15),
    );
  }

  setFilter(chip: string): void {
    this.activeFilter.set(chip);
  }

  sportColor(sport: string): string {
    return SPORT_COLORS[sport] ?? SPORT_COLORS['default'];
  }

  sportIcon(sport: string): string {
    return SPORT_ICONS[sport] ?? SPORT_ICONS['default'];
  }

  goToActivity(id: number): void {
    this.router.navigate(['/activities', id]);
  }
}
