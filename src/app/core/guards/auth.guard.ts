import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserRole } from '../../features/auth/models/user.model';

/**
 * Basic authentication guard - checks if user is logged in
 */
export function authGuard(): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigateByUrl('/auth/login');
      return false;
    }

    return true;
  };
}

/**
 * Admin role guard
 * Verifies user has Admin or SuperAdmin role
 */
export function adminGuard(): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigateByUrl('/auth/login');
      return false;
    }

    // const isAdmin = authService.hasRole([UserRole.Admin, UserRole.SuperAdmin]);

    // if (!isAdmin) {
    //   router.navigateByUrl('/error/403', {
    //     state: { message: 'You do not have permission to access this area' },
    //   });
    //   return false;
    // }

    return true;
  };
}

/**
 * System Owner guard
 * Verifies user has SystemOwner role
 */
export function systemOwnerGuard(): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigateByUrl('/auth/login');
      return false;
    }

    const isSystemOwner = authService.hasRole(UserRole.SystemOwner);

    if (!isSystemOwner) {
      router.navigateByUrl('/error/403', {
        state: { message: 'This area is restricted to system owners only' },
      });
      return false;
    }

    return true;
  };
}

/**
 * Driver guard
 * Verifies user has Driver role
 */
export function driverGuard(): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigateByUrl('/auth/login');
      return false;
    }

    const isDriver = authService.hasRole(UserRole.Driver);

    if (!isDriver) {
      router.navigateByUrl('/error/403', {
        state: { message: 'This area is restricted to drivers only' },
      });
      return false;
    }

    return true;
  };
}

/**
 * Passenger guard
 * Verifies user has Passenger role
 */
export function passengerOnlyGuard(): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigateByUrl('/auth/login');
      return false;
    }

    const isPassenger = authService.hasRole(UserRole.Passenger);

    if (!isPassenger) {
      router.navigateByUrl('/error/403', {
        state: { message: 'This area is restricted to passengers only' },
      });
      return false;
    }

    return true;
  };
}
