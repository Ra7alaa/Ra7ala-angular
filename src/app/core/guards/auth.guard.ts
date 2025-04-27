import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserRole } from '../../features/auth/models/user.model';

/**
 * Authentication guard for protecting routes
 * - Basic usage (requires just being logged in): canActivate: [authGuard]
 * - Role-specific usage: canActivate: [authGuard([UserRole.Admin, UserRole.SuperAdmin])]
 */
export function authGuard(allowedRoles?: UserRole | UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      // Not logged in, redirect to login page with an error message
      router.navigate(['/auth/login'], {
        queryParams: {
          returnUrl: router.url,
          authError: 'unauthorized',
        },
      });
      return false;
    }

    // If no specific roles are required, allow access for any logged in user
    if (!allowedRoles) {
      return true;
    }

    // Check if the user has any of the allowed roles
    const hasRole = authService.hasRole(allowedRoles);

    if (!hasRole) {
      // User doesn't have required role, redirect to the 403 error page
      router.navigate(['/error/403']);
      return false;
    }

    return true;
  };
}

/**
 * System Owner guard for protecting routes that only system owners can access
 */
export function systemOwnerGuard(): CanActivateFn {
  return authGuard(UserRole.SystemOwner);
}

/**
 * Super Admin or higher guard for protecting routes that require SuperAdmin or SystemOwner access
 */
export function superAdminGuard(): CanActivateFn {
  return authGuard([UserRole.SuperAdmin, UserRole.SystemOwner]);
}

/**
 * Admin or higher guard for protecting routes that require Admin, SuperAdmin, or SystemOwner access
 */
export function adminGuard(): CanActivateFn {
  return authGuard([UserRole.Admin, UserRole.SuperAdmin, UserRole.SystemOwner]);
}

/**
 * Driver guard for protecting routes that only drivers can access
 */
export function driverGuard(): CanActivateFn {
  return authGuard(UserRole.Driver);
}

/**
 * Guard that prevents already authenticated users from accessing routes like login/register
 */
export const guestOnlyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // User is already logged in, redirect based on role
    const currentUser = authService.getCurrentUser();

    if (
      currentUser?.isSuperAdmin ||
      currentUser?.isCompanyAdmin
    ) {
      router.navigate(['/admin/dashboard']);
    } else if (currentUser?.isDriver) {
      router.navigate(['/driver/dashboard']);
    } else {
      router.navigate(['/']);
    }

    return false;
  }

  return true;
};

/**
 * Passenger only guard that redirects admin users to the admin dashboard
 * This ensures admin users can't access passenger pages
 */
export const passengerOnlyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const currentUser = authService.getCurrentUser();

  // If the user is an admin, super admin or system owner, redirect to admin dashboard
  if (
    currentUser?.isSystemOwner ||
    currentUser?.isSuperAdmin ||
    currentUser?.isCompanyAdmin
  ) {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  // Allow access for passengers or not logged in users
  return true;
};
