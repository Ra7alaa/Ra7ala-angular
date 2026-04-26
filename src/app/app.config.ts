import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { provideRouter } from '@angular/router';
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { routes } from './app.routes';
import { httpInterceptorProviders } from './core/interceptors';

// Localization
import { registerLocaleData } from '@angular/common';
import localeAr from '@angular/common/locales/ar';
import { LanguageService } from './core/localization/language.service';

registerLocaleData(localeAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimationsAsync(),
    providePrimeNG({
        theme: {
            preset: Aura
        }
    }),
    provideRouter(routes),
    
    provideHttpClient(withInterceptorsFromDi()),
    httpInterceptorProviders,

    {
      provide: LOCALE_ID,
      useFactory: (languageService: LanguageService) => {
        return languageService.getCurrentLanguage().code;
      },
      deps: [LanguageService]
    }
  ],
};

