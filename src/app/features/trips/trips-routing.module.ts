import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TripsListComponent } from './pages/trips-list/trips-list.component';
import { TripDetailsComponent } from './pages/trip-details/trip-details.component';
import { roleGuard } from '../../core/guards/auth.guard';
import { UserRole } from '../auth/models/user.model';

const routes: Routes = [
  {
    path: '',
    component: TripsListComponent,
  },
  {
    path: ':id',
    component: TripDetailsComponent,
    canActivate: [roleGuard([UserRole.Passenger])], // Using roleGuard instead of authGuard
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TripsRoutingModule {}
