import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormsModule,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { TranslatePipe } from '../../../../../../features/settings/pipes/translate.pipe';
import { RouteCreateRequest } from '../../../../models/route.model';
import { RoutesService } from '../../../../services/routes.service';
import {
  CitiesService,
  City,
  Station,
} from '../../../../services/cities.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

// Define interfaces to fix TypeScript errors
interface StationFormValue {
  stationId: number;
  sequenceNumber: number;
}

@Component({
  selector: 'app-route-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './route-create.component.html',
  styleUrl: './route-create.component.css',
})
export class RouteCreateComponent implements OnInit {
  @Output() routeCreated = new EventEmitter<boolean>();

  routeForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;

  // Get companyId from localStorage
  private companyId: number = Number(localStorage.getItem('companyId')) || 1;

  // Cities from API
  cityOptions: City[] = [];
  isLoadingCities = false;

  // Stations for selected cities
  startCityStationsData: Station[] = [];
  endCityStationsData: Station[] = [];
  isLoadingStations = false;

  // Dropdown visibility flags
  startCityDropdownOpen = false;
  endCityDropdownOpen = false;
  startStationDropdownOpen = false;
  endStationDropdownOpen = false;

  // Selected city and station display
  selectedStartCity: City | null = null;
  selectedEndCity: City | null = null;

  constructor(
    private routesService: RoutesService,
    private citiesService: CitiesService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadCities();

    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
      if (!(event.target as HTMLElement).closest('.dropdown-container')) {
        this.startCityDropdownOpen = false;
        this.endCityDropdownOpen = false;
        this.startStationDropdownOpen = false;
        this.endStationDropdownOpen = false;
      }
    });
  }

  // Initialize form
  initializeForm(): void {
    this.routeForm = this.fb.group(
      {
        name: ['', Validators.required],
        startCityId: [null, Validators.required],
        endCityId: [null, Validators.required],
        distance: ['', [Validators.required, Validators.min(1)]],
        durationHours: ['', [Validators.required, Validators.min(0)]],
        durationMinutes: [
          '',
          [Validators.required, Validators.min(0), Validators.max(59)],
        ],
        isActive: [true],
        startCityStations: this.fb.array([]),
        endCityStations: this.fb.array([]),
      },
      { validators: this.differentCitiesValidator }
    );
  }

  // Get FormArrays for stations
  get startCityStations(): FormArray {
    return this.routeForm.get('startCityStations') as FormArray;
  }

  get endCityStations(): FormArray {
    return this.routeForm.get('endCityStations') as FormArray;
  }

  // Load cities from API
  loadCities(): void {
    this.isLoadingCities = true;
    this.citiesService
      .getAllCities()
      .pipe(finalize(() => (this.isLoadingCities = false)))
      .subscribe({
        next: (cities) => {
          this.cityOptions = cities;
          console.log('Cities loaded:', this.cityOptions);
        },
        error: (error) => {
          console.error('Error loading cities:', error);
          this.error = 'Failed to load cities. Please try refreshing the page.';
        },
      });
  }

  // Toggle city dropdown visibility
  toggleCityDropdown(type: 'start' | 'end', event: Event): void {
    event.stopPropagation();
    if (type === 'start') {
      this.startCityDropdownOpen = !this.startCityDropdownOpen;
      this.endCityDropdownOpen = false;
    } else {
      this.endCityDropdownOpen = !this.endCityDropdownOpen;
      this.startCityDropdownOpen = false;
    }
    this.startStationDropdownOpen = false;
    this.endStationDropdownOpen = false;
  }

  // Toggle station dropdown visibility
  toggleStationDropdown(type: 'start' | 'end', event: Event): void {
    event.stopPropagation();
    if (type === 'start') {
      this.startStationDropdownOpen = !this.startStationDropdownOpen;
      this.endStationDropdownOpen = false;
    } else {
      this.endStationDropdownOpen = !this.endStationDropdownOpen;
      this.startStationDropdownOpen = false;
    }
    this.startCityDropdownOpen = false;
    this.endCityDropdownOpen = false;
  }

  // Handle keyboard events for accessibility
  handleKeyDown(event: KeyboardEvent, callback: () => void): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      callback();
    }
  }

  // Select a city and load its stations
  selectCity(city: City, type: 'start' | 'end'): void {
    if (type === 'start') {
      this.selectedStartCity = city;
      this.routeForm.get('startCityId')?.setValue(city.id);
      this.startCityDropdownOpen = false;
      this.loadStationsForCity(city.id, 'start');
    } else {
      this.selectedEndCity = city;
      this.routeForm.get('endCityId')?.setValue(city.id);
      this.endCityDropdownOpen = false;
      this.loadStationsForCity(city.id, 'end');
    }
  }

  // Load stations for a selected city
  loadStationsForCity(cityId: number, type: 'start' | 'end'): void {
    this.isLoadingStations = true;

    // Reset the stations FormArray
    if (type === 'start') {
      this.clearStations(this.startCityStations);
      this.startCityStationsData = [];
    } else {
      this.clearStations(this.endCityStations);
      this.endCityStationsData = [];
    }

    this.citiesService
      .getCityWithStations(cityId, this.companyId)
      .pipe(finalize(() => (this.isLoadingStations = false)))
      .subscribe({
        next: (cityWithStations) => {
          const stations = cityWithStations.stations || [];
          console.log(
            `Loaded ${stations.length} stations for ${type} city:`,
            stations
          );

          if (type === 'start') {
            this.startCityStationsData = stations;
          } else {
            this.endCityStationsData = stations;
          }
        },
        error: (error) => {
          console.error(`Error loading ${type} city stations:`, error);
          this.error = `Failed to load stations for the ${type} city.`;

          if (type === 'start') {
            this.startCityStationsData = [];
          } else {
            this.endCityStationsData = [];
          }
        },
      });
  }

  // Select a station for the route
  selectStation(station: Station, type: 'start' | 'end'): void {
    const stationsArray =
      type === 'start' ? this.startCityStations : this.endCityStations;

    // Check if station is already selected
    const existingIndex = this.findStationIndex(stationsArray, station.id);

    if (existingIndex !== -1) {
      // If already selected, remove it
      stationsArray.removeAt(existingIndex);
    } else {
      // If not selected, add it with the next sequence number
      stationsArray.push(
        this.fb.group({
          stationId: [station.id, Validators.required],
          sequenceNumber: [stationsArray.length + 1, Validators.required],
        })
      );
    }

    // Update sequence numbers
    this.updateSequenceNumbers(stationsArray);
  }

  // Find index of a station in the FormArray
  findStationIndex(stationsArray: FormArray, stationId: number): number {
    for (let i = 0; i < stationsArray.length; i++) {
      const currentId = stationsArray.at(i).get('stationId')?.value;
      if (currentId === stationId) {
        return i;
      }
    }
    return -1;
  }

  // Check if a station is selected
  isStationSelected(stationId: number, type: 'start' | 'end'): boolean {
    const stationsArray =
      type === 'start' ? this.startCityStations : this.endCityStations;
    return this.findStationIndex(stationsArray, stationId) !== -1;
  }

  // Get selected stations for display
  getSelectedStations(type: 'start' | 'end'): Station[] {
    const stationsArray =
      type === 'start' ? this.startCityStations : this.endCityStations;
    const stationsData =
      type === 'start' ? this.startCityStationsData : this.endCityStationsData;

    const result: Station[] = [];

    for (let i = 0; i < stationsArray.length; i++) {
      const stationId = stationsArray.at(i).get('stationId')?.value;
      const station = stationsData.find((s) => s.id === stationId);
      if (station) {
        result.push(station);
      }
    }

    // Sort by sequence number
    return result.sort((a, b) => {
      const aIndex = this.findStationIndex(stationsArray, a.id);
      const bIndex = this.findStationIndex(stationsArray, b.id);
      return (
        (stationsArray.at(aIndex).get('sequenceNumber')?.value || 0) -
        (stationsArray.at(bIndex).get('sequenceNumber')?.value || 0)
      );
    });
  }

  // Clear stations from a FormArray
  clearStations(stationsArray: FormArray): void {
    while (stationsArray.length) {
      stationsArray.removeAt(0);
    }
  }

  // Update sequence numbers after a station is removed
  updateSequenceNumbers(stationsArray: FormArray): void {
    for (let i = 0; i < stationsArray.length; i++) {
      stationsArray
        .at(i)
        .get('sequenceNumber')
        ?.setValue(i + 1);
    }
  }

  // Validator to ensure start and end cities are different
  differentCitiesValidator(group: AbstractControl): ValidationErrors | null {
    const startCity = group.get('startCityId')?.value;
    const endCity = group.get('endCityId')?.value;

    if (startCity && endCity && startCity === endCity) {
      return { sameCities: true };
    }

    return null;
  }

  // Create new route
  createRoute(): void {
    if (this.routeForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.routeForm.controls).forEach((key) => {
        this.routeForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const formValues = this.routeForm.value;

    // Convert hours and minutes to seconds for the API
    const hours = Number(formValues.durationHours) || 0;
    const minutes = Number(formValues.durationMinutes) || 0;
    const estimatedDurationInSeconds = hours * 60 + minutes;

    // Process station sequences
    const startCityStationIds = formValues.startCityStations.map(
      (station: StationFormValue) => ({
        stationId: Number(station.stationId),
        sequenceNumber: Number(station.sequenceNumber),
      })
    );

    const endCityStationIds = formValues.endCityStations.map(
      (station: StationFormValue) => ({
        stationId: Number(station.stationId),
        sequenceNumber: Number(station.sequenceNumber),
      })
    );

    // Create request object
    const routeRequest: RouteCreateRequest = {
      name: formValues.name,
      startCityId: Number(formValues.startCityId),
      startCityName: this.selectedStartCity?.name || '',
      endCityId: Number(formValues.endCityId),
      endCityName: this.selectedEndCity?.name || '',
      distance: Number(formValues.distance),
      durationHours: Number(formValues.durationHours),
      durationMinutes: Number(formValues.durationMinutes),
      estimatedDuration: estimatedDurationInSeconds,
      isActive: Boolean(formValues.isActive),
      companyId: this.companyId,
      startCityStationIds:
        startCityStationIds.length > 0 ? startCityStationIds : undefined,
      endCityStationIds:
        endCityStationIds.length > 0 ? endCityStationIds : undefined,
    };

    console.log('Creating route with data:', routeRequest);

    this.routesService.createRoute(routeRequest).subscribe({
      next: (response) => {
        console.log('Route created successfully:', response);
        this.resetForm();
        this.isSubmitting = false;
        this.routeCreated.emit(true);

        // Close the modal
        const closeBtn = document.getElementById('closeAddRouteModal');
        if (closeBtn) {
          (closeBtn as HTMLElement).click();
        }
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error creating route:', err);
        this.error = 'Failed to create route. Please try again.';
        this.isSubmitting = false;
        this.routeCreated.emit(false);
      },
    });
  }

  // Reset form
  resetForm(): void {
    this.routeForm.reset();
    this.clearStations(this.startCityStations);
    this.clearStations(this.endCityStations);
    this.routeForm.patchValue({
      isActive: true,
    });
    this.selectedStartCity = null;
    this.selectedEndCity = null;
    this.startCityStationsData = [];
    this.endCityStationsData = [];
    this.error = null;
  }

  // Get formatted station names for display in the UI
  getStationDisplayString(type: 'start' | 'end'): string {
    const selectedStations = this.getSelectedStations(type);
    if (selectedStations.length === 0) {
      return type === 'start'
        ? 'Select departure stations'
        : 'Select arrival stations';
    }

    if (selectedStations.length <= 2) {
      return selectedStations.map((s) => s.name).join(', ');
    }

    return `${selectedStations.length} stations selected`;
  }
}
