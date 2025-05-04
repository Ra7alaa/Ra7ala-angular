import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StationsService } from '../../../services/stations.service';
import { StationCreateRequest } from '../../../models/station.model';
import { AuthService } from '../../../../auth/services/auth.service';
import { User } from '../../../../auth/models/user.model';
import { TranslatePipe } from '../../../../../features/settings/pipes/translate.pipe';
import { TranslationService } from '../../../../../core/localization/translation.service';
import { CitiesService, City } from '../../../services/cities.service';

@Component({
  selector: 'app-station-create',
  templateUrl: './station-create.component.html',
  styleUrls: ['./station-create.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe,
  ],
})
export class StationCreateComponent implements OnInit {
  stationForm: FormGroup;
  loading = false;
  loadingCities = false;
  error: string | null = null;
  currentUser: User | null = null;
  cities: City[] = [];
  selectedCity: City | null = null;

  constructor(
    private fb: FormBuilder,
    private stationsService: StationsService,
    private citiesService: CitiesService,
    private authService: AuthService,
    private router: Router,
    private translateService: TranslationService
  ) {
    this.stationForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      latitude: [
        30.0444,
        [Validators.required, Validators.min(-90), Validators.max(90)],
      ],
      longitude: [
        31.2357,
        [Validators.required, Validators.min(-180), Validators.max(180)],
      ],
      cityId: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    console.log('Current user:', this.currentUser);

    this.loadCities();

    this.stationForm.get('cityId')?.valueChanges.subscribe((cityId) => {
      if (cityId) {
        this.updateSelectedCity(cityId);
      }
    });
  }

  loadCities(): void {
    this.loadingCities = true;
    console.log('Loading cities...');

    this.citiesService.getAllCities().subscribe({
      next: (cities) => {
        console.log('Cities loaded successfully:', cities);
        this.cities = cities;
        this.loadingCities = false;
      },
      error: (err) => {
        console.error('Error loading cities:', err);
        this.error =
          this.translateService.translate('admin.stations.cities_load_error') ||
          'Failed to load cities. Please try again.';
        this.loadingCities = false;
      },
    });
  }

  updateSelectedCity(cityId: number): void {
    this.selectedCity =
      this.cities.find((city) => city.id === Number(cityId)) || null;
  }

  onSubmit(): void {
    Object.keys(this.stationForm.controls).forEach((key) => {
      this.stationForm.get(key)?.markAsTouched();
    });

    if (this.stationForm.invalid) {
      console.log('Form is invalid:', this.stationForm.errors);
      return;
    }

    if (!this.currentUser || !this.currentUser.companyId) {
      this.error = 'User information is missing. Cannot create station.';
      console.error('Current user or companyId is missing:', this.currentUser);
      return;
    }

    if (!this.selectedCity) {
      this.error = 'Please select a valid city first.';
      return;
    }

    this.loading = true;
    this.error = null;

    const formValue = this.stationForm.value;

    const stationData: StationCreateRequest = {
      name: formValue.name,
      latitude: Number(formValue.latitude),
      longitude: Number(formValue.longitude),
      cityId: Number(formValue.cityId),
      cityName: this.selectedCity.name,
      companyId: Number(this.currentUser.companyId),
    };

    console.log('Creating station with data:', stationData);

    this.stationsService.createStation(stationData).subscribe({
      next: (result) => {
        console.log('Station created successfully:', result);
        this.loading = false;
        this.router.navigate(['/admin/stations']);
      },
      error: (err) => {
        console.error('Error creating station:', err);
        this.error =
          this.translateService.translate(
            'admin.stations.create_station.error'
          ) +
          ': ' +
          (err.message || 'Unknown error');
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/stations']);
  }

  get name() {
    return this.stationForm.get('name');
  }
  get latitude() {
    return this.stationForm.get('latitude');
  }
  get longitude() {
    return this.stationForm.get('longitude');
  }
  get cityId() {
    return this.stationForm.get('cityId');
  }
}
