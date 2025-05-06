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
import { Route, RouteStation } from '../../../../models/route.model';
import { RoutesService } from '../../../../services/routes.service';
import { Bus } from '../../../../models/bus.model';
import { BusesService } from '../../../../services/buses.service';
import { Driver } from '../../../../../../features/admin/models/driver.model';
import { DriversService } from '../../../../../../features/admin/services/drivers.service';
import { AuthService } from '../../../../../../features/auth/services/auth.service';
import { TranslationService } from '../../../../../../core/localization/translation.service';
import { LanguageService } from '../../../../../../core/localization/language.service';

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

  // Language and Direction
  isRtl = false;

  // Company ID
  companyId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private tripsService: TripsService,
    private routesService: RoutesService,
    private busesService: BusesService,
    private driversService: DriversService,
    private authService: AuthService,
    private translationService: TranslationService,
    private languageService: LanguageService
  ) {
    this.tripForm = this.createTripForm();
  }

  ngOnInit(): void {
    // Inicializar el servicio de traducción y dirección
    this.initializeLanguage();

    // استخدام الدالة الجديدة للحصول على معرف الشركة
    this.getCompanyIdAndInitialize();
  }

  // Inicializar configuraciones de idioma y dirección
  initializeLanguage(): void {
    // Detectar idioma actual
    const currentLanguage = this.languageService.getCurrentLanguage();
    this.isRtl = currentLanguage.rtl;

    // Suscribirse a cambios de idioma
    this.languageService.language$.subscribe((language) => {
      this.isRtl = language.rtl;
    });

    // Asegurar que las traducciones estén cargadas
    this.translationService.translations$.subscribe((translations) => {
      if (Object.keys(translations).length === 0) {
        this.translationService.reloadTranslations();
      }
    });
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

        // Load buses after getting company ID
        this.loadBuses();
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
          this.loadBuses();
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

    // Use getAllRoutes instead of getRoutesByCompanyId to get routes with their stations in sequence
    this.routesService.getAllRoutes(this.companyId).subscribe({
      next: (response) => {
        if (response.data && response.data.length > 0) {
          this.routes = response.data;
          console.log('Routes loaded with stations:', this.routes);
        } else {
          this.routes = [];
          console.log('No routes available for this company');
        }
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('Error loading routes:', error);
        this.errorMessage = this.translationService.translate(
          'admin.trips.routes_load_error'
        );
        this.isLoading = false;
      },
    });
  }

  loadBuses(): void {
    this.isLoading = true;

    if (!this.companyId) {
      console.error('CompanyId is required but not available');
      this.errorMessage = 'Company ID is required to load buses';
      this.isLoading = false;
      return;
    }

    this.busesService.getBusesByCompanyId(this.companyId).subscribe({
      next: (buses: Bus[]) => {
        if (buses) {
          this.buses = buses;
          console.log('Buses loaded:', this.buses);
        } else {
          this.buses = [];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading buses:', error);
        this.errorMessage = this.translationService.translate(
          'admin.trips.buses_load_error'
        );
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
        this.errorMessage = this.translationService.translate(
          'admin.trips.drivers_load_error'
        );
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

  // Helper method to get stations for the selected route
  getStationsForSelectedRoute(): RouteStation[] {
    const routeId = this.tripForm.get('routeId')?.value;
    if (!routeId) return [];

    const selectedRoute = this.routes.find(
      (route) => route.id === Number(routeId)
    );
    if (!selectedRoute || !selectedRoute.routeStations) return [];

    // Return sorted stations by sequence number
    return selectedRoute.routeStations.sort(
      (a, b) => a.sequenceNumber - b.sequenceNumber
    );
  }

  // Helper method to get station display name by ID
  getStationDisplayName(stationId: number): string {
    if (!stationId) return '';

    const stations = this.getStationsForSelectedRoute();
    const station = stations.find((s) => s.stationId === Number(stationId));

    if (station) {
      return `${station.stationName} (${station.cityName})`;
    }

    return (
      this.translationService.translate('admin.trips.station_placeholder') +
      ` #${stationId}`
    );
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

  // Method to handle route selection change
  onRouteChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const routeId = Number(selectElement.value);

    if (!routeId) return;

    // Find the selected route
    const selectedRoute = this.routes.find((route) => route.id === routeId);

    if (
      selectedRoute &&
      selectedRoute.routeStations &&
      selectedRoute.routeStations.length > 0
    ) {
      console.log('Selected route with stations:', selectedRoute);

      // Clear existing trip stations
      while (this.tripStations.length !== 0) {
        this.tripStations.removeAt(0);
      }

      // Add trip stations based on the route's stations with their sequence numbers
      selectedRoute.routeStations
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber) // Sort by sequence number
        .forEach((station) => {
          const stationGroup = this.fb.group({
            stationId: [station.stationId, Validators.required],
            sequenceNumber: [station.sequenceNumber, Validators.required],
            arrivalTime: [''],
            departureTime: ['', Validators.required],
          });

          this.tripStations.push(stationGroup);
        });

      console.log(
        'Trip stations updated based on route:',
        this.tripStations.value
      );
    } else {
      console.warn('Selected route has no stations or is invalid');
      // Ensure at least one empty station form exists
      if (this.tripStations.length === 0) {
        this.addTripStation();
      }
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
          this.errorMessage =
            response?.message ||
            this.translationService.translate('admin.trips.create_failed');
          this.isSubmitting = false;
          this.tripCreated.emit(false);
        }
      },
      error: (error: Error) => {
        console.error('Error creating trip:', error);
        this.errorMessage =
          error.message ||
          this.translationService.translate('admin.trips.create_failed');
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
