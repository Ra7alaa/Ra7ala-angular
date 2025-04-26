

//
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
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  standalone: true,
})
export class ForgotPasswordComponent implements OnInit {
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

  ngOnInit(): void {}

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      return;
    }
  
    this.isSubmitting = true;
    this.errorMessage = '';
  
    const email = this.forgotPasswordForm.get('email')?.value;
  
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        // Success: Store email and navigate to verify code
        sessionStorage.setItem('resetEmail', email);
        this.router.navigate(['/auth/verify-code']);
      },
      error: (error) => {
        console.error('Forgot password error:', error);
        if (error.message?.toLowerCase().includes('not registered')) {
          this.errorMessage = 'هذا البريد غير مسجل لدينا.';
        } else {
          this.errorMessage = 'حدث خطأ أثناء الإرسال، حاول مرة أخرى.';
        }
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}  