import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { RoutesManagementComponent } from './routes-management.component';
import { RouteCreateComponent } from './components/route-create/route-create.component';
// import { RouteEditComponent } from './components/route-edit/route-edit.component';

const routes: Routes = [{ path: '', component: RoutesManagementComponent }];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    // Import the standalone components
    RoutesManagementComponent,
    RouteCreateComponent,
    // RouteEditComponent,
  ],
})
export class RoutesModule {}
