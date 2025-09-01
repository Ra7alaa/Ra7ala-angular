import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { TripsManagementComponent } from './trips-management.component';
import { TripDetailsComponent } from '../trip-details/trip-details.component';
import { TripCreateComponent } from './components/trip-create/trip-create.component';

const routes: Routes = [
  { path: '', component: TripsManagementComponent },
  { path: 'create', component: TripCreateComponent },
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
    TripCreateComponent,
  ],
})
export class TripsModule {}
