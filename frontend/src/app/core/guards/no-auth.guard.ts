import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) return true;

  // Already signed in — honour the original destination if one was attached,
  // otherwise drop the user on the home page. Avoid bouncing back to /login
  // or /register (which would just re-trigger this guard).
  const requested = route.queryParamMap.get('returnUrl');
  const safe =
    requested && !/^\/(login|register)(\/|$|\?)/.test(requested) ? requested : '/home';

  return router.parseUrl(safe);
};
