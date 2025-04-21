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

@Component({
  selector: 'app-new-password',
  templateUrl: './new-password.component.html',
  styleUrls: ['./new-password.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  standalone: true,
})
export class NewPasswordComponent implements OnInit {
  newPasswordForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  resetEmail: string | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.newPasswordForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    // Check if we have gone through the previous steps
    this.resetEmail = sessionStorage.getItem('resetEmail');
    const codeVerified = sessionStorage.getItem('codeVerified');

    if (!this.resetEmail || codeVerified !== 'true') {
      // If no email or code verification found, redirect back
      this.router.navigate(['/auth/forgot-password']);
    }
  }

  passwordMismatch(): boolean {
    const password = this.newPasswordForm.get('password')?.value;
    const confirmPassword = this.newPasswordForm.get('confirmPassword')?.value;
    return !!(
      password !== confirmPassword &&
      this.newPasswordForm.get('confirmPassword')?.dirty
    );
  }

  onSubmit(): void {
    if (this.newPasswordForm.invalid || this.passwordMismatch()) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const password = this.newPasswordForm.get('password')?.value;

    // In a real application, this would call the auth service to reset the password
    // For now, we'll simulate a successful password reset and redirect to login
    setTimeout(() => {
      this.isSubmitting = false;

      // Clear the reset process data
      sessionStorage.removeItem('resetEmail');
      sessionStorage.removeItem('codeVerified');

      // Show success message (in a real app, you might want to use a proper notification system)
      alert(
        'Password reset successfully! Please log in with your new password.'
      );

      // Redirect to login
      this.router.navigate(['/auth/login']);
    }, 1500);
  }
}
