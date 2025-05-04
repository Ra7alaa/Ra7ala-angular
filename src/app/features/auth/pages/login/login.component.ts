import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
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
      emailOrUsername: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  ngOnInit(): void {
    // If user is already logged in, redirect based on role
    if (this.authService.isLoggedIn()) {
      const user = this.authService.getCurrentUser();
      if (user) {
        this.authService.redirectBasedOnRole(user);
      }
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      // Mark all fields as touched to display validation errors
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    console.log('Login form submission:', this.loginForm.value);

    this.authService.login(this.loginForm.value).subscribe({
      next: (user) => {
        console.log('Login successful, user received with roles:', {
          id: user.id,
          username: user.username,
          userType: user.userType,
          isSystemOwner: user.isSystemOwner,
          isSuperAdmin: user.isSuperAdmin,
          isCompanyAdmin: user.isCompanyAdmin,
          isDriver: user.isDriver,
          isPassenger: user.isPassenger,
        });

        // التوجيه يتم الآن مباشرة في خدمة المصادقة بناءً على نوع المستخدم
        // Navigation is now handled directly in the auth service based on user type
      },
      error: (error) => {
        console.error('Login error:', error);
        this.errorMessage =
          error.message ||
          'فشلت عملية تسجيل الدخول. يرجى التحقق من بيانات الاعتماد الخاصة بك.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
