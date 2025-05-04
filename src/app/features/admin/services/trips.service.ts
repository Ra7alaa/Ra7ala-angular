import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  Trip,
  PaginatedTripsResponse,
  TripCreateRequest,
  TripUpdateRequest,
} from '../models/trip.model';

export interface ApiResponse<T = unknown> {
  statusCode: number;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root',
})
export class TripsService {
  private apiUrl = `${environment.apiUrl}/api/Trips`;

  constructor(private http: HttpClient) {}

  // Get HTTP options with headers
  private getHttpOptions() {
    return {
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  // Get all trips (paginated)
  getAllTrips(page = 1, pageSize = 10): Observable<PaginatedTripsResponse> {
    return this.http
      .get<PaginatedTripsResponse>(
        `${this.apiUrl}/paginated?pageNumber=${page}&pageSize=${pageSize}`,
        this.getHttpOptions()
      )
      .pipe(catchError((error) => throwError(() => error)));
  }

  // Get paginated trips with companyId filter
  getTripsByCompanyId(
    companyId: number,
    page = 1,
    pageSize = 10
  ): Observable<PaginatedTripsResponse> {
    return this.http
      .get<PaginatedTripsResponse>(
        `${this.apiUrl}/paginated?companyId=${companyId}&pageNumber=${page}&pageSize=${pageSize}`,
        this.getHttpOptions()
      )
      .pipe(catchError((error) => throwError(() => error)));
  }

  // Get trip by ID
  getTripById(id: number): Observable<Trip> {
    return this.http
      .get<Trip>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(catchError((error) => throwError(() => error)));
  }

  // Create new trip
  createTrip(trip: TripCreateRequest): Observable<ApiResponse<Trip>> {
    return this.http
      .post<ApiResponse<Trip>>(`${this.apiUrl}`, trip, this.getHttpOptions())
      .pipe(catchError((error) => throwError(() => error)));
  }

  // Update trip
  updateTrip(
    id: number,
    trip: TripUpdateRequest
  ): Observable<ApiResponse<Trip>> {
    return this.http
      .put<ApiResponse<Trip>>(
        `${this.apiUrl}/${id}`,
        trip,
        this.getHttpOptions()
      )
      .pipe(catchError((error) => throwError(() => error)));
  }

  // Delete trip
  deleteTrip(id: number): Observable<boolean> {
    return this.http
      .delete<boolean>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(catchError((error) => throwError(() => error)));
  }
}
