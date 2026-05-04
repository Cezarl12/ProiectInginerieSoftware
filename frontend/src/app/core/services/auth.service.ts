import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { AuthResponse, LoginDto, RegisterDto, RegisterResponse } from '../models/user.model';

const USER_KEY = 'sportmap_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _currentUser = signal<AuthResponse | null>(null);

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());

  constructor() {
    this.restoreSession();
  }

  private restoreSession(): void {
    const stored = localStorage.getItem(USER_KEY);
    if (!stored) return;
    try {
      const user: AuthResponse = JSON.parse(stored);
      if (new Date(user.expiresAt) > new Date()) {
        this._currentUser.set(user);
      } else {
        localStorage.removeItem(USER_KEY);
      }
    } catch {
      localStorage.removeItem(USER_KEY);
    }
  }

  login(dto: LoginDto) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, dto)
      .pipe(tap(res => this.setSession(res)));
  }

  register(dto: RegisterDto) {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, dto);
  }

  logout(): void {
    localStorage.removeItem(USER_KEY);
    this._currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._currentUser()?.token ?? null;
  }

  private setSession(response: AuthResponse): void {
    localStorage.setItem(USER_KEY, JSON.stringify(response));
    this._currentUser.set(response);
  }
}
