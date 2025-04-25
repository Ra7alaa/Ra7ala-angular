import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Company, CompanyCreateRequest } from '../../auth/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private apiUrl = `${environment.apiUrl}/api/Companies`;

  constructor(private http: HttpClient) {}

  /**
   * Get all companies
   */
  getAllCompanies(): Observable<Company[]> {
    return this.http
      .get<Company[]>(this.apiUrl)
      .pipe(catchError(this.handleError));
  }

  /**
   * Get a specific company by ID
   */
  getCompanyById(id: number): Observable<Company> {
    return this.http
      .get<Company>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Create a new company
   */
  createCompany(company: CompanyCreateRequest): Observable<Company> {
    return this.http
      .post<Company>(this.apiUrl, company)
      .pipe(catchError(this.handleError));
  }

  /**
   * Update a company
   */
  updateCompany(id: number, company: Partial<Company>): Observable<Company> {
    return this.http
      .put<Company>(`${this.apiUrl}/${id}`, company)
      .pipe(catchError(this.handleError));
  }

  /**
   * Delete a company
   */
  deleteCompany(id: number): Observable<any> {
    return this.http
      .delete(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  /**
   * Error handling
   */
  private handleError(error: HttpErrorResponse) {
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
