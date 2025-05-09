import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../features/settings/pipes/translate.pipe';
import { TripsService } from '../../services/trips.service';
import { Trip } from '../../models/trip.model';
import { RtlDirective } from '../../../../features/settings/directives/rtl.directive';

@Component({
  selector: 'app-trip-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, RtlDirective],
  templateUrl: './trip-details.component.html',
  styleUrl: './trip-details.component.css',
})
export class TripDetailsComponent implements OnInit {
  tripId = 0;
  trip: Trip | null = null;
  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private tripsService: TripsService
  ) {}

  ngOnInit(): void {
    // Get trip ID from route parameters
    this.route.params.subscribe((params) => {
      this.tripId = +params['id']; // Convert to number
      if (this.tripId) {
        this.loadTripDetails();
      } else {
        this.errorMessage = 'Invalid trip ID';
        this.isLoading = false;
      }
    });
  }

  loadTripDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Log tripId being requested
    console.log('Requesting trip details for ID:', this.tripId);

    this.tripsService.getTripById(this.tripId).subscribe({
      next: (response) => {
        // Log the complete response first
        console.log('Trip API Response:', response);

        // Check if response is wrapped in ApiResponse format or direct Trip object
        if (response && typeof response === 'object') {
          if ('data' in response) {
            // Response is in ApiResponse format, extract data property
            this.trip = response.data as Trip;
            console.log('Extracted trip data from API response:', this.trip);
          } else {
            // Response is already a Trip object
            this.trip = response as Trip;
          }

          // Log if trip data is properly set
          console.log('Trip data after processing:', this.trip);

          if (!this.trip || !this.trip.id) {
            console.error('Trip data is invalid or empty after processing');
            this.errorMessage = 'تم استلام بيانات غير صالحة من الخادم';
            // Use mock data as fallback
            this.loadMockData();
          }
        } else {
          console.error('Invalid API response:', response);
          this.errorMessage = 'تم استلام استجابة غير صالحة من الخادم';
          // Use mock data as fallback
          this.loadMockData();
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading trip details:', error);
        this.errorMessage = error.message || 'فشل في تحميل بيانات الرحلة';
        // Use mock data as fallback
        this.loadMockData();
        this.isLoading = false;
      },
    });
  }

  // Load mock data for testing the UI
  loadMockData(): void {
    this.trip = {
      id: this.tripId,
      routeId: 1,
      routeName: 'القاهرة - الإسكندرية',
      departureTime: new Date().toISOString(),
      arrivalTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours later
      driverId: 'DRV-123',
      driverName: 'محمد أحمد',
      driverPhoneNumber: '01012345678',
      busId: 5,
      busRegistrationNumber: 'ص أ د 5432',
      isCompleted: false,
      availableSeats: 25,
      companyId: 2,
      companyName: 'الشركة المصرية للنقل',
      price: 150,
      tripStations: [
        {
          stationId: 1,
          stationName: 'محطة القاهرة المركزية',
          cityId: 1,
          cityName: 'القاهرة',
          sequenceNumber: 1,
          arrivalTime: null,
          departureTime: new Date().toISOString(),
        },
        {
          stationId: 2,
          stationName: 'محطة طنطا',
          cityId: 2,
          cityName: 'طنطا',
          sequenceNumber: 2,
          arrivalTime: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
          departureTime: new Date(
            Date.now() + 1.2 * 60 * 60 * 1000
          ).toISOString(),
        },
        {
          stationId: 3,
          stationName: 'محطة الإسكندرية',
          cityId: 3,
          cityName: 'الإسكندرية',
          sequenceNumber: 3,
          arrivalTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
          departureTime: null,
        },
      ],
    };
  }

  goBack(): void {
    this.router.navigate(['/admin/trips']);
  }

  /**
   * Calculates the duration between departure and arrival times
   * @param departureTime Trip departure time
   * @param arrivalTime Trip arrival time
   * @returns Formatted duration string (e.g., "2h 30m")
   */
  calculateDuration(departureTime: string, arrivalTime: string): string {
    if (!departureTime || !arrivalTime) {
      return '-';
    }

    const departureDateObj = new Date(departureTime);
    const arrivalDateObj = new Date(arrivalTime);

    // Calculate duration in minutes
    const durationMs = arrivalDateObj.getTime() - departureDateObj.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  }
}
