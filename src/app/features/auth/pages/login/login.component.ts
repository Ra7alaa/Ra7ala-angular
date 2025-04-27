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
        this.errorMessage = error.message || 'حدث خطأ أثناء تسجيل الدخول';
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
