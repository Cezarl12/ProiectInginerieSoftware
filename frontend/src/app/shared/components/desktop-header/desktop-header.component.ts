import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-desktop-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="hidden md:flex items-center justify-between px-8 py-4
                   bg-surface-container-lowest shadow-ambient">
      <a routerLink="/home" class="text-headline-md text-on-surface font-bold">SportMap</a>
      <nav class="flex gap-6">
        <a routerLink="/home" class="text-on-surface-variant hover:text-on-surface transition-colors">Map</a>
        <a routerLink="/profile" class="text-on-surface-variant hover:text-on-surface transition-colors">Profile</a>
      </nav>
    </header>
  `,
  styleUrl: './desktop-header.component.scss',
})
export class DesktopHeaderComponent {}
