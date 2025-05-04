import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/user.model';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule, CommonModule, AdminSidebarComponent],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
})
export class AdminLayoutComponent implements OnInit, OnDestroy {
  currentLanguage!: Language;
  currentTheme!: ThemeOption;
  currentUser: User | null = null;
  isSidebarHidden = false;
  isMobileMenuOpen = false;
  isMobileView = false;
  private subscriptions: Subscription[] = [];

  constructor(
    public languageService: LanguageService,
    public themeService: ThemeService,
    public authService: AuthService
  ) {
    // Initialize with current settings
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.currentTheme = this.themeService.getCurrentTheme();
    this.checkScreenSize();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  // Check if we're in mobile view
  checkScreenSize() {
    const prevMobileView = this.isMobileView;
    this.isMobileView = window.innerWidth < 800; // Changed from 768 to 800

    // Always hide sidebar on mobile view by default
    if (this.isMobileView) {
      this.isSidebarHidden = true;
    } else if (!this.isMobileView && prevMobileView) {
      // When switching back to desktop, show the sidebar
      this.isSidebarHidden = false;
    }
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

    // Subscribe to authentication state changes
    this.subscriptions.push(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
      })
    );

    // Initial screen size check
    this.checkScreenSize();
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  // Helper method to check if current theme is dark
  isDarkTheme(): boolean {
    return this.themeService.isDarkTheme();
  }

  // Toggle sidebar visibility
  toggleSidebar(): void {
    this.isSidebarHidden = !this.isSidebarHidden;

    // Force sidebars to be visible on desktop
    if (!this.isMobileView) {
      this.isSidebarHidden = false;
    }
  }

  // Close sidebar when clicking outside (mobile)
  closeSidebarOnOutsideClick(event: Event): void {
    if (this.isMobileView && !this.isSidebarHidden) {
      const target = event.target as HTMLElement;
      const isMobileOverlay = target.classList.contains('mobile-overlay');

      // Close if clicking on the overlay or outside the sidebar
      if (isMobileOverlay || !target.closest('.admin-sidebar')) {
        this.isSidebarHidden = true;
      }
    }
  }

  // Handle keyboard events for accessibility
  handleKeyboardEvent(event: KeyboardEvent): void {
    // Close sidebar on Escape key
    if (event.key === 'Escape' && !this.isSidebarHidden) {
      this.isSidebarHidden = true;
    }

    // Toggle sidebar on Space or Enter when focused
    if (
      (event.key === ' ' || event.key === 'Enter') &&
      document.activeElement === event.currentTarget
    ) {
      event.preventDefault(); // Prevent page scrolling on space
      this.toggleSidebar();
    }
  }

  // Close mobile menu if it's open
  closeMobileMenuIfOpen(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  // Toggle mobile menu
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
