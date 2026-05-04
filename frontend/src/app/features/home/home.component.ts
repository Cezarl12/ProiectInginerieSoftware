import { Component } from '@angular/core';
import { BottomNavComponent } from '../../shared/components/bottom-nav/bottom-nav.component';
import { DesktopHeaderComponent } from '../../shared/components/desktop-header/desktop-header.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BottomNavComponent, DesktopHeaderComponent],
  template: `
    <div class="min-h-screen bg-background flex flex-col">
      <app-desktop-header />

      <main class="flex-1 pb-24">
        <div class="p-6">
          <h1 class="text-headline-lg text-on-surface mb-2">Nearby</h1>
          <p class="text-on-surface-variant text-sm">Discover sports venues and activities</p>
        </div>

        <!-- Map placeholder -->
        <div class="mx-6 rounded-xl overflow-hidden bg-surface-container-high"
             style="height: 60vh;">
          <div class="h-full flex items-center justify-center">
            <div class="flex flex-col items-center gap-3 text-on-surface-variant">
              <span class="material-symbols-outlined text-5xl">map</span>
              <p class="text-sm">Interactive map coming soon</p>
            </div>
          </div>
        </div>
      </main>

      <app-bottom-nav />
    </div>
  `,
  styleUrl: './home.component.scss',
})
export class HomeComponent {}
