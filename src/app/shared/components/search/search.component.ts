/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../features/settings/pipes/translate.pipe';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import {
  TripsSearchService,
  SearchRequest,
} from '../../services/trips-search.service';
import {
  CitiesService,
  City,
} from '../../../features/admin/services/cities.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarModule,
    InputNumberModule,
    FloatLabelModule,
    TranslatePipe,
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  [x: string]: any;
  searchForm: FormGroup;
  isLoading = false;
  minDate = new Date(5/5/2025);
  cities: City[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tripsSearchService: TripsSearchService,
    private citiesService: CitiesService
  ) {
    this.searchForm = this.fb.group({
      startCityId: [null, Validators.required],
      endCityId: [null, Validators.required],
      departureDate: [null, Validators.required],
      requiredSeats: [
        1,
        [Validators.required, Validators.min(1), Validators.max(10)],
      ],
    });
  }

  ngOnInit(): void {
    this.loadCities();
  }

  loadCities(): void {
    this.citiesService.getAllCities().subscribe({
      next: (cities) => {
        this.cities = cities;
      },
      error: (error) => {
        console.error('Error loading cities:', error);
      },
    });
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      Object.keys(this.searchForm.controls).forEach((key) => {
        const control = this.searchForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading = true;
    const formValues = this.searchForm.value;

    // Add one day to the departure date
    const departureDate = new Date(formValues.departureDate);
    departureDate.setDate(departureDate.getDate() + 1);

    const searchRequest: SearchRequest = {
      startCityId: formValues.startCityId,
      endCityId: formValues.endCityId,
      departureDate: departureDate.toISOString(),
      requiredSeats: formValues.requiredSeats,
    };

    this.tripsSearchService.searchTrips(searchRequest).subscribe({
      next: (response) => {
        // Always navigate to book-trips page regardless of whether trips are found or not
        this.router.navigate(['/book-trips'], {
          state: {
            trips: response.data || [],
            searchParams: searchRequest,
          },
        });
      },
      error: (error) => {
        console.error('Search error:', error);
        // In case of error, still navigate but with empty trips array
        this.router.navigate(['/book-trips'], {
          state: {
            trips: [],
            searchParams: searchRequest,
            error: true,
          },
        });
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }
}
