/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TripData } from '../../../../shared/services/trip-results.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';

@Component({
  selector: 'app-book-trips',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterModule],
  template: `
    <div class="container py-4">
      <h2 class="mb-4">{{ 'available_trips' | translate }}</h2>

      <div class="row g-4">
        <div *ngFor="let trip of trips" class="col-12">
          <div class="card shadow-sm">
            <div class="card-body">
              <div class="row">
                <!-- Trip Info -->
                <div class="col-md-8">
                  <h3 class="card-title h5">{{trip.routeName}}</h3>
                  <div class="d-flex gap-4 mb-3">
                    <div>
                      <small class="text-muted">{{ 'departure' | translate }}</small>
                      <p class="mb-0">{{departureTime | date:'medium'}}</p>
                    </div>
                    <div>
                      <small class="text-muted">{{ 'arrival' | translate }}</small>
                      <p class="mb-0">{{arrivalTime | date:'medium'}}</p>
                    </div>
                  </div>

                  <div class="mb-3">
                    <small class="text-muted">{{ 'trips.stations' | translate }}</small>
                    <div class="d-flex flex-wrap gap-2">
                      <ng-container *ngFor="let station of trip.tripStations; let last = last">
                        <span>{{station.stationName}} ({{station.cityName}})</span>
                        <i *ngIf="!last" class="bi bi-arrow-right"></i>
                      </ng-container>
                    </div>
                  </div>

                  <div class="d-flex gap-4">
                    <div>
                      <small class="text-muted">{{ 'driver' | translate }}</small>
                      <p class="mb-0">{{driverName}} - {{trip.driverPhoneNumber}}</p>
                    </div>
                    <div>
                      <small class="text-muted">{{ 'bus' | translate }}</small>
                      <p class="mb-0">{{busRegistrationNumber}}</p>
                    </div>
                    <div>
                      <small class="text-muted">{{ 'company' | translate }}</small>
                      <p class="mb-0">{{companyName}}</p>
                    </div>
                  </div>
                </div>

                <!-- Price and Booking -->
                <div class="col-md-4 border-start">
                  <div class="text-center">
                    <h4 class="mb-3">{{price | currency:'EGP':'symbol':'1.0-0'}}</h4>
                    <p class="text-muted mb-3">
                      {{ 'available_seats' | translate }}: {{availableSeats}}
                    </p>
                    <button class="btn btn-primary w-100" [disabled]="trip.availableSeats === 0"
                            [routerLink]="['/booking', trip.id]">
                      {{ 'book_now' | translate }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- No Results -->
        <div *ngIf="trips.length === 0" class="col-12 text-center py-5">
          <i class="bi bi-emoji-frown display-1"></i>
          <h3 class="mt-3">{{ 'no_trips_found' | translate }}</h3>
          <p class="text-muted">{{ 'try_different_search' | translate }}</p>
          <button class="btn btn-primary" (click)="goBack()">
            {{ 'common.back' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .bi-arrow-right {
      color: #6c757d;
      font-size: 0.8rem;
      margin: 0 0.5rem;
    }
  `]
})
export class BookTripsComponent implements OnInit {
  trips: TripData[] = [];
driverName: any;
busRegistrationNumber: any;
companyName: any;
  price!: string | number;
availableSeats: any;
  departureTime!: string | number | Date;
  arrivalTime!: string | number | Date;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state?.['trips']) {
      this.trips = navigation.extras.state['trips'];
    }
  }

  ngOnInit(): void {
    if (this.trips.length === 0) {
      this.goBack();
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
