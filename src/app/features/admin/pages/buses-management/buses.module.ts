import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { BusesManagementComponent } from './buses-management.component';
import { BusCreateComponent } from './components/bus-create/bus-create.component';

const routes: Routes = [{ path: '', component: BusesManagementComponent }];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    // Import the standalone components
    BusesManagementComponent,
    BusCreateComponent,
  ],
})
export class BusesModule {}
