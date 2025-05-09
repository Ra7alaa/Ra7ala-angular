import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';

import { DriversManagementComponent } from './drivers-management.component';
import { DriverCreateComponent } from './components/driver-create/driver-create.component';
import { DriverDetailsComponent } from './components/driver-details/driver-details.component';

const routes: Routes = [
  { path: '', component: DriversManagementComponent },
  { path: ':id', component: DriverDetailsComponent },
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    TranslateModule,
    RouterModule.forChild(routes),
    // استيراد المكونات المستقلة بشكل صحيح
    DriversManagementComponent,
    DriverCreateComponent,
    DriverDetailsComponent,
  ],
})
export class DriversModule {}
