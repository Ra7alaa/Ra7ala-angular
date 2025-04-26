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
        email: ['', [Validators.required, Validators.email]],
        username: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        fullName: ['', [Validators.required]],
        profilePictureUrl: [''],
        address: ['', [Validators.required]],
        dateOfBirth: ['', [Validators.required]],
        phoneNumber: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,14}$/)]],
        confirmPassword: ['', [Validators.required]],
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

    const formData = this.registerForm.value;
    
    this.authService.registerPassenger(formData).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.errorMessage = error.message || 'An error occurred during registration';
        this.isSubmitting = false;
      },
    });
  }
}
