import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [],
  template: `
    <div class="flex flex-col items-center gap-4 p-8 text-center">
      <span class="material-symbols-outlined text-5xl text-error">error</span>
      <p class="text-on-surface-variant">{{ message }}</p>
    </div>
  `,
  styleUrl: './error-state.component.scss',
})
export class ErrorStateComponent {
  @Input() message = 'Something went wrong.';
}
