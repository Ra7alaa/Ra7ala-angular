import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
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
  private apiUrl = `${environment.apiUrl}/drivers`;
  private authApiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) {}

  getDriverDetails(id: string): Observable<Driver> {
    const url = `${this.authApiUrl}/driver/${id}`;
    return this.http.get<Driver>(url).pipe(
      catchError((error) => {
        console.error('Error fetching driver details:', error);
        return throwError(() => new Error('Failed to load driver details'));
      }),
    );
  }

  // Get all drivers for the current company
  getAllDriversWithoutParams(): Observable<Driver[]> {
    const url = `${environment.apiUrl}/Auth/drivers/company`;
    return this.http.get<Driver[]>(url).pipe(
      catchError((error) => {
        console.error('Error fetching drivers:', error);
        return throwError(() => new Error('Failed to load drivers'));
      }),
    );
  }

  getAllDrivers(page = 1, pageSize = 10): Observable<PaginatedDriversResponse> {
    return this.http.get<PaginatedDriversResponse>(
      `${this.apiUrl}?page=${page}&pageSize=${pageSize}`,
    );
  }

  getDriverById(id: string): Observable<Driver> {
    return this.http.get<Driver>(`${this.apiUrl}/${id}`);
  }

  // Fixed method for creating driver using multipart/form-data
  createDriver(driver: DriverRegistrationRequest): Observable<Driver> {
    const formData = new FormData();

    if (driver.ProfilePicture) {
      formData.append('ProfilePicture', driver.ProfilePicture);
    }

    const url = `${this.authApiUrl}/register-driver`;
    let params = new HttpParams()
      .set('FullName', driver.FullName)
      .set('Email', driver.Email)
      .set('UserName', driver.UserName)
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

    return this.http
      .post<Driver>(url, formData, { params })
      .pipe(
        catchError((error) => {
          console.error('Error creating driver:', error);
          return throwError(() => error);
        }),
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
    companyId: number | null = null,
  ): Observable<DriversResponse> {
    let url = `${this.apiUrl}/available`;
    if (companyId) {
      url += `?companyId=${companyId}`;
    }
    return this.http.get<DriversResponse>(url);
  }
}
