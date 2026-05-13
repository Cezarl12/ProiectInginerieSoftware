import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, BehaviorSubject, Observable } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

// Module-level state so concurrent 401s don't trigger multiple refreshes.
// `null` means "refresh in flight"; a string is the new token; an Error
// means the refresh failed and queued requests should fail too.
type RefreshSignal = string | Error | null;
let isRefreshing = false;
const refreshSubject = new BehaviorSubject<RefreshSignal>(null);

const AUTH_ENDPOINTS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/confirm-email'];

function isApiUrl(url: string): boolean {
  return url.startsWith(environment.apiUrl) || url.startsWith('/api/');
}

function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINTS.some(p => url.includes(p));
}

function isRefreshEndpoint(url: string): boolean {
  return url.includes('/auth/refresh');
}

function attachToken(req: HttpRequest<unknown>, token: string | null): HttpRequest<unknown> {
  if (!token) return req;
  return req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const apiCall = isApiUrl(req.url);
  // Don't attach the bearer token to the auth endpoints themselves —
  // login/register don't need it and refresh authenticates via the body.
  const shouldAttach = apiCall && !isAuthEndpoint(req.url);
  const token = shouldAttach ? auth.getToken() : null;

  return next(attachToken(req, token)).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only react to 401s on our own API.
      if (error.status !== 401 || !apiCall) {
        return throwError(() => error);
      }

      // 401 on the refresh endpoint = refresh token rejected → hard logout.
      if (isRefreshEndpoint(req.url)) {
        auth.logout();
        return throwError(() => error);
      }

      // 401 on login/register = bad credentials → bubble up to the component.
      if (isAuthEndpoint(req.url)) {
        return throwError(() => error);
      }

      // 401 on a protected endpoint → try to swap a fresh JWT in via refresh.
      const refreshToken = auth.getRefreshToken();
      if (!refreshToken || !auth.hasValidRefreshToken()) {
        auth.logout();
        return throwError(() => error);
      }

      return queueWithRefresh(req, next, auth, refreshToken);
    }),
  );
};

function queueWithRefresh(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  auth: AuthService,
  refreshToken: string,
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshSubject.next(null);

    return auth.refreshSession(refreshToken).pipe(
      switchMap(newToken => {
        isRefreshing = false;
        refreshSubject.next(newToken);
        return next(attachToken(req, newToken));
      }),
      catchError(refreshErr => {
        isRefreshing = false;
        // Wake up everyone waiting in the queue and tell them to give up.
        refreshSubject.next(refreshErr instanceof Error ? refreshErr : new Error('refresh failed'));
        auth.logout();
        return throwError(() => refreshErr);
      }),
    );
  }

  // Another request is already refreshing — wait for the result.
  return refreshSubject.pipe(
    filter((v): v is string | Error => v !== null),
    take(1),
    switchMap(v => {
      if (v instanceof Error) return throwError(() => v);
      return next(attachToken(req, v));
    }),
  );
}
