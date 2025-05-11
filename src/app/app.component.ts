import { Component, OnInit, OnDestroy } from '@angular/core';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, takeUntil } from 'rxjs/operators';
import { Subject, firstValueFrom } from 'rxjs';
import { LayoutModule } from './layout/layout.module';
import { CommonModule } from '@angular/common';

// Import our core services
import { ThemeService } from './core/themes/theme.service';
import { LanguageService } from './core/localization/language.service';
import { TranslationService } from './core/localization/translation.service';
import { AuthService } from './features/auth/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GridModule, PagerModule, RouterOutlet, LayoutModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Ra7ala';
  isLoading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService,
    private translationService: TranslationService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize app settings
    this.initializeAppSettings();

    // Monitor authentication state changes
    this.monitorAuthState();

    // Handle route changes
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        // Check for 403 errors
        if (event.url === '/error/403') {
          console.log('On 403 error page, checking auth state...');
          this.tryRecoverFromError();
        }
      });

    // Monitor translation loading
    this.translationService.translations$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (translations) => {
          // Check if translations object is not empty
          if (translations && Object.keys(translations).length > 0) {
            // Give a small delay to make sure UI gets translations
            setTimeout(() => {
              this.isLoading = false;
              console.log('Translations loaded successfully');
            }, 500);
          }
        },
        error: () => {
          // Even if there's an error, we should eventually hide the loading screen
          this.isLoading = false;
          console.error('Error loading translations');
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeAppSettings(): void {
    // Initialize theme based on stored preference or system setting
    const currentTheme = this.themeService.getCurrentTheme();
    this.themeService.setTheme(currentTheme);

    // Initialize language based on stored preference
    const currentLang = this.languageService.getCurrentLanguage().code;
    this.languageService.setLanguage(currentLang);

    // Log initialization information
    console.log(
      `App initialized with theme: ${currentTheme}, language: ${currentLang}`
    );
  }

  private async monitorAuthState(): Promise<void> {
    try {
      const user = await firstValueFrom(this.authService.currentUser$);
      console.log('Auth state changed:', !!user);

      if (user) {
        // User is authenticated - we don't need to read from localStorage anymore
        // as the BehaviorSubject in AuthService will hold the current user
        console.log(
          `User authenticated as: ${
            user.fullName || user.username || 'Unknown'
          }, role: ${user.userType || 'Unknown'}`
        );
        console.log('Full user object:', user); // Log the complete user object to debug
      }
    } catch (error) {
      console.error('Error monitoring auth state:', error);
    }
  }

  // Method to try recovering from errors
  private tryRecoverFromError(): void {
    // Try to recover only if the user is authenticated
    if (this.authService.isLoggedIn()) {
      console.log('User is authenticated, trying to recover...');

      // Get the current authenticated user
      const currentUser = this.authService.getCurrentUser();
      if (currentUser) {
        // Navigate based on user role
        this.authService.redirectBasedOnRole(currentUser);
      }
    } else {
      console.log('No valid authentication found, redirecting to login');
      this.router.navigate(['/auth/login']);
    }
  }
}
