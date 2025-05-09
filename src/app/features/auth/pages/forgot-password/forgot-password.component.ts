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

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  standalone: true,
})
export class ForgotPasswordComponent{
  forgotPasswordForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }


  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const email = this.forgotPasswordForm.get('email')?.value;

    // In a real application, this would call the auth service to find the account
    // For now, we'll simulate a successful request and redirect to verify-code
    setTimeout(() => {
      this.isSubmitting = false;
      // Store the email in session storage to use in subsequent steps
      sessionStorage.setItem('resetEmail', email);
      this.router.navigate(['/auth/verify-code']);
    }, 1500);
  }
}
