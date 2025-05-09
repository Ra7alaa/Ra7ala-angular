/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CityService, City } from '../../../../shared/services/city.service';
import { TripsSearchService, SearchResponse } from '../../../../shared/services/trips-search.service';
import { TripResultsService, TripSearchResponse } from '../../../../shared/services/trip-results.service';

@Component({
  selector: 'app-trip-search',
  templateUrl: './trip-search.component.html',
  styleUrls: ['./trip-search.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class TripSearchComponent implements OnInit {
  searchForm: FormGroup;
  cities: City[] = [];
  isLoading = false;
  searchResults: any;

  constructor(
    private fb: FormBuilder,
    private cityService: CityService,
    private tripsSearchService: TripsSearchService,
    private tripResultsService: TripResultsService,
    private router: Router
  ) {
    console.log('Initializing trip search form');
    this.searchForm = this.fb.group({
      startCityId: ['', Validators.required],
      endCityId: ['', Validators.required],
      departureDate: ['', Validators.required],
      requiredSeats: [1, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadCities();
  }

  loadCities(): void {
    console.log('Loading cities...');
    this.cityService.getAllCities().subscribe({
      next: (cities) => {
        console.log('Cities loaded:', cities);
        this.cities = cities;
      },
      error: (error) => {
        console.error('Error loading cities:', error);
      }
    });
  }

  onSubmit(): void {
    if (this.searchForm.valid) {
      console.log('Form submitted with values:', this.searchForm.value);
      this.isLoading = true;

      const formData = {
        startCityId: Number(this.searchForm.value.startCityId),  // Convert to number
        endCityId: Number(this.searchForm.value.endCityId),      // Convert to number
        departureDate: new Date(this.searchForm.value.departureDate + 1).toISOString(),
        requiredSeats: this.searchForm.value.requiredSeats
      };

      console.log('Sending search request with data:', formData);
      this.tripsSearchService.searchTrips(formData).subscribe({
        next: (response: SearchResponse) => {
          console.log('Search response received:', response);
          this.isLoading = false;
          const tripSearchResponse: TripSearchResponse = {
            statusCode: response.statusCode,
            message: response.message,
            data: response.data.map(trip => ({
              id: 0,
              routeId: 0,
              routeName: trip.routeName,
              departureTime: trip.departureTime,
              arrivalTime: trip.arrivalTime,
              driverId: '',
              driverName: trip.driverName,
              driverPhoneNumber: trip.driverPhoneNumber,
              busId: 0,
              busRegistrationNumber: trip.busRegistrationNumber,
              isCompleted: false,
              availableSeats: trip.availableSeats,
              companyId: 0,
              companyName: trip.companyName,
              price: trip.price,
              tripStations: trip.tripStations.map(station => ({
                stationId: 0,
                stationName: station.stationName,
                cityId: 0,
                cityName: station.cityName,
                sequenceNumber: station.sequenceNumber,
                arrivalTime: station.arrivalTime,
                departureTime: station.departureTime
              }))
            }))
          };
          this.tripResultsService.setSearchResults(tripSearchResponse);
          this.router.navigate(['/trips/results']);
        },
        error: (error) => {
          console.error('Error searching trips:', error);
          this.isLoading = false;
        }
      });
    } else {
      console.log('Form is invalid:', this.searchForm.errors);
    }
  }
}
