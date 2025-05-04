import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface SearchRequest {
  startCityId: number;
  endCityId: number;
  departureDate: string;
  requiredSeats: number;
}

export interface TripStation {
  sequenceNumber: number;
  stationName: string;
  cityName: string;
  arrivalTime: string;
  departureTime: string;
}

export interface Trip {
  routeName: string;
  departureTime: string;
  arrivalTime: string;
  driverName: string;
  driverPhoneNumber: string;
  busRegistrationNumber: string;
  companyName: string;
  price: number;
  availableSeats: number;
  tripStations: TripStation[];
}

export interface SearchResponse {
  statusCode: number;
  message: string;
  data: Trip[];
}

@Injectable({
  providedIn: 'root'
})
export class TripsSearchService {
  private apiUrl = `https://localhost:7111/api/Trips/search`;

  constructor(private http: HttpClient) { }

  searchTrips(request: SearchRequest): Observable<SearchResponse> {
    console.log('Search Request:', request);
    return this.http.post<SearchResponse>(`${this.apiUrl}`, request).pipe(
      tap(response => console.log('Search Response:', response))
    );
  }
}
