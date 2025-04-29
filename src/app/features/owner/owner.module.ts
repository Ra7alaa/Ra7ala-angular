import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { OwnerRoutingModule } from './owner-routing.module';
import { OwnerLayoutComponent } from './pages/owner-layout/owner-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CompanyRequestsComponent } from './pages/company-requests/company-requests.component';
import { CompaniesManagementComponent } from './pages/companies-management/companies-management.component';
import { SuperadminManagementComponent } from './pages/superadmin-management/superadmin-management.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OwnerRoutingModule,
    ReactiveFormsModule,
    // استيراد المكونات المستقلة بدلاً من إعلانها
    OwnerLayoutComponent,
    DashboardComponent,
    CompanyRequestsComponent,
    CompaniesManagementComponent,
    SuperadminManagementComponent,
  ],
})
export class OwnerModule {}
