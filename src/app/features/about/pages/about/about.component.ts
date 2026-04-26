import { Component, OnInit, OnDestroy } from '@angular/core';
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

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './about.component.html',
  styleUrl: './about.component.css',
})
export class AboutComponent implements OnInit, OnDestroy {
  currentLanguage!: Language;
  currentTheme!: ThemeOption;
  private subscriptions: Subscription[] = [];

  constructor(
    private languageService: LanguageService,
    private themeService: ThemeService
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

  teamMembers = [
    {
      name: 'Eslam Mohamed Salah',
      role: 'about.team.roles.fullstack',
      phone: '+201013114472',
      icon: 'fa-solid fa-code',
      color: '#FF6B00'
    },
    {
      name: 'Eslam Elsayed Mohamed',
      role: 'about.team.roles.fullstack',
      phone: '+201271520551',
      icon: 'fa-solid fa-database',
      color: '#007BFF'
    },
    {
      name: 'Nourhan Elnagar',
      role: 'about.team.roles.fullstack',
      phone: '+201205884073',
      icon: 'fa-solid fa-server',
      color: '#E83E8C'
    },
    {
      name: 'Ahmed Lotfi',
      role: 'about.team.roles.fullstack',
      phone: '+201015327439',
      icon: 'fa-solid fa-gears',
      color: '#28A745'
    },
    {
      name: 'Alaa Shokry',
      role: 'about.team.roles.fullstack',
      phone: '+201019774214',
      icon: 'fa-solid fa-laptop-code',
      color: '#6F42C1'
    },
    {
      name: 'Gehad Ammar',
      role: 'about.team.roles.fullstack',
      phone: '+201028856163',
      icon: 'fa-solid fa-display',
      color: '#FD7E14'
    }
  ];
}
