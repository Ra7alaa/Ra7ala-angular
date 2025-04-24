import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of, throwError } from 'rxjs';
import {
  Station,
  StationCreateRequest,
  StationUpdateRequest,
} from '../models/station.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StationsService {
  private apiUrl = `${environment.apiUrl}/api/Station`;

  // Mock data for development
  private mockStations: Station[] = [
    {
      id: 1,
      name: 'Cairo Main Station',
      latitude: 30.0444,
      longitude: 31.2357,
      cityName: 'Cairo',
      isSystemOwned: true,
      companyId: 0,
    },
    {
      id: 2,
      name: 'Alexandria Station',
      latitude: 31.2001,
      longitude: 29.9187,
      cityName: 'Alexandria',
      isSystemOwned: true,
      companyId: 0,
    },
    {
      id: 3,
      name: 'Sharm El Sheikh Station',
      latitude: 27.9158,
      longitude: 34.33,
      cityName: 'Sharm El Sheikh',
      isSystemOwned: false,
      companyName: 'Eastern Tourism Company',
      companyId: 5,
    },
  ];

  constructor(private http: HttpClient) {}

  // Get HTTP options with headers
  private getHttpOptions() {
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
      }),
    };
  }

  // Get all stations
  getAllStations(): Observable<Station[]> {
    // Use mock data if specified in environment
    if (environment.useMockData) {
      return of(this.mockStations);
    }

    // Use API if not using mock data
    return this.http.get<Station[]>(this.apiUrl, this.getHttpOptions()).pipe(
      map((stations) => {
        // Ensure isSystemOwned is set correctly based on companyId
        return stations.map((station) => {
          station.isSystemOwned = station.companyId === null;
          return station;
        });
      }),
      catchError((error) => {
        console.error('Error fetching stations', error);
        return throwError(() => new Error('Failed to load stations'));
      })
    );
  }

  // Get station by ID
  getStationById(id: number): Observable<Station> {
    // Use mock data if specified in environment
    if (environment.useMockData) {
      const station = this.mockStations.find((s) => s.id === id);
      if (station) {
        return of(station);
      }
      return throwError(() => new Error('Station not found'));
    }

    // Use API if not using mock data
    return this.http
      .get<Station>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        catchError((error) => {
          console.error(`Error fetching station`, error);
          return throwError(() => new Error('Failed to load station details'));
        })
      );
  }

  // Create new station
  createStation(station: StationCreateRequest): Observable<Station> {
    // Check if companyId is null and set isSystemOwned accordingly
    if (station.companyId === null) {
      station.isSystemOwned = true;
    } else if (station.isSystemOwned) {
      station.companyId = 0;
    }

    // Use mock data if specified in environment
    if (environment.useMockData) {
      const newStation: Station = {
        ...station,
        id:
          this.mockStations.length > 0
            ? Math.max(...this.mockStations.map((s) => s.id || 0)) + 1
            : 1,
      };
      this.mockStations.push(newStation);
      return of(newStation);
    }

    // Use API if not using mock data
    return this.http
      .post<Station>(this.apiUrl, station, this.getHttpOptions())
      .pipe(
        catchError((error) => {
          console.error('Error creating station', error);
          return throwError(() => new Error('Failed to create station'));
        })
      );
  }

  // Update station
  updateStation(station: Station | StationUpdateRequest): Observable<Station> {
    // Make sure we have an ID
    if (!station.id) {
      return throwError(() => new Error('Station ID is required for updates'));
    }

    // Check if companyId is null and set isSystemOwned accordingly
    if (station.companyId === null) {
      station.isSystemOwned = true;
      station.companyId = 0; // Ensure companyId is 0 for system-owned stations
    }

    // Use mock data if specified in environment
    if (environment.useMockData) {
      const index = this.mockStations.findIndex((s) => s.id === station.id);
      if (index !== -1) {
        const updatedStation = { ...this.mockStations[index], ...station };
        this.mockStations[index] = updatedStation;
        return of(updatedStation);
      }
      return throwError(() => new Error('Station not found'));
    }

    // Use API if not using mock data
    return this.http
      .put<Station>(
        `${this.apiUrl}/${station.id}`,
        station,
        this.getHttpOptions()
      )
      .pipe(
        catchError((error) => {
          console.error(`Error updating station`, error);
          return throwError(() => new Error('Failed to update station'));
        })
      );
  }

  // Delete station
  deleteStation(id: number): Observable<boolean> {
    // Use mock data if specified in environment
    if (environment.useMockData) {
      const index = this.mockStations.findIndex((s) => s.id === id);
      if (index !== -1) {
        this.mockStations.splice(index, 1);
        return of(true);
      }
      return throwError(() => new Error('Station not found'));
    }

    // Use API if not using mock data
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        map(() => true),
        catchError((error) => {
          console.error(`Error deleting station`, error);
          return throwError(() => new Error('Failed to delete station'));
        })
      );
  }

  // Get stations by ownership (system or company)
  getStationsByOwnership(isSystemOwned: boolean): Observable<Station[]> {
    // Use mock data if specified in environment
    if (environment.useMockData) {
      return of(
        this.mockStations.filter((s) => s.isSystemOwned === isSystemOwned)
      );
    }

    // Use API if not using mock data
    const url = `${this.apiUrl}?isSystemOwned=${isSystemOwned}`;
    return this.http.get<Station[]>(url, this.getHttpOptions()).pipe(
      catchError((error) => {
        console.error(`Error fetching stations by ownership`, error);
        return throwError(() => new Error('Failed to load stations'));
      })
    );
  }
}
