import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/pages/main-layout/main-layout.component';
import {
  adminGuard,
  passengerOnlyGuard,
  systemOwnerGuard,
} from './core/guards/auth.guard';
import { ErrorPageComponent } from './shared/components/error-page/error-page.component';
import { inject } from '@angular/core';
import { AuthService } from './features/auth/services/auth.service';
import { UserRole } from './features/auth/models/user.model';

// حارس توجيه الصفحة الرئيسية - يوجه المستخدمين بناءً على أدوارهم
const rootRedirectGuard = () => {
  const authService = inject(AuthService);

  if (!authService.isLoggedIn()) {
    return true; // السماح بالوصول إلى الصفحة الرئيسية للزوار
  }

  const user = authService.getCurrentUser();

  // توجيه المستخدمين بناءً على أدوارهم
  if (user?.isSystemOwner || user?.userType === UserRole.SystemOwner) {
    return { redirectTo: '/owner/dashboard' };
  } else if (
    user?.isSuperAdmin ||
    user?.isCompanyAdmin ||
    user?.userType === UserRole.SuperAdmin ||
    user?.userType === UserRole.Admin
  ) {
    return { redirectTo: '/admin/dashboard' };
  } else if (user?.isDriver || user?.userType === UserRole.Driver) {
    return { redirectTo: '/driver/dashboard' };
  }

  return true; // إذا كان المستخدم راكبًا، اسمح له بالوصول إلى الصفحة الرئيسية
};

export const routes: Routes = [
  {
    path: '',
    canMatch: [rootRedirectGuard],
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/home/home.module').then((m) => m.HomeModule),
      },
      {
        path: 'trips',
        loadChildren: () =>
          import('./features/trips/trips-routing.module').then(
            (m) => m.TripsRoutingModule
          ),
        canActivate: [passengerOnlyGuard],
      },
      {
        path: 'about',
        loadChildren: () =>
          import('./features/about/about.module').then((m) => m.AboutModule),
        canActivate: [passengerOnlyGuard],
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.module').then(
            (m) => m.SettingsModule
          ),
        canActivate: [passengerOnlyGuard],
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.module').then(
            (m) => m.ProfileModule
          ),
        canActivate: [passengerOnlyGuard],
      },
    ],
  },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  {
    path: 'admin',
    loadChildren: () =>
      import('./features/admin/admin.module').then((m) => m.AdminModule),
    canActivate: [adminGuard()],
  },
  {
    path: 'owner',
    loadChildren: () =>
      import('./features/owner/owner.module').then((m) => m.OwnerModule),
    canActivate: [systemOwnerGuard()],
  },
  {
    path: 'book-trips',
    loadComponent: () =>
      import('./features/trips/pages/book-trips/book-trips.component').then(
        (m) => m.BookTripsComponent
      ),
  },
  {
    path: 'booking/:tripId',
    loadComponent: () =>
      import('./features/trips/pages/booking/booking.component').then(
        (m) => m.BookingComponent
      ),
  },
  // Error routes
  {
    path: 'error',
    children: [
      {
        path: '403',
        component: ErrorPageComponent,
        data: {
          errorCode: '403',
          errorTitle: 'Access Denied',
          errorMessage: 'You do not have permission to access this page.',
        },
      },
      {
        path: '404',
        component: ErrorPageComponent,
        data: {
          errorCode: '404',
          errorTitle: 'Page Not Found',
          errorMessage:
            'The page you are looking for does not exist or has been moved.',
        },
      },
      {
        path: '500',
        component: ErrorPageComponent,
        data: {
          errorCode: '500',
          errorTitle: 'Server Error',
          errorMessage:
            'An internal server error occurred. Please try again later.',
        },
      },
      {
        path: ':code',
        component: ErrorPageComponent,
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'error/404',
    pathMatch: 'full',
  },
];
