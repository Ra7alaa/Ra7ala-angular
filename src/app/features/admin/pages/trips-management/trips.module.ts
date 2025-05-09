import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { TripsManagementComponent } from './trips-management.component';
import { TripDetailsComponent } from '../trip-details/trip-details.component';

const routes: Routes = [
  { path: '', component: TripsManagementComponent },
  { path: ':id', component: TripDetailsComponent },
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    // Import the standalone components
    TripsManagementComponent,
    TripDetailsComponent,
  ],
})
export class TripsModule {}
