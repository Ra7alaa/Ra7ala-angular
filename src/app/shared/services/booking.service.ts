import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TripDetailsResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    routeId: number;
    routeName: string;
    departureTime: string;
    arrivalTime: string;
    driverId: string;
    driverName: string;
    driverPhoneNumber: string;
    busId: number;
    busRegistrationNumber: string;
    amenityDescription: string;
    isCompleted: boolean;
    availableSeats: number;
    companyId: number;
    companyName: string;
    price: number;
    tripStations: TripStation[];
  };
}

export interface TripStation {
  stationId: number;
  stationName: string;
  cityId: number;
  cityName: string;
  sequenceNumber: number;
  arrivalTime: string | null;
  departureTime: string | null;
}

export interface BookingRequest {
  tripId: number;
  startStationId: number;
  endStationId: number;
  numberOfTickets: number;
}

export interface BookingResponse {
  statusCode: number;
  message: string;
  data: {
    id?: number;
    bookingId?: number;
    tripId: number;
    userId: string;
    startStationId: number;
    endStationId: number;
    numberOfTickets: number;
    totalPrice: number;
    bookingDate: string;
    status: string;
  };
}

export interface ProcessPaymentResponse {
  statusCode: number;
  message: string;
  data: {
    clientSecret: string;
    paymentIntentId: string;
    bookingId: number;
    totalPrice: number;
  };
}

export interface ConfirmPaymentResponse {
  statusCode: number;
  message: string;
  data: {
    isSuccess: boolean;
    ticketIds: number[];
  };
}

export interface StripeConfigResponse {
  statusCode: number;
  message: string;
  data: {
    publishableKey: string;
  };
}

export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PassengerTicket {
  id: number;
  tripId: number;
  bookingId?: number;
  passengerId: string;
  passengerName: string;
  seatNumber?: number;
  price: number;
  purchaseDate: string;
  isUsed: boolean;
  ticketCode: string;
}

export interface PassengerBooking {
  id: number;
  passengerId: string;
  passengerName: string;
  tripId: number;
  startStationId: number;
  startStationName: string;
  startCityId: number;
  startCityName: string;
  endStationId: number;
  endStationName: string;
  endCityId: number;
  endCityName: string;
  bookingDate: string;
  totalPrice: number;
  status: string;
  isPaid: boolean;
  numberOfTickets: number;
  paymentIntentId?: string;
  tickets: PassengerTicket[];
}

export interface PassengerBookingsPayload {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  bookings: PassengerBooking[];
}

export interface PassengerTicketsPayload {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  tickets: PassengerTicket[];
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTripDetails(tripId: number): Observable<TripDetailsResponse> {
    return this.http.get<TripDetailsResponse>(`${this.apiUrl}/Trips/${tripId}`);
  }

  bookTrip(bookingData: BookingRequest): Observable<BookingResponse> {
    if (!this.isValidBookingRequest(bookingData)) {
      throw new Error('Invalid booking request data');
    }
    return this.http.post<BookingResponse>(`${this.apiUrl}/Booking`, bookingData);
  }

  getStripeConfig(): Observable<StripeConfigResponse> {
    return this.http.get<StripeConfigResponse>(
      `${this.apiUrl}/Payments/config`,
    );
  }

  processPayment(bookingId: number): Observable<ProcessPaymentResponse> {
    return this.http.post<ProcessPaymentResponse>(
      `${this.apiUrl}/Booking/payment`,
      { bookingId },
    );
  }

  confirmPayment(
    paymentIntentId: string,
    bookingId: number,
  ): Observable<ConfirmPaymentResponse> {
    return this.http.post<ConfirmPaymentResponse>(
      `${this.apiUrl}/Payments/confirm-payment`,
      {
        paymentIntentId,
        bookingId,
      },
    );
  }

  getMyBookings(
    pageNumber = 1,
    pageSize = 10,
  ): Observable<ApiResponse<PassengerBookingsPayload>> {
    return this.http.get<ApiResponse<PassengerBookingsPayload>>(
      `${this.apiUrl}/Booking/my-bookings?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
  }

  getMyTickets(
    pageNumber = 1,
    pageSize = 10,
  ): Observable<ApiResponse<PassengerTicketsPayload>> {
    return this.http.get<ApiResponse<PassengerTicketsPayload>>(
      `${this.apiUrl}/Booking/my-tickets?pageNumber=${pageNumber}&pageSize=${pageSize}`,
    );
  }

  cancelBooking(bookingId: number): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(
      `${this.apiUrl}/Booking/cancel/${bookingId}`,
      {},
    );
  }

  private isValidBookingRequest(booking: BookingRequest): boolean {
    return !!(
      booking.tripId &&
      booking.startStationId &&
      booking.endStationId &&
      booking.numberOfTickets &&
      booking.numberOfTickets > 0 &&
      booking.startStationId !== booking.endStationId
    );
  }
}
