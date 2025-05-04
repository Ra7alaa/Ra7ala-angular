import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import {
  Driver,
  DriversResponse,
  PaginatedDriversResponse,
} from '../models/driver.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DriversService {
  private apiUrl = `${environment.apiUrl}/drivers`;

  constructor(private http: HttpClient) {}

  // Get all drivers without any parameters - Uses Auth/drivers/company endpoint
  getAllDriversWithoutParams(): Observable<Driver[]> {
    const url = `${environment.apiUrl}/api/Auth/drivers/company`;
    console.log('Calling driver API endpoint:', url);

    // Get token from localStorage - The token is stored inside the user object
    let token: string | null = null;
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        // Direct token extraction from the user object as seen in the screenshot
        token = user.token;
        console.log('Token found:', token ? 'Yes' : 'No');
      } else {
        console.warn('No user object found in localStorage');
      }
    } catch (error) {
      console.error('Error retrieving token from localStorage:', error);
    }

    // Create headers with the token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    });

    console.log(
      'Making API request with Authorization header:',
      token ? 'Yes' : 'No'
    );

    return this.http.get<Driver[]>(url, { headers }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error ${error.status} fetching drivers:`, error.message);
        if (error.status === 403) {
          console.error(
            'Access forbidden (403). Check if token is valid and you have proper permissions.'
          );
        }
        return throwError(
          () => new Error(`Error fetching drivers: ${error.message}`)
        );
      })
    );
  }

  getAllDrivers(page = 1, pageSize = 10): Observable<PaginatedDriversResponse> {
    return this.http.get<PaginatedDriversResponse>(
      `${this.apiUrl}?page=${page}&pageSize=${pageSize}`
    );
  }

  getDriverById(id: string): Observable<Driver> {
    return this.http.get<Driver>(`${this.apiUrl}/${id}`);
  }

  createDriver(driver: Driver): Observable<Driver> {
    return this.http.post<Driver>(this.apiUrl, driver);
  }

  updateDriver(id: string, driver: Driver): Observable<Driver> {
    return this.http.put<Driver>(`${this.apiUrl}/${id}`, driver);
  }

  deleteDriver(id: string): Observable<boolean> {
    return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
  }

  // Helper method to get available drivers
  getAvailableDrivers(
    companyId: number | null = null
  ): Observable<DriversResponse> {
    let url = `${this.apiUrl}/available`;
    if (companyId) {
      url += `?companyId=${companyId}`;
    }
    return this.http.get<DriversResponse>(url);
  }
}
