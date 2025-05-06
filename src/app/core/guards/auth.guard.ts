// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import {
  CanActivateFn,
  Router,
  UrlTree,
  NavigationExtras,
} from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserRole } from '../../features/auth/models/user.model';

/**
 * Returns a guard that only activates if the user is logged in
 * and their role is one of the allowedRoles.
 */
export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return (): boolean | UrlTree => {
    const auth = inject(AuthService);
    const router = inject(Router);

    // 1) Must be logged in
    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/auth/login']);
    }

    // 2) Must have an allowed role
    const user = auth.getCurrentUser();
    if (!user || !allowedRoles.includes(user.userType)) {
      // Using NavigationExtras for state instead of directly in createUrlTree
      const navigationExtras: NavigationExtras = {
        queryParams: {
          message: 'You do not have permission to access this area.',
        },
      };

      // Navigate programmatically with state then return the URL tree
      router.navigate(['/error/403'], navigationExtras);
      return router.createUrlTree(['/error/403']);
    }

    return true;
  };
}
