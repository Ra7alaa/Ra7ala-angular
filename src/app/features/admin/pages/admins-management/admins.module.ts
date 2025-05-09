import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

// Use relative path that TypeScript can find
import { AdminsManagementComponent } from './admins-management.component';

const routes: Routes = [{ path: '', component: AdminsManagementComponent }];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(routes),
    // Import the standalone component
    AdminsManagementComponent,
  ],
})
export class AdminsModule {}
