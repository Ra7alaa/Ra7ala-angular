import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserRole } from '../../features/auth/models/user.model';

/**
 * حارس المصادقة لحماية المسارات
 * - الاستخدام الأساسي (يتطلب فقط تسجيل الدخول): canActivate: [authGuard]
 * - الاستخدام المحدد للدور: canActivate: [authGuard([UserRole.Admin, UserRole.SuperAdmin])]
 */
export function authGuard(allowedRoles?: UserRole | UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      // المستخدم غير مسجل الدخول، توجيهه إلى صفحة تسجيل الدخول
      router.navigate(['/auth/login']);
      return false;
    }

    if (allowedRoles) {
      // التحقق من أن المستخدم لديه الدور المطلوب
      const hasRole = authService.hasRole(allowedRoles);
      if (!hasRole) {
        // المستخدم لا يملك الدور المطلوب، توجيهه إلى الصفحة الرئيسية
        router.navigate(['/']);
        return false;
      }
    }

    // السماح بالوصول
    return true;
  };
}

/**
 * حارس مالك النظام لحماية المسارات التي يمكن لمالكي النظام فقط الوصول إليها
 */
export function systemOwnerGuard(): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    const hasRole = authService.hasRole(UserRole.SystemOwner);
    if (!hasRole) {
      router.navigate(['/admin/dashboard']); // توجيه إلى لوحة تحكم المشرف
      return false;
    }

    return true;
  };
}

/**
 * حارس المشرف الأعلى أو أعلى لحماية المسارات التي تتطلب وصول المشرف الأعلى أو مالك النظام
 */
export function superAdminGuard(): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    const hasRole = authService.hasRole([
      UserRole.SuperAdmin,
      UserRole.SystemOwner,
    ]);
    if (!hasRole) {
      router.navigate(['/admin/dashboard']); // توجيه إلى لوحة تحكم المشرف
      return false;
    }

    return true;
  };
}

/**
 * حارس المشرف أو أعلى لحماية المسارات التي تتطلب وصول المشرف أو المشرف الأعلى أو مالك النظام
 */
export function adminGuard(): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    const hasRole = authService.hasRole([
      UserRole.Admin,
      UserRole.SuperAdmin,
      UserRole.SystemOwner,
    ]);
    if (!hasRole) {
      router.navigate(['/']); // توجيه إلى الصفحة الرئيسية
      return false;
    }

    return true;
  };
}

/**
 * حارس السائق لحماية المسارات التي يمكن للسائقين فقط الوصول إليها
 */
export function driverGuard(): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    const hasRole = authService.hasRole(UserRole.Driver);
    if (!hasRole) {
      router.navigate(['/']); // توجيه إلى الصفحة الرئيسية
      return false;
    }

    return true;
  };
}

/**
 * حارس الراكب لحماية المسارات التي يمكن للركاب فقط الوصول إليها
 */
export function passengerOnlyGuard(): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isLoggedIn()) {
      router.navigate(['/auth/login']);
      return false;
    }

    const hasRole = authService.hasRole(UserRole.Passenger);
    if (!hasRole) {
      router.navigate(['/']); // توجيه إلى الصفحة الرئيسية
      return false;
    }

    return true;
  };
}

/**
 * حارس لمنع المستخدمين المصادق عليهم من الوصول إلى صفحات تسجيل الدخول/التسجيل
 */
export const publicOnlyGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const currentUser = authService.getCurrentUser();

  if (!currentUser) {
    // المستخدم غير مسجل الدخول، السماح بالوصول
    return true;
  }

  // إذا كان المستخدم مالك نظام أو مشرف أعلى أو مشرف، قم بتوجيهه إلى لوحة تحكم المشرف
  if (
    currentUser.isSystemOwner ||
    currentUser.isSuperAdmin ||
    currentUser.isCompanyAdmin
  ) {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  // السماح بالوصول للركاب أو المستخدمين غير المسجلين
  return true;
};
