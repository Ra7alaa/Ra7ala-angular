/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { TripResultsService, TripData, TripStation } from '../../../../shared/services/trip-results.service';
import { BookingService } from '../../../../shared/services/booking.service';

@Component({
  selector: 'app-trip-results',
  templateUrl: './trip-results.component.html',
  styleUrls: ['./trip-results.component.css'],
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, RouterModule]
})
export class TripResultsComponent implements OnInit {
  searchResults: any = null;
  isLoading = false;
  error: string | null = null;
  sortedTrips: TripData[] = [];
  selectedStartStations: Record<number, number> = {};
  selectedEndStations: Record<number, number> = {};
  numberOfTickets: Record<number, number> = {};
  
  // تاريخ البحث الأصلي المدخل بواسطة المستخدم
  originalSearchDate = '';

  constructor(
    private tripResultsService: TripResultsService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.isLoading = true;
    this.tripResultsService.getSearchResults().subscribe({
      next: (results) => {
        this.searchResults = results;
        if (results?.data) {
          // الحصول على تاريخ البحث الأصلي من الخدمة
          this.originalSearchDate = this.extractSearchDate();
          
          // تصفية الرحلات حسب التاريخ المحدد
          this.sortedTrips = this.filterTripsByDate(results.data);
          this.initializeBookingData();
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching results:', error);
        this.error = 'Failed to load search results';
        this.isLoading = false;
      }
    });
  }
  
  // استخلاص تاريخ البحث المدخل من قبل المستخدم
  private extractSearchDate(): string {
    // محاولة الحصول على تاريخ البحث من التخزين المحلي
    const searchDate = localStorage.getItem('searchDate');
    
    if (searchDate) {
      return searchDate.split('T')[0]; // استخراج جزء التاريخ فقط YYYY-MM-DD
    }
    
    // إذا لم يتم تخزين تاريخ البحث، استخدم اليوم الحالي
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  // تصفية الرحلات حسب التاريخ المحدد
  private filterTripsByDate(trips: TripData[]): TripData[] {
    if (!this.originalSearchDate || !trips || trips.length === 0) return trips;
    
    console.log(`Filtering trips for date: ${this.originalSearchDate}`);
    
    return trips.filter(trip => {
      const tripDate = new Date(trip.departureTime);
      const tripDateString = tripDate.toISOString().split('T')[0];
      
      console.log(`Trip ${trip.id}: ${tripDateString} vs Search: ${this.originalSearchDate}`);
      
      // مقارنة تاريخ الرحلة مع تاريخ البحث
      const tripDay = tripDate.getDate();
      const searchDay = new Date(this.originalSearchDate).getDate();
      
      return tripDay === searchDay;
    });
  }

  private initializeBookingData(): void {
    this.sortedTrips.forEach(trip => {
      this.selectedStartStations[trip.id] = 0;
      this.selectedEndStations[trip.id] = 0;
      this.numberOfTickets[trip.id] = 1;
    });
  }

  getSeatsStatusClass(availableSeats: number): string {
    if (availableSeats === 0) return 'seats-none';
    if (availableSeats <= 5) return 'seats-low';
    if (availableSeats <= 15) return 'seats-medium';
    return 'seats-available';
  }

  getSeatsMessage(availableSeats: number): string {
    if (availableSeats === 0) return 'No seats available';
    if (availableSeats <= 5) return `${availableSeats} seats left`;
    if (availableSeats <= 15) return `${availableSeats} seats available`;
    return `${availableSeats} seats available`;
  }

  canBookTrip(tripId: number): boolean {
    const startStationId = this.selectedStartStations[tripId];
    const endStationId = this.selectedEndStations[tripId];
    const tickets = this.numberOfTickets[tripId];
    const trip = this.sortedTrips.find(t => t.id === tripId);

    return !!(
      startStationId &&
      endStationId &&
      tickets &&
      tickets > 0 &&
      trip &&
      trip.availableSeats >= tickets &&
      this.isValidStationSelection(tripId, startStationId, endStationId)
    );
  }

  private isValidStationSelection(tripId: number, startStationId: number, endStationId: number): boolean {
    const trip = this.sortedTrips.find(t => t.id === tripId);
    if (!trip) return false;

    const startStation = trip.tripStations.find(s => s.stationId === startStationId);
    const endStation = trip.tripStations.find(s => s.stationId === endStationId);

    if (!startStation || !endStation) return false;

    return startStation.sequenceNumber < endStation.sequenceNumber;
  }

  bookTrip(tripId: number): void {
    if (!this.canBookTrip(tripId)) {
      return;
    }

    const bookingData = {
      tripId: tripId,
      startStationId: this.selectedStartStations[tripId],
      endStationId: this.selectedEndStations[tripId],
      numberOfTickets: this.numberOfTickets[tripId]
    };

    this.bookingService.bookTrip(bookingData).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.router.navigate(['/profile/bookings'], {
            queryParams: {
              bookingId: response.data.bookingId,
              totalPrice: response.data.totalPrice
            }
          });
        } else {
          this.error = response.message || 'Booking failed';
          setTimeout(() => {
            this.error = null;
          }, 3000);
        }
      },
      error: (error) => {
        console.error('Error booking trip:', error);
        this.error = 'Failed to book trip';
        setTimeout(() => {
          this.error = null;
        }, 3000);
      }
    });
  }

  backToSearch(): void {
    this.router.navigate(['/trips/search']);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.backToSearch();
    }
  }
}
