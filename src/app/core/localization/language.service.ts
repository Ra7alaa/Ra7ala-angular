import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  rtl: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private storageKey = 'ra7ala-language';

  private languages: Language[] = [
    { code: 'en', name: 'English', rtl: false },
    { code: 'ar', name: 'العربية', rtl: true },
  ];

  private languageSubject = new BehaviorSubject<Language>(
    this.getCurrentLanguage()
  );

  public language$: Observable<Language> = this.languageSubject.asObservable();

  constructor() {
    this.applyLanguage(this.getCurrentLanguage());
    console.log(
      `Language service initialized with language: ${
        this.getCurrentLanguage().code
      }`
    );
  }

  getAvailableLanguages(): Language[] {
    return [...this.languages];
  }

  setLanguage(languageCode: string): void {
    const language = this.languages.find((lang) => lang.code === languageCode);
    if (language) {
      localStorage.setItem(this.storageKey, languageCode);
      this.languageSubject.next(language);
      this.applyLanguage(language);
      console.log(
        `Language switched to: ${language.code} (RTL: ${language.rtl})`
      );
    } else {
      console.error(`Attempted to set unsupported language: ${languageCode}`);
    }
  }

  getCurrentLanguage(): Language {
    const savedLanguageCode = localStorage.getItem(this.storageKey) || 'en';
    return (
      this.languages.find((lang) => lang.code === savedLanguageCode) ||
      this.languages[0]
    );
  }

  private applyLanguage(language: Language): void {
    // Set document language
    document.documentElement.lang = language.code;

    // Handle RTL/LTR
    if (language.rtl) {
      document.documentElement.dir = 'rtl';
      document.documentElement.classList.add('rtl');

      // Enable RTL stylesheet
      const rtlStylesheet = document.getElementById(
        'rtl-stylesheet'
      ) as HTMLLinkElement;
      if (rtlStylesheet) {
        rtlStylesheet.removeAttribute('disabled');
      }
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.classList.remove('rtl');

      // Disable RTL stylesheet
      const rtlStylesheet = document.getElementById(
        'rtl-stylesheet'
      ) as HTMLLinkElement;
      if (rtlStylesheet) {
        rtlStylesheet.setAttribute('disabled', 'true');
      }
    }

    // Dispatch custom event for components that need to react to language changes
    document.dispatchEvent(
      new CustomEvent('languageChange', {
        detail: {
          language: language.code,
          rtl: language.rtl,
        },
      })
    );
  }
}
