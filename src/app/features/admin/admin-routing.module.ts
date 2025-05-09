import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { AdminProfileComponent } from './pages/admin-profile/admin-profile.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile', component: AdminProfileComponent },
      {
        path: 'routes',
        loadChildren: () =>
          import('./pages/routes-management/routes.module').then(
            (m) => m.RoutesModule
          ),
      },
      {
        path: 'buses',
        loadChildren: () =>
          import('./pages/buses-management/buses.module').then(
            (m) => m.BusesModule
          ),
      },
      {
        path: 'trips',
        loadChildren: () =>
          import('./pages/trips-management/trips.module').then(
            (m) => m.TripsModule
          ),
      },
      {
        path: 'stations',
        loadChildren: () =>
          import('./pages/stations-management/stations.module').then(
            (m) => m.StationsModule
          ),
      },
      {
        path: 'admins',
        loadChildren: () =>
          import('./pages/admins-management/index').then((m) => m.AdminsModule),
      },
      {
        path: 'drivers',
        loadChildren: () =>
          import('./pages/drivers-management/drivers.module').then(
            (m) => m.DriversModule
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('../settings/settings.module').then((m) => m.SettingsModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
