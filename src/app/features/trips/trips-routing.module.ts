import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TripsListComponent } from './pages/trips-list/trips-list.component';
import { TripDetailsComponent } from './pages/trip-details/trip-details.component';

const routes: Routes = [
  {
    path: '',
    component: TripsListComponent,
  },
  {
    path: ':id',
    component: TripDetailsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TripsRoutingModule {}
