import {
  Component, OnInit, OnDestroy, signal, computed, effect, inject,
  ChangeDetectionStrategy, DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { Router, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import * as L from 'leaflet';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../shared/components/desktop-header/desktop-header.component';
import { LocationsService } from '../../core/services/locations.service';
import { ActivitiesService } from '../../core/services/activities.service';
import { ToastService } from '../../core/services/toast.service';
import type { Location } from '../../core/models/location.model';
import type { Activity } from '../../core/models/activity.model';

const BUCHAREST: L.LatLngExpression = [44.4268, 26.1025];

const SPORT_COLORS: Record<string, string> = {
  Football:      '#43A047',
  Tennis:        '#F9A825',
  Basketball:    '#FF9800',
  Running:       '#FF7043',
  Swimming:      '#00ACC1',
  Padel:         '#26A69A',
  Cycling:       '#E91E63',
  Yoga:          '#9C27B0',
  Volleyball:    '#1565C0',
  Handball:      '#00838F',
  Golf:          '#558B2F',
  Boxing:        '#C62828',
  Fitness:       '#5C6BC0',
  Badminton:     '#F57F17',
  Rugby:         '#795548',
  'Martial Arts':'#D32F2F',
  Skiing:        '#0D47A1',
  Surfing:       '#0277BD',
  Cricket:       '#6D4C41',
  Athletics:     '#FF8F00',
  default:       '#2e8fa6',
};

const SPORT_ICONS: Record<string, string> = {
  Football:      'sports_soccer',
  Tennis:        'sports_tennis',
  Basketball:    'sports_basketball',
  Running:       'directions_run',
  Swimming:      'pool',
  Padel:         'sports_tennis',
  Cycling:       'directions_bike',
  Yoga:          'self_improvement',
  Volleyball:    'sports_volleyball',
  Handball:      'sports_handball',
  Golf:          'sports_golf',
  Boxing:        'sports_mma',
  Fitness:       'fitness_center',
  Badminton:     'sports_tennis',
  Rugby:         'sports_rugby',
  'Martial Arts':'sports_martial_arts',
  Skiing:        'skiing',
  Surfing:       'surfing',
  Cricket:       'sports_cricket',
  Athletics:     'directions_run',
  default:       'sports',
};

const SPORT_KEYS = Object.keys(SPORT_COLORS).filter(k => k !== 'default');
const FILTER_CHIPS = ['All', 'Football', 'Tennis', 'Basketball', 'Padel', 'Running', 'Swimming'];

function resolveSport(raw: string): string {
  const trimmed = raw.trim();
  return SPORT_KEYS.find(k => k.toLowerCase() === trimmed.toLowerCase()) ?? 'default';
}

function markerHtml(color: string, icon: string, name: string): string {
  const textColor = ['#FFEB3B', '#94f990'].includes(color) ? '#0e1d4a' : '#ffffff';
  const label = name.length > 13 ? name.slice(0, 13) + '…' : name;
  return `
    <div style="display:flex;flex-direction:column;align-items:center;cursor:pointer;filter:drop-shadow(0 3px 8px rgba(14,29,74,0.28));">
      <div style="background:${color};color:${textColor};width:36px;height:36px;border-radius:50%;
                  display:flex;align-items:center;justify-content:center;
                  border:2.5px solid rgba(255,255,255,0.9);">
        <span class="material-symbols-outlined" style="font-size:16px;line-height:1;
              font-variation-settings:'FILL' 1,'wght' 600,'GRAD' 0,'opsz' 20;">${icon}</span>
      </div>
      <div style="margin-top:3px;background:white;padding:1px 7px;border-radius:999px;
                  box-shadow:0 1px 4px rgba(14,29,74,0.14);font-size:9px;font-weight:700;
                  font-family:Inter,system-ui,sans-serif;white-space:nowrap;color:#0e1d4a;">
        ${label}
      </div>
    </div>`;
}

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LeafletModule, BottomNavComponent, DesktopHeaderComponent, RouterLink, DatePipe],
  template: `
    <div class="h-screen w-full bg-background overflow-hidden flex flex-col">
      <app-desktop-header />

      <div class="relative flex-1 overflow-hidden">

        <!-- Map -->
        <div
          leaflet
          class="absolute inset-0 z-0"
          [leafletOptions]="mapOptions"
          (leafletMapReady)="onMapReady($event)"
        ></div>

        <!-- ── MOBILE: top search + chips ── -->
        <div class="absolute top-0 left-0 w-full z-20 md:hidden px-4 pt-10 pb-3 space-y-3">
          <!-- Search bar -->
          <div class="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg flex items-center px-4 py-3 gap-2 border border-outline-variant/10">
            <span class="material-symbols-outlined text-primary text-[20px] shrink-0">search</span>
            <input
              type="text"
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              placeholder="Courts, gyms, clubs…"
              class="bg-transparent border-none focus:ring-0 text-sm font-medium w-full placeholder:text-outline-variant outline-none text-on-surface"
            />
            @if (searchQuery()) {
              <button (click)="searchQuery.set('')"
                class="shrink-0 text-outline hover:text-on-surface transition-colors p-0.5">
                <span class="material-symbols-outlined text-[18px]">close</span>
              </button>
            }
          </div>

          <!-- Sport filter chips -->
          <div class="flex gap-2 overflow-x-auto" style="scrollbar-width:none;-webkit-overflow-scrolling:touch;">
            @for (chip of FILTER_CHIPS; track chip) {
              <button
                (click)="setFilter(chip)"
                class="flex-shrink-0 flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
                [class]="activeFilter() === chip
                  ? 'bg-primary text-on-primary shadow-md'
                  : 'bg-white/90 backdrop-blur-md text-on-surface shadow-sm border border-outline-variant/10'"
              >
                @if (chip !== 'All') {
                  <span class="w-2 h-2 rounded-full shrink-0"
                    [style.background-color]="activeFilter() === chip ? 'rgba(255,255,255,0.6)' : sportColor(chip)">
                  </span>
                }
                {{ chip }}
              </button>
            }
          </div>
        </div>

        <!-- ── DESKTOP: sport chips (top-left) ── -->
        <div class="hidden md:flex absolute top-5 left-5 z-20 gap-2.5" style="scrollbar-width:none;">
          @for (chip of FILTER_CHIPS; track chip) {
            <button
              (click)="setFilter(chip)"
              class="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all active:scale-95 whitespace-nowrap shadow-sm"
              [class]="activeFilter() === chip
                ? 'bg-primary text-on-primary shadow-md'
                : 'bg-white/95 backdrop-blur-md text-on-surface hover:bg-surface-container-low border border-outline-variant/10'"
            >
              @if (chip !== 'All') {
                <span class="w-2 h-2 rounded-full shrink-0"
                  [style.background-color]="activeFilter() === chip ? 'rgba(255,255,255,0.6)' : sportColor(chip)">
                </span>
              }
              {{ chip }}
            </button>
          }
        </div>

        <!-- ── DESKTOP: right sidebar ── -->
        <aside class="hidden md:flex absolute top-0 right-0 bottom-0 w-[360px] p-4 flex-col z-20 pointer-events-none">
          <div class="flex-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-outline-variant/10 pointer-events-auto">

            <!-- Sidebar header -->
            <div class="p-5 pb-3 border-b border-surface-container-low space-y-3">
              <div class="flex justify-between items-start">
                <div>
                  <h2 class="text-xl font-black tracking-tight text-on-surface">Activities</h2>
                  <p class="text-xs text-outline font-medium mt-0.5">
                    {{ filteredActivities().length }}
                    {{ searchQuery() || activeFilter() !== 'All' ? 'matching' : 'nearby' }}
                  </p>
                </div>
                <a routerLink="/activities/create"
                  class="flex items-center gap-1 bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-full hover:bg-primary-dim active:scale-95 transition-all">
                  <span class="material-symbols-outlined text-[16px]">add</span>
                  Create
                </a>
              </div>

              <!-- Desktop search -->
              <div class="flex items-center gap-2 bg-surface-container-low rounded-xl px-3 py-2.5">
                <span class="material-symbols-outlined text-primary text-[18px] shrink-0">search</span>
                <input
                  type="text"
                  [value]="searchQuery()"
                  (input)="searchQuery.set($any($event.target).value)"
                  placeholder="Search activities or venues…"
                  class="bg-transparent border-none focus:ring-0 text-sm w-full placeholder:text-outline-variant outline-none text-on-surface"
                />
                @if (searchQuery()) {
                  <button (click)="searchQuery.set('')"
                    class="shrink-0 text-outline hover:text-on-surface transition-colors">
                    <span class="material-symbols-outlined text-[16px]">close</span>
                  </button>
                }
              </div>
            </div>

            <!-- Activity list -->
            <div class="flex-1 overflow-y-auto px-4 py-3 space-y-2" style="scrollbar-width:thin;scrollbar-color:#d0deff transparent;">
              @for (activity of filteredActivities(); track activity.id) {
                <div
                  class="group flex gap-3 p-3 rounded-xl cursor-pointer hover:bg-surface-container-low active:scale-[0.98] transition-all"
                  (click)="goToActivity(activity.id)"
                >
                  <!-- Sport icon box -->
                  <div class="w-14 h-14 rounded-xl shrink-0 flex items-center justify-center"
                    [style.background-color]="sportColor(activity.sport) + '22'">
                    <span class="material-symbols-outlined text-2xl"
                      [style.color]="sportColor(activity.sport)"
                      style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24;">
                      {{ sportIcon(activity.sport) }}
                    </span>
                  </div>

                  <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start gap-1">
                      <h3 class="font-bold text-on-surface text-sm leading-tight truncate">{{ activity.title }}</h3>
                      <span class="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        [style.background-color]="sportColor(activity.sport) + '22'"
                        [style.color]="sportColor(activity.sport)">
                        {{ activity.sport }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between mt-1.5">
                      <div class="flex items-center gap-1 text-xs text-on-surface-variant">
                        <span class="material-symbols-outlined text-[13px]">schedule</span>
                        {{ activity.dateTime | date:'EEE d MMM · HH:mm' }}
                      </div>
                      <span class="text-[10px] font-bold text-outline">
                        {{ activity.participantCount }}/{{ activity.maxParticipants }}
                        <span class="font-normal">joined</span>
                      </span>
                    </div>
                    @if (activity.location?.name) {
                      <div class="flex items-center gap-1 mt-1 text-[10px] text-outline">
                        <span class="material-symbols-outlined text-[12px]">location_on</span>
                        {{ activity.location!.name }}
                      </div>
                    }
                  </div>
                </div>
              }

              @if (filteredActivities().length === 0) {
                <div class="flex flex-col items-center gap-3 py-12 text-on-surface-variant">
                  <div class="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center">
                    <span class="material-symbols-outlined text-3xl text-outline">sports</span>
                  </div>
                  <p class="text-sm font-medium text-center">
                    {{ searchQuery() || activeFilter() !== 'All' ? 'No results found' : 'No activities yet' }}
                  </p>
                  @if (!searchQuery() && activeFilter() === 'All') {
                    <a routerLink="/activities/create"
                      class="text-xs font-bold text-primary hover:underline">
                      Be the first to create one →
                    </a>
                  }
                </div>
              }
            </div>
          </div>
        </aside>

        <!-- ── MOBILE: bottom activities sheet ── -->
        <div class="absolute bottom-16 left-0 right-0 z-30 md:hidden">
          <div class="bg-white/95 backdrop-blur-xl rounded-t-2xl shadow-[0_-8px_32px_rgba(14,29,74,0.12)] border-t border-outline-variant/10">
            <!-- Drag handle -->
            <div class="flex justify-center pt-3 pb-1">
              <div class="w-8 h-1 bg-outline-variant/40 rounded-full"></div>
            </div>

            <div class="px-5 pb-5 space-y-4">
              <!-- Sheet header -->
              <div class="flex justify-between items-center">
                <div>
                  <h2 class="text-lg font-black tracking-tight text-on-surface">
                    {{ activeFilter() === 'All' ? 'Nearby' : activeFilter() }}
                  </h2>
                  <p class="text-[10px] font-bold text-outline uppercase tracking-widest">
                    {{ filteredActivities().length }} activities
                  </p>
                </div>
                <a routerLink="/activities/create"
                  class="flex items-center gap-1 bg-primary text-on-primary text-[10px] font-bold px-3 py-1.5 rounded-full">
                  <span class="material-symbols-outlined text-[14px]">add</span>
                  Create
                </a>
              </div>

              <!-- Horizontal scroll cards -->
              <div class="flex gap-3 overflow-x-auto -mx-5 px-5 pb-1" style="scrollbar-width:none;-webkit-overflow-scrolling:touch;">
                @for (activity of filteredActivities().slice(0, 8); track activity.id) {
                  <div
                    class="min-w-[200px] max-w-[200px] bg-surface-container-lowest rounded-xl p-3 shadow-sm border border-outline-variant/10 cursor-pointer active:scale-95 transition-all flex flex-col gap-2"
                    (click)="goToActivity(activity.id)"
                  >
                    <!-- Sport header -->
                    <div class="h-20 rounded-lg flex items-center justify-center"
                      [style.background-color]="sportColor(activity.sport) + '18'">
                      <span class="material-symbols-outlined text-4xl"
                        [style.color]="sportColor(activity.sport)"
                        style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 48;">
                        {{ sportIcon(activity.sport) }}
                      </span>
                    </div>

                    <div class="space-y-1">
                      <h3 class="font-bold text-on-surface text-xs leading-tight line-clamp-2">{{ activity.title }}</h3>
                      <div class="flex items-center gap-1 text-[10px] text-outline">
                        <span class="material-symbols-outlined text-[12px]">schedule</span>
                        {{ activity.dateTime | date:'EEE · HH:mm' }}
                      </div>
                      <div class="flex justify-between items-center pt-1">
                        <span class="text-[10px] font-bold text-on-surface-variant">
                          {{ activity.participantCount }}/{{ activity.maxParticipants }}
                        </span>
                        <button
                          (click)="joinActivity($event, activity)"
                          class="bg-primary text-on-primary text-[9px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                          Join
                        </button>
                      </div>
                    </div>
                  </div>
                }

                @if (filteredActivities().length === 0) {
                  <div class="flex items-center gap-3 py-6 text-on-surface-variant w-full justify-center">
                    <span class="material-symbols-outlined text-outline">sports</span>
                    <p class="text-sm font-medium">No activities found</p>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- FAB: my location -->
        <button
          (click)="centerOnUser()"
          class="absolute bottom-44 right-4 z-40 md:bottom-6 md:right-[380px]
                 w-12 h-12 rounded-xl bg-white shadow-lg border border-outline-variant/10
                 flex items-center justify-center active:scale-90 transition-transform hover:bg-surface-container-low"
        >
          <span class="material-symbols-outlined text-primary text-xl">my_location</span>
        </button>

      </div>

      <app-bottom-nav />
    </div>
  `,
  styles: [`
    :host ::ng-deep .leaflet-tile-pane {
      filter: grayscale(0.45) brightness(1.08) opacity(0.82);
    }
    :host ::ng-deep .leaflet-control-attribution {
      font-size: 9px;
      opacity: 0.4;
      background: transparent !important;
    }
    :host ::ng-deep .leaflet-control-zoom {
      border: none !important;
      border-radius: 12px !important;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(14,29,74,0.15) !important;
    }
    :host ::ng-deep .leaflet-control-zoom a {
      border: none !important;
      color: #1a6ef5 !important;
      font-weight: 700 !important;
    }
    :host ::ng-deep .leaflet-control-zoom a:hover {
      background-color: #eaf1ff !important;
    }
  `],
})
export class HomeComponent implements OnInit, OnDestroy {
  private locationsService = inject(LocationsService);
  private activitiesService = inject(ActivitiesService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  protected FILTER_CHIPS = FILTER_CHIPS;
  searchQuery  = signal('');
  activeFilter = signal('All');
  activities   = signal<Activity[]>([]);
  locations    = signal<Location[]>([]);

  private map: L.Map | null = null;
  private markers: L.Marker[] = [];

  filteredLocations = computed(() => {
    const f = this.activeFilter();
    const q = this.searchQuery().toLowerCase().trim();
    let locs = this.locations();

    if (f !== 'All') {
      locs = locs.filter(l =>
        l.sports?.split(',').some(s => s.trim().toLowerCase() === f.toLowerCase())
      );
    }
    if (q) {
      locs = locs.filter(l =>
        l.name.toLowerCase().includes(q) ||
        (l.address?.toLowerCase().includes(q) ?? false) ||
        (l.sports?.toLowerCase().includes(q) ?? false)
      );
    }
    return locs;
  });

  filteredActivities = computed(() => {
    const f = this.activeFilter();
    const q = this.searchQuery().toLowerCase().trim();
    let all = this.activities();

    if (f !== 'All') {
      all = all.filter(a => a.sport.toLowerCase() === f.toLowerCase());
    }
    if (q) {
      all = all.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.sport.toLowerCase().includes(q) ||
        (a.location?.name?.toLowerCase().includes(q) ?? false) ||
        (a.location?.address?.toLowerCase().includes(q) ?? false)
      );
    }
    return all;
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

  constructor() {
    effect(() => {
      this.refreshMarkers(this.filteredLocations());
    });
  }

  ngOnInit(): void {
    this.loadActivities();
    this.loadLocations();
  }

  ngOnDestroy(): void {
    this.map = null;
  }

  onMapReady(map: L.Map): void {
    this.map = map;
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    // Draw whatever is already loaded
    this.refreshMarkers(this.filteredLocations());
    // Try to center on user
    navigator.geolocation?.getCurrentPosition(
      pos => {
        if (!this.map) return;
        const { latitude, longitude } = pos.coords;
        this.map.setView([latitude, longitude], 14);
        this.locationsService.getNearby(latitude, longitude, 10)
          .pipe(takeUntilDestroyed(this.destroyRef), catchError(() => EMPTY))
          .subscribe(locs => this.locations.set(locs));
      },
      () => { /* fallback: loadLocations already called in ngOnInit */ },
    );
  }

  private loadActivities(): void {
    this.activitiesService.getAll().pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => EMPTY),
    ).subscribe(paged => this.activities.set(paged.items));
  }

  private loadLocations(): void {
    this.locationsService.getAll(1, 100).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError(() => {
        this.toast.error('Could not load venues. Please refresh.', 'Network error');
        return EMPTY;
      }),
    ).subscribe(paged => this.locations.set(paged.items));
  }

  private refreshMarkers(locations: Location[]): void {
    this.markers.forEach(m => m.remove());
    this.markers = [];
    if (!this.map) return;

    locations.forEach(loc => {
      const sportRaw = loc.sports?.split(',')[0] ?? '';
      const sport    = resolveSport(sportRaw);
      const color    = SPORT_COLORS[sport];
      const icon     = SPORT_ICONS[sport];

      const marker = L.marker([loc.latitude, loc.longitude], {
        icon: L.divIcon({
          className: '',
          html: markerHtml(color, icon, loc.name),
          iconSize:   [40, 52],
          iconAnchor: [20, 52],
        }),
      });
      marker.on('click', () => this.router.navigate(['/locations', loc.id]));
      marker.addTo(this.map!);
      this.markers.push(marker);
    });
  }

  setFilter(chip: string): void {
    this.activeFilter.set(chip);
  }

  centerOnUser(): void {
    if (!this.map) return;
    navigator.geolocation?.getCurrentPosition(
      pos => this.map?.setView([pos.coords.latitude, pos.coords.longitude], 15),
      () => this.toast.warning('Enable location access to use this feature.', 'Location denied'),
    );
  }

  joinActivity(event: Event, activity: Activity): void {
    event.stopPropagation();
    this.toast.info(`Join feature coming soon for "${activity.title}"`, 'Coming soon');
  }

  goToActivity(id: number): void {
    this.router.navigate(['/activities', id]);
  }

  sportColor(sport: string): string {
    const key = SPORT_KEYS.find(k => k.toLowerCase() === sport.toLowerCase()) ?? 'default';
    return SPORT_COLORS[key];
  }

  sportIcon(sport: string): string {
    const key = SPORT_KEYS.find(k => k.toLowerCase() === sport.toLowerCase()) ?? 'default';
    return SPORT_ICONS[key];
  }
}
