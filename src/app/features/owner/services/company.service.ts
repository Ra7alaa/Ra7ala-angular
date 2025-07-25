import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CompanyResponse } from '../models/company.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Add method to get base URL for document formatting
  getBaseUrl(): string {
    return this.baseUrl;
  }

  getAllCompanies(pageNumber = 1, pageSize = 10): Observable<CompanyResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<CompanyResponse>(
        `${this.baseUrl}/api/Company/all-companies-details`,
        { params }
      )
      .pipe(
        catchError((error) => {
          console.error('Failed to fetch companies', error);
          return throwError(() => error);
        })
      );
  }

  getActiveCompanies(
    pageNumber = 1,
    pageSize = 10
  ): Observable<CompanyResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<CompanyResponse>(`${this.baseUrl}/api/Company/approved`, { params })
      .pipe(
        catchError((error) => {
          console.error('Failed to fetch active companies', error);
          return throwError(() => error);
        })
      );
  }

  getPendingCompanies(
    pageNumber = 1,
    pageSize = 10
  ): Observable<CompanyResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<CompanyResponse>(`${this.baseUrl}/api/Company/pending`, { params })
      .pipe(
        catchError((error) => {
          console.error('Failed to fetch pending companies', error);
          return throwError(() => error);
        })
      );
  }

  getCompanyById(id: number): Observable<unknown> {
    console.log(
      `Making API request to: ${this.baseUrl}/api/Company/${id}/Company-Owner-profile`
    );

    return this.http
      .get(`${this.baseUrl}/api/Company/${id}/Company-Owner-profile`, {
        responseType: 'json',
      })
      .pipe(
        catchError((error) => {
          console.error(`Failed to fetch company with ID ${id}`, error);
          // Try fallback endpoint
          console.log(
            `Attempting fallback endpoint: ${this.baseUrl}/api/Company/${id}`
          );
          return this.http
            .get(`${this.baseUrl}/api/Company/${id}`, { responseType: 'json' })
            .pipe(
              catchError((fallbackError) => {
                console.error(
                  `Fallback also failed for company ID ${id}`,
                  fallbackError
                );
                return throwError(() => fallbackError);
              })
            );
        })
      );
  }

  reviewCompany(
    companyId: number,
    isApproved: boolean,
    rejectionReason?: string
  ): Observable<unknown> {
    const reviewData = {
      companyId: companyId,
      isApproved: isApproved,
      rejectionReason: rejectionReason || '',
    };

    return this.http
      .post(`${this.baseUrl}/api/Company/review`, reviewData)
      .pipe(
        catchError((error) => {
          console.error('Failed to review company', error);
          return throwError(() => error);
        })
      );
  }

  deleteCompany(id: number): Observable<unknown> {
    return this.http.delete(`${this.baseUrl}/api/Company/${id}`).pipe(
      catchError((error) => {
        console.error(`Failed to delete company with ID ${id}`, error);
        return throwError(() => error);
      })
    );
  }
}
