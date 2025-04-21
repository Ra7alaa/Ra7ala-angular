import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
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
  selector: 'app-verify-code',
  templateUrl: './verify-code.component.html',
  styleUrls: ['./verify-code.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  standalone: true,
})
export class VerifyCodeComponent implements OnInit {
  verifyCodeForm: FormGroup;
  isSubmitting = false;
  isCodeInvalid = false;
  resetEmail: string | null = null;

  @ViewChild('digit1') digit1Input!: ElementRef;
  @ViewChild('digit2') digit2Input!: ElementRef;
  @ViewChild('digit3') digit3Input!: ElementRef;
  @ViewChild('digit4') digit4Input!: ElementRef;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.verifyCodeForm = this.formBuilder.group({
      digit1: ['', [Validators.required, Validators.maxLength(1)]],
      digit2: ['', [Validators.required, Validators.maxLength(1)]],
      digit3: ['', [Validators.required, Validators.maxLength(1)]],
      digit4: ['', [Validators.required, Validators.maxLength(1)]],
    });
  }

  ngOnInit(): void {
    // Check if we have the email from the previous step
    this.resetEmail = sessionStorage.getItem('resetEmail');
    if (!this.resetEmail) {
      // If no email found, redirect back to forgot password
      this.router.navigate(['/auth/forgot-password']);
    }

    // Focus on first input after component loads
    setTimeout(() => {
      this.digit1Input.nativeElement.focus();
    }, 0);
  }

  isCodeComplete(): boolean {
    return !!(
      this.verifyCodeForm.get('digit1')?.value &&
      this.verifyCodeForm.get('digit2')?.value &&
      this.verifyCodeForm.get('digit3')?.value &&
      this.verifyCodeForm.get('digit4')?.value
    );
  }

  onKeyUp(event: KeyboardEvent, position: number): void {
    // Handle backspace
    if (event.key === 'Backspace') {
      if (position > 1) {
        const prevInput = this.getDigitInputByPosition(position - 1);
        prevInput.nativeElement.focus();
      }
      return;
    }

    // Auto-focus next input when a digit is entered
    if (this.isDigit(event.key) && position < 4) {
      const nextInput = this.getDigitInputByPosition(position + 1);
      nextInput.nativeElement.focus();
    }
  }

  private getDigitInputByPosition(position: number): ElementRef {
    switch (position) {
      case 1:
        return this.digit1Input;
      case 2:
        return this.digit2Input;
      case 3:
        return this.digit3Input;
      case 4:
        return this.digit4Input;
      default:
        throw new Error(`Invalid digit position: ${position}`);
    }
  }

  private isDigit(key: string): boolean {
    return /^\d$/.test(key);
  }

  getFullCode(): string {
    return (
      this.verifyCodeForm.get('digit1')?.value +
      this.verifyCodeForm.get('digit2')?.value +
      this.verifyCodeForm.get('digit3')?.value +
      this.verifyCodeForm.get('digit4')?.value
    );
  }

  onSubmit(): void {
    if (!this.isCodeComplete()) {
      this.isCodeInvalid = true;
      return;
    }

    this.isSubmitting = true;
    this.isCodeInvalid = false;

    const code = this.getFullCode();

    // In a real application, this would call the auth service to verify the code
    // For now, we'll simulate a successful verification and redirect to new-password
    setTimeout(() => {
      this.isSubmitting = false;

      // For demo purposes, accept any 4-digit code
      if (code.length === 4) {
        // Store verification success in session storage
        sessionStorage.setItem('codeVerified', 'true');
        this.router.navigate(['/auth/new-password']);
      } else {
        this.isCodeInvalid = true;
      }
    }, 1500);
  }

  resendCode(): void {
    // In a real application, this would call the auth service to resend the code
    // For now, we'll just show an alert
    alert('Verification code resent to your email!');
  }
}
