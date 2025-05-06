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
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ThemeService,
  ThemeOption,
} from '../../../../core/themes/theme.service';
import {
  LanguageService,
  Language,
} from '../../../../core/localization/language.service';
import { Subscription } from 'rxjs';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
})
export class UserProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  isSubmitting = false;
  submitSuccess = false;
  submitError: string | null = null;
  currentLanguage!: Language;
  currentTheme!: ThemeOption;

  // Variables to handle image loading
  selectedImage: File | null = null;
  selectedImagePreview: string | null = null;

  // Base URL for profile images
  private apiBaseUrl = environment.apiUrl;

  private subscriptions: Subscription[] = [];
  private formatDatePipe: FormatDatePipe;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private themeService: ThemeService,
    private languageService: LanguageService
  ) {
    // Initialize with current settings
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.currentTheme = this.themeService.getCurrentTheme();
    this.formatDatePipe = new FormatDatePipe(this.languageService);
  }

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^\+?[0-9]{10,14}$/)]],
      address: [''],
      dateOfBirth: [''],
      profilePictureUrl: [''],
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
      // Format the date of birth from ISO string to YYYY-MM-DD for HTML date input
      let dateOfBirth = '';

      if (this.currentUser.dateOfBirth) {
        try {
          const date = new Date(this.currentUser.dateOfBirth);
          if (!isNaN(date.getTime())) {
            // Add one day to fix timezone issue
            date.setDate(date.getDate() + 1);
            // Format as YYYY-MM-DD for HTML date input
            dateOfBirth = date.toISOString().split('T')[0];
          } else {
            console.error(
              'Invalid date format in user data:',
              this.currentUser.dateOfBirth
            );
          }
        } catch (error) {
          console.error('Error formatting date:', error);
        }
      }

      this.profileForm.patchValue({
        fullName: this.currentUser.fullName,
        email: this.currentUser.email,
        phoneNumber: this.currentUser.phoneNumber,
        address: this.currentUser.address,
        dateOfBirth: dateOfBirth,
        profilePictureUrl: this.currentUser.profilePictureUrl,
      });
    }

    // Also subscribe to changes in case user logs in while on this page
    this.subscriptions.push(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;

        if (user) {
          // Format the date of birth from ISO string to YYYY-MM-DD for HTML date input
          let dateOfBirth = '';

          if (user.dateOfBirth) {
            try {
              const date = new Date(user.dateOfBirth);
              if (!isNaN(date.getTime())) {
                // Add one day to fix timezone issue
                date.setDate(date.getDate() + 1);
                // Format as YYYY-MM-DD for HTML date input
                dateOfBirth = date.toISOString().split('T')[0];
              }
            } catch (error) {
              console.error('Error formatting date:', error);
            }
          }

          this.profileForm.patchValue({
            fullName: user.fullName,
            email: user.email,
            phoneNumber: user.phoneNumber,
            address: user.address,
            dateOfBirth: dateOfBirth,
            profilePictureUrl: user.profilePictureUrl,
          });
        }
      })
    );
  }

  // Method to handle file selection
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];

      // Create a preview of the image
      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImagePreview = reader.result as string;
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }

  // Method to upload selected image only without updating other data
  uploadImage(): void {
    if (!this.selectedImage) {
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = null;

    const formData = new FormData();
    formData.append(
      'profilePicture',
      this.selectedImage,
      this.selectedImage.name
    );

    // Add current data from the form to maintain it
    if (this.profileForm.value.fullName) {
      formData.append('fullName', this.profileForm.value.fullName);
    }

    if (this.profileForm.value.address) {
      formData.append('address', this.profileForm.value.address);
    }

    if (this.profileForm.value.phoneNumber) {
      formData.append('phoneNumber', this.profileForm.value.phoneNumber);
    }

    if (this.profileForm.value.dateOfBirth) {
      formData.append('dateOfBirth', this.profileForm.value.dateOfBirth);
    }

    this.authService.updatePassengerProfile(formData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.submitSuccess = true;

        // Update image in form if server returns a new URL
        if (response?.profilePictureUrl) {
          this.profileForm.patchValue({
            profilePictureUrl: response.profilePictureUrl,
          });
        }

        // Reset image variables
        this.selectedImage = null;
        setTimeout(() => {
          this.submitSuccess = false;
        }, 3000);
      },
      error: (error: Error | HttpErrorResponse) => {
        this.isSubmitting = false;
        this.submitError = error.message || 'Failed to upload image';
        console.error('Error uploading image:', error);
      },
    });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = null;

    // Process data before sending
    const formValues = { ...this.profileForm.value };

    // If there's a selected image, create a FormData
    if (this.selectedImage) {
      const formData = new FormData();

      // Process phone number if it starts with + to match server requirements
      if (formValues.phoneNumber && formValues.phoneNumber.startsWith('+')) {
        // Remove + sign and any non-digit symbols
        formValues.phoneNumber = formValues.phoneNumber.replace(/^\+/, '');
      }

      // Add all form fields to the FormData
      Object.keys(formValues).forEach((key) => {
        if (key !== 'profilePictureUrl') {
          // We don't send the URL, we send the file
          formData.append(key, formValues[key]);
        }
      });

      // Add the image
      formData.append(
        'profilePicture',
        this.selectedImage,
        this.selectedImage.name
      );

      // Send to service
      this.authService.updatePassengerProfile(formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.submitSuccess = true;

          // Update the currentUser with the response data
          this.currentUser = response;

          // Update the form with the returned data
          this.profileForm.patchValue({
            fullName: response.fullName,
            email: response.email,
            phoneNumber: response.phoneNumber,
            address: response.address,
            dateOfBirth: response.dateOfBirth
              ? new Date(response.dateOfBirth).toISOString().split('T')[0]
              : '',
            profilePictureUrl: response.profilePictureUrl,
          });

          // Clear image selection
          this.selectedImage = null;
          this.selectedImagePreview = null;

          setTimeout(() => {
            this.submitSuccess = false;
          }, 3000);
        },
        error: (error: Error | HttpErrorResponse) => {
          this.isSubmitting = false;
          this.submitError = error.message || 'Failed to update profile';
        },
      });
    } else {
      // Create FormData even without an image
      const formData = new FormData();

      // Process phone number if it starts with + to match server requirements
      if (formValues.phoneNumber && formValues.phoneNumber.startsWith('+')) {
        // Remove + sign and any non-digit symbols
        formValues.phoneNumber = formValues.phoneNumber.replace(/^\+/, '');
      }

      // Add all form fields to FormData
      Object.keys(formValues).forEach((key) => {
        if (
          key !== 'profilePictureUrl' &&
          formValues[key] !== null &&
          formValues[key] !== undefined
        ) {
          formData.append(key, formValues[key]);
        }
      });

      this.authService.updatePassengerProfile(formData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.submitSuccess = true;

          // Update the currentUser with the response data
          this.currentUser = response;

          // Update the form with the returned data
          this.profileForm.patchValue({
            fullName: response.fullName,
            email: response.email,
            phoneNumber: response.phoneNumber,
            address: response.address,
            dateOfBirth: response.dateOfBirth
              ? new Date(response.dateOfBirth).toISOString().split('T')[0]
              : '',
            profilePictureUrl: response.profilePictureUrl,
          });

          setTimeout(() => {
            this.submitSuccess = false;
          }, 3000);
        },
        error: (error: Error | HttpErrorResponse) => {
          this.isSubmitting = false;
          this.submitError = error.message || 'Failed to update profile';
        },
      });
    }
  }

  // This function helps with conditional CSS classes based on the theme
  getThemeClass(className: string): string {
    return this.isDarkTheme() ? `${className} dark-theme` : className;
  }

  // Check if current theme is dark (either explicit or from system pref)
  isDarkTheme(): boolean {
    return this.themeService.isDarkTheme();
  }

  // Method to get the full URL of the profile image
  getFullProfileImageUrl(imageUrl: string | null | undefined): string {
    if (!imageUrl) {
      return 'assets/images/default-avatar.svg';
    }

    // If the URL already starts with http:// or https://, it's a complete URL
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // If the URL starts with a "/", it's a relative path from the server
    if (imageUrl.startsWith('/')) {
      return `${this.apiBaseUrl}${imageUrl}`;
    }

    // If the URL starts with "assets/", it's a local path
    if (imageUrl.startsWith('assets/')) {
      return imageUrl;
    }

    // By default, we assume it's a relative path from the server
    return `${this.apiBaseUrl}/${imageUrl}`;
  }
}
