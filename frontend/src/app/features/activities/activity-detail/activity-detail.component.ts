import {
  Component, inject, OnInit, signal, ChangeDetectionStrategy, ChangeDetectorRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ActivitiesService } from '../../../core/services/activities.service';
import { ParticipationsService } from '../../../core/services/participations.service';
import { BottomNavComponent } from '../../../shared/components/bottom-nav/bottom-nav.component';
import type { Activity } from '../../../core/models/activity.model';

const SPORT_COLORS: Record<string, string> = {
  Tennis: '#CDDC39', Football: '#4CAF50', Basketball: '#FF9800',
  Padel: '#2196F3', Running: '#FF7043', Swimming: '#00BCD4', default: '#5d5e61',
};

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BottomNavComponent, DatePipe],
  template: `
    <div class="h-screen bg-background flex flex-col overflow-hidden">

      <!-- Header -->
      <header class="bg-background z-50 shrink-0">
        <div class="flex justify-between items-center w-full px-6 py-4">
          <div class="flex items-center gap-4">
            <button (click)="goBack()"
                    class="w-10 h-10 flex items-center justify-center bg-surface-container rounded-full active:scale-95 transition-transform">
              <span class="material-symbols-outlined">arrow_back</span>
            </button>
            @if (activity()) {
              <div class="flex flex-col">
                <span class="text-xs font-bold uppercase tracking-widest text-outline">Active Event</span>
                <h1 class="text-lg font-black tracking-tighter text-on-surface">{{ activity()!.title }}</h1>
              </div>
            }
          </div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">notifications</span>
          </div>
        </div>
      </header>

      @if (loading()) {
        <div class="flex-1 flex items-center justify-center text-on-surface-variant">
          <span class="material-symbols-outlined text-5xl animate-pulse">fitness_center</span>
        </div>
      } @else if (error()) {
        <div class="flex-1 flex flex-col items-center justify-center gap-3 text-on-surface-variant px-6">
          <span class="material-symbols-outlined text-5xl text-error">error</span>
          <p>{{ error() }}</p>
          <button (click)="goBack()" class="btn-primary">Go back</button>
        </div>
      } @else if (activity()) {
        <main class="flex-1 overflow-y-auto pb-40" style="scrollbar-width: none;">

          <!-- Hero card -->
          <section class="px-6 pt-2">
            <div class="relative w-full h-48 rounded-xl overflow-hidden shadow-sm">
              <div class="w-full h-full bg-gradient-to-br from-surface-container-high to-surface-container-highest flex items-center justify-center">
                <span class="material-symbols-outlined text-8xl text-on-surface-variant/20">sports</span>
              </div>
              <div class="absolute inset-0 bg-gradient-to-t from-on-surface/60 to-transparent"></div>
              <div class="absolute bottom-4 left-4">
                <span class="px-3 py-1 bg-tertiary-container text-on-tertiary-container rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">
                  {{ activity()!.sport }}
                </span>
                <div class="flex items-center gap-4 text-surface-container-lowest">
                  <div class="flex items-center gap-1">
                    <span class="material-symbols-outlined text-sm">schedule</span>
                    <span class="text-sm font-medium">{{ activity()!.dateTime | date:'HH:mm' }}</span>
                  </div>
                  @if (activity()!.location) {
                    <div class="flex items-center gap-1">
                      <span class="material-symbols-outlined text-sm">location_on</span>
                      <span class="text-sm font-medium">{{ activity()!.location!.name }}</span>
                    </div>
                  }
                </div>
              </div>
            </div>
          </section>

          <!-- Participants -->
          <section class="mt-8 px-6">
            <div class="flex justify-between items-end mb-4">
              <h2 class="text-2xl font-black tracking-tight text-on-surface">
                Athletes
                <span class="text-outline text-lg font-normal tracking-normal ml-1">
                  ({{ activity()!.participantCount }}/{{ activity()!.maxParticipants }})
                </span>
              </h2>
              <span class="text-sm font-bold text-tertiary-fixed underline decoration-2 underline-offset-4 cursor-pointer">Manage</span>
            </div>
            <div class="flex gap-4 overflow-x-auto pb-4" style="scrollbar-width: none;">
              @for (n of participantSlots(); track n) {
                <div class="flex-shrink-0 flex flex-col items-center gap-2">
                  <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center border-2 border-surface">
                    <span class="material-symbols-outlined text-on-surface-variant text-2xl">person</span>
                  </div>
                  <span class="text-[10px] font-bold text-on-surface uppercase tracking-tighter">Athlete {{ n }}</span>
                </div>
              }
              @if (activity()!.participantCount === 0) {
                <p class="text-sm text-on-surface-variant py-4">No athletes yet — be the first to join!</p>
              }
            </div>
          </section>

          <!-- Info divider -->
          <div class="mx-6 mt-4 h-px bg-surface-container-high/50"></div>

          <!-- Activity info -->
          <section class="px-6 mt-6 space-y-4">
            <div class="grid grid-cols-2 gap-4">
              <div class="bg-surface-container-low p-4 rounded-xl">
                <p class="text-[10px] font-bold uppercase tracking-widest text-outline">Date & Time</p>
                <p class="text-sm font-semibold text-on-surface mt-1">{{ activity()!.dateTime | date:'EEE, MMM d • HH:mm' }}</p>
              </div>
              <div class="bg-surface-container-low p-4 rounded-xl">
                <p class="text-[10px] font-bold uppercase tracking-widest text-outline">Spots</p>
                <p class="text-sm font-semibold text-on-surface mt-1">
                  {{ activity()!.maxParticipants - activity()!.participantCount }} remaining
                </p>
              </div>
            </div>
            @if (activity()!.description) {
              <div class="bg-surface-container-low p-4 rounded-xl">
                <p class="text-[10px] font-bold uppercase tracking-widest text-outline mb-2">Description</p>
                <p class="text-sm text-on-surface leading-relaxed">{{ activity()!.description }}</p>
              </div>
            }
          </section>

          <!-- Placeholder chat indicator -->
          <section class="px-6 mt-8">
            <div class="flex justify-center">
              <span class="bg-surface-container text-outline text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                Group chat — coming soon
              </span>
            </div>
          </section>

        </main>

        <!-- Join / Leave action bar (above bottom nav) -->
        <div class="fixed bottom-20 left-0 w-full px-6 z-50">
          <div class="bg-surface-container-lowest/90 backdrop-blur-xl rounded-full p-2 flex items-center gap-3 shadow-xl border border-outline-variant/10">
            <div class="flex-1 px-4">
              @if (joined()) {
                <p class="text-sm font-semibold text-secondary">You've joined this activity!</p>
              } @else {
                <p class="text-sm text-on-surface-variant">{{ activity()!.maxParticipants - activity()!.participantCount }} spots left</p>
              }
            </div>
            @if (joined()) {
              <button (click)="leave()"
                      class="px-6 py-3 bg-error text-on-error rounded-full font-bold text-sm active:scale-95 transition-all">
                Leave
              </button>
            } @else {
              <button (click)="join()"
                      [disabled]="joining()"
                      class="px-6 py-3 bg-primary text-on-primary rounded-full font-bold text-sm active:scale-95 transition-all disabled:opacity-60">
                {{ joining() ? 'Joining…' : 'Join Activity' }}
              </button>
            }
          </div>
        </div>
      }

      <app-bottom-nav />
    </div>
  `,
})
export class ActivityDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private activitiesService = inject(ActivitiesService);
  private participationsService = inject(ParticipationsService);
  private cdr = inject(ChangeDetectorRef);

  activity = signal<Activity | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  joined = signal(false);
  joining = signal(false);

  participantSlots = () => {
    const count = this.activity()?.participantCount ?? 0;
    return Array.from({ length: count }, (_, i) => i + 1);
  };

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.activitiesService.getById(id).subscribe({
      next: a => {
        this.activity.set(a);
        this.loading.set(false);
        this.cdr.markForCheck();
      },
      error: () => {
        this.error.set('Activity not found.');
        this.loading.set(false);
        this.cdr.markForCheck();
      },
    });
  }

  join(): void {
    const id = this.activity()?.id;
    if (!id) return;
    this.joining.set(true);
    this.participationsService.join(id).subscribe({
      next: () => { this.joined.set(true); this.joining.set(false); this.cdr.markForCheck(); },
      error: () => { this.joining.set(false); this.cdr.markForCheck(); },
    });
  }

  leave(): void {
    const id = this.activity()?.id;
    if (!id) return;
    this.participationsService.leave(id).subscribe({
      next: () => { this.joined.set(false); this.cdr.markForCheck(); },
    });
  }

  goBack(): void { this.router.navigate(['/home']); }

  sportColor(sport: string): string {
    return SPORT_COLORS[sport] ?? SPORT_COLORS['default'];
  }
}
