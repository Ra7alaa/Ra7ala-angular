import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../../features/auth/models/user.model';

// Define the AdminRegisterRequest interface directly here
export interface AdminRegisterRequest {
  FullName: string;
  Email: string;
  PhoneNumber: string;
  DateOfBirth?: string;
  Department?: string;
  Address?: string;
  CompanyId: number;
  ProfilePicture?: File | null;
}

@Injectable({
  providedIn: 'root',
})
export class AdminsService {
  private apiUrl = `${environment.apiUrl}/api/Auth`;
  private adminApiUrl = `${environment.apiUrl}/api/Auth/admins/company`;

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

  /**
   * Get all admins for the current company
   */
  getCompanyAdmins(): Observable<User[]> {
    return this.http
      .get<User[]>(this.adminApiUrl, this.getHttpOptions())
      .pipe(catchError(this.handleError));
  }

  /**
   * Register a new admin for company using multipart/form-data
   */
  registerAdmin(adminData: AdminRegisterRequest): Observable<User> {
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

    // Add ProfilePicture to FormData if it exists
    if (adminData.ProfilePicture) {
      formData.append('ProfilePicture', adminData.ProfilePicture);
    }

    // Build URL with query parameters as done for drivers
    const url = `${this.apiUrl}/register-admin`;
    let params = new HttpParams()
      .set('FullName', adminData.FullName)
      .set('Email', adminData.Email)
      .set('PhoneNumber', adminData.PhoneNumber)
      .set('CompanyId', adminData.CompanyId.toString());

    // Add optional parameters if they exist
    if (adminData.DateOfBirth) {
      params = params.set('DateOfBirth', adminData.DateOfBirth);
    }

    if (adminData.Department) {
      params = params.set('Department', adminData.Department);
    }

    if (adminData.Address) {
      params = params.set('Address', adminData.Address);
    }

    console.log(
      'Admin registration URL with params:',
      url + '?' + params.toString()
    );

    // Make POST request with FormData
    return this.http
      .post<User>(url, formData, {
        headers: headers,
        params: params,
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete admin user
   */
  deleteAdmin(id: string): Observable<unknown> {
    return this.http
      .delete(`${this.apiUrl}/admin/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Error handling
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API error:', error);

    if (error.status === 0) {
      // Network error
      return throwError(
        () =>
          new Error(
            'Cannot connect to server. Please check your internet connection.'
          )
      );
    }

    const errorMessage =
      error.error?.message || error.message || 'An unknown error occurred';
    return throwError(() => new Error(errorMessage));
  }
}
