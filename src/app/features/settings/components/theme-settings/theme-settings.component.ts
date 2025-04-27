import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ThemeService,
  ThemeOption,
} from '../../../../core/themes/theme.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-theme-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './theme-settings.component.html',
  styleUrls: ['./theme-settings.component.css'],
})
export class ThemeSettingsComponent implements OnInit {
  currentTheme: ThemeOption;
  themes: { value: ThemeOption; label: string }[] = [
    { value: 'light', label: 'theme_language.light_mode' },
    { value: 'dark', label: 'theme_language.dark_mode' },
    { value: 'system', label: 'theme_language.system_mode' },
  ];

  constructor(private themeService: ThemeService) {
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  ngOnInit(): void {
    this.themeService.theme$.subscribe((theme) => {
      this.currentTheme = theme;
    });
  }

  onThemeChange(theme: ThemeOption): void {
    this.themeService.setTheme(theme);
  }
}
