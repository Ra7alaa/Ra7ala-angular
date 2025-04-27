import { Component, OnInit } from '@angular/core';
import { GridModule, PagerModule } from '@syncfusion/ej2-angular-grids';
import { RouterOutlet } from '@angular/router';
import { LayoutModule } from './layout/layout.module';

// Import our core services
import { ThemeService } from './core/themes/theme.service';
import { LanguageService } from './core/localization/language.service';
import { TranslationService } from './core/localization/translation.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [GridModule, PagerModule, RouterOutlet, LayoutModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'Ra7ala';

  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService,
    private translationService: TranslationService
  ) {}

  ngOnInit(): void {
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
}
