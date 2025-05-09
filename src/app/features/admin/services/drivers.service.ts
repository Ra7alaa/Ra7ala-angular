import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  Driver,
  DriversResponse,
  PaginatedDriversResponse,
  DriverRegistrationRequest,
} from '../models/driver.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DriversService {
  private apiUrl = `${environment.apiUrl}/api/drivers`;
  private authApiUrl = `${environment.apiUrl}/api/Auth`;

  constructor(private http: HttpClient) {}

  // تحديث دالة getDriverDetails لاستخدام نقطة النهاية الصحيحة من Swagger
  getDriverDetails(id: string): Observable<Driver> {
    const url = `${this.authApiUrl}/driver/${id}`;
    console.log('Calling driver details API endpoint:', url);

    return this.http.get<Driver>(url, this.getAuthHeaders()).pipe(
      map((response) => {
        console.log('API Response:', response);
        return response;
      }),
      catchError((error) => {
        console.error('Error fetching driver details:', error);
        return throwError(() => new Error('Failed to load driver details'));
      })
    );
  }

  // حصول على headers مع توكن المصادقة
  private getAuthHeaders(): { headers: HttpHeaders } {
    let token: string | null = null;
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        token = user.token;
        console.log('Token found:', token ? 'Yes' : 'No');
      } else {
        console.warn('No user object found in localStorage');
      }
    } catch (error) {
      console.error('Error retrieving token from localStorage:', error);
    }

    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: token ? `Bearer ${token}` : '',
      }),
    };
  }

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
        // Direct token extraction from the user object
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
      Authorization: token ? `Bearer ${token}` : '',
    });

    return this.http.get<Driver[]>(url, { headers }).pipe(
      catchError((error) => {
        console.error('Error fetching drivers:', error);
        return throwError(() => new Error('Failed to load drivers'));
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

  // Fixed method for creating driver using multipart/form-data
  createDriver(driver: DriverRegistrationRequest): Observable<Driver> {
    // Log the data being sent
    console.log('Driver data being sent to API:', driver);

    // Get token from localStorage
    let token: string | null = null;
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        token = user.token;
      }
    } catch (error) {
      console.error('Error retrieving token from localStorage:', error);
    }

    // Create headers with the token
    const headers = new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : '',
      // Don't set Content-Type for multipart/form-data as the browser will set it with the boundary
    });

    // Create FormData object
    const formData = new FormData();

    // Add all fields to the FormData
    if (driver.ProfilePicture) {
      formData.append('ProfilePicture', driver.ProfilePicture);
    }

    // Build the URL with query parameters as shown in your cURL example
    const url = `${this.authApiUrl}/register-driver`;
    let params = new HttpParams()
      .set('FullName', driver.FullName)
      .set('Email', driver.Email)
      .set('PhoneNumber', driver.PhoneNumber)
      .set('LicenseNumber', driver.LicenseNumber)
      .set('LicenseExpiryDate', driver.LicenseExpiryDate)
      .set('ContactAddress', driver.ContactAddress)
      .set('HireDate', driver.HireDate);

    if (driver.DateOfBirth) {
      params = params.set('DateOfBirth', driver.DateOfBirth);
    }

    params = params.set('CompanyId', driver.CompanyId.toString());
    params = params.set('UserType', driver.UserType);

    console.log('API URL with params:', url + '?' + params.toString());

    // Make a direct POST request with the FormData
    return this.http
      .post<Driver>(url, formData, {
        headers: headers,
        params: params,
      })
      .pipe(
        catchError((error) => {
          console.error('Error details:', error);
          if (error.error) {
            console.log('Server error response:', error.error);
          }
          return throwError(() => error);
        })
      );
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
