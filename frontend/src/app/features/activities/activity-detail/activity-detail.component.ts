import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ParticipationsService } from '../../../core/services/participations.service';
import type { Activity } from '../../../core/models/activity.model';

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [LoadingSpinnerComponent, ErrorStateComponent, DatePipe],
  template: `
    <div class="min-h-screen bg-background">
      @if (loading()) {
        <app-loading-spinner />
      } @else if (error()) {
        <app-error-state [message]="error()!" />
      } @else if (activity()) {
        <div class="p-6 flex flex-col gap-4">
          <span class="sport-chip w-fit">{{ activity()!.sport }}</span>
          <h1 class="text-headline-lg text-on-surface">{{ activity()!.title }}</h1>
          <p class="text-on-surface-variant">
            {{ activity()!.dateTime | date:'medium' }}
          </p>
          <p class="text-on-surface-variant text-sm">
            {{ activity()!.participantCount }} / {{ activity()!.maxParticipants }} participants
          </p>
          @if (activity()!.description) {
            <p class="text-on-surface text-sm">{{ activity()!.description }}</p>
          }
          <button class="btn-primary mt-4" (click)="join()">Join activity</button>
        </div>
      }
    </div>
  `,
  styleUrl: './activity-detail.component.scss',
})
export class ActivityDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private activitiesService = inject(ActivitiesService);
  private participationsService = inject(ParticipationsService);

  activity = signal<Activity | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.activitiesService.getById(id).subscribe({
      next: a => { this.activity.set(a); this.loading.set(false); },
      error: () => { this.error.set('Activity not found.'); this.loading.set(false); },
    });
  }

  join(): void {
    const id = this.activity()?.id;
    if (!id) return;
    this.participationsService.join(id).subscribe();
  }
}
