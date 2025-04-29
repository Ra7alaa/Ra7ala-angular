import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OwnerLayoutComponent } from './pages/owner-layout/owner-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CompanyRequestsComponent } from './pages/company-requests/company-requests.component';
import { CompaniesManagementComponent } from './pages/companies-management/companies-management.component';
import { SuperadminManagementComponent } from './pages/superadmin-management/superadmin-management.component';
import { CompanyDetailsComponent } from './components/company-details/company-details.component';

const routes: Routes = [
  {
    path: '',
    component: OwnerLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'company-requests', component: CompanyRequestsComponent },
      { path: 'companies', component: CompaniesManagementComponent },
      { path: 'companies/:id', component: CompanyDetailsComponent },
      { path: 'superadmins', component: SuperadminManagementComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OwnerRoutingModule {}
