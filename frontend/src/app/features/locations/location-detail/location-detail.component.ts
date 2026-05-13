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
import { sportColor as sColor } from '../../../core/utils/sport-utils';

function userInitials(username: string): string {
  const parts = username.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

const SPORT_HERO: Record<string, string> = {
  Football:     'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1400&h=700&fit=crop&q=80',
  Tennis:       'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1400&h=700&fit=crop&q=80',
  Basketball:   'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1400&h=700&fit=crop&q=80',
  Running:      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1400&h=700&fit=crop&q=80',
  Swimming:     'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1400&h=700&fit=crop&q=80',
  Padel:        'https://images.unsplash.com/photo-1619693286886-8ed735e42d49?w=1400&h=700&fit=crop&q=80',
  Cycling:      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=1400&h=700&fit=crop&q=80',
  Yoga:         'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1400&h=700&fit=crop&q=80',
  Volleyball:   'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=1400&h=700&fit=crop&q=80',
  Fitness:      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1400&h=700&fit=crop&q=80',
  Handball:     'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1400&h=700&fit=crop&q=80',
  Golf:         'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=1400&h=700&fit=crop&q=80',
  Boxing:         'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=1400&h=700&fit=crop&q=80',
  Badminton:      'https://images.unsplash.com/photo-1613918431703-aa50889e3be7?w=1400&h=700&fit=crop&q=80',
  Rugby:          'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1400&h=700&fit=crop&q=80',
  'Martial Arts': 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=1400&h=700&fit=crop&q=80',
  Skiing:         'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1400&h=700&fit=crop&q=80',
  Surfing:        'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=1400&h=700&fit=crop&q=80',
  Cricket:        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1400&h=700&fit=crop&q=80',
  Athletics:      'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=1400&h=700&fit=crop&q=80',
};
const FALLBACK_HERO = 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1400&h=700&fit=crop&q=80';

const SPORT_GALLERY: Record<string, string[]> = {
  Tennis: [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560012057-4372e14c5085?w=400&h=600&fit=crop&q=80',
  ],
  Football: [
    'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=600&fit=crop&q=80',
  ],
  Basketball: [
    'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1474224021254-1c1d3d6bb6f1?w=400&h=600&fit=crop&q=80',
  ],
  Padel: [
    'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1619693286886-8ed735e42d49?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=400&h=600&fit=crop&q=80',
  ],
  Running: [
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486218119243-13301702cb03?w=400&h=600&fit=crop&q=80',
  ],
  Swimming: [
    'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1519315901367-f34ff9154487?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1560089000-7433a4ebbd64?w=400&h=600&fit=crop&q=80',
  ],
  Cycling: [
    'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534787238916-9ba6764efd4f?w=400&h=600&fit=crop&q=80',
  ],
  Yoga: [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1588286840104-8957b019727f?w=400&h=600&fit=crop&q=80',
  ],
  Fitness: [
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&q=80',
  ],
  Volleyball: [
    'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1592656094267-764a45160876?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1569937756447-68e09bef33db?w=400&h=600&fit=crop&q=80',
  ],
  Handball: [
    'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=600&fit=crop&q=80',
  ],
  Golf: [
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1593111774240-d529f12cf4bb?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1576858574144-9ae1ebcf5ae5?w=400&h=600&fit=crop&q=80',
  ],
  Boxing: [
    'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517438476312-10d79c077509?w=400&h=600&fit=crop&q=80',
  ],
  Badminton: [
    'https://images.unsplash.com/photo-1613918431703-aa50889e3be7?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1599586120429-48281b6f0ece?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1491466424936-e304919aada7?w=400&h=600&fit=crop&q=80',
  ],
  Rugby: [
    'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1541252260730-0412e8e2108e?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=600&fit=crop&q=80',
  ],
  'Martial Arts': [
    'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=600&fit=crop&q=80',
  ],
  Skiing: [
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1568572933382-74d440642117?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535581652167-3a26c90f0f65?w=400&h=600&fit=crop&q=80',
  ],
  Surfing: [
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1455729552865-3658a5d39692?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1446043778965-d05ac4bef9e3?w=400&h=600&fit=crop&q=80',
  ],
  Cricket: [
    'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1606925797300-0b35e9d1794e?w=400&h=600&fit=crop&q=80',
  ],
  Athletics: [
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=400&h=600&fit=crop&q=80',
    'https://images.unsplash.com/photo-1486218119243-13301702cb03?w=400&h=600&fit=crop&q=80',
  ],
};
const FALLBACK_GALLERY = [
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=600&fit=crop&q=80',
];

@Component({
  selector: 'app-location-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BottomNavComponent, DesktopHeaderComponent, RouterLink, DatePipe],
  template: `
    <div class="min-h-screen bg-background">
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
            <button (click)="goBack()" class="bg-primary text-on-primary px-6 py-3 rounded-full font-bold">Go back</button>
          </div>
        </div>

      } @else if (loc()) {

        <!-- ═══════ MOBILE FIXED HEADER ═══════ -->
        <header class="fixed top-0 left-0 w-full z-50 bg-background/95 backdrop-blur-md md:hidden">
          <div class="flex justify-between items-center w-full px-6 py-4">
            <button (click)="goBack()"
                    class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm active:scale-95 transition-transform">
              <span class="material-symbols-outlined text-on-surface">arrow_back</span>
            </button>
            <div class="text-2xl font-black tracking-tighter text-on-surface">SportMap</div>
            <button class="w-10 h-10 flex items-center justify-center rounded-full bg-surface-container-lowest shadow-sm">
              <span class="material-symbols-outlined text-on-surface">favorite_border</span>
            </button>
          </div>
        </header>

        <!-- ═══════ HERO (shared) ═══════ -->
        <section class="relative w-full h-[397px] md:h-[512px] lg:h-[614px] overflow-hidden">
          <img [src]="heroPhoto()" [alt]="loc()!.name" class="w-full h-full object-cover"
               (error)="onImgError($event, FALLBACK_HERO)" />
          <div class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent md:from-background/20"></div>

          <!-- Desktop: info overlay at bottom of hero -->
          <div class="hidden md:block absolute bottom-0 left-0 p-8 lg:p-16 w-full max-w-4xl">
            <div class="flex flex-wrap gap-2 mb-6">
              @for (sport of sports(); track sport; let first = $first) {
                <span class="px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase flex items-center gap-2"
                      style="background:rgba(255,255,255,0.18);backdrop-filter:blur(8px);color:white;border:1px solid rgba(255,255,255,0.25);">
                  <span class="w-2 h-2 rounded-full flex-shrink-0"
                        [class]="first ? 'animate-pulse' : ''"
                        [style.background-color]="sColor(sport)"></span>
                  {{ sport }}
                </span>
              }
            </div>
            <h1 class="text-5xl lg:text-7xl font-black tracking-tighter text-white mb-4 leading-none">{{ loc()!.name }}</h1>
            <div class="flex items-center gap-2 text-white/80 font-medium">
              <span class="material-symbols-outlined text-xl">location_on</span>
              <span>{{ loc()!.address }}</span>
            </div>
          </div>
        </section>

        <!-- ═══════ MOBILE CONTENT ═══════ -->
        <main class="md:hidden relative -mt-16 px-6 space-y-12 pb-48">

          <!-- Header info -->
          <div class="space-y-4">
            <div class="inline-flex flex-wrap gap-2">
              @for (sport of sports(); track sport; let first = $first) {
                <span class="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-1.5"
                      [style.background-color]="sColor(sport) + '20'"
                      [style.color]="sColor(sport)">
                  <span class="w-2 h-2 rounded-full flex-shrink-0"
                        [class]="first ? 'animate-pulse' : ''"
                        [style.background-color]="sColor(sport)"></span>
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
              <div class="bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/15 text-center shrink-0 ml-4">
                <div class="text-xl font-black text-on-surface">{{ activities().length }}</div>
                <div class="text-[10px] font-bold text-outline uppercase tracking-widest">Events</div>
              </div>
            </div>
          </div>

          <!-- Bento grid -->
          <div class="grid grid-cols-2 gap-4">

            <!-- Amenities: full-width -->
            <div class="col-span-2 bg-surface-container-low p-6 rounded-xl space-y-4">
              <h3 class="text-xs font-bold uppercase tracking-widest text-outline">Amenities</h3>
              <div class="flex flex-wrap gap-6">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary">local_parking</span>
                  </div>
                  <span class="text-sm font-semibold">Parking</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary">shower</span>
                  </div>
                  <span class="text-sm font-semibold">Showers</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center">
                    <span class="material-symbols-outlined text-primary">lock</span>
                  </div>
                  <span class="text-sm font-semibold">Lockers</span>
                </div>
                @if (loc()!.hasLights) {
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center">
                      <span class="material-symbols-outlined text-primary"
                            style="font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24;">wb_twilight</span>
                    </div>
                    <span class="text-sm font-semibold">Floodlights</span>
                  </div>
                }
                @if (loc()!.surface) {
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center">
                      <span class="material-symbols-outlined text-primary">layers</span>
                    </div>
                    <span class="text-sm font-semibold capitalize">{{ loc()!.surface }}</span>
                  </div>
                }
              </div>
            </div>

            <!-- Mini-map -->
            <div class="col-span-1 bg-surface-container-lowest rounded-xl overflow-hidden aspect-square shadow-sm border border-outline-variant/15">
              <img [src]="miniMapUrl()" [alt]="'Map of ' + loc()!.name"
                   class="w-full h-full object-cover"
                   (error)="onMapError($event)" />
            </div>

            <!-- Status card -->
            <div class="col-span-1 bg-surface-container-lowest p-6 rounded-xl shadow-sm border border-outline-variant/15 flex flex-col justify-between">
              <h3 class="text-xs font-bold uppercase tracking-widest text-outline">Status</h3>
              <div>
                <div class="text-lg font-black text-secondary leading-tight">
                  {{ loc()!.hasLights ? 'Open Late' : 'Open Now' }}
                </div>
                <div class="text-xs font-medium text-outline capitalize">
                  {{ loc()!.surface ? loc()!.surface + ' surface' : 'Outdoor venue' }}
                </div>
              </div>
            </div>
          </div>

          <!-- Schedule (mobile) -->
          <div class="bg-surface-container-low p-5 rounded-xl">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-xs font-bold uppercase tracking-widest text-outline">Opening Hours</h3>
              <span class="text-[10px] font-bold px-2.5 py-1 rounded-full"
                    [class]="loc()!.hasLights ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-lowest text-outline'">
                {{ loc()!.hasLights ? 'Night sessions' : 'Day only' }}
              </span>
            </div>
            <div class="space-y-1.5">
              @for (day of schedule(); track day.day) {
                <div class="flex justify-between items-center py-1 border-b border-surface-container-lowest/60 last:border-0">
                  <span class="text-sm font-semibold text-on-surface">{{ day.day }}</span>
                  <span class="text-sm text-on-surface-variant">{{ day.hours }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Upcoming Activities -->
          <section class="space-y-6">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-extrabold tracking-tight">Upcoming Activities</h2>
              <button (click)="router.navigate(['/activities'])"
                      class="text-xs font-bold uppercase tracking-widest text-tertiary border-b border-tertiary/20 pb-1">
                View all
              </button>
            </div>

            @if (activitiesLoading()) {
              <div class="flex items-center gap-3 py-6 text-on-surface-variant">
                <span class="material-symbols-outlined animate-pulse text-primary">sports</span>
                <p class="text-sm">Loading activities…</p>
              </div>
            } @else if (activities().length === 0) {
              <div class="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/15 text-center space-y-3">
                <span class="material-symbols-outlined text-4xl text-outline block">sports</span>
                <p class="text-sm font-medium text-on-surface-variant">No upcoming activities here</p>
                <a [routerLink]="['/activities/create']" [queryParams]="{ locationId: loc()!.id }"
                   class="inline-flex items-center gap-1 text-xs font-bold text-tertiary">
                  Be the first to create one →
                </a>
              </div>
            } @else {
              <div class="space-y-4">
                @for (activity of activities(); track activity.id) {
                  <div class="group bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/15 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                       (click)="goToActivity(activity.id)">
                    <div class="flex justify-between items-start">
                      <div class="flex gap-4">
                        <a [routerLink]="['/users', activity.organizerId]"
                           class="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-primary-container flex items-center justify-center">
                          @if (activity.organizer?.profilePhotoUrl) {
                            <img [src]="activity.organizer!.profilePhotoUrl!" [alt]="activity.organizer!.username" class="w-full h-full object-cover" />
                          } @else {
                            <span class="text-xs font-bold text-on-primary-container">{{ organizerInitials(activity) }}</span>
                          }
                        </a>
                        <div>
                          <h4 class="font-bold text-on-surface">{{ activity.title }}</h4>
                          <p class="text-xs font-medium text-outline">
                            Hosted by {{ activity.organizer?.username ?? 'Organizer' }}
                          </p>
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
                      <button (click)="joinActivity($event, activity)"
                              class="px-4 py-2 bg-surface-container-low rounded-full text-xs font-bold uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-colors shrink-0">
                        Join
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </section>
        </main>

        <!-- ═══════ DESKTOP CONTENT ═══════ -->
        <div class="hidden md:block">

          <!-- Content grid -->
          <section class="px-6 md:px-16 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">

            <!-- Left: About + Facilities -->
            <div class="lg:col-span-4 space-y-12">
              <div>
                <h3 class="text-sm font-bold uppercase tracking-widest text-outline mb-6">About the Facility</h3>
                <p class="text-lg leading-relaxed text-on-surface-variant">
                  {{ loc()!.details || 'A premier sporting facility designed for athletes of all levels, offering world-class amenities and a vibrant community atmosphere.' }}
                </p>
              </div>
              <div class="bg-surface-container-low p-8 rounded-xl">
                <h3 class="text-sm font-bold uppercase tracking-widest text-outline mb-6">Facilities</h3>
                <ul class="space-y-6">
                  <li class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary">
                      <span class="material-symbols-outlined">local_parking</span>
                    </div>
                    <span class="font-medium">Secure Parking</span>
                  </li>
                  <li class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary">
                      <span class="material-symbols-outlined">shower</span>
                    </div>
                    <span class="font-medium">Premium Showers &amp; Sauna</span>
                  </li>
                  <li class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary">
                      <span class="material-symbols-outlined">lock</span>
                    </div>
                    <span class="font-medium">Smart Lockers</span>
                  </li>
                  <li class="flex items-center gap-4">
                    <div class="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary">
                      <span class="material-symbols-outlined">coffee</span>
                    </div>
                    <span class="font-medium">Pro-Shop &amp; Café</span>
                  </li>
                  @if (loc()!.hasLights) {
                    <li class="flex items-center gap-4">
                      <div class="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined"
                              style="font-variation-settings:'FILL' 1,'wght' 400,'GRAD' 0,'opsz' 24;">wb_twilight</span>
                      </div>
                      <span class="font-medium">Night Floodlights</span>
                    </li>
                  }
                  @if (loc()!.surface) {
                    <li class="flex items-center gap-4">
                      <div class="w-12 h-12 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined">layers</span>
                      </div>
                      <span class="font-medium capitalize">{{ loc()!.surface }} Surface</span>
                    </li>
                  }
                </ul>
              </div>

              <!-- Schedule -->
              <div class="bg-surface-container-low p-8 rounded-xl">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="text-sm font-bold uppercase tracking-widest text-outline">Opening Hours</h3>
                  <span class="text-xs font-bold px-3 py-1 rounded-full"
                        [class]="loc()!.hasLights ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-lowest text-outline'">
                    {{ loc()!.hasLights ? 'Night sessions available' : 'Day only' }}
                  </span>
                </div>
                <div class="space-y-2">
                  @for (day of schedule(); track day.day) {
                    <div class="flex justify-between items-center py-2 border-b border-surface-container-lowest/60 last:border-0">
                      <span class="font-semibold text-on-surface">{{ day.day }}</span>
                      <span class="text-sm text-on-surface-variant font-medium">{{ day.hours }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Right: Upcoming Activities -->
            <div class="lg:col-span-8">
              <div class="flex justify-between items-end mb-8">
                <div>
                  <h2 class="text-3xl font-black tracking-tight text-on-surface">Upcoming Activities</h2>
                  <p class="text-on-surface-variant">Join a match or find a training partner</p>
                </div>
                <button (click)="router.navigate(['/activities'])"
                        class="text-sm font-bold text-tertiary hover:underline underline-offset-4 decoration-2">
                  View all schedule
                </button>
              </div>

              @if (activitiesLoading()) {
                <div class="flex items-center gap-3 py-6 text-on-surface-variant">
                  <span class="material-symbols-outlined animate-pulse text-primary">sports</span>
                  <p>Loading activities…</p>
                </div>
              } @else {
                <div class="space-y-4">
                  @for (activity of activities(); track activity.id) {
                    <div class="group bg-surface-container-lowest hover:bg-surface-container-low transition-all duration-300 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm cursor-pointer"
                         (click)="goToActivity(activity.id)">
                      <!-- Date block + divider + title/time/count -->
                      <div class="flex items-center gap-6">
                        <div class="text-center min-w-[64px]">
                          <span class="block text-2xl font-black text-on-surface">{{ activity.dateTime | date:'d' }}</span>
                          <span class="block text-xs font-bold uppercase tracking-widest text-outline">{{ activity.dateTime | date:'MMM' }}</span>
                        </div>
                        <div class="w-[2px] h-12 bg-surface-container-high hidden md:block"></div>
                        <div>
                          <h4 class="text-xl font-bold text-on-surface">{{ activity.title }}</h4>
                          <div class="flex items-center gap-4 mt-1 text-sm text-on-surface-variant">
                            <span class="flex items-center gap-1">
                              <span class="material-symbols-outlined text-lg">schedule</span>
                              {{ activity.dateTime | date:'HH:mm' }}
                            </span>
                            <span class="flex items-center gap-1">
                              <span class="material-symbols-outlined text-lg">groups</span>
                              {{ activity.participantCount }}/{{ activity.maxParticipants }} joined
                            </span>
                          </div>
                        </div>
                      </div>
                      <!-- Avatar stack -->
                      <div class="flex items-center -space-x-3 shrink-0">
                        @if (activity.organizer) {
                          <a [routerLink]="['/users', activity.organizerId]"
                             class="w-10 h-10 rounded-full border-2 border-surface-container-lowest overflow-hidden bg-primary-container flex items-center justify-center">
                            @if (activity.organizer.profilePhotoUrl) {
                              <img [src]="activity.organizer.profilePhotoUrl" [alt]="activity.organizer.username" class="w-full h-full object-cover" />
                            } @else {
                              <span class="text-[10px] font-bold text-on-primary-container">{{ organizerInitials(activity) }}</span>
                            }
                          </a>
                        }
                        @if (activity.participantCount > 1) {
                          <div class="w-10 h-10 rounded-full bg-surface-container-high border-2 border-surface-container-lowest flex items-center justify-center text-[10px] font-bold text-outline">
                            +{{ activity.participantCount - 1 }}
                          </div>
                        }
                      </div>
                      <button (click)="joinActivity($event, activity)"
                              class="bg-primary text-on-primary px-8 py-3 rounded-full font-bold hover:scale-105 active:scale-95 transition-transform shrink-0">
                        Join Match
                      </button>
                    </div>
                  }

                  <!-- "Hosting an event?" dashed card (always visible) -->
                  <div class="bg-surface-container-low/50 border-2 border-dashed border-outline-variant/20 rounded-xl p-8 flex flex-col items-center justify-center text-center">
                    <span class="material-symbols-outlined text-4xl text-outline-variant mb-3">event_note</span>
                    <h4 class="font-bold text-on-surface">Hosting an event?</h4>
                    <p class="text-on-surface-variant text-sm mt-1 max-w-xs">
                      Organize your own private match or public training session at this location.
                    </p>
                    <a [routerLink]="['/activities/create']" [queryParams]="{ locationId: loc()!.id }"
                       class="mt-6 font-bold text-tertiary flex items-center gap-2 hover:gap-3 transition-all">
                      Create private booking
                      <span class="material-symbols-outlined">arrow_forward</span>
                    </a>
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- Gallery -->
          <section class="px-6 md:px-16 mt-24 max-w-7xl mx-auto pb-16">
            <h3 class="text-sm font-bold uppercase tracking-widest text-outline mb-10">Gallery Moments</h3>
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 h-[300px]">
              <div class="col-span-2 rounded-xl overflow-hidden">
                <img [src]="galleryPhotos()[0]" alt="Gallery"
                     class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                     (error)="onImgError($event, FALLBACK_GALLERY[0])" />
              </div>
              <div class="rounded-xl overflow-hidden">
                <img [src]="galleryPhotos()[1]" alt="Gallery"
                     class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                     (error)="onImgError($event, FALLBACK_GALLERY[1])" />
              </div>
              <div class="rounded-xl overflow-hidden">
                <img [src]="galleryPhotos()[2]" alt="Gallery"
                     class="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
                     (error)="onImgError($event, FALLBACK_GALLERY[2])" />
              </div>
            </div>
          </section>
        </div>

        <!-- ─── Mobile FAB ─── -->
        <div class="fixed bottom-28 right-6 z-50 md:hidden">
          <a [routerLink]="['/activities/create']" [queryParams]="{ locationId: loc()!.id }"
             class="flex items-center gap-3 pl-6 pr-4 py-4 bg-primary text-on-primary rounded-full shadow-2xl active:scale-95 duration-150">
            <span class="font-bold text-sm tracking-tight">Create Activity</span>
            <div class="w-8 h-8 bg-on-primary/10 rounded-full flex items-center justify-center">
              <span class="material-symbols-outlined text-[18px]">add</span>
            </div>
          </a>
        </div>

        <!-- ─── Desktop FAB ─── -->
        <div class="hidden md:block fixed bottom-10 right-10 z-50">
          <a [routerLink]="['/activities/create']" [queryParams]="{ locationId: loc()!.id }"
             class="bg-primary text-on-primary shadow-xl hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all flex items-center gap-3 px-8 py-5 rounded-full">
            <span class="material-symbols-outlined font-bold">add</span>
            <span class="font-black tracking-tight text-lg">Create Activity</span>
          </a>
        </div>
      }

      <app-bottom-nav />
    </div>
  `,
})
export class LocationDetailComponent implements OnInit {
  readonly FALLBACK_HERO    = FALLBACK_HERO;
  readonly FALLBACK_GALLERY = FALLBACK_GALLERY;

  readonly router = inject(Router);
  private route = inject(ActivatedRoute);
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

  schedule = computed(() => {
    const late = this.loc()?.hasLights ?? false;
    const close = late ? '22:00' : '20:00';
    return [
      { day: 'Monday',    hours: `07:00 – ${close}`, open: true },
      { day: 'Tuesday',   hours: `07:00 – ${close}`, open: true },
      { day: 'Wednesday', hours: `07:00 – ${close}`, open: true },
      { day: 'Thursday',  hours: `07:00 – ${close}`, open: true },
      { day: 'Friday',    hours: `07:00 – ${close}`, open: true },
      { day: 'Saturday',  hours: `08:00 – ${close}`, open: true },
      { day: 'Sunday',    hours: `09:00 – 18:00`,   open: true },
    ];
  });

  todaySchedule = computed(() => {
    const dayIdx = new Date().getDay();
    const map = [6, 0, 1, 2, 3, 4, 5];
    return this.schedule()[map[dayIdx]];
  });

  heroPhoto = computed(() => {
    const l = this.loc();
    if (!l) return FALLBACK_HERO;
    if (l.mainPhotoUrl) return l.mainPhotoUrl;
    const sport = this.sports()[0] ?? '';
    return SPORT_HERO[sport] ?? FALLBACK_HERO;
  });

  galleryPhotos = computed(() => {
    const l = this.loc();
    if (!l) return FALLBACK_GALLERY;
    const sport = this.sports()[0] ?? '';
    const sportPhotos = SPORT_GALLERY[sport] ?? FALLBACK_GALLERY;
    const merged = [...(l.secondaryPhotoUrls ?? []), ...sportPhotos];
    return merged.slice(0, 3);
  });

  miniMapUrl = computed(() => {
    const l = this.loc();
    if (!l) return '';
    return `https://staticmap.openstreetmap.de/staticmap.php?center=${l.latitude},${l.longitude}&zoom=16&size=300x300&markers=${l.latitude},${l.longitude}`;
  });

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

  organizerInitials(activity: Activity): string {
    return userInitials(activity.organizer?.username ?? 'AN');
  }

  avatarSlots(activity: Activity): number[] {
    return Array.from({ length: Math.min(activity.participantCount, 3) }, (_, i) => i);
  }

  onImgError(event: Event, fallback: string): void {
    const img = event.target as HTMLImageElement;
    if (img.src !== fallback) img.src = fallback;
  }

  onMapError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = `https://images.unsplash.com/photo-1524661135-423995f22d0b?w=300&h=300&fit=crop&q=80`;
  }

  joinActivity(event: Event, activity: Activity): void {
    event.stopPropagation();
    this.router.navigate(['/activities', activity.id]);
  }

  goBack(): void { history.length > 1 ? history.back() : this.router.navigate(['/home']); }
  goToActivity(id: number): void { this.router.navigate(['/activities', id]); }
  sColor(sport: string): string { return sColor(sport); }
}
