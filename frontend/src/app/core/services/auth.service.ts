import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import type { AuthResponse, LoginDto, RegisterDto, RegisterResponse } from '../models/user.model';

const STORAGE_KEY = 'sportmap_session';
// Old key the app used to write to. Cleaned up on first run after upgrading.
const LEGACY_STORAGE_KEYS = ['sportmap_token'];
// Treat the JWT as expired this many seconds before its real expiry,
// so we proactively refresh instead of being rejected by the API.
const JWT_EXPIRY_SKEW_MS = 30_000;

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

  // ---------- public API ----------

  login(dto: LoginDto): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, dto)
      .pipe(tap(res => this.setSession(res)));
  }

  register(dto: RegisterDto): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${environment.apiUrl}/auth/register`, dto);
  }

  logout(navigate: boolean = true): void {
    const refreshToken = this.getRefreshToken();

    // Best-effort server logout to revoke the refresh token. Ignore errors —
    // the local session is being cleared regardless.
    if (refreshToken && this.getToken()) {
      this.http
        .post(`${environment.apiUrl}/auth/logout`, {})
        .pipe(catchError(() => throwError(() => null)))
        .subscribe({ error: () => void 0 });
    }

    this.clearSession();

    if (navigate && this.router.url !== '/login' && !this.router.url.startsWith('/login?')) {
      this.router.navigate(['/login']);
    }
  }

  getToken(): string | null {
    return this._currentUser()?.token ?? null;
  }

  getRefreshToken(): string | null {
    return this._currentUser()?.refreshToken ?? null;
  }

  /** True if we have a JWT and it isn't expired (with a small safety skew). */
  hasValidJwt(): boolean {
    const user = this._currentUser();
    if (!user?.token || !user?.expiresAt) return false;
    return new Date(user.expiresAt).getTime() - JWT_EXPIRY_SKEW_MS > Date.now();
  }

  /** True if we still have a refresh token whose expiry hasn't passed. */
  hasValidRefreshToken(): boolean {
    const user = this._currentUser();
    if (!user?.refreshToken || !user?.refreshTokenExpiry) return false;
    return new Date(user.refreshTokenExpiry).getTime() > Date.now();
  }

  refreshSession(refreshToken: string): Observable<string> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap(res => this.setSession(res)),
        map(res => res.token),
      );
  }

  // ---------- internal ----------

  private restoreSession(): void {
    this.migrateLegacyStorage();
    const stored = this.readStorage();
    if (!stored) return;

    try {
      const user: AuthResponse = JSON.parse(stored);

      // Drop sessions written by an older format that's missing required fields.
      if (!user?.token || !user?.refreshToken || !user?.refreshTokenExpiry) {
        this.clearSession();
        return;
      }

      // The interceptor will auto-refresh an expired JWT as long as the
      // refresh token is still valid (typically 7 days), so we restore the
      // session even when the JWT itself has already expired.
      const refreshAlive = new Date(user.refreshTokenExpiry).getTime() > Date.now();
      if (refreshAlive) {
        this._currentUser.set(user);
      } else {
        this.clearSession();
      }
    } catch {
      this.clearSession();
    }
  }

  /** One-time pickup of pre-existing sessions written under the old key. */
  private migrateLegacyStorage(): void {
    if (typeof localStorage === 'undefined') return;
    if (localStorage.getItem(STORAGE_KEY)) return; // already migrated
    for (const legacy of LEGACY_STORAGE_KEYS) {
      try {
        const value = localStorage.getItem(legacy);
        if (value) {
          localStorage.setItem(STORAGE_KEY, value);
        }
        localStorage.removeItem(legacy);
      } catch {
        /* ignore */
      }
    }
  }

  private setSession(response: AuthResponse): void {
    this.writeStorage(JSON.stringify(response));
    this._currentUser.set(response);
  }

  private clearSession(): void {
    this.writeStorage(null);
    this._currentUser.set(null);
  }

  // localStorage is unavailable in some non-browser test environments — guard it.
  private readStorage(): string | null {
    try {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    } catch {
      return null;
    }
  }

  private writeStorage(value: string | null): void {
    try {
      if (typeof localStorage === 'undefined') return;
      if (value === null) localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore quota / disabled-storage errors */
    }
  }
}
