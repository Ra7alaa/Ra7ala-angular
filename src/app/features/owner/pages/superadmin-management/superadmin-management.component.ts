import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-superadmin-management',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './superadmin-management.component.html',
  styleUrl: './superadmin-management.component.css',
  standalone: true,
})
export class SuperadminManagementComponent {}
