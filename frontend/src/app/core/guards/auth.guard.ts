import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

const AUTH_ROUTES = ['/login', '/register'];

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isAuthenticated()) return true;

  // Don't preserve a returnUrl that would just bounce the user back here
  // (e.g., /login or /register) — that creates a redirect loop.
  const target = state.url.split('?')[0];
  const safeReturn = AUTH_ROUTES.some(p => target === p || target.startsWith(p + '/'))
    ? null
    : state.url;

  return router.createUrlTree(['/login'], {
    queryParams: safeReturn ? { returnUrl: safeReturn } : {},
  });
};
