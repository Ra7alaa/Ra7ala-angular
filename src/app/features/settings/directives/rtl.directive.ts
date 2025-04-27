import { Directive, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { LanguageService } from '../../../core/localization/language.service';

@Directive({
  selector: '[appRtl]',
  standalone: true,
})
export class RtlDirective implements OnInit, OnDestroy {
  private subscription: Subscription | null = null;

  constructor(
    private el: ElementRef<HTMLElement>,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Apply RTL direction based on current language
    this.applyDirection(this.languageService.getCurrentLanguage().rtl);

    // Subscribe to language changes
    this.subscription = this.languageService.language$.subscribe((language) => {
      this.applyDirection(language.rtl);
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private applyDirection(isRtl: boolean): void {
    this.el.nativeElement.dir = isRtl ? 'rtl' : 'ltr';

    // Add or remove RTL class
    if (isRtl) {
      this.el.nativeElement.classList.add('rtl');
    } else {
      this.el.nativeElement.classList.remove('rtl');
    }

    // Adjust Bootstrap grid classes for RTL support
    const allElements = this.el.nativeElement.querySelectorAll('*');

    allElements.forEach((element) => {
      // Convert Bootstrap margin/padding classes for RTL
      if (isRtl) {
        this.convertClassesToRtl(element as HTMLElement);
      } else {
        this.convertClassesToLtr(element as HTMLElement);
      }
    });
  }

  private convertClassesToRtl(element: HTMLElement): void {
    // Convert margin/padding left/right classes
    this.replaceClass(element, 'ms-', 'me-');
    this.replaceClass(element, 'ps-', 'pe-');
    this.replaceClass(element, 'text-start', 'text-end');
    this.replaceClass(element, 'text-end', 'text-start');
  }

  private convertClassesToLtr(element: HTMLElement): void {
    // Convert back to LTR
    this.replaceClass(element, 'me-', 'ms-');
    this.replaceClass(element, 'pe-', 'ps-');
    this.replaceClass(element, 'text-end', 'text-start');
    this.replaceClass(element, 'text-start', 'text-end');
  }

  private replaceClass(
    element: HTMLElement,
    fromPrefix: string,
    toPrefix: string
  ): void {
    const classList = element.classList;

    for (let i = 0; i < classList.length; i++) {
      const className = classList[i];

      if (className.startsWith(fromPrefix)) {
        const suffix = className.substring(fromPrefix.length);

        classList.remove(className);
        classList.add(`${toPrefix}${suffix}`);
        // Adjust index since we removed an item
        i--;
      }
    }
  }
}
