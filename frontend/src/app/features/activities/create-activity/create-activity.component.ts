import {
  Component, inject, signal, ChangeDetectionStrategy,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivitiesService } from '../../../core/services/activities.service';
import { LocationsService } from '../../../core/services/locations.service';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../../shared/components/desktop-header/desktop-header.component';
import { ActivityType } from '../../../core/models/activity.model';
import type { Location } from '../../../core/models/location.model';

const SPORTS = [
  { label: 'Tennis', color: '#CDDC39' },
  { label: 'Running', color: '#FF7043' },
  { label: 'Football', color: '#4CAF50' },
  { label: 'Padel', color: '#2196F3' },
  { label: 'Basketball', color: '#FF9800' },
  { label: 'Swimming', color: '#00BCD4' },
  { label: 'Cycling', color: '#E91E63' },
  { label: 'Yoga', color: '#9C27B0' },
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
      <header class="sticky top-0 z-40 bg-background md:hidden">
        <div class="flex justify-between items-center px-6 py-4">
          <h1 class="text-2xl font-black tracking-tighter text-on-surface">ActiveZone</h1>
          <button class="p-2 rounded-full hover:bg-surface-container-low transition-colors">
            <span class="material-symbols-outlined text-on-surface">notifications</span>
          </button>
        </div>
      </header>

      <main class="px-6 py-8 max-w-2xl mx-auto">
        <div class="mb-10">
          <span class="text-primary font-bold tracking-widest text-[10px] uppercase block mb-2">New Event</span>
          <h2 class="text-4xl font-black tracking-tighter text-on-surface leading-none">Create Activity</h2>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-12">

          <!-- Activity Title -->
          <section class="space-y-3">
            <label class="text-sm font-bold tracking-tight text-on-primary-fixed">Activity Title</label>
            <input
              type="text"
              formControlName="title"
              placeholder="e.g. Morning Padel Session"
              class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all placeholder:text-outline-variant"
            />
          </section>

          <!-- Sport selector -->
          <section class="space-y-4">
            <label class="text-sm font-bold tracking-tight text-on-primary-fixed">Select Sport</label>
            <div class="flex overflow-x-auto gap-3 -mx-6 px-6" style="scrollbar-width: none;">
              @for (sport of SPORTS; track sport.label) {
                <button
                  type="button"
                  (click)="selectSport(sport.label)"
                  [class]="selectedSport() === sport.label
                    ? 'flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full bg-primary text-on-primary shadow-lg scale-105 transition-all'
                    : 'flex-shrink-0 flex items-center gap-2 px-5 py-3 rounded-full bg-surface-container-lowest border border-outline-variant/10 shadow-sm hover:shadow-md transition-all'"
                >
                  <span class="w-2 h-2 rounded-full shrink-0" [style.background-color]="sport.color"></span>
                  <span class="text-sm font-medium">{{ sport.label }}</span>
                </button>
              }
            </div>
          </section>

          <!-- Date & Time -->
          <section class="grid grid-cols-2 gap-4">
            <div class="space-y-3">
              <label class="text-sm font-bold tracking-tight text-on-primary-fixed">Date</label>
              <input
                type="date"
                formControlName="date"
                class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all"
              />
            </div>
            <div class="space-y-3">
              <label class="text-sm font-bold tracking-tight text-on-primary-fixed">Time</label>
              <input
                type="time"
                formControlName="time"
                class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all"
              />
            </div>
          </section>

          <!-- Max players & Privacy toggle -->
          <section class="grid grid-cols-2 gap-4 items-end">
            <div class="space-y-3">
              <label class="text-sm font-bold tracking-tight text-on-primary-fixed">Max Players</label>
              <input
                type="number"
                formControlName="maxParticipants"
                placeholder="10"
                min="2"
                max="100"
                class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all"
              />
            </div>
            <div class="bg-surface-container-low rounded-xl p-4 flex items-center justify-between">
              <span class="text-[10px] uppercase font-bold tracking-widest"
                    [class]="isPublic() ? 'text-secondary' : 'text-outline'">
                {{ isPublic() ? 'Public' : 'Private' }}
              </span>
              <button
                type="button"
                (click)="togglePrivacy()"
                class="w-12 h-6 rounded-full relative transition-colors duration-200"
                [class]="isPublic() ? 'bg-secondary-fixed' : 'bg-surface-container-highest'"
              >
                <span
                  class="absolute top-1 w-4 h-4 bg-surface-container-lowest rounded-full shadow-sm transition-all duration-200"
                  [class]="isPublic() ? 'right-1' : 'left-1'"
                ></span>
              </button>
            </div>
          </section>

          <!-- Location picker -->
          <section class="space-y-3">
            <label class="text-sm font-bold tracking-tight text-on-primary-fixed">Location</label>
            <div class="relative">
              <select
                formControlName="locationId"
                class="w-full bg-surface-container-low border-none rounded-xl p-4 text-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all appearance-none"
              >
                <option value="">Select a venue…</option>
                @for (loc of locations(); track loc.id) {
                  <option [value]="loc.id">{{ loc.name }} — {{ loc.address }}</option>
                }
              </select>
              <span class="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none">expand_more</span>
            </div>
          </section>

          <!-- Description -->
          <section class="space-y-3">
            <label class="text-sm font-bold tracking-tight text-on-primary-fixed">Activity Details</label>
            <textarea
              formControlName="description"
              placeholder="Mention level, equipment needed, or meeting point details..."
              rows="4"
              class="w-full bg-surface-container-low border-none rounded-xl p-5 text-sm focus:bg-surface-container-lowest focus:outline-none focus:ring-0 transition-all resize-none placeholder:text-outline-variant"
            ></textarea>
          </section>

          <!-- Decorative quote block -->
          <div class="relative h-28 rounded-xl overflow-hidden shadow-lg rotate-1 bg-gradient-to-br from-primary to-primary-dim">
            <div class="absolute inset-0 flex items-end p-6">
              <p class="text-on-primary text-xs font-medium italic opacity-80">
                "The only bad workout is the one that didn't happen."
              </p>
            </div>
          </div>

          @if (error()) {
            <p class="text-error text-sm text-center">{{ error() }}</p>
          }

          <!-- Submit -->
          <div class="pt-2">
            <button
              type="submit"
              [disabled]="form.invalid || loading()"
              class="w-full bg-primary text-on-primary font-black py-6 rounded-full shadow-2xl shadow-primary/20
                     active:scale-95 transition-all flex items-center justify-center gap-3
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100 uppercase tracking-widest text-sm"
            >
              <span>{{ loading() ? 'Creating…' : 'Create Activity' }}</span>
              @if (!loading()) {
                <span class="material-symbols-outlined">add_circle</span>
              }
            </button>
          </div>
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

  selectedSport = signal('');
  isPublic = signal(true);
  loading = signal(false);
  error = signal('');
  locations = signal<Location[]>([]);

  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(3)]),
    date: new FormControl('', Validators.required),
    time: new FormControl('', Validators.required),
    maxParticipants: new FormControl(10, [Validators.required, Validators.min(2), Validators.max(100)]),
    locationId: new FormControl<number | null>(null, Validators.required),
    description: new FormControl(''),
  });

  constructor() {
    this.locationsService.getAll(1, 100).subscribe({
      next: paged => this.locations.set(paged.items),
    });
  }

  selectSport(sport: string): void {
    this.selectedSport.set(sport);
  }

  togglePrivacy(): void {
    this.isPublic.update(v => !v);
  }

  submit(): void {
    if (this.form.invalid || !this.selectedSport()) {
      if (!this.selectedSport()) this.error.set('Please select a sport.');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    const v = this.form.getRawValue();
    const dateTime = new Date(`${v.date}T${v.time}`);
    this.activitiesService.create({
      title: v.title!,
      sport: this.selectedSport(),
      dateTime,
      maxParticipants: v.maxParticipants!,
      type: this.isPublic() ? ActivityType.Public : ActivityType.Private,
      locationId: Number(v.locationId),
      description: v.description || undefined,
    }).subscribe({
      next: a => this.router.navigate(['/activities', a.id]),
      error: () => {
        this.error.set('Failed to create activity. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
