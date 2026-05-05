import {
  Component, inject, signal, computed, ChangeDetectionStrategy, DestroyRef,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { ActivitiesService } from '../../../core/services/activities.service';
import { LocationsService } from '../../../core/services/locations.service';
import { ToastService } from '../../../core/services/toast.service';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../../shared/components/desktop-header/desktop-header.component';
import { ActivityType } from '../../../core/models/activity.model';
import type { Location } from '../../../core/models/location.model';

export const ALL_SPORTS = [
  { label: 'Football',      color: '#43A047', icon: 'sports_soccer',      featured: true  },
  { label: 'Tennis',        color: '#F9A825', icon: 'sports_tennis',      featured: true  },
  { label: 'Basketball',    color: '#FF9800', icon: 'sports_basketball',  featured: true  },
  { label: 'Running',       color: '#FF7043', icon: 'directions_run',     featured: true  },
  { label: 'Swimming',      color: '#00ACC1', icon: 'pool',               featured: true  },
  { label: 'Padel',         color: '#26A69A', icon: 'sports_tennis',      featured: false },
  { label: 'Cycling',       color: '#E91E63', icon: 'directions_bike',    featured: false },
  { label: 'Yoga',          color: '#9C27B0', icon: 'self_improvement',   featured: false },
  { label: 'Volleyball',    color: '#1565C0', icon: 'sports_volleyball',  featured: false },
  { label: 'Handball',      color: '#00838F', icon: 'sports_handball',    featured: false },
  { label: 'Golf',          color: '#558B2F', icon: 'sports_golf',        featured: false },
  { label: 'Boxing',        color: '#C62828', icon: 'sports_mma',         featured: false },
  { label: 'Fitness',       color: '#5C6BC0', icon: 'fitness_center',     featured: false },
  { label: 'Badminton',     color: '#F57F17', icon: 'sports_tennis',      featured: false },
  { label: 'Rugby',         color: '#795548', icon: 'sports_rugby',       featured: false },
  { label: 'Martial Arts',  color: '#D32F2F', icon: 'sports_martial_arts', featured: false },
  { label: 'Skiing',        color: '#0D47A1', icon: 'skiing',             featured: false },
  { label: 'Surfing',       color: '#0277BD', icon: 'surfing',            featured: false },
  { label: 'Cricket',       color: '#6D4C41', icon: 'sports_cricket',     featured: false },
  { label: 'Athletics',     color: '#FF8F00', icon: 'directions_run',     featured: false },
];

const FEATURED = ALL_SPORTS.filter(s => s.featured);
const MORE     = ALL_SPORTS.filter(s => !s.featured);

@Component({
  selector: 'app-create-activity',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, BottomNavComponent, DesktopHeaderComponent],
  template: `
    <div class="min-h-screen bg-background pb-32">
      <app-desktop-header />

      <!-- Mobile header -->
      <header class="sticky top-0 z-40 bg-background/80 backdrop-blur-sm md:hidden">
        <div class="flex items-center gap-3 px-6 py-4">
          <button (click)="goBack()"
                  class="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full active:scale-95 transition-transform shrink-0">
            <span class="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
          <h1 class="text-base font-bold tracking-tight text-on-surface">New Activity</h1>
        </div>
      </header>

      <main class="px-6 py-8 max-w-2xl mx-auto">
        <div class="mb-8 hidden md:block">
          <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-2">New Event</span>
          <h2 class="text-4xl font-black tracking-tighter text-on-surface leading-none">Create Activity</h2>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-8">

          <!-- ── Title ── -->
          <section class="space-y-2">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Activity Title</label>
            <input
              type="text"
              formControlName="title"
              placeholder="e.g. Morning Padel Session"
              class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                     focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all
                     placeholder:text-outline-variant"
            />
            @if (submitted() && form.get('title')?.invalid) {
              <p class="text-xs text-error flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">error</span>
                Title must be at least 3 characters.
              </p>
            }
          </section>

          <!-- ── Sport selector ── -->
          <section class="space-y-3">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Select Sport</label>

            <!-- Featured chips row -->
            <div class="flex gap-2 overflow-x-auto pb-1 -mx-0" style="scrollbar-width: none;">
              @for (sport of FEATURED; track sport.label) {
                <button
                  type="button"
                  (click)="selectSport(sport.label)"
                  class="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all active:scale-95"
                  [class]="selectedSport() === sport.label
                    ? 'border-transparent shadow-sm'
                    : 'bg-surface-container-lowest border-outline-variant/20'"
                  [style.background-color]="selectedSport() === sport.label ? sport.color : ''"
                >
                  <span class="material-symbols-outlined text-[16px]"
                        [style.color]="selectedSport() === sport.label ? 'white' : sport.color"
                        style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20;">{{ sport.icon }}</span>
                  <span class="text-sm font-semibold whitespace-nowrap"
                        [class]="selectedSport() === sport.label ? 'text-white' : 'text-on-surface'">{{ sport.label }}</span>
                </button>
              }

              <!-- More button -->
              <button
                type="button"
                (click)="showMoreSports.update(v => !v)"
                class="flex-shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full border transition-all active:scale-95"
                [class]="showMoreSports()
                  ? 'bg-surface-container text-on-surface border-outline-variant/40'
                  : 'bg-surface-container-lowest border-outline-variant/20 text-on-surface-variant'"
              >
                <span class="material-symbols-outlined text-[16px]">{{ showMoreSports() ? 'expand_less' : 'expand_more' }}</span>
                <span class="text-sm font-semibold">More</span>
              </button>
            </div>

            <!-- Expanded more-sports grid -->
            @if (showMoreSports()) {
              <div class="grid grid-cols-2 gap-2 p-4 bg-surface-container-low rounded-2xl">
                @for (sport of MORE; track sport.label) {
                  <button
                    type="button"
                    (click)="selectSport(sport.label); showMoreSports.set(false)"
                    class="flex items-center gap-3 p-3 rounded-xl border transition-all active:scale-95 text-left"
                    [class]="selectedSport() === sport.label
                      ? 'border-transparent shadow-sm'
                      : 'bg-surface-container-lowest border-outline-variant/20'"
                    [style.background-color]="selectedSport() === sport.label ? sport.color + '18' : ''"
                    [style.border-color]="selectedSport() === sport.label ? sport.color + '60' : ''"
                  >
                    <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                         [style.background-color]="sport.color + '20'">
                      <span class="material-symbols-outlined text-[16px]" [style.color]="sport.color"
                            style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20;">{{ sport.icon }}</span>
                    </div>
                    <span class="text-sm font-semibold text-on-surface">{{ sport.label }}</span>
                    @if (selectedSport() === sport.label) {
                      <span class="material-symbols-outlined text-[14px] ml-auto" [style.color]="sport.color">check_circle</span>
                    }
                  </button>
                }
              </div>
            }

            <!-- Selected sport badge (if a "more" sport is selected) -->
            @if (selectedSport() && !isFeatured()) {
              <div class="flex items-center gap-2 px-4 py-2 rounded-full border w-fit"
                   [style.background-color]="selectedSportMeta()!.color + '18'"
                   [style.border-color]="selectedSportMeta()!.color + '60'">
                <span class="material-symbols-outlined text-[16px]" [style.color]="selectedSportMeta()!.color"
                      style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 20;">{{ selectedSportMeta()!.icon }}</span>
                <span class="text-sm font-bold" [style.color]="selectedSportMeta()!.color">{{ selectedSport() }}</span>
                <button type="button" (click)="selectedSport.set('')"
                        class="text-outline hover:text-on-surface transition-colors">
                  <span class="material-symbols-outlined text-[14px]">close</span>
                </button>
              </div>
            }

            @if (submitted() && !selectedSport()) {
              <p class="text-xs text-error flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">error</span>
                Please select a sport.
              </p>
            }
          </section>

          <!-- ── Date & Time ── -->
          <section class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Date</label>
              <input
                type="date"
                formControlName="date"
                [min]="today"
                class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                       focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all"
              />
              @if (submitted() && form.get('date')?.invalid) {
                <p class="text-xs text-error flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">error</span>
                  Required.
                </p>
              }
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Time</label>
              <input
                type="time"
                formControlName="time"
                class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                       focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all"
              />
              @if (submitted() && form.get('time')?.invalid) {
                <p class="text-xs text-error flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">error</span>
                  Required.
                </p>
              }
            </div>
          </section>

          <!-- ── Max players & Privacy ── -->
          <section class="grid grid-cols-2 gap-4 items-end">
            <div class="space-y-2">
              <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Max Players</label>
              <input
                type="number"
                formControlName="maxParticipants"
                placeholder="10"
                min="2"
                max="100"
                class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                       focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all"
              />
            </div>
            <div class="bg-surface-container-low rounded-xl p-4 flex items-center justify-between gap-3 h-[58px]">
              <div>
                <p class="text-[10px] uppercase font-bold tracking-widest text-outline">Visibility</p>
                <p class="text-sm font-semibold" [class]="isPublic() ? 'text-primary' : 'text-on-surface-variant'">
                  {{ isPublic() ? 'Public' : 'Private' }}
                </p>
              </div>
              <button
                type="button"
                (click)="togglePrivacy()"
                class="w-12 h-6 rounded-full relative transition-colors duration-200 shrink-0"
                [class]="isPublic() ? 'bg-primary' : 'bg-surface-container-highest'"
              >
                <span
                  class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
                  [class]="isPublic() ? 'right-1' : 'left-1'"
                ></span>
              </button>
            </div>
          </section>

          <!-- ── Location picker ── -->
          <section class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Location</label>
              @if (selectedSport()) {
                <span class="text-[10px] text-primary font-semibold flex items-center gap-1">
                  <span class="material-symbols-outlined text-[12px]">filter_alt</span>
                  Filtered for {{ selectedSport() }}
                </span>
              }
            </div>
            <div class="relative">
              <select
                formControlName="locationId"
                class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                       focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all appearance-none"
              >
                <option value="">Select a venue…</option>
                @for (loc of filteredLocations(); track loc.id) {
                  <option [value]="loc.id">{{ loc.name }} — {{ loc.address }}</option>
                }
                @if (filteredLocations().length === 0 && selectedSport()) {
                  <option value="" disabled>No venues for {{ selectedSport() }} yet</option>
                }
              </select>
              <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
            @if (filteredLocations().length === 0 && selectedSport()) {
              <p class="text-xs text-on-surface-variant flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">info</span>
                No approved venues for {{ selectedSport() }} yet. Try a different sport or all locations.
              </p>
            }
            @if (submitted() && form.get('locationId')?.invalid) {
              <p class="text-xs text-error flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">error</span>
                Please select a location.
              </p>
            }
          </section>

          <!-- ── Description ── -->
          <section class="space-y-2">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
              Details <span class="font-normal normal-case text-outline">(optional)</span>
            </label>
            <textarea
              formControlName="description"
              placeholder="Mention skill level, equipment needed, or meeting point..."
              rows="3"
              class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                     focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all resize-none
                     placeholder:text-outline-variant"
            ></textarea>
          </section>

          <!-- Error banner -->
          @if (submitError()) {
            <div class="flex items-start gap-3 bg-error-container/20 border border-error-container/40 rounded-xl p-4">
              <span class="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">error</span>
              <p class="text-sm text-on-surface">{{ submitError() }}</p>
            </div>
          }

          <!-- Submit -->
          <button
            type="submit"
            [disabled]="loading()"
            class="w-full bg-primary text-on-primary font-bold py-5 rounded-full shadow-lg shadow-primary/20
                   active:scale-95 transition-all flex items-center justify-center gap-3
                   disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 uppercase tracking-widest text-sm"
          >
            @if (loading()) {
              <span class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              <span>Creating…</span>
            } @else {
              <span>Create Activity</span>
              <span class="material-symbols-outlined text-[20px]">add_circle</span>
            }
          </button>

        </form>
      </main>

      <app-bottom-nav />
    </div>
  `,
})
export class CreateActivityComponent {
  protected FEATURED = FEATURED;
  protected MORE = MORE;

  private activitiesService = inject(ActivitiesService);
  private locationsService  = inject(LocationsService);
  private router = inject(Router);
  private toast  = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  selectedSport  = signal('');
  isPublic       = signal(true);
  loading        = signal(false);
  submitError    = signal('');
  submitted      = signal(false);
  showMoreSports = signal(false);
  allLocations   = signal<Location[]>([]);

  readonly today = new Date().toISOString().split('T')[0];

  selectedSportMeta = computed(() =>
    ALL_SPORTS.find(s => s.label === this.selectedSport()) ?? null,
  );

  isFeatured = computed(() =>
    FEATURED.some(s => s.label === this.selectedSport()),
  );

  filteredLocations = computed(() => {
    const sport = this.selectedSport().toLowerCase();
    if (!sport) return this.allLocations();
    return this.allLocations().filter(l =>
      l.sports.toLowerCase().split(',').map(s => s.trim()).some(s => s.includes(sport)),
    );
  });

  form = new FormGroup({
    title:           new FormControl('', [Validators.required, Validators.minLength(3)]),
    date:            new FormControl('', Validators.required),
    time:            new FormControl('', Validators.required),
    maxParticipants: new FormControl(10, [Validators.required, Validators.min(2), Validators.max(100)]),
    locationId:      new FormControl<number | string>('', Validators.required),
    description:     new FormControl(''),
  });

  constructor() {
    this.locationsService.getAll(1, 200).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({ next: paged => this.allLocations.set(paged.items) });
  }

  selectSport(sport: string): void {
    this.selectedSport.set(sport);
    // Reset location if current selection is incompatible with new sport
    const currentId = this.form.get('locationId')?.value;
    if (currentId) {
      const loc = this.allLocations().find(l => String(l.id) === String(currentId));
      if (loc && !loc.sports.toLowerCase().includes(sport.toLowerCase())) {
        this.form.get('locationId')?.setValue('');
      }
    }
  }

  togglePrivacy(): void { this.isPublic.update(v => !v); }

  goBack(): void {
    if (window.history.length > 1) window.history.back();
    else this.router.navigate(['/home']);
  }

  submit(): void {
    this.submitted.set(true);
    if (!this.selectedSport()) return;
    if (this.form.invalid) return;

    this.loading.set(true);
    this.submitError.set('');
    const v = this.form.getRawValue();
    const dateTime = new Date(`${v.date}T${v.time}`);

    this.activitiesService.create({
      title:           v.title!,
      sport:           this.selectedSport(),
      dateTime,
      maxParticipants: v.maxParticipants!,
      type:            this.isPublic() ? ActivityType.Public : ActivityType.Private,
      locationId:      Number(v.locationId),
      description:     v.description || undefined,
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        const msg = err?.error?.message
          ?? (err.status === 401 ? 'You must be logged in to create an activity.'
            : err.status === 400 ? 'Invalid data. Check the form and try again.'
            : 'Failed to create activity. Please try again.');
        this.submitError.set(msg);
        this.loading.set(false);
        this.toast.error(msg, 'Could not create activity');
        return EMPTY;
      }),
    ).subscribe(a => {
      this.toast.success('Activity created!', v.title ?? undefined);
      this.router.navigate(['/activities', a.id]);
    });
  }
}
