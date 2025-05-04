import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError, of } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../features/auth/services/auth.service';

export interface City {
  id: number;
  name: string;
  countryId: number;
  countryName?: string;
  stations?: Station[];
}

export interface CityResponse {
  statusCode: number;
  message: string;
  data: City[];
}

export interface CityWithStationsResponse {
  statusCode: number;
  message: string;
  data: {
    id: number;
    name: string;
    countryId: number;
    countryName?: string;
    stations: Station[];
  };
}

export interface Station {
  id: number;
  name: string;
  cityId: number;
  cityName?: string;
  latitude: number;
  longitude: number;
  companyName: string | null;
  companyId?: number | null;
}

export interface StationResponse {
  statusCode: number;
  message: string;
  data: Station[];
}

@Injectable({
  providedIn: 'root',
})
export class CitiesService {
  private apiUrl = `${environment.apiUrl}/api`;

  // Define a fallback list of Egyptian cities in case the API fails
  private fallbackCities: City[] = [
    { id: 1, name: 'Cairo', countryId: 1 },
    { id: 2, name: 'Alexandria', countryId: 1 },
    { id: 3, name: 'Luxor', countryId: 1 },
    { id: 4, name: 'Aswan', countryId: 1 },
    { id: 5, name: 'Hurghada', countryId: 1 },
    { id: 6, name: 'Sharm El Sheikh', countryId: 1 },
    { id: 7, name: 'Damietta', countryId: 1 },
    { id: 8, name: 'El Mahalla El Kubra', countryId: 1 },
    { id: 9, name: 'Tanta', countryId: 1 },
    { id: 10, name: 'Mansoura', countryId: 1 },
    { id: 11, name: 'Kafr El Sheikh', countryId: 1 },
    { id: 12, name: 'El Santa', countryId: 1 },
  ];

  constructor(private http: HttpClient, private authService: AuthService) {}

  // Get HTTP options with headers
  private getHttpOptions() {
    const currentUser = this.authService.getCurrentUser();
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    });

    // Add authorization header if user is logged in
    if (currentUser && currentUser.token) {
      return {
        headers: headers.set('Authorization', `Bearer ${currentUser.token}`),
      };
    }

    return { headers };
  }

  // Get all cities
  getAllCities(): Observable<City[]> {
    console.log('Fetching cities from API...');

    return this.http
      .get<unknown>(`${this.apiUrl}/City`, this.getHttpOptions())
      .pipe(
        map((response) => {
          console.log('Cities API Response:', response);

          // If we have an array directly, use it
          if (Array.isArray(response)) {
            return response as City[];
          }

          // If we have a wrapped response with data property
          if (response && typeof response === 'object' && 'data' in response) {
            const typedResponse = response as CityResponse;
            return typedResponse.data;
          }

          console.log('Received empty cities data from API');
          return [];
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Error retrieving cities from API:', error);

          // If we get a 403 Forbidden error, use the fallback cities list
          if (error.status === 403) {
            console.log('API access forbidden. Using fallback cities list.');
            return of(this.fallbackCities);
          }

          return throwError(() => new Error('Failed to load cities from API'));
        })
      );
  }

  // Get city with stations by city ID
  getCityWithStations(
    cityId: number,
    userCompanyId?: number
  ): Observable<City> {
    return this.http
      .get<unknown>(
        `${this.apiUrl}/City/${cityId}/with-stations`,
        this.getHttpOptions()
      )
      .pipe(
        map((response) => {
          console.log(`City ${cityId} with stations API Response:`, response);

          let city: City;
          let stations: Station[] = [];

          // Handle different response formats
          if (response && typeof response === 'object') {
            // If response has a data property (wrapped response)
            if ('data' in response) {
              const typedResponse = response as CityWithStationsResponse;
              city = typedResponse.data;
              stations = typedResponse.data.stations || [];
            }
            // If response is the city object directly
            else if ('id' in response && 'name' in response) {
              city = response as City;
              stations = city.stations || [];
            }
            // If none of the above, create a default city
            else {
              city = {
                id: cityId,
                name: 'Unknown',
                countryId: 0,
                stations: [],
              };
            }
          } else {
            city = { id: cityId, name: 'Unknown', countryId: 0, stations: [] };
          }

          // Filter stations based on company ID if provided
          if (userCompanyId !== undefined && stations.length > 0) {
            stations = stations.filter(
              (station) =>
                station.companyName === null ||
                station.companyId === userCompanyId
            );
          }

          // Ensure stations property exists
          if (!city.stations) {
            city.stations = [];
          }

          // Update stations array with filtered stations
          city.stations = stations;

          return city;
        }),
        catchError((error) => {
          console.error(
            `Error retrieving city ${cityId} with stations from API:`,
            error
          );
          return throwError(
            () => new Error('Failed to load city with stations from API')
          );
        })
      );
  }

  // Get stations by city ID with filtering - Using getCityWithStations internally
  getStationsByCityId(
    cityId: number,
    userCompanyId?: number
  ): Observable<Station[]> {
    return this.getCityWithStations(cityId, userCompanyId).pipe(
      map((city) => city.stations || [])
    );
  }
}
