import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { RoutesManagementComponent } from './routes-management.component';

const routes: Routes = [{ path: '', component: RoutesManagementComponent }];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    // Import the standalone component
    RoutesManagementComponent,
  ],
})
export class RoutesModule {}
