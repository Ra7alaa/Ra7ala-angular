import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../features/settings/pipes/translate.pipe';
import { TranslationService } from '../../../core/localization/translation.service';
import {
  LanguageService,
  Language,
} from '../../../core/localization/language.service';
import { Subscription } from 'rxjs';

// Interface for translated reason
interface ReasonOption {
  key: string;
  text: string;
}

@Component({
  selector: 'app-rejection-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './rejection-modal.component.html',
  styleUrls: ['./rejection-modal.component.css'],
})
export class RejectionModalComponent implements OnInit, OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Output() confirmRejection = new EventEmitter<string>();
  @Output() cancelRejection = new EventEmitter<void>();

  rejectionReason = '';
  selectedPredefinedReason = '';
  currentLanguage: Language | null = null;
  languageSubscription: Subscription | null = null;

  // Define reason keys
  predefinedReasonKeys = [
    'owner.company_requests.rejection_reasons.incomplete_info',
    'owner.company_requests.rejection_reasons.invalid_docs',
    'owner.company_requests.rejection_reasons.duplicate',
    'owner.company_requests.rejection_reasons.not_eligible',
    'owner.company_requests.rejection_reasons.suspicious',
    'owner.company_requests.rejection_reasons.unverifiable',
  ];

  // Translated options for display
  translatedReasons: ReasonOption[] = [];

  constructor(
    private translationService: TranslationService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // Subscribe to language changes
    this.languageSubscription = this.languageService.language$.subscribe(
      (language) => {
        this.currentLanguage = language;
        this.updateTranslatedReasons();
      }
    );

    // Initialize with current language
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.updateTranslatedReasons();
  }

  ngOnDestroy(): void {
    if (this.languageSubscription) {
      this.languageSubscription.unsubscribe();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // When modal opens, ensure translations are fresh
    if (changes['isOpen'] && changes['isOpen'].currentValue === true) {
      // Force reload of translations to ensure proper localization
      this.translationService.reloadTranslations();
      this.updateTranslatedReasons();
      this.resetModal();

      // Ensure RTL is applied correctly if in Arabic
      this.currentLanguage = this.languageService.getCurrentLanguage();
      console.log(
        'Current language in modal:',
        this.currentLanguage.code,
        'RTL:',
        this.currentLanguage.rtl
      );
    }
  }

  // Update translated reasons based on current language
  updateTranslatedReasons(): void {
    this.translatedReasons = this.predefinedReasonKeys.map((key) => ({
      key: key,
      text: this.translationService.translate(key),
    }));

    // Log for debugging
    console.log('Translated reasons:', this.translatedReasons);
  }

  selectPredefinedReason(reasonKey: string): void {
    this.selectedPredefinedReason = reasonKey;

    // Find the translated text for this reason
    const translatedReason = this.translatedReasons.find(
      (reason) => reason.key === reasonKey
    );

    if (translatedReason) {
      this.rejectionReason = translatedReason.text;
    } else {
      // Fallback to using the key if translation not found
      this.rejectionReason = this.translationService.translate(reasonKey);
    }
  }

  onConfirm(): void {
    this.confirmRejection.emit(this.rejectionReason);
    this.resetModal();
  }

  onCancel(): void {
    this.cancelRejection.emit();
    this.resetModal();
  }

  private resetModal(): void {
    this.rejectionReason = '';
    this.selectedPredefinedReason = '';
  }
}
