import { Component, inject } from '@angular/core';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map, startWith } from 'rxjs';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav class="fixed bottom-0 left-0 w-full z-50 md:hidden flex justify-around items-end px-6 pb-6
                bg-surface-container-lowest/80 backdrop-blur-xl
                shadow-[0_-1px_0_0_rgba(0,0,0,0.05)] rounded-t-xl">
      @for (item of navItems; track item.path + item.icon) {
        <a [routerLink]="item.path"
           [class]="isActive(item.path) && item.matchPath
             ? 'flex flex-col items-center justify-center bg-primary text-on-primary rounded-full p-3 mb-2 -translate-y-2 transition-all duration-200'
             : 'flex flex-col items-center justify-center text-outline-variant p-2 hover:text-on-surface transition-colors'">
          <span
            class="material-symbols-outlined"
            [style.font-variation-settings]="isActive(item.path) && item.matchPath ? filledIcon : outlineIcon"
          >{{ item.icon }}</span>
          <span class="text-[10px] uppercase tracking-widest font-bold mt-0.5">{{ item.label }}</span>
        </a>
      }
    </nav>
  `,
})
export class BottomNavComponent {
  private router = inject(Router);

  filledIcon = "'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24";
  outlineIcon = "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24";

  private url = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
  );

  navItems = [
    { path: '/home', icon: 'home', label: 'Home', matchPath: true },
    { path: '/activities', icon: 'fitness_center', label: 'Activities', matchPath: true },
    { path: '/profile', icon: 'person', label: 'Profile', matchPath: true },
  ];

  isActive(path: string): boolean {
    return !!this.url()?.startsWith(path);
  }
}
