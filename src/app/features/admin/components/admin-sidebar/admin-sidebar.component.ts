import {
  Component,
  OnInit,
  OnDestroy,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
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
import { AuthService } from '../../../auth/services/auth.service';
import { User, UserRole } from '../../../auth/models/user.model';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [RouterModule, CommonModule, TranslatePipe],
  templateUrl: './admin-sidebar.component.html',
  styleUrl: './admin-sidebar.component.css',
})
export class AdminSidebarComponent implements OnInit, OnDestroy {
  @Input() isHidden = false;
  @Output() sidebarClosed = new EventEmitter<void>();

  currentLanguage!: Language;
  currentTheme!: ThemeOption;
  private subscriptions: Subscription[] = [];
  currentUser: User | null = null;
  userRole = UserRole;

  constructor(
    public languageService: LanguageService,
    public themeService: ThemeService,
    private authService: AuthService
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

    // Get current user information
    this.currentUser = this.authService.getCurrentUser();

    // Subscribe to auth changes
    this.subscriptions.push(
      this.authService.currentUser$.subscribe((user) => {
        this.currentUser = user;
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

  // إغلاق الـ sidebar عندما يتم النقر على زر الإغلاق
  closeSidebar(): void {
    this.isHidden = true;
    this.sidebarClosed.emit();
  }

  // التحقق إذا كان المستخدم هو SuperAdmin
  isSuperAdmin(): boolean {
    return this.currentUser?.userType === UserRole.SuperAdmin;
  }
}
