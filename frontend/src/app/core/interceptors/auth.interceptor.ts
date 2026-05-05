import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();
  const isApi = req.url.startsWith(environment.apiUrl);

  const authReq =
    token && isApi
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Only auto-logout on 401 from the refresh endpoint — that means the
      // refresh token itself is expired/revoked and there is no recovery.
      // For all other 401s (wrong password, expired JWT on a regular endpoint)
      // let the component's own catchError handle it so the user isn't kicked
      // out of the app on every transient auth failure.
      if (error.status === 401 && req.url.includes('/auth/refresh')) {
        auth.logout();
      }
      return throwError(() => error);
    }),
  );
};
