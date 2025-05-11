import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LanguageService } from './language.service';
import { catchError, tap } from 'rxjs/operators';

export interface TranslationDictionary {
  [key: string]: string | TranslationDictionary;
}

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private translationsSubject = new BehaviorSubject<TranslationDictionary>({});
  public translations$: Observable<TranslationDictionary> =
    this.translationsSubject.asObservable();

  private translationCache: Record<string, TranslationDictionary> = {};

  constructor(
    private http: HttpClient,
    private languageService: LanguageService
  ) {
    // Initialize with the current language
    this.loadTranslations(this.languageService.getCurrentLanguage().code);

    // Update translations when language changes
    this.languageService.language$.subscribe((language) => {
      this.loadTranslations(language.code);
    });
  }

  /**
   * Load translations from JSON file in assets/i18n folder
   */
  private loadTranslations(languageCode: string): void {
    // Default to English if an unsupported language is requested
    const lang = ['en', 'ar'].includes(languageCode) ? languageCode : 'en';

    // Use cached translations if available
    if (this.translationCache[lang]) {
      console.log(`Using cached translations for ${lang}`);
      this.translationsSubject.next(this.translationCache[lang]);
      return;
    }

    console.log(
      `Loading translations for ${lang} from assets/i18n/${lang}.json`
    );

    this.http
      .get<TranslationDictionary>(`assets/i18n/${lang}.json`)
      .pipe(
        tap((translations) => {
          // Cache the translations
          this.translationCache[lang] = translations;
        }),
        catchError((error) => {
          console.error(`Failed to load translations for ${lang}:`, error);
          // Fallback to English if there's an error
          if (lang !== 'en') {
            return this.http.get<TranslationDictionary>('assets/i18n/en.json');
          }
          return of({});
        })
      )
      .subscribe({
        next: (translations) => {
          this.translationsSubject.next(translations);
        },
        error: () => {
          // If all fallbacks fail, use an empty object
          console.error('All translation fallbacks failed');
          this.translationsSubject.next({});
        },
      });
  }

  /**
   * Get translation for a key with nested support
   * Examples:
   * - translate('home') => "Home"
   * - translate('navigation.home') => "Home"
   */
  translate(key: string): string {
    const translations = this.translationsSubject.getValue();

    // Handle simple keys
    if (key.indexOf('.') === -1) {
      return this.getValueByKey(translations, key) || key;
    }

    // Handle nested keys (e.g., 'navigation.home')
    const segments = key.split('.');
    let value: TranslationDictionary | string = translations;

    for (const segment of segments) {
      if (!value || typeof value !== 'object') {
        return key; // If we can't navigate further, return the original key
      }
      value = value[segment];
    }

    return typeof value === 'string' ? value : key;
  }

  /**
   * Helper method to safely get a value by key
   */
  private getValueByKey(
    obj: TranslationDictionary,
    key: string
  ): string | undefined {
    if (!obj || typeof obj !== 'object') return undefined;
    return typeof obj[key] === 'string' ? (obj[key] as string) : undefined;
  }

  /**
   * Force reload translations for the current language
   */
  reloadTranslations(): void {
    const currentLang = this.languageService.getCurrentLanguage().code;
    // Clear the cache for the current language
    delete this.translationCache[currentLang];
    // Reload
    this.loadTranslations(currentLang);
  }
}
