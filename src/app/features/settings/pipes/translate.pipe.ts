import { Pipe, PipeTransform, OnDestroy } from '@angular/core';
import { TranslationService } from '../../../core/localization/translation.service';
import { Subscription } from 'rxjs';
import { TranslationDictionary } from '../../../core/localization/translation.service';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false, // Making it impure so it updates when language changes
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private translations: TranslationDictionary = {};
  private subscription: Subscription;

  constructor(private translationService: TranslationService) {
    // Subscribe to translation changes
    this.subscription = this.translationService.translations$.subscribe(
      (translations) => {
        this.translations = translations;
      }
    );
  }

  transform(key: string, params?: { [key: string]: string }): string {
    if (!key) return '';

    let translatedText = this.translationService.translate(key);

    // Replace parameters if provided
    if (params && translatedText) {
      Object.keys(params).forEach((param) => {
        translatedText = translatedText.replace(`{{${param}}}`, params[param]);
      });
    }

    return translatedText;
  }

  ngOnDestroy(): void {
    // Clean up subscription when the pipe is destroyed
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
