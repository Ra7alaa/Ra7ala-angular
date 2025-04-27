import { Component, OnInit } from '@angular/core';
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
import { UserRole } from '../../models/user.model';
import { TranslationService } from '../../../../core/localization/translation.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule, TranslatePipe],
  standalone: true,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public translationService: TranslationService
  ) {
    this.loginForm = this.formBuilder.group({
      emailOrUsername: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    console.log('Login component initialized');
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    console.log(
      'Password visibility toggled:',
      this.showPassword ? 'showing' : 'hidden'
    );
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      console.error('Form validation failed', this.loginForm.errors);
      // Show error messages for invalid fields
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const emailOrUsername = this.loginForm.get('emailOrUsername')?.value;
    const password = this.loginForm.get('password')?.value;

    console.log('Attempting login with:', {
      emailOrUsername,
      password: '******',
    });
    console.time('Login request');

    // Create a LoginRequest object to match the AuthService.login method signature
    const loginRequest = {
      emailOrUsername,
      password,
    };

    this.authService.login(loginRequest).subscribe({
      next: (user) => {
        console.timeEnd('Login request');
        console.log('Login successful, user:', user);

        // Redirect based on user role
        if (user.userType === UserRole.Passenger) {
          // For passengers, redirect to home page
          this.router.navigate(['/']);
        } else if (
          user.userType === UserRole.Admin ||
          user.userType === UserRole.SuperAdmin ||
          user.userType === UserRole.SystemOwner
        ) {
          // For admin roles, redirect to admin dashboard
          this.router.navigate(['/admin/dashboard']);
        } else if (user.userType === UserRole.Driver) {
          // For drivers, redirect to driver dashboard if it exists, or home otherwise
          this.router.navigate(['/']);
        } else {
          // Default fallback
          this.router.navigate(['/']);
        }

        this.isSubmitting = false;
      },
      error: (error) => {
        console.timeEnd('Login request');
        console.error('Login failed:', error);

        if (error instanceof HttpErrorResponse) {
          // Handle HTTP errors specifically
          if (error.status === 401) {
            this.errorMessage = 'Invalid username or password';
            console.error('Authentication error: Invalid credentials provided');
          } else if (error.status === 400) {
            this.errorMessage =
              'Invalid data provided. Please check your input.';
            console.error('Bad request error:', error.error);
          } else if (error.status === 0) {
            this.errorMessage =
              'Cannot connect to server. Please check your internet connection.';
            console.error('Network error: Unable to connect to server');
          } else {
            this.errorMessage =
              error.error?.message ||
              error.error?.title ||
              error.message ||
              'An error occurred during login';
            console.error(`Server error (${error.status}):`, error.error);
          }
        } else {
          this.errorMessage =
            error.message || 'An unexpected error occurred. Please try again.';
          console.error('Unexpected error during login:', error);
        }

        this.isSubmitting = false;
      },
      complete: () => {
        console.log('Login request completed');
      },
    });
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
