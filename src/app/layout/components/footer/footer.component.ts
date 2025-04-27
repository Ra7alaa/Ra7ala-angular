import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService, ThemeOption } from '../../../core/themes/theme.service';
import {
  LanguageService,
  Language,
} from '../../../core/localization/language.service';
import {
  TranslationService,
  TranslationDictionary,
} from '../../../core/localization/translation.service';
import { TranslatePipe } from '../../../features/settings/pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css',
})
export class FooterComponent implements OnInit {
  currentLanguage: Language;
  currentTheme: ThemeOption;
  translations: TranslationDictionary = {};
  currentYear: number = new Date().getFullYear();

  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService,
    private translationService: TranslationService
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  ngOnInit(): void {
    // الاشتراك في تغييرات اللغة
    this.languageService.language$.subscribe((language: Language) => {
      this.currentLanguage = language;
    });

    // الاشتراك في تغييرات السمة
    this.themeService.theme$.subscribe((theme: ThemeOption) => {
      this.currentTheme = theme;
    });

    // الاشتراك في تغييرات الترجمة
    this.translationService.translations$.subscribe(
      (translations: TranslationDictionary) => {
        this.translations = translations;
      }
    );
  }
}
