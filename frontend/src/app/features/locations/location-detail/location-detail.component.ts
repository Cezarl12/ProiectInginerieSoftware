import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../shared/components/error-state/error-state.component';
import { LocationsService } from '../../../core/services/locations.service';
import type { Location } from '../../../core/models/location.model';

@Component({
  selector: 'app-location-detail',
  standalone: true,
  imports: [LoadingSpinnerComponent, ErrorStateComponent],
  template: `
    <div class="min-h-screen bg-background">
      @if (loading()) {
        <app-loading-spinner />
      } @else if (error()) {
        <app-error-state [message]="error()!" />
      } @else if (location()) {
        <div class="p-6 flex flex-col gap-4">
          <h1 class="text-headline-lg text-on-surface">{{ location()!.name }}</h1>
          <p class="text-on-surface-variant">{{ location()!.address }}</p>
          <div class="flex gap-2 flex-wrap">
            @for (sport of sports(); track sport) {
              <span class="sport-chip">{{ sport }}</span>
            }
          </div>
          @if (location()!.details) {
            <p class="text-on-surface text-sm">{{ location()!.details }}</p>
          }
        </div>
      }
    </div>
  `,
  styleUrl: './location-detail.component.scss',
})
export class LocationDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private locationsService = inject(LocationsService);

  location = signal<Location | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  sports = signal<string[]>([]);

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.locationsService.getById(id).subscribe({
      next: loc => {
        this.location.set(loc);
        this.sports.set(loc.sports.split(',').map(s => s.trim()).filter(Boolean));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Location not found.');
        this.loading.set(false);
      },
    });
  }
}
