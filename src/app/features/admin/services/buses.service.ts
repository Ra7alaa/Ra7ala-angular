import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { BusResponse, Bus } from '../models/bus.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BusesService {
  private apiUrl = `${environment.apiUrl}/api/Bus`;

  constructor(private http: HttpClient) {}

  // Get buses with companyId filter - URL format: /api/Bus/company/1
  getBusesByCompanyId(companyId: number): Observable<Bus[]> {
    const url = `${this.apiUrl}/company/${companyId}`;
    console.log(`Fetching buses for company ID ${companyId} using URL: ${url}`);
    // Keep Accept header if response is JSON
    const headers = new HttpHeaders({ Accept: 'application/json' });
    return this.http.get<Bus[]>(url, { headers: headers }).pipe(
      map((response) => {
        console.log('API Response for getBusesByCompanyId:', response);
        return response || [];
      }),
      catchError((error) => {
        console.error('Error fetching buses:', error);
        return throwError(() => new Error('Failed to load buses'));
      })
    );
  }

  // Create new bus - Accept FormData
  createBus(formData: FormData): Observable<BusResponse> {
    console.log('--- Creating Bus (FormData) --- ');
    console.log('Request URL:', this.apiUrl);
    // Log FormData keys/values if needed for debugging
    // formData.forEach((value, key) => { console.log(key, value); });

    // Send FormData directly. HttpClient sets the Content-Type automatically with the correct boundary.
    // Pass only Accept header if the API response is JSON.
    const headers = new HttpHeaders({
      Accept: 'application/json',
      // DO NOT set 'Content-Type': 'multipart/form-data' manually here
    });

    return this.http
      .post<BusResponse>(this.apiUrl, formData, { headers: headers }) // Pass headers object
      .pipe(
        map((response) => {
          console.log('Bus created successfully:', response);
          return response; // Return the actual response from the API
        }),
        catchError((error) => {
          console.error('Error creating bus:', error);
          if (error.error) {
            console.error('Error details:', error.error);
            if (error.error.errors) {
              console.error('Validation errors:', error.error.errors);
            }
          }
          // Try to provide a more specific error message if possible
          let errorMessage = 'Failed to create bus.';
          if (error.status === 400 && error.error?.errors) {
            // Extract validation errors if available
            const validationErrors = Object.values(error.error.errors)
              .flat()
              .join(', ');
            errorMessage = `Validation failed: ${validationErrors}`;
          } else if (error.message) {
            errorMessage = error.message;
          }
          // Return an error observable with a meaningful message
          return throwError(() => new Error(errorMessage));
        })
      );
  }

  // Delete bus
  deleteBus(id: number): Observable<boolean> {
    // Keep Accept header if response is JSON (even if body is empty on success)
    const headers = new HttpHeaders({ Accept: 'application/json' });
    return this.http
      .delete<unknown>(`${this.apiUrl}/${id}`, { headers: headers }) // Pass headers object
      .pipe(
        map(() => true), // Assume success if no error
        catchError((error) => {
          console.error(`Error deleting bus ID ${id}:`, error);
          return throwError(() => new Error('Failed to delete bus'));
        })
      );
  }
}
