import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UsersService } from '../../core/services/users.service';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';
import type { User } from '../../core/models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [BottomNavComponent, LoadingSpinnerComponent],
  template: `
    <div class="min-h-screen bg-background flex flex-col pb-24">
      @if (loading()) {
        <app-loading-spinner />
      } @else if (user()) {
        <div class="p-6 flex flex-col items-center gap-4">
          <div class="w-24 h-24 rounded-full bg-primary-container flex items-center justify-center">
            @if (user()!.profilePhotoUrl) {
              <img [src]="user()!.profilePhotoUrl!" alt="avatar"
                   class="w-full h-full rounded-full object-cover" />
            } @else {
              <span class="material-symbols-outlined text-5xl text-on-primary-fixed">person</span>
            }
          </div>
          <div class="text-center">
            <h1 class="text-headline-md text-on-surface">{{ user()!.username }}</h1>
            <p class="text-on-surface-variant text-sm">{{ user()!.email }}</p>
          </div>
          @if (user()!.favoriteSports) {
            <div class="flex flex-wrap gap-2 justify-center">
              @for (sport of sports(); track sport) {
                <span class="sport-chip">{{ sport }}</span>
              }
            </div>
          }
        </div>
      }

      <div class="px-6 mt-auto">
        <button class="btn-secondary w-full" (click)="logout()">Sign out</button>
      </div>
    </div>

    <app-bottom-nav />
  `,
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  private auth = inject(AuthService);
  private usersService = inject(UsersService);

  user = signal<User | null>(null);
  loading = signal(true);
  sports = signal<string[]>([]);

  ngOnInit(): void {
    this.usersService.getMe().subscribe({
      next: u => {
        this.user.set(u);
        this.sports.set(
          u.favoriteSports?.split(',').map(s => s.trim()).filter(Boolean) ?? [],
        );
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
