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
    // Subscribe to changes in the authentication state
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = { ...user, id: Number(user.id) };
      } else {
        this.currentUser = null;
      }
    });

    // Subscribe to language changes
    this.languageService.language$.subscribe((language) => {
      this.currentLanguage = language;
    });

    // Subscribe to theme changes
    this.themeService.theme$.subscribe((theme) => {
      this.currentTheme = theme;
    });

    // Subscribe to translations
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


}
