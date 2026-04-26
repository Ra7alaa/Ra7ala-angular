import {
  Component,
  OnInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import {
  loadStripe,
  Stripe,
  StripeCardElement,
  StripeElements,
} from '@stripe/stripe-js';
import {
  BookingService,
  ProcessPaymentResponse,
} from '../../../../shared/services/booking.service';
import {
  TranslationDictionary,
  TranslationService,
} from '../../../../core/localization/translation.service';
import {
  LanguageService,
  Language,
} from '../../../../core/localization/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-payment',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
})
export class PaymentComponent implements OnInit, OnDestroy {
  @ViewChild('cardElement', { static: false }) cardElementRef!: ElementRef;

  bookingId = 0;
  totalPrice = 0;
  clientSecret = '';
  paymentIntentId = '';

  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardElement: StripeCardElement | null = null;

  loading = true;
  processingPayment = false;
  paymentSuccess = false;
  error: string | null = null;
  cardError: string | null = null;
  currentLanguage!: Language;
  translations: TranslationDictionary = {};

  private subscriptions: Subscription[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private translationService: TranslationService,
    private languageService: LanguageService,
  ) {}

  ngOnInit(): void {
    this.currentLanguage = this.languageService.getCurrentLanguage();

    this.subscriptions.push(
      this.languageService.language$.subscribe((language) => {
        this.currentLanguage = language;
      }),
    );

    this.subscriptions.push(
      this.translationService.translations$.subscribe((translations) => {
        this.translations = translations;
      }),
    );

    this.translationService.reloadTranslations();

    const idParam = this.route.snapshot.paramMap.get('bookingId');
    if (!idParam || isNaN(+idParam)) {
      this.error = this.t('payment_page.errors.invalid_booking_id');
      this.loading = false;
      return;
    }

    this.bookingId = +idParam;
    const navState = history.state;
    this.totalPrice = navState?.totalPrice ?? 0;

    this.initializePayment();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());

    if (this.cardElement) {
      this.cardElement.destroy();
    }
  }

  private async initializePayment(): Promise<void> {
    try {
      // Step 1: Get Stripe publishable key from backend
      const configResponse = await firstValueFrom(
        this.bookingService.getStripeConfig()
      );
      const publishableKey = configResponse?.data?.publishableKey;

      if (!publishableKey) {
        this.error = this.t('payment_page.errors.config_failed');
        this.loading = false;
        return;
      }

      // Step 2: Create payment intent and get client secret
      const paymentResponse = await firstValueFrom(
        this.bookingService.processPayment(this.bookingId)
      ) as ProcessPaymentResponse;

      if (!paymentResponse?.data?.clientSecret) {
        this.error =
          paymentResponse?.message || this.t('payment_page.errors.init_failed');
        this.loading = false;
        return;
      }

      this.clientSecret = paymentResponse.data.clientSecret;
      this.paymentIntentId = paymentResponse.data.paymentIntentId;
      if (paymentResponse.data.totalPrice) {
        this.totalPrice = paymentResponse.data.totalPrice;
      }

      // Step 3: Initialize Stripe Elements
      this.stripe = await loadStripe(publishableKey);
      if (!this.stripe) {
        this.error = this.t('payment_page.errors.load_stripe_failed');
        this.loading = false;
        return;
      }

      this.elements = this.stripe.elements();
      this.loading = false;

      // Mount card element after view is ready
      setTimeout(() => this.mountCardElement(), 0);
    } catch (err: unknown) {
      console.error('Payment initialization error:', err);
      const e = err as { error?: { message?: string } };
      this.error =
        e?.error?.message || this.t('payment_page.errors.init_failed');
      this.loading = false;
    }
  }

  private mountCardElement(): void {
    if (!this.elements) return;

    const cardElementContainer = document.getElementById('card-element');
    if (!cardElementContainer) {
      console.error('Card element container not found');
      return;
    }

    this.cardElement = this.elements.create('card', {
      hidePostalCode: true,
      style: {
        base: {
          fontSize: '16px',
          color: '#32325d',
          fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
          '::placeholder': {
            color: '#aab7c4',
          },
        },
        invalid: {
          color: '#fa755a',
          iconColor: '#fa755a',
        },
      },
    });

    this.cardElement.mount('#card-element');

    this.cardElement.on('change', (event) => {
      if (!event.error) {
        this.cardError = null;
        return;
      }

      // Friendly localized fallback for common Stripe validation text.
      if (event.error.message?.toLowerCase().includes('postal code')) {
        this.cardError = this.t('payment_page.errors.postal_optional');
        return;
      }

      this.cardError = event.error.message;
    });
  }

  async submitPayment(): Promise<void> {
    if (!this.stripe || !this.cardElement || !this.clientSecret) return;

    this.processingPayment = true;
    this.error = null;

    const { paymentIntent, error } = await this.stripe.confirmCardPayment(
      this.clientSecret,
      {
        payment_method: {
          card: this.cardElement,
        },
      },
    );

    if (error) {
      this.error =
        error.message || this.t('payment_page.errors.payment_failed');
      this.processingPayment = false;
      return;
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        const confirmResponse = await firstValueFrom(
          this.bookingService.confirmPayment(this.paymentIntentId, this.bookingId)
        );

        if (confirmResponse?.data?.isSuccess) {
          this.paymentSuccess = true;
          this.processingPayment = false;
          setTimeout(() => {
            this.router.navigate(['/profile/bookings']);
          }, 3000);
        } else {
          this.error =
            confirmResponse?.message ||
            this.t('payment_page.errors.confirm_update_failed');
          this.processingPayment = false;
        }
      } catch (err: unknown) {
        console.error('Confirm payment error:', err);
        const e = err as { error?: { message?: string } };
        this.error =
          e?.error?.message || this.t('payment_page.errors.confirm_failed');
        this.processingPayment = false;
      }
    } else {
      this.error = this.t('payment_page.errors.not_completed');
      this.processingPayment = false;
    }
  }

  cancelPayment(): void {
    this.router.navigate(['/profile/bookings']);
  }

  t(key: string): string {
    return this.translationService.translate(key);
  }
}
