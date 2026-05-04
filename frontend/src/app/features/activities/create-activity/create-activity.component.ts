import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ActivityType } from '../../../core/models/activity.model';

@Component({
  selector: 'app-create-activity',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-background p-6">
      <h1 class="text-headline-lg text-on-surface mb-6">New Activity</h1>

      <form [formGroup]="form" (ngSubmit)="submit()" class="flex flex-col gap-4 max-w-md">
        <input class="input-field" type="text" placeholder="Title" formControlName="title" />
        <input class="input-field" type="text" placeholder="Sport (e.g. football)" formControlName="sport" />
        <input class="input-field" type="datetime-local" formControlName="dateTime" />
        <input class="input-field" type="number" placeholder="Max participants" formControlName="maxParticipants" />
        <input class="input-field" type="number" placeholder="Location ID" formControlName="locationId" />
        <textarea class="input-field rounded-2xl resize-none" rows="3"
                  placeholder="Description (optional)" formControlName="description"></textarea>

        @if (error) {
          <p class="text-error text-sm text-center">{{ error }}</p>
        }

        <button class="btn-primary" type="submit" [disabled]="form.invalid || loading">
          {{ loading ? 'Creating…' : 'Create activity' }}
        </button>
      </form>
    </div>
  `,
  styleUrl: './create-activity.component.scss',
})
export class CreateActivityComponent {
  private activitiesService = inject(ActivitiesService);
  private router = inject(Router);

  form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.minLength(1)]),
    sport: new FormControl('', Validators.required),
    dateTime: new FormControl('', Validators.required),
    maxParticipants: new FormControl(10, [Validators.required, Validators.min(1), Validators.max(100)]),
    locationId: new FormControl<number | null>(null, Validators.required),
    description: new FormControl(''),
  });

  loading = false;
  error = '';

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const v = this.form.getRawValue();
    this.activitiesService.create({
      title: v.title!,
      sport: v.sport!,
      dateTime: new Date(v.dateTime!),
      maxParticipants: v.maxParticipants!,
      type: ActivityType.Public,
      locationId: v.locationId!,
      description: v.description || undefined,
    }).subscribe({
      next: a => this.router.navigate(['/activities', a.id]),
      error: () => { this.error = 'Failed to create activity.'; this.loading = false; },
    });
  }
}
