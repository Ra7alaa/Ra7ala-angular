import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/pages/main-layout/main-layout.component';
import { roleGuard } from './core/guards/auth.guard';
import { UserRole } from './features/auth/models/user.model';
import { ErrorPageComponent } from './shared/components/error-page/error-page.component';
import { inject } from '@angular/core';
import { AuthService } from './features/auth/services/auth.service';

// حارس توجيه الصفحة الرئيسية - يوجه المستخدمين بناءً على أدوارهم
const rootRedirectGuard = () => {
  const authService = inject(AuthService);

  if (!authService.isLoggedIn()) {
    return true; // السماح بالوصول إلى الصفحة الرئيسية للزوار
  }

  const user = authService.getCurrentUser();

  if (user?.userType === UserRole.SystemOwner) {
    return { redirectTo: '/owner/dashboard' };
  } else if (
    user?.userType === UserRole.SuperAdmin ||
    user?.userType === UserRole.Admin
  ) {
    return { redirectTo: '/admin/dashboard' };
  } else if (user?.userType === UserRole.Driver) {
    return { redirectTo: '/driver/dashboard' };
  }

  return true; // راكب أو ضيف
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
        canActivate: [roleGuard([UserRole.Passenger])],
      },
      {
        path: 'about',
        loadChildren: () =>
          import('./features/about/about.module').then((m) => m.AboutModule),
        canActivate: [roleGuard([UserRole.Passenger])],
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.module').then(
            (m) => m.SettingsModule
          ),
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.module').then(
            (m) => m.ProfileModule
          ),
        canActivate: [roleGuard([UserRole.Passenger])],
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
    canActivate: [roleGuard([UserRole.SuperAdmin, UserRole.Admin])],
  },
  {
    path: 'owner',
    loadChildren: () =>
      import('./features/owner/owner.module').then((m) => m.OwnerModule),
    canActivate: [roleGuard([UserRole.SystemOwner])],
  },
  {
    path: 'book-trips',
    loadComponent: () =>
      import('./features/trips/pages/book-trips/book-trips.component').then(
        (m) => m.BookTripsComponent
      ),
    canActivate: [roleGuard([UserRole.Passenger])],
  },
  {
    path: 'booking/:tripId',
    loadComponent: () =>
      import('./features/trips/pages/booking/booking.component').then(
        (m) => m.BookingComponent
      ),
    canActivate: [roleGuard([UserRole.Passenger])],
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
