import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminLayoutComponent } from './pages/admin-layout/admin-layout.component';
import { SettingsComponent } from '../settings/pages/settings/settings.component';

const routes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      {
        path: 'trips',
        loadChildren: () =>
          import('./pages/trips-management/trips.module').then(
            (m) => m.TripsModule
          ),
      },
      {
        path: 'routes',
        loadChildren: () =>
          import('./pages/routes-management/routes.module').then(
            (m) => m.RoutesModule
          ),
      },
      {
        path: 'stations',
        loadChildren: () =>
          import('./pages/stations-management/stations.module').then(
            (m) => m.StationsModule
          ),
      },
      { path: 'settings', component: SettingsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
