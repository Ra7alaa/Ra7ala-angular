import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { User, UserRole } from '../../../features/auth/models/user.model';
import {
  LanguageService,
  Language,
} from '../../../core/localization/language.service';
import { ThemeService, ThemeOption } from '../../../core/themes/theme.service';
import {
  TranslationService,
  TranslationDictionary,
} from '../../../core/localization/translation.service';
import { TranslatePipe } from '../../../features/settings/pipes/translate.pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  isMobileMenuOpen = false;
  currentLanguage: Language;
  currentTheme: ThemeOption;
  translations: TranslationDictionary = {};

  // Base URL for images
  private apiBaseUrl = environment.apiUrl;

  constructor(
    private authService: AuthService,
    private languageService: LanguageService,
    private themeService: ThemeService,
    private translationService: TranslationService
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        // Convert id to string if it's a number to avoid type errors
        this.currentUser = {
          ...user,
          id: typeof user.id === 'number' ? String(user.id) : user.id,
        };
      } else {
        this.currentUser = null;
      }
    });

    this.languageService.language$.subscribe((language) => {
      this.currentLanguage = language;
    });

    this.themeService.theme$.subscribe((theme) => {
      this.currentTheme = theme;
    });

    this.translationService.translations$.subscribe((translations) => {
      this.translations = translations;
    });
  }

  isAdminUser(): boolean {
    return (
      this.currentUser?.userType === UserRole.Admin ||
      this.currentUser?.userType === UserRole.SuperAdmin ||
      this.currentUser?.userType === UserRole.SystemOwner
    );
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenuIfOpen(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  scrollToCommonTrips(event: Event): void {
    event.preventDefault();
    const element = document.getElementById('common-trips');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      this.closeMobileMenuIfOpen();
    }
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
}
