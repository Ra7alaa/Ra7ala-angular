import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError, BehaviorSubject } from 'rxjs';
import { CompanyResponse } from '../models/company.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CompanyService {
  private apiBaseUrl = environment.apiUrl;
  private siteBaseUrl = environment.apiUrl.replace(/\/api$/, '');
  private pendingCountSubject = new BehaviorSubject<number>(0);
  public pendingCount$ = this.pendingCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Add method to get base URL for document formatting
  getBaseUrl(): string {
    return this.siteBaseUrl;
  }

  // Method to update the pending count
  updatePendingCount(count: number): void {
    this.pendingCountSubject.next(count);
  }

  // Method to refresh the pending count from the server
  refreshPendingCount(): void {
    this.getPendingCompanies(1, 1).subscribe({
      next: (response) => {
        this.updatePendingCount(response.totalCount || 0);
      },
      error: (error) => {
        console.error('Error refreshing pending count:', error);
      },
    });
  }

  getAllCompanies(pageNumber = 1, pageSize = 10): Observable<CompanyResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<CompanyResponse>(
        `${this.apiBaseUrl}/Company/all-companies-details`,
        { params },
      )
      .pipe(
        catchError((error) => {
          console.error('Failed to fetch companies', error);
          return throwError(() => error);
        }),
      );
  }

  getActiveCompanies(
    pageNumber = 1,
    pageSize = 10,
  ): Observable<CompanyResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<CompanyResponse>(`${this.apiBaseUrl}/Company/approved`, { params })
      .pipe(
        catchError((error) => {
          console.error('Failed to fetch active companies', error);
          return throwError(() => error);
        }),
      );
  }

  getPendingCompanies(
    pageNumber = 1,
    pageSize = 10,
  ): Observable<CompanyResponse> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());

    return this.http
      .get<CompanyResponse>(`${this.apiBaseUrl}/Company/pending`, { params })
      .pipe(
        catchError((error) => {
          console.error('Failed to fetch pending companies', error);
          return throwError(() => error);
        }),
      );
  }

  getCompanyById(id: number): Observable<unknown> {
    console.log(
      `Making API request to: ${this.apiBaseUrl}/Company/${id}/Company-Owner-profile`,
    );

    return this.http
      .get(`${this.apiBaseUrl}/Company/${id}/Company-Owner-profile`, {
        responseType: 'json',
      })
      .pipe(
        catchError((error) => {
          console.error(`Failed to fetch company with ID ${id}`, error);
          // Try fallback endpoint
          console.log(
            `Attempting fallback endpoint: ${this.apiBaseUrl}/Company/${id}`,
          );
          return this.http
            .get(`${this.apiBaseUrl}/Company/${id}`, { responseType: 'json' })
            .pipe(
              catchError((fallbackError) => {
                console.error(
                  `Fallback also failed for company ID ${id}`,
                  fallbackError,
                );
                return throwError(() => fallbackError);
              }),
            );
        }),
      );
  }

  reviewCompany(
    companyId: number,
    isApproved: boolean,
    rejectionReason?: string,
  ): Observable<unknown> {
    const reviewData = {
      companyId: companyId,
      isApproved: isApproved,
      rejectionReason: rejectionReason || '',
    };

    return this.http.post(`${this.apiBaseUrl}/Company/review`, reviewData).pipe(
      catchError((error) => {
        console.error('Failed to review company', error);
        return throwError(() => error);
      }),
    );
  }

  deleteCompany(id: number): Observable<unknown> {
    return this.http.delete(`${this.apiBaseUrl}/Company/${id}`).pipe(
      catchError((error) => {
        console.error(`Failed to delete company with ID ${id}`, error);
        return throwError(() => error);
      }),
    );
  }
}
