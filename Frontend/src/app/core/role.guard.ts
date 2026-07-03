import { inject } from '@angular/core';
import { CanActivateChildFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { roleCanSee } from './roles';

/**
 * Blocks console routes outside the active role's nav scope; the sidebar
 * already hides them, this closes the deep-link/URL-bar hole. Out-of-scope
 * navigations bounce to the role's home dashboard.
 */
export const roleGuard: CanActivateChildFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (roleCanSee(auth.role(), state.url)) return true;
  return router.createUrlTree([auth.home()]);
};
