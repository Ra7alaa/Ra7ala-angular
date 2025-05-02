import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';

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

  // Get all cities
  getAllCities(): Observable<City[]> {
    return this.http
      .get<unknown>(`${this.apiUrl}/City`, this.getHttpOptions())
      .pipe(
        map((response) => {
          console.log('Cities API Response:', response);

          // If we have an array directly, use it (as seen in your console)
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
        catchError((error) => {
          console.error('Error retrieving cities from API:', error);
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
