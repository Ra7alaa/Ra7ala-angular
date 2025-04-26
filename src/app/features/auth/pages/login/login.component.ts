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
        this.errorMessage = error.message || 'حدث خطأ أثناء تسجيل الدخول';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
        console.log('Login request completed');
      },
    });
  }
}
