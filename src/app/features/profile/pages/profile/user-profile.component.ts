import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/user.model';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { HttpErrorResponse } from '@angular/common/http';
import { ThemeService, ThemeOption } from '../../../../core/themes/theme.service';
import { LanguageService, Language } from '../../../../core/localization/language.service';
import { TranslationService } from '../../../../core/localization/translation.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { RtlDirective } from '../../../settings/directives/rtl.directive';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RtlDirective]
})
export class UserProfileComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  currentUser: User | null = null;
  isSubmitting = false;
  submitSuccess = false;
  submitError: string | null = null;
  currentLanguage!: Language;
  currentTheme!: ThemeOption;
  private subscriptions: Subscription[] = [];
  isNetworkError = false;
  private pendingImage: File | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private themeService: ThemeService,
    private languageService: LanguageService,
    private translationService: TranslationService,
    private router: Router
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.currentTheme = this.themeService.getCurrentTheme();
    this.initializeForm();
  }

  ngOnInit(): void {
    // Subscribe to auth changes immediately
    this.subscriptions.push(
      this.authService.currentUser$.subscribe(user => {
        if (!user) {
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: this.router.url }
          });
          return;
        }
        this.currentUser = user;
        this.updateFormWithUserData(user);
      })
    );

    this.setupSubscriptions();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.pattern(/^[0-9]{11}$/)]],
      address: [''],
      dateOfBirth: [''],
      profilePictureUrl: [''],
    });
  }

  private setupSubscriptions(): void {
    // الاشتراك في تغييرات اللغة
    this.subscriptions.push(
      this.languageService.language$.subscribe((language) => {
        this.currentLanguage = language;
      })
    );

    // الاشتراك في تغييرات السمة
    this.subscriptions.push(
      this.themeService.theme$.subscribe((theme) => {
        this.currentTheme = theme;
      })
    );

    // الاشتراك في تغييرات بيانات المستخدم
    this.subscriptions.push(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
        if (user) {
          this.updateFormWithUserData(user);
        } else {
          // إذا لم يكن هناك مستخدم، قم بالتوجيه إلى صفحة تسجيل الدخول
          this.router.navigate(['/auth/login'], {
            queryParams: { returnUrl: '/profile' }
          });
        }
      })
    );
  }

  private updateFormWithUserData(user: User): void {
    if (user) {
      this.profileForm.patchValue({
        fullName: user.fullName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        dateOfBirth: user.dateOfBirth || '',
        profilePictureUrl: user.profilePictureUrl || '',
      });
    }
  }

  loadUserProfile(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.currentUser = user;
      this.updateFormWithUserData(user);
    }
  }

  onSubmit(): void {
    if (!this.authService.isLoggedIn()) {
      this.submitError = 'يجب تسجيل الدخول أولاً';
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: '/profile' }
      });
      return;
    }

    if (this.profileForm.invalid) {
      Object.keys(this.profileForm.controls).forEach(key => {
        const control = this.profileForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = null;
    this.isNetworkError = false;

    const saveProfile = () => {
      const updatedProfile = {
        ...this.profileForm.value,
      };

      this.authService.updateProfile(updatedProfile).subscribe({
        next: (user) => {
          this.isSubmitting = false;
          this.submitSuccess = true;
          this.currentUser = user;
          this.updateFormWithUserData(user);
        },
        error: (error: Error | HttpErrorResponse) => this.handleError(error),
      });
    };

    // If there's a pending image, upload it first
    if (this.pendingImage) {
      this.authService.uploadProfilePicture(this.pendingImage).subscribe({
        next: (response) => {
          this.profileForm.patchValue({
            profilePictureUrl: response.profilePictureUrl
          });
          saveProfile();
        },
        error: (error) => {
          this.handleError(error);
        }
      });
    } else {
      saveProfile();
    }
  }

  uploadImage(event: Event): void {
    if (!this.authService.isLoggedIn()) {
      this.submitError = 'يجب تسجيل الدخول أولاً';
      this.router.navigate(['/auth/login']);
      return;
    }

    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      const file = input.files[0];
      this.isSubmitting = true;
      this.submitError = null;
      this.isNetworkError = false;

      this.authService.uploadProfilePicture(file).subscribe({
        next: (user) => {
          this.isSubmitting = false;
          this.submitSuccess = true;
          this.submitError = null;
          this.currentUser = user;
          if (user.profilePictureUrl) {
            this.profileForm.patchValue({ profilePictureUrl: user.profilePictureUrl });
          }
        },
        error: (error: Error | HttpErrorResponse) => this.handleError(error),
      });
    }
  }

  private handleError(error: Error | HttpErrorResponse): void {
    this.isSubmitting = false;
    if (error instanceof HttpErrorResponse) {
      if (!navigator.onLine) {
        this.isNetworkError = true;
        this.submitError = this.translationService.translate('profile.errors.no_connection');
      } else if (error.status === 0) {
        this.isNetworkError = true;
        this.submitError = this.translationService.translate('profile.errors.server_connection_failed');
      } else if (error.status === 401) {
        this.authService.logout();
        return;
      } else {
        this.isNetworkError = false;
        this.submitError = error.error?.message || this.translationService.translate('profile.errors.update_failed');
      }
    } else {
      this.isNetworkError = false;
      this.submitError = this.translationService.translate('profile.errors.unexpected');
    }
  }

  isDarkTheme(): boolean {
    return this.themeService.isDarkTheme();
  }

  getThemeClass(className: string): string {
    return this.isDarkTheme() ? `${className} dark-theme` : className;
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
