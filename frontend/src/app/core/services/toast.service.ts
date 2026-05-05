import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
}

let _id = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
  readonly toasts = signal<Toast[]>([]);

  success(message: string, title?: string)  { this.add('success', message, title, 4000); }
  error(message: string, title?: string)    { this.add('error',   message, title, 5000); }
  info(message: string, title?: string)     { this.add('info',    message, title, 4000); }
  warning(message: string, title?: string)  { this.add('warning', message, title, 4500); }

  dismiss(id: number): void {
    this.toasts.update(ts => ts.filter(t => t.id !== id));
  }

  private add(type: ToastType, message: string, title?: string, duration = 4000): void {
    const id = _id++;
    this.toasts.update(ts => [...ts, { id, type, message, title, duration }]);
    setTimeout(() => this.dismiss(id), duration);
  }
}
