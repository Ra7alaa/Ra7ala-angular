import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  Station,
  StationCreateRequest,
  StationUpdateRequest,
} from '../models/station.model';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class StationsService {
  private apiUrl = `${environment.apiUrl}/api/Station`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHttpOptions() {
    const currentUser = this.authService.getCurrentUser();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    if (currentUser && currentUser.token) {
      return {
        headers: headers.set('Authorization', `Bearer ${currentUser.token}`),
      };
    }

    return { headers };
  }

  getAllStations(): Observable<Station[]> {
    const currentUser = this.authService.getCurrentUser();
    const companyId = currentUser?.companyId;

    const endpoint = companyId
      ? `${this.apiUrl}/system-and-company/${companyId}`
      : this.apiUrl;

    return this.http.get<Station[]>(endpoint, this.getHttpOptions()).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error fetching stations', error);
        return throwError(() => new Error('Failed to load stations'));
      })
    );
  }

  getStationById(id: number): Observable<Station> {
    return this.http
      .get<Station>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        catchError((error) => {
          console.error(`Error fetching station`, error);
          return throwError(() => new Error('Failed to load station details'));
        })
      );
  }

  createStation(station: StationCreateRequest): Observable<Station> {
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser?.companyId) {
      return throwError(
        () => new Error('Company ID is required to create a station')
      );
    }

    if (!station.cityName) {
      return throwError(
        () => new Error('City name is required to create a station')
      );
    }

    const batchRequest = [
      {
        name: station.name,
        latitude: Number(station.latitude),
        longitude: Number(station.longitude),
        cityId: Number(station.cityId),
        cityName: station.cityName,
        companyId: Number(currentUser.companyId),
      },
    ];

    console.log('Creating station using batch endpoint:', batchRequest);

    return this.http
      .post<Station[]>(
        `${this.apiUrl}/company/batch`,
        batchRequest,
        this.getHttpOptions()
      )
      .pipe(
        map((stations) => {
          if (stations && stations.length > 0) {
            console.log('Station created successfully:', stations[0]);
            return stations[0];
          }
          throw new Error('No station returned from creation');
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error creating station:', error);
          let errorMessage = 'Failed to create station';

          if (error.error && typeof error.error === 'string') {
            errorMessage += ': ' + error.error;
          } else if (error.error?.message) {
            errorMessage += ': ' + error.error.message;
          } else if (error.message) {
            errorMessage += ': ' + error.message;
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  updateStation(station: Station | StationUpdateRequest): Observable<Station> {
    if (!station.id) {
      return throwError(() => new Error('Station ID is required for updates'));
    }

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

  deleteStation(id: number): Observable<boolean> {
    return this.http
      .delete<Station>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        map(() => true),
        catchError((error) => {
          console.error(`Error deleting station`, error);
          return throwError(() => new Error('Failed to delete station'));
        })
      );
  }

  getStationsByOwnership(isSystemOwned: boolean): Observable<Station[]> {
    const url = `${this.apiUrl}?isSystemOwned=${isSystemOwned}`;
    return this.http.get<Station[]>(url, this.getHttpOptions()).pipe(
      catchError((error) => {
        console.error(`Error fetching stations by ownership`, error);
        return throwError(() => new Error('Failed to load stations'));
      })
    );
  }
}
