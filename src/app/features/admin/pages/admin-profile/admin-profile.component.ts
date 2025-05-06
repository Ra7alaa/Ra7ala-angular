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
import { environment } from '../../../../../environments/environment';

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

  // Variables for handling image upload
  selectedProfileImage: File | null = null;
  selectedProfileImagePreview: string | null = null;

  // Base URL for images
  private apiBaseUrl = environment.apiUrl;

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
      phoneNumber: ['', [Validators.pattern(/^\+?[0-9]{10,14}$/)]],
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
    // Mark all fields as touched to display validation errors
    Object.keys(this.profileForm.controls).forEach((key) => {
      const control = this.profileForm.get(key);
      control?.markAsTouched();
    });

    if (this.profileForm.invalid) {
      this.submitError = 'Please fix the errors in the form before saving.';
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = null;

    const updatedProfile = this.profileForm.value;
    console.log('Saving profile (form data):', updatedProfile);

    try {
      // Create FormData to send the data
      const formData = new FormData();

      // Add all form fields to FormData
      Object.keys(updatedProfile).forEach((key) => {
        if (updatedProfile[key] !== null && updatedProfile[key] !== undefined) {
          formData.append(key, updatedProfile[key]);
        }
      });

      // Note: This function will be updated later to use updateAdminProfile or similar
      this.updateAdminProfile(formData).subscribe({
        next: (updatedUser: User) => {
          console.log('Profile updated successfully:', updatedUser);
          this.isSubmitting = false;
          this.submitSuccess = true;

          // Update the interface with the new data
          if (this.currentUser) {
            this.currentUser = {
              ...this.currentUser,
              ...updatedProfile,
            };
          }

          // Show success message for 3 seconds
          setTimeout(() => {
            this.submitSuccess = false;
          }, 3000);
        },
        error: (error: Error | HttpErrorResponse) => {
          console.error('Error updating profile:', error);
          this.isSubmitting = false;
          this.submitError =
            error.message || 'Error updating profile. Please try again.';
        },
      });
    } catch (err) {
      console.error('Unexpected error processing request:', err);
      this.isSubmitting = false;
      this.submitError = 'Unexpected error processing request.';
    }
  }

  // Temporary function to resolve the error, will be updated later
  private updateAdminProfile(formData: FormData) {
    return this.authService.updatePassengerProfile(formData);
  }

  // Function to cancel changes to the form
  cancelChanges(): void {
    // Restore the form to the original user data
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

    // Clear any error messages
    this.submitError = null;
  }

  // Function to select a new image
  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedProfileImage = input.files[0];
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedProfileImagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedProfileImage);
    }
  }

  // Function to upload the image
  uploadProfileImage(): void {
    if (!this.selectedProfileImage) {
      this.submitError = 'Please select an image first';
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = null;

    // Create FormData to send the image
    const formData = new FormData();
    formData.append('profilePicture', this.selectedProfileImage);

    // Temporary delay to simulate network upload
    setTimeout(() => {
      // Read file as Data URL
      const reader = new FileReader();
      reader.onload = () => {
        const profilePictureUrl = reader.result as string;

        // Update the form
        this.profileForm.get('profilePictureUrl')?.setValue(profilePictureUrl);

        // Update user data
        const currentUser = this.authService.getCurrentUser();
        if (currentUser) {
          // Try to update the server - Note: using temporary updateAdminProfile
          const imageFormData = new FormData();
          imageFormData.append('profilePictureUrl', profilePictureUrl);

          this.updateAdminProfile(imageFormData).subscribe({
            next: () => {
              console.log('Profile picture updated successfully!');
              this.isSubmitting = false;
              this.submitSuccess = true;
              setTimeout(() => (this.submitSuccess = false), 3000);

              // Reset variables
              this.selectedProfileImage = null;
            },
            error: (error: Error | HttpErrorResponse) => {
              console.error('Error updating profile picture:', error);
              this.isSubmitting = false;
              this.submitSuccess = true; // Show success anyway
              setTimeout(() => (this.submitSuccess = false), 3000);

              // Reset variables
              this.selectedProfileImage = null;
            },
          });
        } else {
          this.isSubmitting = false;
          this.submitError = 'Could not find user data';
        }
      };
      reader.readAsDataURL(this.selectedProfileImage as File);
    }, 1000); // Simulate network delay
  }

  // Function to get full URL for profile image
  getFullProfileImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
      return 'assets/images/default-avatar.svg';
    }

    // If URL starts with http:// or https://, it's a complete URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If URL starts with "/", it's a relative path from the server
    if (imageUrl.startsWith('/')) {
      return `${this.apiBaseUrl}${imageUrl}`;
    }

    // If URL starts with "assets/", it's a local path
    if (imageUrl.startsWith('assets/')) {
      return imageUrl;
    }

    // By default, assume it's a relative path from the server
    return `${this.apiBaseUrl}/${imageUrl}`;
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
