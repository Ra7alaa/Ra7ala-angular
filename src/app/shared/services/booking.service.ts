import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
    bookingId: number;
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

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private apiUrl = 'https://localhost:7111/api';

  constructor(private http: HttpClient) {}

  getTripDetails(tripId: number): Observable<TripDetailsResponse> {
    return this.http.get<TripDetailsResponse>(`${this.apiUrl}/Trips/${tripId}`);
  }

  bookTrip(bookingData: BookingRequest): Observable<BookingResponse> {
    // Validate the booking data before sending
    if (!this.isValidBookingRequest(bookingData)) {
      throw new Error('Invalid booking request data');
    }

    return this.http.post<BookingResponse>(
      `${this.apiUrl}/Booking`,
      bookingData
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
