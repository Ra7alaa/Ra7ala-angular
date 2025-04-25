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

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
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
    private authService: AuthService
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
        this.router.navigate(['/']);
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
        this.isSubmitting = false;
        console.log('Login request completed');
      },
    });
  }
}
