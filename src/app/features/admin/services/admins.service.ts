import {
  HttpClient,
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
  UserName: string;
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
  private apiUrl = `${environment.apiUrl}/Auth`;
  private adminApiUrl = `${environment.apiUrl}/Auth/admins/company`;

  constructor(private http: HttpClient) {}

  /**
   * Get all admins for the current company
   */
  getCompanyAdmins(): Observable<User[]> {
    return this.http
      .get<User[]>(this.adminApiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Register a new admin for company using multipart/form-data
   */
  registerAdmin(adminData: AdminRegisterRequest): Observable<User> {
    const formData = new FormData();

    if (adminData.ProfilePicture) {
      formData.append('ProfilePicture', adminData.ProfilePicture);
    }

    const url = `${this.apiUrl}/register-admin`;
    let params = new HttpParams()
      .set('FullName', adminData.FullName)
      .set('Email', adminData.Email)
      .set('UserName', adminData.UserName)
      .set('PhoneNumber', adminData.PhoneNumber)
      .set('CompanyId', adminData.CompanyId.toString());

    if (adminData.DateOfBirth) {
      params = params.set('DateOfBirth', adminData.DateOfBirth);
    }
    if (adminData.Department) {
      params = params.set('Department', adminData.Department);
    }
    if (adminData.Address) {
      params = params.set('Address', adminData.Address);
    }

    return this.http
      .post<User>(url, formData, { params })
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
            'Cannot connect to server. Please check your internet connection.',
          ),
      );
    }

    const errorMessage =
      error.error?.message || error.message || 'An unknown error occurred';
    return throwError(() => new Error(errorMessage));
  }
}
