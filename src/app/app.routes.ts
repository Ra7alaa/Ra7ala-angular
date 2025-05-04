import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/pages/main-layout/main-layout.component';
import { passengerOnlyGuard } from './core/guards/auth.guard';
import { ErrorPageComponent } from './shared/components/error-page/error-page.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/home/home.module').then((m) => m.HomeModule),
        canActivate: [passengerOnlyGuard],
      },
      {
        path: 'trips',
        loadChildren: () =>
          import('./features/trips/trips-routing.module').then(
            (m) => m.TripsRoutingModule // Assuming TripsRoutingModule is the correct module to load
          ),
        // Add canActivate guard if needed, e.g., [authGuard()] if details require login
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
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('./features/profile/profile.module').then(
            (m) => m.ProfileModule
          ),
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
    // canActivate: [adminGuard()],
  },
  {
    path: 'owner',
    loadChildren: () =>
      import('./features/owner/owner.module').then((m) => m.OwnerModule),
    // TODO: Create and use ownerGuard to protect this route
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
  {
    path: '',
    loadComponent: () =>
      import('./features/home/pages/home/home.component').then(
        (m) => m.HomeComponent
      ),
  },
];
