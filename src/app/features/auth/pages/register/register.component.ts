import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PassengerRegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  standalone: true,
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.formBuilder.group(
      {
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        fullName: ['', [Validators.required]],
        profilePictureUrl: [''],
        address: ['', [Validators.required]],
        dateOfBirth: ['', [Validators.required]],
        phoneNumber: [
          '',
          [Validators.required, Validators.pattern(/^\+?[0-9]{10,14}$/)],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(group: FormGroup): Record<string, boolean> | null {
    const password = group.get('password');
    const confirmPassword = group.get('confirmPassword');

    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      Object.keys(this.registerForm.controls).forEach((key) => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Get form values
    const dateOfBirthValue = this.registerForm.get('dateOfBirth')?.value;
    let formattedDateOfBirth = dateOfBirthValue;

    // Format date if needed
    if (dateOfBirthValue) {
      // Check if it's a Date object by checking if it has a toISOString method
      if (
        dateOfBirthValue &&
        typeof dateOfBirthValue === 'object' &&
        'toISOString' in dateOfBirthValue
      ) {
        formattedDateOfBirth = (dateOfBirthValue as Date)
          .toISOString()
          .split('T')[0]; // YYYY-MM-DD
      } else if (typeof dateOfBirthValue === 'string') {
        // Try to ensure date is in YYYY-MM-DD format
        if (dateOfBirthValue.includes('/')) {
          const parts = dateOfBirthValue.split('/');
          if (parts.length === 3) {
            // Handle MM/DD/YYYY format
            formattedDateOfBirth = `${parts[2]}-${parts[0].padStart(
              2,
              '0'
            )}-${parts[1].padStart(2, '0')}`;
          }
        } else if (dateOfBirthValue.includes('-')) {
          // Ensure YYYY-MM-DD format
          const parts = dateOfBirthValue.split('-');
          if (parts.length === 3) {
            formattedDateOfBirth = `${parts[0]}-${parts[1].padStart(
              2,
              '0'
            )}-${parts[2].padStart(2, '0')}`;
          }
        }
      }
    }

    const registerData: PassengerRegisterRequest = {
      email: this.registerForm.get('email')?.value,
      username: this.registerForm.get('username')?.value,
      password: this.registerForm.get('password')?.value,
      fullName: this.registerForm.get('fullName')?.value,
      phoneNumber: this.registerForm.get('phoneNumber')?.value,
      profilePictureUrl:
        this.registerForm.get('profilePictureUrl')?.value || '',
      address: this.registerForm.get('address')?.value,
      dateOfBirth: formattedDateOfBirth,
    };

    console.log('Sending registration data:', {
      ...registerData,
      password: '******',
      dateOfBirth: registerData.dateOfBirth,
    });

    this.authService.registerPassenger(registerData).subscribe({
      next: (user) => {
        console.log('Registration successful:', user);
        // Show success message
        this.errorMessage = '';
        // توجيه المستخدم حسب دوره بعد التسجيل بنجاح
        this.authService.redirectBasedOnRole(user);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Registration error:', error);

        this.isSubmitting = false;

        if (error.status === 400) {
          // Try to extract validation errors
          if (error.error && typeof error.error === 'object') {
            if (error.error.message) {
              this.errorMessage = error.error.message;
            } else if (error.error.errors) {
              // Combine validation errors
              const errorMessages = [];
              for (const key in error.error.errors) {
                if (
                  Object.prototype.hasOwnProperty.call(error.error.errors, key)
                ) {
                  const errorArray = error.error.errors[key];
                  if (Array.isArray(errorArray)) {
                    errorMessages.push(...errorArray);
                  } else {
                    errorMessages.push(errorArray);
                  }
                }
              }
              this.errorMessage = errorMessages.join('. ');
            } else {
              this.errorMessage =
                'Invalid registration data. Please check your input.';
            }
          } else {
            this.errorMessage =
              'Invalid registration data. Please check your input.';
          }
        } else {
          this.errorMessage =
            'An error occurred during registration. Please try again.';
        }
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
