import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface TripSearchResponse {
  statusCode: number;
  message: string;
  data: TripData[];
}

export interface TripData {
  id: number;
  routeId: number;
  routeName: string;
  departureTime: string;
  arrivalTime: string;
  driverId: string;
  driverName: string;
  driverPhoneNumber: string;
  busId: number;
  busRegistrationNumber: string;
  isCompleted: boolean;
  availableSeats: number;
  companyId: number;
  companyName: string;
  price: number;
  tripStations: TripStation[];
}

export interface TripStation {
  stationId: number;
  stationName: string;
  cityId: number;
  cityName: string;
  sequenceNumber: number;
  arrivalTime: string | null;
  departureTime: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TripResultsService {
  private searchResultsSubject = new BehaviorSubject<TripSearchResponse | null>(null);
  searchResults$ = this.searchResultsSubject.asObservable();

  setSearchResults(results: TripSearchResponse): void {
    this.searchResultsSubject.next(results);
  }

  getSearchResults(): Observable<TripSearchResponse | null> {
    return this.searchResults$;
  }

  clearResults(): void {
    this.searchResultsSubject.next(null);
  }
}
