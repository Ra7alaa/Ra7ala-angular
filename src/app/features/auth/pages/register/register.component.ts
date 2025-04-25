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
import { PassengerRegisterRequest } from '../../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  standalone: true,
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.formBuilder.group(
      {
        fullName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        phoneNumber: [''],
        profilePictureUrl: [''],
        address: [''],
        dateOfBirth: [''],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  ngOnInit(): void {}

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      formGroup.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      formGroup.get('confirmPassword')?.setErrors(null);
      return null;
    }
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const registerData: PassengerRegisterRequest = {
      email: this.registerForm.get('email')?.value,
      username: this.registerForm.get('username')?.value,
      password: this.registerForm.get('password')?.value,
      fullName: this.registerForm.get('fullName')?.value,
      phoneNumber: this.registerForm.get('phoneNumber')?.value || undefined,
      profilePictureUrl:
        this.registerForm.get('profilePictureUrl')?.value || undefined,
      address: this.registerForm.get('address')?.value || undefined,
      dateOfBirth: this.registerForm.get('dateOfBirth')?.value || undefined,
    };

    this.authService.registerPassenger(registerData).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error: Error | HttpErrorResponse) => {
        this.errorMessage = error.message || 'حدث خطأ أثناء التسجيل';
        this.isSubmitting = false;
      },
    });
  }
}
