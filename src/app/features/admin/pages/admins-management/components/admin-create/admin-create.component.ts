import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '../../../../../../features/settings/pipes/translate.pipe';
import {
  AdminsService,
  AdminRegisterRequest,
} from '../../../../services/admins.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-admin-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-create.component.html',
  styleUrl: './admin-create.component.css',
})
export class AdminCreateComponent implements OnInit {
  @Output() adminCreated = new EventEmitter<boolean>();

  adminForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  companyId = 0;
  profilePicture: File | null = null;

  constructor(
    private adminsService: AdminsService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.companyId = currentUser?.companyId || 1; // Use company ID 1 as default value
  }

  // Initialize form with validation
  initializeForm(): void {
    this.adminForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\+?[0-9]{10,14}$/)],
      ],
      dateOfBirth: [''],
      department: [''],
      address: [''],
      profilePicture: [null],
    });
  }

  // Handle file input change
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.profilePicture = input.files[0];
    }
  }

  // Format date to match the format expected by the API (MM/dd/yyyy)
  formatDateForAPI(dateString: string): string {
    if (!dateString) return '';

    try {
      // Parse the date string to a Date object
      const date = new Date(dateString);

      // If the date is not valid, return original string
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateString);
        return dateString;
      }

      // Format the date as MM/dd/yyyy
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();

      return `${month}/${day}/${year}`;
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  }

  // Create new admin
  createAdmin(): void {
    if (this.adminForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.adminForm.controls).forEach((key) => {
        this.adminForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    // Get form values
    const formValues = this.adminForm.getRawValue();
    console.log('Raw form values:', formValues);

    // Format dates if present
    const dateOfBirth = formValues.dateOfBirth
      ? this.formatDateForAPI(formValues.dateOfBirth)
      : undefined;

    // Create the request object with exact field names the API expects
    const adminData: AdminRegisterRequest = {
      FullName: String(formValues.fullName || '').trim(),
      Email: String(formValues.email || '').trim(),
      PhoneNumber: String(formValues.phoneNumber || '').trim(),
      DateOfBirth: dateOfBirth,
      Department: formValues.department?.trim(),
      Address: formValues.address?.trim(),
      CompanyId: this.companyId,
      ProfilePicture: this.profilePicture,
    };

    console.log('Admin data being sent to API:', adminData);

    this.adminsService
      .registerAdmin(adminData)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          console.log('Admin created successfully:', response);
          this.resetForm();
          this.adminCreated.emit(true);
        },
        error: (err: HttpErrorResponse | Error) => {
          console.error('Error creating admin:', err);
          if (err instanceof HttpErrorResponse) {
            // Extract validation errors if available
            if (err.error && err.error.errors) {
              const errorMessages: string[] = [];
              Object.keys(err.error.errors).forEach((key) => {
                const fieldErrors = err.error.errors[key];
                if (Array.isArray(fieldErrors)) {
                  errorMessages.push(...fieldErrors);
                } else if (typeof fieldErrors === 'string') {
                  errorMessages.push(fieldErrors);
                }
              });

              if (errorMessages.length > 0) {
                this.error = errorMessages.join(', ');
              } else {
                this.error =
                  err.error.message ||
                  'Failed to create admin. Please try again.';
              }
            } else if (err.error && err.error.message) {
              this.error = err.error.message;
            } else {
              this.error = `Failed to create admin (Status: ${err.status}). Please try again.`;
            }
          } else {
            this.error = err.message || 'An unknown error occurred.';
          }
          this.adminCreated.emit(false);
        },
      });
  }

  // Reset form
  resetForm(): void {
    this.adminForm.reset();
    this.profilePicture = null;
    this.error = null;
  }
}
