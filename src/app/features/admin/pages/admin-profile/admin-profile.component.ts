import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/user.model';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import {
  LanguageService,
  Language,
} from '../../../../core/localization/language.service';
import {
  ThemeService,
  ThemeOption,
} from '../../../../core/themes/theme.service';
import { RtlDirective } from '../../../settings/directives/rtl.directive';

@Component({
  selector: 'app-admin-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RtlDirective],
  templateUrl: './admin-profile.component.html',
  styleUrls: ['./admin-profile.component.css'],
})
export class AdminProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  isSubmitting = false;
  submitSuccess = false;
  submitError: string | null = null;
  currentLanguage!: Language;
  currentTheme!: ThemeOption;

  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private themeService: ThemeService,
    private languageService: LanguageService
  ) {
    // Initialize with current settings
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^[0-9]{11}$/)]],
      address: [''],
      username: ['', [Validators.required]],
      profilePictureUrl: [''],
      companyName: [{ value: '', disabled: true }],
    });

    this.loadUserProfile();

    // Subscribe to language changes
    this.subscriptions.push(
      this.languageService.language$.subscribe((language) => {
        this.currentLanguage = language;
      })
    );

    // Subscribe to theme changes
    this.subscriptions.push(
      this.themeService.theme$.subscribe((theme) => {
        this.currentTheme = theme;
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  loadUserProfile(): void {
    this.currentUser = this.authService.getCurrentUser();

    if (this.currentUser) {
      this.profileForm.patchValue({
        fullName: this.currentUser.fullName,
        email: this.currentUser.email,
        phoneNumber: this.currentUser.phoneNumber,
        address: this.currentUser.address,
        username: this.currentUser.username,
        profilePictureUrl: this.currentUser.profilePictureUrl,
        companyName: this.currentUser.companyName,
      });
    }

    // Also subscribe to changes in case user logs in while on this page
    this.subscriptions.push(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;

        if (user) {
          this.profileForm.patchValue({
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            username: user.username,
            profilePictureUrl: user.profilePictureUrl,
            companyName: user.companyName,
          });
        }
      })
    );
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = null;

    const updatedProfile = {
      ...this.profileForm.value,
    };

    this.authService.updateProfile(updatedProfile).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
      },
      error: (error: Error | HttpErrorResponse) => {
        this.isSubmitting = false;
        this.submitError = error.message || 'Failed to update profile';
      },
    });
  }

  // This function helps with conditional CSS classes based on the theme
  getThemeClass(className: string): string {
    return this.isDarkTheme() ? `${className} dark-theme` : className;
  }

  // Check if current theme is dark (either explicit or from system pref)
  isDarkTheme(): boolean {
    return this.themeService.isDarkTheme();
  }
}
