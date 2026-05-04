import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [],
  template: `
    <div class="flex items-center justify-center p-8">
      <div class="w-8 h-8 border-4 border-primary border-t-transparent
                  rounded-full animate-spin"></div>
    </div>
  `,
  styleUrl: './loading-spinner.component.scss',
})
export class LoadingSpinnerComponent {}
