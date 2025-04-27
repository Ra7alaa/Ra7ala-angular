import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../../core/localization/language.service';

@Pipe({
  name: 'formatDate',
  standalone: true,
  pure: false,
})
export class FormatDatePipe implements PipeTransform {
  constructor(private languageService: LanguageService) {}

  transform(
    value: string | Date,
    format: 'short' | 'medium' | 'long' = 'medium'
  ): string {
    if (!value) return '';

    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return value.toString();

    const currentLang = this.languageService.getCurrentLanguage();
    const options: Intl.DateTimeFormatOptions = this.getFormatOptions(format);

    // Use Intl.DateTimeFormat for localized date formatting
    return new Intl.DateTimeFormat(currentLang.code, options).format(date);
  }

  private getFormatOptions(
    format: 'short' | 'medium' | 'long'
  ): Intl.DateTimeFormatOptions {
    switch (format) {
      case 'short':
        return {
          day: 'numeric',
          month: 'numeric',
          year: 'numeric',
        };
      case 'long':
        return {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        };
      case 'medium':
      default:
        return {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        };
    }
  }
}
