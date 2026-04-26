import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  styleUrls: ['./login.component.css'],
  templateUrl: './login.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule, TranslatePipe],
})
export class LoginComponent implements OnInit {
  errorMessage = '';
  loginForm!: FormGroup;
  showPassword = false;
  isSubmitting = false;

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      emailOrUsername: ['', Validators.required],
      password: ['', Validators.required],
      rememberMe: [false],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const credentials = {
      emailOrUsername: this.loginForm.get('emailOrUsername')?.value || '',
      password: this.loginForm.get('password')?.value || '',
      rememberMe: this.loginForm.get('rememberMe')?.value || false,
    };

    this.auth.login(credentials).subscribe({
      next: () => {
        /* already redirected in service */
        this.isSubmitting = false;
      },
      error: (err) => {
        this.errorMessage = err.message || 'Login failed';
        this.isSubmitting = false;
      },
    });
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  quickLogin(role: string) {
    const credentials = {
      emailOrUsername: '',
      password: '',
      rememberMe: true,
    };

    switch (role) {
      case 'superadmin':
        credentials.emailOrUsername = 'karim@cairotransit.com';
        credentials.password = 'SuperAdmin123!';
        break;
      case 'owner':
        credentials.emailOrUsername = 'owner@ra7ala.com';
        credentials.password = 'Owner123!';
        break;
      case 'passenger':
        credentials.emailOrUsername = 'sara@example.com';
        credentials.password = 'Passenger123!';
        break;
    }

    this.loginForm.patchValue({
      emailOrUsername: credentials.emailOrUsername,
      password: credentials.password,
      rememberMe: true,
    });

    this.onSubmit();
  }
}
