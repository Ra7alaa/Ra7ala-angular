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
import { DriversService } from '../../../../services/drivers.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';
import { DriverRegistrationRequest } from '../../../../models/driver.model';

@Component({
  selector: 'app-driver-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './driver-create.component.html',
  styleUrl: './driver-create.component.css',
})
export class DriverCreateComponent implements OnInit {
  @Output() driverCreated = new EventEmitter<boolean>();

  driverForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  companyId = 0;
  profilePicture: File | null = null;

  constructor(
    private driversService: DriversService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.companyId = currentUser?.companyId || 1; // Default to company ID 1 if not available
  }

  // Initialize form with required fields
  initializeForm(): void {
    this.driverForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      licenseNumber: ['', [Validators.required]],
      licenseExpiryDate: ['', [Validators.required]],
      contactAddress: ['', [Validators.required]],
      hireDate: ['', [Validators.required]],
      dateOfBirth: [''],
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

  // Create new driver
  createDriver(): void {
    if (this.driverForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.driverForm.controls).forEach((key) => {
        this.driverForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    // Get form values
    const formValues = this.driverForm.getRawValue();
    console.log('Raw form values:', formValues);

    // Format the dates for API
    const licenseExpiryDate = this.formatDateForAPI(
      formValues.licenseExpiryDate
    );
    const hireDate = this.formatDateForAPI(formValues.hireDate);
    const dateOfBirth = formValues.dateOfBirth
      ? this.formatDateForAPI(formValues.dateOfBirth)
      : null;

    // Create the request object with exact field names the API expects
    const driverData: DriverRegistrationRequest = {
      FullName: String(formValues.fullName || '').trim(),
      Email: String(formValues.email || '').trim(),
      PhoneNumber: String(formValues.phoneNumber || '').trim(),
      LicenseNumber: String(formValues.licenseNumber || '').trim(),
      LicenseExpiryDate: licenseExpiryDate,
      ContactAddress: String(formValues.contactAddress || '').trim(),
      HireDate: hireDate,
      DateOfBirth: dateOfBirth,
      CompanyId: this.companyId,
      UserType: 'driver',
      ProfilePicture: this.profilePicture,
    };

    console.log('Sending driver data to API:', driverData);

    this.driversService
      .createDriver(driverData)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          console.log('Driver created successfully:', response);
          this.resetForm();
          this.driverCreated.emit(true);
        },
        error: (err: HttpErrorResponse | Error) => {
          console.error('Error creating driver:', err);

          if (err instanceof HttpErrorResponse) {
            console.log('Status code:', err.status);
            console.log('Response body:', err.error);

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
                  'Failed to create driver. Please try again.';
              }
            } else if (err.error && err.error.message) {
              this.error = err.error.message;
            } else {
              this.error = `Failed to create driver (Status: ${err.status}). Please try again.`;
            }
          } else {
            this.error =
              err.message || 'Failed to create driver. Please try again.';
          }

          this.driverCreated.emit(false);
        },
      });
  }

  // Reset form
  resetForm(): void {
    this.driverForm.reset();
    this.profilePicture = null;
    this.error = null;
  }
}
