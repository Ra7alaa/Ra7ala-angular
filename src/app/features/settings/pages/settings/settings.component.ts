import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemeSettingsComponent } from '../../components/theme-settings/theme-settings.component';
import { LanguageSettingsComponent } from '../../components/language-settings/language-settings.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import {
  LanguageService,
  Language,
} from '../../../../core/localization/language.service';
import {
  ThemeService,
  ThemeOption,
} from '../../../../core/themes/theme.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ThemeSettingsComponent,
    LanguageSettingsComponent,
    TranslatePipe,
  ],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  currentLanguage!: Language;
  currentTheme!: ThemeOption;
  private subscriptions: Subscription[] = [];

  constructor(
    private languageService: LanguageService,
    private themeService: ThemeService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  ngOnInit(): void {
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

  // Helper method to check if the current theme is dark
  isDarkTheme(): boolean {
    return this.themeService.isDarkTheme();
  }

  // Logout method
  logout(): void {
    // تنفيذ عملية تسجيل الخروج
    this.authService.logout();
    // التوجيه إلى صفحة تسجيل الدخول
    this.router.navigate(['/auth/login']);
  }
}
