/* eslint-disable @typescript-eslint/no-inferrable-types */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BookingService, TripDetailsResponse, TripStation, BookingResponse } from '../../../../shared/services/booking.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
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
    numberOfTickets: 1
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService
  ) {
    // Get trip ID from route parameters and validate it
    const id = this.route.snapshot.paramMap.get('tripId');
    if (id && !isNaN(+id)) {
      this.tripId = +id;
      this.bookingData.tripId = this.tripId;
    } else {
      this.error = 'Invalid trip ID provided';
    }
  }

  ngOnInit(): void {
    if (this.tripId > 0) {
      this.loadTripDetails();
    } else {
      this.error = 'Invalid or missing trip ID';
      // Navigate back to search after 2 seconds if ID is invalid
      setTimeout(() => {
        this.router.navigate(['/trips/search']);
      }, 2000);
    }
  }

  loadTripDetails(): void {
    this.loading = true;
    this.error = null;

    this.bookingService.getTripDetails(this.tripId).subscribe({
      next: (response) => {
        if (response?.data) {
          this.tripDetails = response.data;
          this.stations = response.data.tripStations || [];
          this.bookingData.numberOfTickets = 1;
        } else {
          this.error = 'Failed to load trip details';
        }
        this.loading = false;
      },
      error: (error) => {
        this.error = error?.error?.message || 'Failed to load trip details. Please try again.';
        this.loading = false;
        console.error('Error loading trip details:', error);
        // Navigate back to search after 2 seconds if trip details can't be loaded
        setTimeout(() => {
          this.router.navigate(['/trips/search']);
        }, 2000);
      }
    });
  }

  onSubmit(): void {
    if (!this.bookingData.startStationId || !this.bookingData.endStationId) {
      this.error = 'Please select both departure and arrival stations';
      return;
    }

    if (!this.isValidStationSequence()) {
      this.error = 'Invalid station selection. Arrival station must come after departure station.';
      return;
    }

    if (!this.tripDetails?.availableSeats || this.bookingData.numberOfTickets > this.tripDetails.availableSeats) {
      this.error = 'Not enough seats available';
      return;
    }

    this.loading = true;
    this.error = null;

    this.bookingService.bookTrip(this.bookingData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response?.statusCode === 200) {
          this.bookingSuccess = true;
          this.bookingResponse = response;

          setTimeout(() => {
            this.router.navigate(['/profile/bookings'], {
              queryParams: {
                bookingId: response.data.bookingId,
                totalPrice: response.data.totalPrice
              }
            });
          }, 2000);
        } else {
          this.error = response?.message || 'Booking failed. Please try again.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = error?.error?.message || 'Failed to book the trip. Please try again.';
        console.error('Booking error:', error);
      }
    });
  }

  clearError(): void {
    this.error = null;
  }

  private isValidStationSequence(): boolean {
    if (!this.stations) return false;

    const startStation = this.stations.find(s => s.stationId === this.bookingData.startStationId);
    const endStation = this.stations.find(s => s.stationId === this.bookingData.endStationId);

    if (!startStation || !endStation) return false;

    return startStation.sequenceNumber < endStation.sequenceNumber;
  }
}
