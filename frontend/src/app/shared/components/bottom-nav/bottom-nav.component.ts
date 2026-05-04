import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="bottom-nav">
      <a routerLink="/home" routerLinkActive="text-primary"
         class="flex flex-col items-center gap-1 text-on-surface-variant">
        <span class="material-symbols-outlined">map</span>
      </a>
      <a routerLink="/activities/create" routerLinkActive="text-primary"
         class="flex flex-col items-center gap-1 text-on-surface-variant">
        <span class="material-symbols-outlined">add_circle</span>
      </a>
      <a routerLink="/profile" routerLinkActive="text-primary"
         class="flex flex-col items-center gap-1 text-on-surface-variant">
        <span class="material-symbols-outlined">person</span>
      </a>
    </nav>
  `,
  styleUrl: './bottom-nav.component.scss',
})
export class BottomNavComponent {}
