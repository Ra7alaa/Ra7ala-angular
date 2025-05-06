/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import {
  BookingService,
  TripDetailsResponse,
  TripStation,
  BookingResponse,
} from '../../../../shared/services/booking.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class BookingComponent implements OnInit {
  tripId: number = 0;
  tripDetails: TripDetailsResponse['data'] | null = null;
  stations: TripStation[] = [];
  loading = false;
  error: string | null = null;
  bookingSuccess = false;
  bookingResponse: BookingResponse | null = null;

  bookingData = {
    tripId: 0,
    startStationId: 0,
    endStationId: 0,
    numberOfTickets: 1,
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {
    const id = this.route.snapshot.paramMap.get('tripId');
    console.log('Trip ID from route:', id);
    if (id && !isNaN(+id)) {
      this.tripId = +id;
      this.bookingData.tripId = this.tripId;
      console.log('Initialized booking data with tripId:', this.bookingData);
    } else {
      this.error = 'Invalid trip ID provided';
    }
  }

  ngOnInit(): void {
    if (this.tripId > 0) {
      this.loadTripDetails();
    } else {
      this.error = 'Invalid or missing trip ID';
      setTimeout(() => {
        this.router.navigate(['/trips/search']);
      }, 2000);
    }
  }

  loadTripDetails(): void {
    this.loading = true;
    this.error = null;
    console.log('Loading trip details for ID:', this.tripId);

    this.bookingService.getTripDetails(this.tripId).subscribe({
      next: (response) => {
        console.log('Trip details response:', response);
        if (response?.data) {
          this.tripDetails = response.data;
          this.stations = response.data.tripStations || [];
          this.bookingData.numberOfTickets = 1;
          console.log('Trip details loaded:', this.tripDetails);
          console.log('Available stations:', this.stations);
        } else {
          this.error = 'Failed to load trip details';
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading trip details:', error);
        this.error =
          error?.error?.message ||
          'Failed to load trip details. Please try again.';
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/trips/search']);
        }, 2000);
      },
    });
  }

  onSubmit(): void {
    // Convert station IDs to numbers
    this.bookingData.startStationId = Number(this.bookingData.startStationId);
    this.bookingData.endStationId = Number(this.bookingData.endStationId);

    console.log('Form submitted with booking data:', this.bookingData);

    if (!this.bookingData.startStationId || !this.bookingData.endStationId) {
      this.error = 'Please select both departure and arrival stations';
      console.log('Validation failed: missing station selection');
      return;
    }

    if (this.bookingData.startStationId === this.bookingData.endStationId) {
      this.error = 'Departure and arrival stations cannot be the same';
      console.log('Validation failed: same stations selected');
      return;
    }

    if (!this.isValidStationSequence()) {
      this.error =
        'Invalid station selection. Arrival station must come after departure station.';
      console.log('Validation failed: invalid station sequence');
      return;
    }

    if (
      !this.tripDetails?.availableSeats ||
      this.bookingData.numberOfTickets > this.tripDetails.availableSeats
    ) {
      this.error = 'Not enough seats available';
      console.log('Validation failed: insufficient seats');
      return;
    }

    this.loading = true;
    this.error = null;

    const bookingRequest = {
      tripId: this.bookingData.tripId,
      startStationId: this.bookingData.startStationId,
      endStationId: this.bookingData.endStationId,
      numberOfTickets: this.bookingData.numberOfTickets,
    };

    console.log('Sending booking request:', bookingRequest);

    this.bookingService.bookTrip(bookingRequest).subscribe({
      next: (response) => {
        console.log('Booking response received:', response);
        this.loading = false;
        if (response?.statusCode === 200) {
          this.bookingSuccess = true;
          this.bookingResponse = response;
          console.log('Booking successful:', response.data);

          setTimeout(() => {
            this.router.navigate(['/profile/bookings'], {
              queryParams: {
                bookingId: response.data.bookingId,
                totalPrice: response.data.totalPrice,
              },
            });
          }, 2000);
        } else {
          this.error = response?.message || 'Booking failed. Please try again.';
          console.log('Booking failed with message:', this.error);
        }
      },
      error: (error) => {
        console.error('Booking error:', error);
        this.loading = false;
        this.error =
          error?.error?.message || 'Failed to book the trip. Please try again.';
      },
    });
  }

  clearError(): void {
    this.error = null;
  }

  private isValidStationSequence(): boolean {
    if (!this.stations || !this.stations.length) {
      console.log('No stations available');
      return false;
    }

    // Log all stations and their sequence numbers
    console.log(
      'Available stations:',
      this.stations.map((s) => ({
        stationId: s.stationId,
        name: s.stationName,
        sequenceNumber: s.sequenceNumber,
      }))
    );

    const startStationId = Number(this.bookingData.startStationId);
    const endStationId = Number(this.bookingData.endStationId);

    console.log('Validating stations:', {
      startStationId,
      endStationId,
      tripId: this.tripId,
    });

    const startStation = this.stations.find(
      (s) => s.stationId === startStationId
    );
    const endStation = this.stations.find((s) => s.stationId === endStationId);

    if (!startStation) {
      console.log(`Start station with ID ${startStationId} not found`);
      return false;
    }

    if (!endStation) {
      console.log(`End station with ID ${endStationId} not found`);
      return false;
    }

    console.log('Found stations:', {
      start: {
        id: startStation.stationId,
        name: startStation.stationName,
        sequence: startStation.sequenceNumber,
      },
      end: {
        id: endStation.stationId,
        name: endStation.stationName,
        sequence: endStation.sequenceNumber,
      },
    });

    const result = startStation.sequenceNumber < endStation.sequenceNumber;
    console.log(`Station sequence validation result: ${result}`, {
      startStationSequence: startStation.sequenceNumber,
      endStationSequence: endStation.sequenceNumber,
      isValid: result,
    });

    return result;
  }

  compareStationIds(id1: number | string, id2: number | string): boolean {
    return Number(id1) === Number(id2);
  }
}
