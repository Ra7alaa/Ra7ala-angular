import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import {
  BookingService,
  PassengerBooking,
  PassengerTicket,
} from '../../../../shared/services/booking.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import {
  TranslationDictionary,
  TranslationService,
} from '../../../../core/localization/translation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, CurrencyPipe, DatePipe, TranslatePipe],
  templateUrl: './user-bookings.component.html',
  styleUrls: ['./user-bookings.component.css'],
})
export class UserBookingsComponent implements OnInit, OnDestroy {
  activeTab: 'bookings' | 'tickets' = 'bookings';

  bookings: PassengerBooking[] = [];
  tickets: PassengerTicket[] = [];

  bookingsTotal = 0;
  bookingsPage = 1;
  readonly bookingsPageSize = 5;

  ticketsTotal = 0;
  ticketsPage = 1;
  readonly ticketsPageSize = 8;

  loadingBookings = false;
  loadingTickets = false;
  bookingsError = '';
  ticketsError = '';

  cancellingBookingId: number | null = null;
  expandedBookingIds = new Set<number>();
  translations: TranslationDictionary = {};

  private subscriptions: Subscription[] = [];

  constructor(
    private bookingService: BookingService,
    private translationService: TranslationService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.push(
      this.translationService.translations$.subscribe(
        (t) => (this.translations = t),
      ),
    );
    this.translationService.reloadTranslations();
    this.loadBookings();
    this.loadTickets();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }

  switchTab(tab: 'bookings' | 'tickets'): void {
    this.activeTab = tab;
  }

  toggleTickets(bookingId: number): void {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    this.expandedBookingIds.has(bookingId)
      ? this.expandedBookingIds.delete(bookingId)
      : this.expandedBookingIds.add(bookingId);
  }

  isExpanded(bookingId: number): boolean {
    return this.expandedBookingIds.has(bookingId);
  }

  // ── Load bookings ─────────────────────────────────────────────────────────
  loadBookings(page = this.bookingsPage): void {
    this.loadingBookings = true;
    this.bookingsError = '';
    this.bookingsPage = page;

    this.bookingService
      .getMyBookings(this.bookingsPage, this.bookingsPageSize)
      .subscribe({
        next: (response) => {
          // ── DEBUG LOG — open browser DevTools console to inspect ──────────
          console.group('[Bookings] Raw API response');
          console.log('status:', response?.statusCode, '|', response?.message);
          const bookings = response?.data?.bookings ?? [];
          console.log(
            `total: ${response?.data?.totalCount}, returned: ${bookings.length}`,
          );
          bookings.forEach((b: PassengerBooking) => {
            console.log(
              `  #${b.id} startStationId=${b.startStationId} ` +
                `startStationName="${b.startStationName}" ` +
                `startCityName="${b.startCityName}" ` +
                `endStationId=${b.endStationId} ` +
                `endStationName="${b.endStationName}" ` +
                `endCityName="${b.endCityName}" ` +
                `tickets=${b.tickets?.length ?? 0}`,
            );
          });
          console.groupEnd();
          // ─────────────────────────────────────────────────────────────────

          const payload = response?.data;
          this.bookings = payload?.bookings ?? [];
          this.bookingsTotal = payload?.totalCount ?? 0;
          this.bookingsPage = payload?.pageNumber ?? this.bookingsPage;
          this.loadingBookings = false;
        },
        error: (error) => {
          console.error('[Bookings] Error:', error);
          this.bookingsError =
            error?.error?.message ||
            this.t('bookings_page.errors.load_bookings');
          this.loadingBookings = false;
        },
      });
  }

  loadTickets(page = this.ticketsPage): void {
    this.loadingTickets = true;
    this.ticketsError = '';
    this.ticketsPage = page;

    this.bookingService
      .getMyTickets(this.ticketsPage, this.ticketsPageSize)
      .subscribe({
        next: (response) => {
          const payload = response?.data;
          this.tickets = payload?.tickets ?? [];
          this.ticketsTotal = payload?.totalCount ?? 0;
          this.ticketsPage = payload?.pageNumber ?? this.ticketsPage;
          this.loadingTickets = false;
        },
        error: (error) => {
          this.ticketsError =
            error?.error?.message ||
            this.t('bookings_page.errors.load_tickets');
          this.loadingTickets = false;
        },
      });
  }

  // ── Pagination ────────────────────────────────────────────────────────────
  get bookingPages(): number {
    return Math.max(1, Math.ceil(this.bookingsTotal / this.bookingsPageSize));
  }
  get ticketPages(): number {
    return Math.max(1, Math.ceil(this.ticketsTotal / this.ticketsPageSize));
  }
  get bookingPageNumbers(): number[] {
    return Array.from({ length: this.bookingPages }, (_, i) => i + 1);
  }
  get ticketPageNumbers(): number[] {
    return Array.from({ length: this.ticketPages }, (_, i) => i + 1);
  }
  changeBookingsPage(p: number): void {
    if (p < 1 || p > this.bookingPages || p === this.bookingsPage) return;
    this.loadBookings(p);
  }
  changeTicketsPage(p: number): void {
    if (p < 1 || p > this.ticketPages || p === this.ticketsPage) return;
    this.loadTickets(p);
  }

  // ── Cancel ────────────────────────────────────────────────────────────────
  cancelBooking(booking: PassengerBooking): void {
    if (booking.status?.toLowerCase() === 'cancelled') return;
    if (!window.confirm(this.t('bookings_page.confirm_cancel'))) return;

    this.cancellingBookingId = booking.id;
    this.bookingService.cancelBooking(booking.id).subscribe({
      next: () => {
        this.cancellingBookingId = null;
        this.loadBookings(this.bookingsPage);
        this.loadTickets(this.ticketsPage);
      },
      error: (error) => {
        this.cancellingBookingId = null;
        this.bookingsError =
          error?.error?.message ||
          this.t('bookings_page.errors.cancel_booking');
      },
    });
  }

  // ── Label helpers ─────────────────────────────────────────────────────────
  getBookingStartLabel(booking: PassengerBooking): string {
    return this.resolveLocationLabel(
      booking.startStationName,
      booking.startCityName,
      `Station #${booking.startStationId}`,
    );
  }

  getBookingEndLabel(booking: PassengerBooking): string {
    return this.resolveLocationLabel(
      booking.endStationName,
      booking.endCityName,
      `Station #${booking.endStationId}`,
    );
  }

  getStatusClass(status: string | number): string {
    switch (String(status ?? '').toLowerCase()) {
      case 'confirmed': case '1': return 'status-confirmed';
      case 'pending':   case '0': return 'status-pending';
      case 'cancelled': case '2': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  getStatusLabel(status: string | number): string {
    const s = String(status ?? '').toLowerCase();
    if (s === 'confirmed' || s === '1') return this.t('bookings_page.status.confirmed');
    if (s === 'pending' || s === '0') return this.t('bookings_page.status.pending');
    if (s === 'cancelled' || s === '2') return this.t('bookings_page.status.cancelled');
    return String(status) || this.t('bookings_page.status.unknown');
  }

  isCancelled(status: string | number | undefined): boolean {
    return String(status ?? '').toLowerCase() === 'cancelled' || String(status) === '2';
  }

  getTicketUsageClass(isUsed: boolean): string {
    return isUsed ? 'badge-used' : 'badge-valid';
  }

  getTicketUsageLabel(isUsed: boolean): string {
    return isUsed
      ? this.t('bookings_page.ticket_status.used')
      : this.t('bookings_page.ticket_status.valid');
  }

  private t(key: string): string {
    return this.translationService.translate(key);
  }

  private resolveLocationLabel(
    stationName: string | null | undefined,
    cityName: string | null | undefined,
    fallback: string,
  ): string {
    const station = stationName?.trim();
    const city = cityName?.trim();
    if (station && city) return `${station}, ${city}`;
    return station || city || fallback;
  }
}
