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
import { SPORTS } from '../../../core/utils/sport-utils';
import type { Location } from '../../../core/models/location.model';

@Component({
  selector: 'app-create-activity',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, BottomNavComponent, DesktopHeaderComponent],
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
            <p class="text-[10px] uppercase font-bold tracking-widest text-primary leading-none">New Event</p>
            <h1 class="text-lg font-black tracking-tight text-on-surface leading-tight">Create Activity</h1>
          </div>
        </div>
      </header>

      <!-- Single form wraps all layouts -->
      <form [formGroup]="form" (ngSubmit)="submit()">

        <!-- ═══════════════ MOBILE LAYOUT ═══════════════ -->
        <div class="md:hidden px-5 py-6 max-w-2xl mx-auto space-y-8">

          <!-- Title -->
          <section class="space-y-2">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Activity Title</label>
            <input type="text" formControlName="title"
                   placeholder="e.g. Morning Padel Session"
                   class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                          focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all
                          placeholder:text-outline-variant shadow-inner" />
            @if (submitted() && form.get('title')?.invalid) {
              <p class="text-xs text-error flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">error</span>
                Title must be at least 3 characters.
              </p>
            }
          </section>

          <!-- Sport chips (horizontal scroll) -->
          <section class="space-y-3">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Select Sport</label>
            <div class="flex overflow-x-auto gap-3 -mx-5 px-5 pb-1" style="scrollbar-width:none;">
              @for (sport of ALL_SPORTS; track sport.label) {
                <button type="button" (click)="selectSport(sport.label)"
                        class="flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full transition-all active:scale-95"
                        [class]="selectedSport() === sport.label
                          ? 'bg-primary text-on-primary shadow-lg scale-105'
                          : 'bg-surface-container-lowest border border-outline-variant/10 shadow-sm text-on-surface'">
                  <span class="w-2 h-2 rounded-full flex-shrink-0"
                        [style.background-color]="sport.color"></span>
                  <span class="text-sm font-medium whitespace-nowrap">{{ sport.label }}</span>
                </button>
              }
            </div>
            @if (submitted() && !selectedSport()) {
              <p class="text-xs text-error flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">error</span>
                Please select a sport.
              </p>
            }
          </section>

          <!-- Date & Time -->
          <section class="grid grid-cols-2 gap-4">
            <div class="space-y-2">
              <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Date</label>
              <input type="date" formControlName="date" [min]="today"
                     class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                            focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all shadow-inner" />
              @if (submitted() && form.get('date')?.invalid) {
                <p class="text-xs text-error flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">error</span> Required.
                </p>
              }
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Time</label>
              <input type="time" formControlName="time"
                     class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                            focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all shadow-inner" />
              @if (submitted() && form.get('time')?.invalid) {
                <p class="text-xs text-error flex items-center gap-1">
                  <span class="material-symbols-outlined text-[14px]">error</span> Required.
                </p>
              }
            </div>
          </section>

          <!-- Max players & Privacy -->
          <section class="grid grid-cols-2 gap-4 items-end">
            <div class="space-y-2">
              <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">Max Players</label>
              <input type="number" formControlName="maxParticipants" placeholder="8" min="2" max="100"
                     class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                            focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all shadow-inner" />
            </div>
            <div class="bg-surface-container-low rounded-xl p-4 flex items-center justify-between h-[58px]">
              <span class="text-[10px] uppercase font-bold tracking-widest ml-1"
                    [class]="isPublic() ? 'text-primary' : 'text-outline'">
                {{ isPublic() ? 'Public' : 'Private' }}
              </span>
              <button type="button" (click)="togglePrivacy()"
                      class="w-12 h-6 rounded-full relative transition-colors duration-200 shrink-0"
                      [class]="isPublic() ? 'bg-primary' : 'bg-surface-container-highest'">
                <span class="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
                      [class]="isPublic() ? 'right-1' : 'left-1'"></span>
              </button>
            </div>
          </section>

          <!-- Location -->
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
              <select formControlName="locationId"
                      class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm
                             focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all appearance-none shadow-inner">
                <option value="">Select a venue…</option>
                @for (loc of filteredLocations(); track loc.id) {
                  <option [value]="loc.id">{{ loc.name }} — {{ loc.address }}</option>
                }
              </select>
              <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
            @if (submitted() && form.get('locationId')?.invalid) {
              <p class="text-xs text-error flex items-center gap-1">
                <span class="material-symbols-outlined text-[14px]">error</span>
                Please select a location.
              </p>
            }
          </section>

          <!-- Description -->
          <section class="space-y-2">
            <label class="text-xs font-bold tracking-widest text-on-surface-variant uppercase">
              Activity Details <span class="font-normal normal-case text-outline">(optional)</span>
            </label>
            <textarea formControlName="description"
                      placeholder="Mention level, equipment needed, or meeting point details..."
                      rows="4"
                      class="w-full bg-surface-container-low border-none rounded-xl p-5 text-sm
                             focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all resize-none shadow-inner
                             placeholder:text-outline-variant"></textarea>
          </section>

          <!-- Motivational image -->
          <div class="relative h-32 rounded-xl overflow-hidden shadow-2xl rotate-1">
            <img src="https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=300&fit=crop&q=80"
                 alt="Athletic motivation" class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-on-surface/80 to-transparent flex items-end p-6">
              <p class="text-white text-xs font-medium italic">"The only bad workout is the one that didn't happen."</p>
            </div>
          </div>

          @if (submitError()) {
            <div class="flex items-start gap-3 bg-error-container/20 border border-error-container/40 rounded-xl p-4">
              <span class="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">error</span>
              <p class="text-sm text-on-surface">{{ submitError() }}</p>
            </div>
          }

          <button type="submit" [disabled]="loading()"
                  class="w-full bg-primary text-on-primary font-black py-6 rounded-full shadow-2xl shadow-primary/20
                         active:scale-95 transition-all flex items-center justify-center gap-3
                         disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 uppercase tracking-widest">
            @if (loading()) {
              <span class="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
              <span>Creating…</span>
            } @else {
              <span>Create Activity</span>
              <span class="material-symbols-outlined text-[20px]">add_circle</span>
            }
          </button>

        </div><!-- /mobile -->

        <!-- ═══════════════ DESKTOP LAYOUT ═══════════════ -->
        <div class="hidden md:grid grid-cols-12 gap-12 max-w-7xl mx-auto px-6 py-12 pb-32">

          <!-- Left: Editorial -->
          <div class="col-span-5 flex flex-col justify-start">
            <h1 class="text-6xl lg:text-7xl font-black text-on-surface tracking-tighter leading-none mb-8">
              Host your <br /><span class="text-tertiary">Momentum.</span>
            </h1>
            <p class="text-xl text-on-surface-variant leading-relaxed max-w-md mb-12">
              Create a new activity and invite the community. Whether it's a casual match or intense training, set the stage here.
            </p>
            <div class="relative rounded-xl overflow-hidden flex-1 min-h-[400px] bg-surface-container shadow-2xl">
              <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1000&fit=crop&q=80"
                   alt="Athletic training"
                   class="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-700" />
              <div class="absolute bottom-0 left-0 p-8 bg-gradient-to-t from-black/60 to-transparent w-full">
                <span class="text-white/70 text-sm font-bold tracking-widest uppercase mb-2 block">SportMap</span>
                <h2 class="text-white text-2xl font-black">Elevate the Game.</h2>
              </div>
            </div>
          </div>

          <!-- Right: Form card -->
          <div class="col-span-7">
            <div class="bg-surface-container-lowest rounded-xl p-8 lg:p-12 shadow-sm border border-outline-variant/10 space-y-10">

              <!-- Title -->
              <div class="space-y-3">
                <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant">Activity Title</label>
                <input type="text" formControlName="title"
                       placeholder="e.g. Morning Padel Session"
                       class="w-full bg-surface-container-low border-none rounded-xl py-4 px-6 text-sm
                              focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all
                              placeholder:text-outline-variant" />
                @if (submitted() && form.get('title')?.invalid) {
                  <p class="text-xs text-error flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">error</span>
                    Title must be at least 3 characters.
                  </p>
                }
              </div>

              <!-- Sport chips (flex-wrap) -->
              <div class="space-y-4">
                <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant">Select Discipline</label>
                <div class="flex flex-wrap gap-3">
                  @for (sport of ALL_SPORTS; track sport.label) {
                    <button type="button" (click)="selectSport(sport.label)"
                            class="flex items-center gap-2 px-6 py-3 rounded-full transition-all active:scale-95"
                            [class]="selectedSport() === sport.label
                              ? 'bg-tertiary text-white shadow-lg'
                              : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high'">
                      <span class="w-2 h-2 rounded-full flex-shrink-0"
                            [class]="selectedSport() === sport.label ? 'bg-white animate-pulse' : ''"
                            [style.background-color]="selectedSport() !== sport.label ? sport.color : undefined"></span>
                      <span class="font-bold text-sm">{{ sport.label }}</span>
                    </button>
                  }
                </div>
                @if (submitted() && !selectedSport()) {
                  <p class="text-xs text-error flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">error</span>
                    Please select a sport.
                  </p>
                }
              </div>

              <!-- Date & Time -->
              <div class="grid grid-cols-2 gap-6">
                <div class="space-y-3">
                  <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant">Event Date</label>
                  <div class="relative">
                    <input type="date" formControlName="date" [min]="today"
                           class="w-full bg-surface-container-low border-none rounded-xl py-4 px-6 text-sm
                                  focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all appearance-none" />
                    <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">calendar_today</span>
                  </div>
                  @if (submitted() && form.get('date')?.invalid) {
                    <p class="text-xs text-error flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">error</span> Required.
                    </p>
                  }
                </div>
                <div class="space-y-3">
                  <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant">Start Time</label>
                  <div class="relative">
                    <input type="time" formControlName="time"
                           class="w-full bg-surface-container-low border-none rounded-xl py-4 px-6 text-sm
                                  focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all appearance-none" />
                    <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">schedule</span>
                  </div>
                  @if (submitted() && form.get('time')?.invalid) {
                    <p class="text-xs text-error flex items-center gap-1">
                      <span class="material-symbols-outlined text-[14px]">error</span> Required.
                    </p>
                  }
                </div>
              </div>

              <!-- Max participants (stepper) + Privacy -->
              <div class="grid grid-cols-2 gap-10 items-end">
                <div class="space-y-3">
                  <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant">Max Participants</label>
                  <div class="flex items-center gap-4 bg-surface-container-low rounded-xl p-2">
                    <button type="button" (click)="decrement()"
                            class="w-12 h-12 flex items-center justify-center bg-surface-container-highest rounded-lg text-on-surface hover:bg-surface-variant transition-colors">
                      <span class="material-symbols-outlined">remove</span>
                    </button>
                    <input type="number" formControlName="maxParticipants" min="2" max="100"
                           class="bg-transparent border-none text-center font-bold text-xl w-full focus:ring-0 focus:outline-none" />
                    <button type="button" (click)="increment()"
                            class="w-12 h-12 flex items-center justify-center bg-surface-container-highest rounded-lg text-on-surface hover:bg-surface-variant transition-colors">
                      <span class="material-symbols-outlined">add</span>
                    </button>
                  </div>
                </div>
                <div class="flex items-center justify-between bg-surface-container-low rounded-xl p-4 h-[64px]">
                  <span class="text-sm font-bold px-2"
                        [class]="isPublic() ? 'text-primary' : 'text-on-surface-variant'">
                    {{ isPublic() ? 'Public Activity' : 'Private Activity' }}
                  </span>
                  <button type="button" (click)="togglePrivacy()"
                          class="w-14 h-7 rounded-full relative transition-colors duration-200 shrink-0"
                          [class]="isPublic() ? 'bg-tertiary' : 'bg-outline-variant/30'">
                    <span class="absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-sm transition-all duration-200"
                          [class]="isPublic() ? 'right-0.5' : 'left-1'"></span>
                  </button>
                </div>
              </div>

              <!-- Location -->
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant">Venue</label>
                  @if (selectedSport()) {
                    <span class="text-[10px] text-tertiary font-semibold flex items-center gap-1">
                      <span class="material-symbols-outlined text-[12px]">filter_alt</span>
                      Filtered for {{ selectedSport() }}
                    </span>
                  }
                </div>
                <div class="relative">
                  <select formControlName="locationId"
                          class="w-full bg-surface-container-low border-none rounded-xl py-4 px-6 text-sm
                                 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all appearance-none">
                    <option value="">Select a venue…</option>
                    @for (loc of filteredLocations(); track loc.id) {
                      <option [value]="loc.id">{{ loc.name }} — {{ loc.address }}</option>
                    }
                  </select>
                  <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
                </div>
                @if (submitted() && form.get('locationId')?.invalid) {
                  <p class="text-xs text-error flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">error</span>
                    Please select a location.
                  </p>
                }
              </div>

              <!-- Description -->
              <div class="space-y-3">
                <label class="block text-sm font-bold uppercase tracking-widest text-on-surface-variant">
                  Description &amp; Rules
                </label>
                <textarea formControlName="description"
                          placeholder="Mention specific court numbers, equipment needs, or skill level expectations..."
                          rows="4"
                          class="w-full bg-surface-container-low border-none rounded-xl py-4 px-6 text-sm
                                 focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all resize-none
                                 placeholder:text-outline-variant"></textarea>
              </div>

              @if (submitError()) {
                <div class="flex items-start gap-3 bg-error-container/20 border border-error-container/40 rounded-xl p-4">
                  <span class="material-symbols-outlined text-error text-[20px] shrink-0 mt-0.5">error</span>
                  <p class="text-sm text-on-surface">{{ submitError() }}</p>
                </div>
              }

              <div class="pt-4">
                <button type="submit" [disabled]="loading()"
                        class="w-full bg-primary text-on-primary font-black text-lg py-6 rounded-full shadow-xl
                               hover:scale-[1.02] active:scale-95 transition-all duration-200 uppercase tracking-widest
                               flex items-center justify-center gap-3
                               disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100">
                  @if (loading()) {
                    <span class="material-symbols-outlined animate-spin text-[22px]">progress_activity</span>
                    <span>Creating…</span>
                  } @else {
                    <span>Create Activity</span>
                  }
                </button>
              </div>

            </div>
          </div>
        </div><!-- /desktop -->

      </form>

      <app-bottom-nav />
    </div>
  `,
})
export class CreateActivityComponent {
  protected readonly ALL_SPORTS = SPORTS;

  private activitiesService = inject(ActivitiesService);
  private locationsService  = inject(LocationsService);
  private router = inject(Router);
  private toast  = inject(ToastService);
  private destroyRef = inject(DestroyRef);

  selectedSport = signal('');
  isPublic      = signal(true);
  loading       = signal(false);
  submitError   = signal('');
  submitted     = signal(false);
  allLocations  = signal<Location[]>([]);

  readonly today = new Date().toISOString().split('T')[0];

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
    const currentId = this.form.get('locationId')?.value;
    if (currentId) {
      const loc = this.allLocations().find(l => String(l.id) === String(currentId));
      if (loc && !loc.sports.toLowerCase().includes(sport.toLowerCase())) {
        this.form.get('locationId')?.setValue('');
      }
    }
  }

  increment(): void {
    const ctrl = this.form.get('maxParticipants');
    const v = (ctrl?.value ?? 10) as number;
    if (v < 100) ctrl?.setValue(v + 1);
  }

  decrement(): void {
    const ctrl = this.form.get('maxParticipants');
    const v = (ctrl?.value ?? 10) as number;
    if (v > 2) ctrl?.setValue(v - 1);
  }

  togglePrivacy(): void { this.isPublic.update(v => !v); }

  goBack(): void {
    if (window.history.length > 1) window.history.back();
    else this.router.navigate(['/activities']);
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
