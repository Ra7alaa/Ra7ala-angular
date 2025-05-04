import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

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
    console.log('Getting trip details for tripId:', tripId);
    const url = `${this.apiUrl}/Trips/${tripId}`;
    console.log('GET request to:', url);

    return this.http.get<TripDetailsResponse>(url).pipe(
      tap({
        next: response => console.log('Trip details response:', response),
        error: error => console.error('Error fetching trip details:', error)
      })
    );
  }

  bookTrip(bookingData: BookingRequest): Observable<BookingResponse> {
    // Validate the booking data before sending
    if (!this.isValidBookingRequest(bookingData)) {
      console.error('Invalid booking request data:', bookingData);
      throw new Error('Invalid booking request data');
    }

    const url = `${this.apiUrl}/Booking`;
    console.log('POST request to:', url);
    console.log('Request body:', bookingData);

    return this.http.post<BookingResponse>(url, bookingData).pipe(
      tap({
        next: (response) => {
          console.log('Booking API response:', response);
          console.log('Response status:', response.statusCode);
          console.log('Response data:', response.data);
        },
        error: (error) => {
          console.error('Booking API error:', error);
          console.error('Error details:', {
            status: error.status,
            message: error.error?.message,
            error: error.error
          });
        }
      })
    );
  }

  private isValidBookingRequest(booking: BookingRequest): boolean {
    const isValid = !!(
      booking.tripId &&
      booking.startStationId &&
      booking.endStationId &&
      booking.numberOfTickets &&
      booking.numberOfTickets > 0 &&
      booking.startStationId !== booking.endStationId
    );

    console.log('Booking request validation:', {
      booking,
      isValid,
      checks: {
        hasTripId: !!booking.tripId,
        hasStartStation: !!booking.startStationId,
        hasEndStation: !!booking.endStationId,
        hasValidTickets: booking.numberOfTickets > 0,
        hasDifferentStations: booking.startStationId !== booking.endStationId
      }
    });

    return isValid;
  }
}
