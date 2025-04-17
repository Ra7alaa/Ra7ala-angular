import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TripsRoutingModule } from './trips-routing.module';
import { TripsListComponent } from './pages/trips-list/trips-list.component';
import { TripDetailsComponent } from './pages/trip-details/trip-details.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    TripsRoutingModule,
    TripsListComponent,
    TripDetailsComponent,
  ],
})
export class TripsModule {}
