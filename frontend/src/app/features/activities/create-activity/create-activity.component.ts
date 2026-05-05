import {
  Component, inject, signal, ChangeDetectionStrategy, DestroyRef,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY } from 'rxjs';
import { ActivitiesService } from '../../../core/services/activities.service';
import { LocationsService } from '../../../core/services/locations.service';
import { ToastService } from '../../../core/services/toast.service';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../../shared/components/desktop-header/desktop-header.component';
import { ActivityType } from '../../../core/models/activity.model';
import type { Location } from '../../../core/models/location.model';

const SPORTS = [
  { label: 'Tennis',     color: '#FFEB3B', icon: 'sports_tennis'      },
  { label: 'Running',    color: '#FF7043', icon: 'directions_run'      },
  { label: 'Football',   color: '#43A047', icon: 'sports_soccer'       },
  { label: 'Padel',      color: '#00897B', icon: 'sports_tennis'       },
  { label: 'Basketball', color: '#FF9800', icon: 'sports_basketball'    },
  { label: 'Swimming',   color: '#00BCD4', icon: 'pool'                },
  { label: 'Cycling',    color: '#E91E63', icon: 'directions_bike'     },
  { label: 'Yoga',       color: '#9C27B0', icon: 'self_improvement'    },
];

@Component({
  selector: 'app-create-activity',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, BottomNavComponent, DesktopHeaderComponent],
  template: `
    <div class="min-h-screen bg-background pb-32">
      <app-desktop-header />

      <!-- Mobile sticky header -->
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

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-10">

          <!-- Activity Title -->
          <section class="space-y-3">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Activity Title</label>
            <input
              type="text"
              formControlName="title"
              placeholder="e.g. Morning Padel Session"
              class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                     focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all
                     placeholder:text-outline-variant"
            />
            @if (form.get('title')?.invalid && form.get('title')?.touched) {
              <p class="text-xs text-error px-1">Title must be at least 3 characters.</p>
            }
          </section>

          <!-- Sport selector -->
          <section class="space-y-4">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Select Sport</label>
            <div class="flex overflow-x-auto gap-3 -mx-6 px-6 pb-1" style="scrollbar-width: none;">
              @for (sport of SPORTS; track sport.label) {
                <button
                  type="button"
                  (click)="selectSport(sport.label)"
                  class="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all active:scale-95"
                  [class]="selectedSport() === sport.label
                    ? 'text-white shadow-md scale-105 border-transparent'
                    : 'bg-surface-container-lowest border-outline-variant/20 shadow-sm hover:shadow-md'"
                  [style.background-color]="selectedSport() === sport.label ? sport.color : ''"
                >
                  <span class="material-symbols-outlined text-[16px]"
                        [style.color]="selectedSport() === sport.label ? 'white' : sport.color">{{ sport.icon }}</span>
                  <span class="text-sm font-semibold"
                        [class]="selectedSport() === sport.label ? 'text-white' : 'text-on-surface'">{{ sport.label }}</span>
                </button>
              }
            </div>
            @if (sportError()) {
              <p class="text-xs text-error px-1">Please select a sport.</p>
            }
          </section>

          <!-- Date & Time -->
          <section class="grid grid-cols-2 gap-4">
            <div class="space-y-3">
              <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Date</label>
              <input
                type="date"
                formControlName="date"
                class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                       focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all"
              />
            </div>
            <div class="space-y-3">
              <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Time</label>
              <input
                type="time"
                formControlName="time"
                class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                       focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all"
              />
            </div>
          </section>

          <!-- Max players & Privacy toggle -->
          <section class="grid grid-cols-2 gap-4 items-end">
            <div class="space-y-3">
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
            <div class="bg-surface-container-low rounded-xl p-4 flex items-center justify-between gap-3">
              <div>
                <p class="text-[10px] uppercase font-bold tracking-widest text-outline">Visibility</p>
                <p class="text-sm font-semibold mt-0.5" [class]="isPublic() ? 'text-secondary' : 'text-on-surface-variant'">
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

          <!-- Location picker -->
          <section class="space-y-3">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Location</label>
            <div class="relative">
              <select
                formControlName="locationId"
                class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                       focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all appearance-none"
              >
                <option value="">Select a venue…</option>
                @for (loc of locations(); track loc.id) {
                  <option [value]="loc.id">{{ loc.name }} — {{ loc.address }}</option>
                }
              </select>
              <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
            @if (form.get('locationId')?.invalid && form.get('locationId')?.touched) {
              <p class="text-xs text-error px-1">Please select a location.</p>
            }
          </section>

          <!-- Description -->
          <section class="space-y-3">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Details <span class="text-outline font-normal normal-case">(optional)</span></label>
            <textarea
              formControlName="description"
              placeholder="Mention skill level, equipment needed, or meeting point..."
              rows="4"
              class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                     focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all resize-none
                     placeholder:text-outline-variant"
            ></textarea>
          </section>

          <!-- Motivational block -->
          <div class="relative rounded-2xl overflow-hidden h-24 bg-gradient-to-br from-primary to-primary-dim flex items-end p-5 shadow-lg">
            <p class="text-on-primary text-xs font-medium italic opacity-80">
              "The only bad workout is the one that didn't happen."
            </p>
          </div>

          @if (submitError()) {
            <p class="text-error text-sm text-center py-2">{{ submitError() }}</p>
          }

          <!-- Submit -->
          <button
            type="submit"
            [disabled]="loading()"
            class="w-full bg-primary text-on-primary font-black py-5 rounded-full shadow-xl shadow-primary/20
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
  protected SPORTS = SPORTS;

  private activitiesService = inject(ActivitiesService);
  private locationsService = inject(LocationsService);
  private router = inject(Router);
  private toast = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  selectedSport = signal('');
  isPublic = signal(true);
  loading = signal(false);
  submitError = signal('');
  sportError = signal(false);
  locations = signal<Location[]>([]);

  form = new FormGroup({
    title:           new FormControl('', [Validators.required, Validators.minLength(3)]),
    date:            new FormControl('', Validators.required),
    time:            new FormControl('', Validators.required),
    maxParticipants: new FormControl(10, [Validators.required, Validators.min(2), Validators.max(100)]),
    locationId:      new FormControl<number | string>('', Validators.required),
    description:     new FormControl(''),
  });

  constructor() {
    this.locationsService.getAll(1, 100).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({ next: paged => this.locations.set(paged.items) });
  }

  selectSport(sport: string): void {
    this.selectedSport.set(sport);
    this.sportError.set(false);
  }

  togglePrivacy(): void { this.isPublic.update(v => !v); }

  goBack(): void {
    if (window.history.length > 1) window.history.back();
    else this.router.navigate(['/home']);
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (!this.selectedSport()) { this.sportError.set(true); return; }
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
      catchError(() => {
        this.submitError.set('Failed to create activity. Please try again.');
        this.loading.set(false);
        return EMPTY;
      }),
    ).subscribe(a => {
      this.toast.success('Activity created!', v.title ?? undefined);
      this.router.navigate(['/activities', a.id]);
    });
  }
}
