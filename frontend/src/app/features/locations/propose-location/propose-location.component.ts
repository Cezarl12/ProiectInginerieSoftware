import {
  Component, inject, signal, OnDestroy, OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Location as NgLocation } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';
import { catchError, EMPTY } from 'rxjs';
import * as L from 'leaflet';
import { LeafletModule } from '@bluehalo/ngx-leaflet';
import { LocationsService } from '../../../core/services/locations.service';
import { ToastService } from '../../../core/services/toast.service';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../../shared/components/desktop-header/desktop-header.component';
import { SPORTS } from '../../../core/utils/sport-utils';

const SURFACES = ['Grass', 'Synthetic', 'Hard Court', 'Sand', 'Parquet', 'Indoor', 'Other'];
const ORADEA: L.LatLngExpression = [47.0722, 21.9218];

const makePinIcon = () => L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:#2e8fa6;border-radius:50% 50% 50% 0;
                     transform:rotate(-45deg);border:3px solid white;
                     box-shadow:0 3px 10px rgba(46,143,166,.55);"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

@Component({
  selector: 'app-propose-location',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, LeafletModule, BottomNavComponent, DesktopHeaderComponent],
  template: `
    <div class="min-h-screen bg-background pb-32">
      <app-desktop-header />

      <!-- Mobile header -->
      <header class="sticky top-0 z-40 bg-background/95 backdrop-blur-md md:hidden border-b border-outline-variant/10">
        <div class="flex items-center gap-3 px-5 py-4">
          <button (click)="goBack()" type="button"
                  class="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full active:scale-95 transition-transform shrink-0">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <div>
            <p class="text-[10px] uppercase font-bold tracking-widest text-primary leading-none">Community</p>
            <h1 class="text-lg font-black tracking-tight text-on-surface leading-tight">Propose a Venue</h1>
          </div>
        </div>
      </header>

      <form [formGroup]="form" (ngSubmit)="submit()">

        <!-- ══════ MOBILE ══════ -->
        <div class="md:hidden px-5 py-6 max-w-2xl mx-auto space-y-8">

          <div class="bg-primary/10 rounded-2xl p-4 flex items-start gap-3 border border-primary/20">
            <span class="material-symbols-outlined text-primary text-[22px] shrink-0 mt-0.5">info</span>
            <p class="text-sm text-on-surface-variant leading-relaxed">Tap the map to place a pin, fill in the details and submit. An admin will review it.</p>
          </div>

          <!-- Map — same pattern as home: relative parent with fixed height, absolute inset-0 child -->
          <section class="space-y-2">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Pin on Map</label>
            <div class="relative rounded-2xl overflow-hidden border-2 transition-colors"
                 style="height:224px;"
                 [class]="pinSet() ? 'border-primary' : 'border-outline-variant/20'">
              @if (!isDesktop()) {
                <div leaflet class="absolute inset-0"
                     [leafletOptions]="mapOptions"
                     (leafletMapReady)="onMapReady($event, 'mobile')"></div>
              }
              @if (!pinSet()) {
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div class="bg-black/55 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px]">touch_app</span>
                    Tap to place pin
                  </div>
                </div>
              }
            </div>
            @if (pinSet()) {
              <p class="text-xs text-primary flex items-center gap-1 font-semibold">
                <span class="material-symbols-outlined text-[14px]">check_circle</span>
                {{ lat().toFixed(5) }}, {{ lng().toFixed(5) }}
              </p>
            }
            @if (submitted() && !pinSet()) {
              <p class="text-xs text-error flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">error</span> Place a pin on the map first.
              </p>
            }
          </section>

          <!-- Venue Name -->
          <section class="space-y-2">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Venue Name</label>
            <input type="text" formControlName="name" placeholder="e.g. Teren Sintetic Rogerius"
                   class="w-full bg-surface-container-low rounded-xl px-4 py-3.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest outline-none transition-all" />
            @if (submitted() && form.get('name')?.invalid) {
              <p class="text-xs text-error flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">error</span> Required.</p>
            }
          </section>

          <!-- Address -->
          <section class="space-y-2">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Address</label>
            <input type="text" formControlName="address" placeholder="e.g. Str. Sovata 2, Oradea"
                   class="w-full bg-surface-container-low rounded-xl px-4 py-3.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest outline-none transition-all" />
            @if (submitted() && form.get('address')?.invalid) {
              <p class="text-xs text-error flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">error</span> Required.</p>
            }
          </section>

          <!-- Sports -->
          <section class="space-y-3">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Sports Available</label>
            <div class="flex overflow-x-auto gap-2 -mx-5 px-5 pb-1" style="scrollbar-width:none;">
              @for (sport of ALL_SPORTS; track sport.label) {
                <button type="button" (click)="toggleSport(sport.label)"
                        class="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full transition-all active:scale-95 text-sm font-medium"
                        [class]="selectedSports().has(sport.label) ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container-lowest border border-outline-variant/10 text-on-surface'">
                  <span class="w-2 h-2 rounded-full shrink-0" [style.background-color]="sport.color"></span>
                  {{ sport.label }}
                </button>
              }
            </div>
            @if (submitted() && selectedSports().size === 0) {
              <p class="text-xs text-error flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">error</span> Select at least one sport.</p>
            }
          </section>

          <!-- Surface + Lights -->
          <section class="grid grid-cols-2 gap-4 items-end">
            <div class="space-y-2">
              <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Surface</label>
              <div class="relative">
                <select formControlName="surface"
                        class="w-full bg-surface-container-low rounded-xl px-4 py-3.5 text-sm text-on-surface appearance-none outline-none transition-all">
                  <option value="">Unknown</option>
                  @for (s of SURFACES; track s) { <option [value]="s">{{ s }}</option> }
                </select>
                <span class="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span>
              </div>
            </div>
            <div class="bg-surface-container-low rounded-xl px-4 py-3.5 flex items-center justify-between">
              <span class="text-[11px] uppercase font-bold tracking-widest" [class]="hasLights() ? 'text-primary' : 'text-outline'">{{ hasLights() ? 'Lights' : 'No Lights' }}</span>
              <button type="button" (click)="hasLights.update(v => !v)"
                      class="w-12 h-6 rounded-full relative transition-colors duration-200 shrink-0"
                      [class]="hasLights() ? 'bg-primary' : 'bg-surface-container-highest'">
                <span class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200" [class]="hasLights() ? 'right-1' : 'left-1'"></span>
              </button>
            </div>
          </section>

          <!-- Details -->
          <section class="space-y-2">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Details <span class="font-normal normal-case text-outline">(optional)</span></label>
            <textarea formControlName="details" placeholder="Parking, changing rooms, open hours..." rows="3"
                      class="w-full bg-surface-container-low rounded-xl px-4 py-3.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest outline-none transition-all resize-none"></textarea>
          </section>

          <!-- Photo URL -->
          <section class="space-y-2">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Photo URL <span class="font-normal normal-case text-outline">(optional)</span></label>
            <input type="url" formControlName="mainPhotoUrl" placeholder="https://..."
                   class="w-full bg-surface-container-low rounded-xl px-4 py-3.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest outline-none transition-all" />
          </section>

          @if (submitError()) {
            <div class="flex items-start gap-3 bg-error-container/20 border border-error-container/40 rounded-xl p-4">
              <span class="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">error</span>
              <p class="text-sm text-on-surface">{{ submitError() }}</p>
            </div>
          }

          <button type="submit" [disabled]="loading()"
                  class="w-full bg-primary text-on-primary font-black py-5 rounded-full shadow-2xl shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 uppercase tracking-widest">
            @if (loading()) {
              <span class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span><span>Submitting...</span>
            } @else {
              <span class="material-symbols-outlined text-[20px]">add_location</span><span>Submit for Review</span>
            }
          </button>

        </div>

        <!-- ══════ DESKTOP ══════ -->
        <div class="hidden md:grid grid-cols-12 gap-10 max-w-7xl mx-auto px-6 py-10 pb-20">

          <div class="col-span-5 flex flex-col gap-6">
            <div>
              <button type="button" (click)="goBack()"
                      class="mb-4 flex items-center gap-2 text-sm font-bold text-on-surface-variant hover:text-primary transition-colors group">
                <span class="w-9 h-9 flex items-center justify-center bg-surface-container rounded-full group-hover:bg-primary group-hover:text-on-primary transition-colors">
                  <span class="material-symbols-outlined text-[18px]">arrow_back</span>
                </span>
                <span class="uppercase tracking-widest text-xs">Back</span>
              </button>
              <h1 class="text-5xl lg:text-6xl font-black text-on-surface tracking-tighter leading-none mb-4">
                Put your<br /><span class="text-primary">Spot</span><br />on the Map.
              </h1>
              <p class="text-base text-on-surface-variant leading-relaxed max-w-md">
                Know a great sports venue that is missing? Place a pin, fill in the details and our team will review it.
              </p>
            </div>
            <!-- Map — fixed 400 px, absolute inset-0 child -->
            <div class="relative rounded-2xl overflow-hidden border-2 transition-colors"
                 style="height:400px;"
                 [class]="pinSet() ? 'border-primary' : 'border-outline-variant/20'">
              @if (isDesktop()) {
                <div leaflet class="absolute inset-0"
                     [leafletOptions]="mapOptions"
                     (leafletMapReady)="onMapReady($event, 'desktop')"></div>
              }
              @if (!pinSet()) {
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-10">
                  <div class="bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-5 py-2 rounded-full flex items-center gap-2">
                    <span class="material-symbols-outlined text-[16px]">mouse</span>Click to place pin
                  </div>
                </div>
              }
              @if (pinSet()) {
                <div class="absolute top-3 left-3 z-10 bg-primary text-on-primary text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[14px]">check_circle</span>
                  {{ lat().toFixed(5) }}, {{ lng().toFixed(5) }}
                </div>
              }
            </div>
          </div>

          <div class="col-span-7">
            <div class="bg-surface-container-lowest rounded-2xl p-8 lg:p-10 shadow-sm border border-outline-variant/10 space-y-7">

              <div class="bg-primary/10 rounded-xl p-4 flex items-start gap-3 border border-primary/20">
                <span class="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">info</span>
                <p class="text-sm text-on-surface-variant">Place a pin on the map first, then fill in the venue details. An admin will approve your submission.</p>
              </div>

              @if (submitted() && !pinSet()) {
                <div class="flex items-center gap-2 bg-error-container/20 border border-error-container/40 rounded-xl p-3">
                  <span class="material-symbols-outlined text-error text-[18px]">error</span>
                  <p class="text-sm text-on-surface">Please place a pin on the map first.</p>
                </div>
              }

              <div class="space-y-2">
                <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Venue Name</label>
                <input type="text" formControlName="name" placeholder="e.g. Teren Sintetic Rogerius"
                       class="w-full bg-surface-container-low rounded-xl px-5 py-3.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest outline-none transition-all" />
                @if (submitted() && form.get('name')?.invalid) {
                  <p class="text-xs text-error flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">error</span> Required.</p>
                }
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Address</label>
                <input type="text" formControlName="address" placeholder="e.g. Str. Sovata 2, Oradea"
                       class="w-full bg-surface-container-low rounded-xl px-5 py-3.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest outline-none transition-all" />
                @if (submitted() && form.get('address')?.invalid) {
                  <p class="text-xs text-error flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">error</span> Required.</p>
                }
              </div>

              <div class="space-y-3">
                <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Sports Available</label>
                <div class="flex flex-wrap gap-2">
                  @for (sport of ALL_SPORTS; track sport.label) {
                    <button type="button" (click)="toggleSport(sport.label)"
                            class="flex items-center gap-2 px-4 py-2 rounded-full transition-all active:scale-95 text-sm font-medium"
                            [class]="selectedSports().has(sport.label) ? 'bg-primary text-on-primary shadow-sm' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'">
                      <span class="w-2 h-2 rounded-full shrink-0" [style.background-color]="sport.color"></span>
                      {{ sport.label }}
                    </button>
                  }
                </div>
                @if (submitted() && selectedSports().size === 0) {
                  <p class="text-xs text-error flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">error</span> Select at least one sport.</p>
                }
              </div>

              <div class="grid grid-cols-2 gap-6 items-end">
                <div class="space-y-2">
                  <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Surface</label>
                  <div class="relative">
                    <select formControlName="surface"
                            class="w-full bg-surface-container-low rounded-xl px-5 py-3.5 text-sm text-on-surface appearance-none outline-none transition-all">
                      <option value="">Unknown</option>
                      @for (s of SURFACES; track s) { <option [value]="s">{{ s }}</option> }
                    </select>
                    <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                  </div>
                </div>
                <div class="flex items-center justify-between bg-surface-container-low rounded-xl px-5 py-3.5">
                  <span class="text-sm font-bold" [class]="hasLights() ? 'text-primary' : 'text-on-surface-variant'">{{ hasLights() ? 'Has Lights' : 'No Lights' }}</span>
                  <button type="button" (click)="hasLights.update(v => !v)"
                          class="w-14 h-7 rounded-full relative transition-colors duration-200 shrink-0"
                          [class]="hasLights() ? 'bg-primary' : 'bg-outline-variant/30'">
                    <span class="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-200" [class]="hasLights() ? 'right-0.5' : 'left-1'"></span>
                  </button>
                </div>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Details <span class="font-normal normal-case text-outline-variant">(optional)</span></label>
                <textarea formControlName="details" rows="3" placeholder="Parking, changing rooms, open hours..."
                          class="w-full bg-surface-container-low rounded-xl px-5 py-3.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest outline-none transition-all resize-none"></textarea>
              </div>

              <div class="space-y-2">
                <label class="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">Photo URL <span class="font-normal normal-case text-outline-variant">(optional)</span></label>
                <input type="url" formControlName="mainPhotoUrl" placeholder="https://..."
                       class="w-full bg-surface-container-low rounded-xl px-5 py-3.5 text-sm text-on-surface placeholder:text-outline-variant focus:bg-surface-container-lowest outline-none transition-all" />
              </div>

              @if (submitError()) {
                <div class="flex items-start gap-3 bg-error-container/20 border border-error-container/40 rounded-xl p-4">
                  <span class="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">error</span>
                  <p class="text-sm text-on-surface">{{ submitError() }}</p>
                </div>
              }

              <button type="submit" [disabled]="loading()"
                      class="w-full bg-primary text-on-primary font-black text-base py-5 rounded-full shadow-xl hover:scale-[1.01] active:scale-95 transition-all uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100">
                @if (loading()) {
                  <span class="material-symbols-outlined animate-spin text-[22px]">progress_activity</span><span>Submitting...</span>
                } @else {
                  <span class="material-symbols-outlined text-[22px]">add_location</span><span>Submit for Review</span>
                }
              </button>

            </div>
          </div>
        </div>

      </form>
      <app-bottom-nav />
    </div>
  `,
  styles: [`
    :host ::ng-deep .leaflet-tile-pane { filter: grayscale(0.2) brightness(1.05); }
    :host ::ng-deep .leaflet-control-attribution { font-size:9px; opacity:0.4; background:transparent !important; }
    :host ::ng-deep .leaflet-control-zoom { border:none !important; border-radius:10px !important; overflow:hidden; box-shadow:0 2px 10px rgba(46,143,166,.2) !important; }
    :host ::ng-deep .leaflet-control-zoom a { border:none !important; color:#2e8fa6 !important; font-weight:700 !important; }
  `],
})
export class ProposeLocationComponent implements OnInit, OnDestroy {
  protected readonly ALL_SPORTS = SPORTS;
  protected readonly SURFACES = SURFACES;

  private locationsService = inject(LocationsService);
  private toast = inject(ToastService);
  private router = inject(Router);
  private ngLocation = inject(NgLocation);
  private destroyRef = inject(DestroyRef);

  lat = signal(0);
  lng = signal(0);
  pinSet = signal(false);
  hasLights = signal(false);
  selectedSports = signal(new Set<string>());
  loading = signal(false);
  submitted = signal(false);
  submitError = signal('');

  /** True when the viewport is at least Tailwind's md breakpoint (768px). */
  isDesktop = signal(
    typeof window !== 'undefined' && window.matchMedia('(min-width: 768px)').matches,
  );
  private mql?: MediaQueryList;
  private mqlListener = (e: MediaQueryListEvent) => this.isDesktop.set(e.matches);

  private mobileMap: L.Map | null = null;
  private desktopMap: L.Map | null = null;
  private mobilePin: L.Marker | null = null;
  private desktopPin: L.Marker | null = null;

  readonly mapOptions: L.MapOptions = {
    layers: [L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    })],
    zoom: 13,
    center: ORADEA,
    zoomControl: true,
  };

  form = new FormGroup({
    name:         new FormControl('', [Validators.required, Validators.minLength(3)]),
    address:      new FormControl('', Validators.required),
    surface:      new FormControl(''),
    details:      new FormControl(''),
    mainPhotoUrl: new FormControl(''),
  });

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      this.mql = window.matchMedia('(min-width: 768px)');
      // Modern browsers: addEventListener; fallback for older Safari: addListener
      this.mql.addEventListener?.('change', this.mqlListener);
    }
  }

  onMapReady(map: L.Map, type: 'mobile' | 'desktop'): void {
    if (type === 'mobile') this.mobileMap = map;
    else this.desktopMap = map;

    // Recalculate size shortly after the container becomes visible
    setTimeout(() => map.invalidateSize(), 100);
    setTimeout(() => map.invalidateSize(), 400);

    map.on('click', (e: L.LeafletMouseEvent) => {
      this.lat.set(e.latlng.lat);
      this.lng.set(e.latlng.lng);
      this.pinSet.set(true);
      this.syncPins(e.latlng);
    });
  }

  private syncPins(latlng: L.LatLng): void {
    const icon = makePinIcon();

    if (this.mobilePin) { this.mobilePin.remove(); this.mobilePin = null; }
    if (this.desktopPin) { this.desktopPin.remove(); this.desktopPin = null; }

    if (this.mobileMap) {
      this.mobilePin = L.marker(latlng, { icon, draggable: true }).addTo(this.mobileMap);
      this.mobilePin.on('dragend', () => {
        const pos = (this.mobilePin as L.Marker).getLatLng();
        this.lat.set(pos.lat); this.lng.set(pos.lng);
        this.syncPins(pos);
      });
    }
    if (this.desktopMap) {
      this.desktopPin = L.marker(latlng, { icon, draggable: true }).addTo(this.desktopMap);
      this.desktopPin.on('dragend', () => {
        const pos = (this.desktopPin as L.Marker).getLatLng();
        this.lat.set(pos.lat); this.lng.set(pos.lng);
        this.syncPins(pos);
      });
    }
  }

  toggleSport(sport: string): void {
    this.selectedSports.update(set => {
      const next = new Set(set);
      next.has(sport) ? next.delete(sport) : next.add(sport);
      return next;
    });
  }

  goBack(): void {
    // Prefer real history-back so the user returns where they came from.
    // Fallback to /home if there's nothing to go back to (e.g. opened in a new tab).
    if (typeof history !== 'undefined' && history.length > 1) {
      this.ngLocation.back();
    } else {
      this.router.navigate(['/home']);
    }
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.pinSet() || this.selectedSports().size === 0 || this.form.invalid) return;

    this.loading.set(true);
    this.submitError.set('');
    const v = this.form.getRawValue();

    this.locationsService.create({
      name:         v.name!,
      address:      v.address!,
      latitude:     this.lat(),
      longitude:    this.lng(),
      sports:       Array.from(this.selectedSports()).join(', '),
      surface:      v.surface || null,
      hasLights:    this.hasLights(),
      details:      v.details || null,
      mainPhotoUrl: v.mainPhotoUrl || null,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        const msg = err?.error?.message ?? 'Failed to submit. Please try again.';
        this.submitError.set(msg);
        this.loading.set(false);
        this.toast.error(msg);
        return EMPTY;
      }),
    ).subscribe(() => {
      this.toast.success('Venue submitted for review!', 'An admin will approve it soon.');
      this.router.navigate(['/home']);
    });
  }

  ngOnDestroy(): void {
    // Defensive cleanup — never let a stale leaflet handle block route changes.
    try { this.mql?.removeEventListener?.('change', this.mqlListener); } catch {}
    try { this.mobilePin?.remove(); } catch {}
    try { this.desktopPin?.remove(); } catch {}
    try { this.mobileMap?.off(); this.mobileMap?.remove(); } catch {}
    try { this.desktopMap?.off(); this.desktopMap?.remove(); } catch {}
    this.mobilePin = null;
    this.desktopPin = null;
    this.mobileMap = null;
    this.desktopMap = null;
  }
}
