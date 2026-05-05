import { Component, inject } from '@angular/core';
import { ToastService, Toast, ToastType } from '../../../core/services/toast.service';

const ICON: Record<ToastType, string> = {
  success: 'check_circle',
  error:   'error',
  info:    'info',
  warning: 'warning',
};

const STRIP: Record<ToastType, string> = {
  success: 'bg-secondary',
  error:   'bg-error',
  info:    'bg-tertiary',
  warning: 'bg-outline',
};

const ICON_COLOR: Record<ToastType, string> = {
  success: 'text-secondary',
  error:   'text-error',
  info:    'text-tertiary',
  warning: 'text-outline',
};

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div
      class="fixed top-0 left-0 right-0 z-[9999] flex flex-col items-stretch gap-3 p-4
             md:top-4 md:right-6 md:left-auto md:items-end md:w-[380px]"
      aria-live="polite"
      aria-atomic="false"
    >
      @for (t of svc.toasts(); track t.id) {
        <article
          class="toast-slide-in bg-surface-container-lowest rounded-2xl overflow-hidden
                 border border-outline-variant/10
                 shadow-[0_8px_32px_-4px_rgba(43,52,55,0.14),0_2px_8px_-2px_rgba(43,52,55,0.08)]"
        >
          <!-- Coloured top strip -->
          <div class="h-[3px] w-full" [class]="strip(t.type)"></div>

          <div class="flex items-start gap-3 px-5 py-4">
            <!-- Icon -->
            <span
              class="material-symbols-outlined text-[22px] shrink-0 mt-0.5"
              [class]="iconColor(t.type)"
              style="font-variation-settings:'FILL' 1,'wght' 500,'GRAD' 0,'opsz' 24"
            >{{ icon(t.type) }}</span>

            <!-- Text -->
            <div class="flex-1 min-w-0">
              @if (t.title) {
                <p class="font-bold text-sm text-on-surface leading-tight mb-1">{{ t.title }}</p>
              }
              <p class="text-sm text-on-surface-variant leading-relaxed">{{ t.message }}</p>
            </div>

            <!-- Close -->
            <button
              (click)="svc.dismiss(t.id)"
              class="shrink-0 -mt-1 -mr-1 p-1.5 rounded-lg text-outline
                     hover:text-on-surface hover:bg-surface-container-low
                     transition-colors"
              aria-label="Dismiss"
            >
              <span class="material-symbols-outlined text-[17px]">close</span>
            </button>
          </div>

          <!-- Progress bar -->
          <div
            class="h-[2px] toast-progress"
            [class]="strip(t.type)"
            [style.animation-duration]="t.duration + 'ms'"
          ></div>
        </article>
      }
    </div>
  `,
})
export class ToastComponent {
  protected svc = inject(ToastService);

  icon(type: ToastType)      { return ICON[type]; }
  strip(type: ToastType)     { return STRIP[type]; }
  iconColor(type: ToastType) { return ICON_COLOR[type]; }
}
