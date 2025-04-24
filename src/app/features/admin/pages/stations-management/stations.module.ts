import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { StationsManagementComponent } from './stations-management.component';
import { StationCreateComponent } from './station-create/station-create.component';
import { StationDetailsComponent } from './station-details/station-details.component';
import { StationUpdateComponent } from './station-update/station-update.component';

const routes: Routes = [
  { path: '', component: StationsManagementComponent },
  { path: 'create', component: StationCreateComponent },
  { path: ':id', component: StationDetailsComponent },
  { path: ':id/edit', component: StationUpdateComponent },
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    // Import standalone components
    StationsManagementComponent,
    StationCreateComponent,
    StationDetailsComponent,
    StationUpdateComponent,
  ],
})
export class StationsModule {}
