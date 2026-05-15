import { Injectable, signal } from '@angular/core';

/**
 * Shared global search state.
 * Used so the DesktopHeader search bar can drive filtering on the
 * Home / Activities pages (and anywhere else that listens to it).
 */
@Injectable({ providedIn: 'root' })
export class SearchService {
  /** Current search query, kept in sync across components. */
  readonly query = signal('');

  set(value: string): void {
    this.query.set(value);
  }

  clear(): void {
    this.query.set('');
  }
}
