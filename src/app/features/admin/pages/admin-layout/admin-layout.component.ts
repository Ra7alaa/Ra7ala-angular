import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar.component';
import {
  LanguageService,
  Language,
} from '../../../../core/localization/language.service';
import {
  ThemeService,
  ThemeOption,
} from '../../../../core/themes/theme.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, AdminSidebarComponent, TranslatePipe],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  currentLanguage!: Language;
  currentTheme!: ThemeOption;
  isSidebarHidden = false; // Keep only the hidden state, remove collapse
  private subscriptions: Subscription[] = [];

  constructor(
    public languageService: LanguageService,
    public themeService: ThemeService
  ) {
    // Initialize with current settings
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

  // Helper method to check if current theme is dark
  isDarkTheme(): boolean {
    return this.themeService.isDarkTheme();
  }

  // Hide sidebar completely
  hideSidebar(): void {
    this.isSidebarHidden = true;
  }

  // Show sidebar
  showSidebar(): void {
    this.isSidebarHidden = false;
  }
}
