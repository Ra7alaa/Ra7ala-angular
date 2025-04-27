import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LanguageService,
  Language,
} from '../../../../core/localization/language.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-language-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './language-settings.component.html',
  styleUrls: ['./language-settings.component.css'],
})
export class LanguageSettingsComponent implements OnInit {
  currentLanguage: Language;
  languages: Language[] = [];

  constructor(private languageService: LanguageService) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.languages = this.languageService.getAvailableLanguages();
  }

  ngOnInit(): void {
    this.languageService.language$.subscribe((language) => {
      this.currentLanguage = language;
    });
  }

  onLanguageChange(languageCode: string): void {
    this.languageService.setLanguage(languageCode);
  }
}
