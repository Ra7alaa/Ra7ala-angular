import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '../../../../../../features/settings/pipes/translate.pipe';
import { TripsService } from '../../../../services/trips.service';
import { TripCreateRequest } from '../../../../models/trip.model';
import { Route, PaginatedRoutesResponse } from '../../../../models/route.model';
import { RoutesService } from '../../../../services/routes.service';
import { Bus } from '../../../../models/bus.model';
import { BusesService } from '../../../../services/buses.service';
import { Driver } from '../../../../../../features/admin/models/driver.model';
import { DriversService } from '../../../../../../features/admin/services/drivers.service';
import { AuthService } from '../../../../../../features/auth/services/auth.service';

interface ApiResponse {
  statusCode: number;
  message: string;
  data?: unknown;
}

@Component({
  selector: 'app-trip-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './trip-create.component.html',
  styleUrls: ['./trip-create.component.css'],
})
export class TripCreateComponent implements OnInit {
  @Output() tripCreated = new EventEmitter<boolean>();

  tripForm: FormGroup;

  // Lists for dropdowns
  routes: Route[] = [];
  buses: Bus[] = [];
  drivers: Driver[] = [];

  // For UI control
  isLoading = false;
  errorMessage = '';
  isSubmitting = false;

  // Company ID
  companyId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private tripsService: TripsService,
    private routesService: RoutesService,
    private busesService: BusesService,
    private driversService: DriversService,
    private authService: AuthService
  ) {
    this.tripForm = this.createTripForm();
  }

  ngOnInit(): void {
    // استخدام الدالة الجديدة للحصول على معرف الشركة
    this.getCompanyIdAndInitialize();
  }

  createTripForm(): FormGroup {
    return this.fb.group({
      routeId: ['', Validators.required],
      companyId: [this.companyId || 1, Validators.required],
      driverId: ['', Validators.required],
      busId: ['', Validators.required],
      departureTime: ['', Validators.required],
      availableSeats: ['', [Validators.required, Validators.min(1)]],
      price: ['', [Validators.required, Validators.min(1)]],
      tripStations: this.fb.array([this.createTripStationFormGroup()]),
    });
  }

  createTripStationFormGroup(): FormGroup {
    return this.fb.group({
      stationId: ['', Validators.required],
      sequenceNumber: ['', Validators.required],
      arrivalTime: [''],
      departureTime: ['', Validators.required],
    });
  }

  // استخدام الدالة الجديدة للحصول على معرف الشركة
  getCompanyIdAndInitialize(): void {
    this.isLoading = true;
    this.authService.getCompanyId().subscribe({
      next: (companyId) => {
        console.log('Company ID retrieved from profile:', companyId);
        this.companyId = companyId;

        // تحديث نموذج الرحلة باستخدام معرف الشركة
        this.tripForm.patchValue({ companyId: this.companyId });

        // تحميل البيانات الأساسية بعد الحصول على معرف الشركة
        this.loadRoutes();
        this.loadDrivers();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error getting company ID:', error);
        this.errorMessage = 'Failed to get company ID. Using fallback method.';

        // استخدام الطريقة الاحتياطية إذا فشلت الطريقة الجديدة
        this.getUserDataFromLocalStorage();

        // تحميل البيانات الأساسية باستخدام معرف الشركة من localStorage
        if (this.companyId) {
          this.loadRoutes();
          this.loadDrivers();
        }

        this.isLoading = false;
      },
    });
  }

  getUserDataFromLocalStorage(): void {
    // هذه الآن طريقة احتياطية
    try {
      const userString = localStorage.getItem('user');

      if (userString) {
        const userData = JSON.parse(userString);
        if (userData && userData.companyId) {
          this.companyId = Number(userData.companyId);
          console.log(
            'CompanyId retrieved from localStorage fallback:',
            this.companyId
          );
          // تحديث نموذج الرحلة باستخدام معرف الشركة
          this.tripForm.patchValue({ companyId: this.companyId });
        }
      } else {
        console.warn(
          'No user data found in localStorage, might need to re-authenticate'
        );
        this.errorMessage = 'Authentication required. Please log in again.';
      }
    } catch (error) {
      console.error('Error retrieving user data from localStorage:', error);
    }
  }

  loadRoutes(): void {
    this.isLoading = true;

    // Check if companyId is available
    if (!this.companyId) {
      console.error('CompanyId is required but not available');
      this.errorMessage = 'Company ID is required to load routes';
      this.isLoading = false;
      return;
    }

    // Use getRoutesByCompanyId instead of getActiveRoutes
    this.routesService.getRoutesByCompanyId(this.companyId, 1, 100).subscribe({
      next: (response: PaginatedRoutesResponse) => {
        if (response.data && response.data.routes) {
          this.routes = response.data.routes;
        } else {
          this.routes = [];
        }
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error loading routes:', error);
        this.errorMessage = 'Failed to load routes';
        this.isLoading = false;
      },
    });
  }

  loadDrivers(): void {
    this.isLoading = true;

    // Check authentication status first
    this.checkAuthStatus();

    // Using the getAllDriversWithoutParams method
    this.driversService.getAllDriversWithoutParams().subscribe({
      next: (drivers: Driver[]) => {
        console.log('Drivers loaded successfully:', drivers);
        this.drivers = drivers;
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error loading drivers:', error);
        this.errorMessage = 'Failed to load drivers';
        this.isLoading = false;
      },
    });
  }

  // Helper method to check auth status and log token information
  private checkAuthStatus(): void {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      console.log('Auth check - Token available:', !!token);
      console.log('Auth check - User available:', !!user);

      if (!token) {
        console.warn('No authentication token found in localStorage');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    }
  }

  // Form array accessors
  get tripStations(): FormArray {
    return this.tripForm.get('tripStations') as FormArray;
  }

  addTripStation(): void {
    this.tripStations.push(this.createTripStationFormGroup());
  }

  removeTripStation(index: number): void {
    if (this.tripStations.length > 1) {
      this.tripStations.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.tripForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.tripForm.controls).forEach((key) => {
        const control = this.tripForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const tripData: TripCreateRequest = this.tripForm.value;

    this.tripsService.createTrip(tripData).subscribe({
      next: (response: ApiResponse) => {
        if (response && response.statusCode === 201) {
          this.tripCreated.emit(true);
          this.tripForm.reset();
          this.isSubmitting = false;
          // Reset form with default values
          this.tripForm = this.createTripForm();
        } else {
          this.errorMessage = response?.message || 'Failed to create trip';
          this.isSubmitting = false;
          this.tripCreated.emit(false);
        }
      },
      error: (error: Error) => {
        console.error('Error creating trip:', error);
        this.errorMessage = error.message || 'Failed to create trip';
        this.isSubmitting = false;
        this.tripCreated.emit(false);
      },
    });
  }

  // Helper methods for the view
  formatDateTime(date: string): string {
    return new Date(date).toLocaleString();
  }

  // Reset form to initial state
  resetForm(): void {
    this.tripForm.reset();
    // Reset the trip stations array
    while (this.tripStations.length !== 0) {
      this.tripStations.removeAt(0);
    }
    this.addTripStation();

    // Reset company ID
    if (this.companyId) {
      this.tripForm.patchValue({ companyId: this.companyId });
    }
  }
}
