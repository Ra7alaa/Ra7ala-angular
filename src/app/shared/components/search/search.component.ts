/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../../features/settings/pipes/translate.pipe';
import { CalendarModule } from 'primeng/calendar';
import { InputNumberModule } from 'primeng/inputnumber';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TripsSearchService, SearchRequest } from '../../services/trips-search.service';
import { CitiesService, City } from '../../../features/admin/services/cities.service';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CalendarModule,
    InputNumberModule,
    FloatLabelModule,
    TranslatePipe
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
[x: string]: any;
  searchForm: FormGroup;
  isLoading = false;
  minDate = new Date();
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
      requiredSeats: [1, [Validators.required, Validators.min(1), Validators.max(10)]]
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
      }
    });
  }

  onSearch(): void {
    if (this.searchForm.invalid) {
      Object.keys(this.searchForm.controls).forEach(key => {
        const control = this.searchForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isLoading = true;
    const formValues = this.searchForm.value;

    const searchRequest: SearchRequest = {
      startCityId: formValues.startCityId,
      endCityId: formValues.endCityId,
      departureDate: new Date(formValues.departureDate).toISOString(),
      requiredSeats: formValues.requiredSeats
    };

    this.tripsSearchService.searchTrips(searchRequest).subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          this.router.navigate(['/book-trips'], {
            state: { trips: response.data }
          });
        }
      },
      error: (error) => {
        console.error('Search error:', error);
        // Handle error - show error message to user
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}
