import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { TripsManagementComponent } from './trips-management.component';

const routes: Routes = [{ path: '', component: TripsManagementComponent }];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    // Import the standalone component
    TripsManagementComponent,
  ],
})
export class TripsModule {}
