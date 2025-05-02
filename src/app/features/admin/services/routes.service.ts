import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import {
  RouteCreateRequest,
  RouteResponse,
  PaginatedRoutesResponse,
} from '../models/route.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class RoutesService {
  private apiUrl = `${environment.apiUrl}/api/Routes`;

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

  // Get all routes for system owners
  getAllRoutes(page = 1, pageSize = 10): Observable<PaginatedRoutesResponse> {
    const url = `${environment.apiUrl}/api/Routes/paginated?pageNumber=${page}&pageSize=${pageSize}`;

    return this.http
      .get<PaginatedRoutesResponse>(url, this.getHttpOptions())
      .pipe(
        map((response) => {
          console.log('API Response:', response);

          if (!response || !response.data || !response.data.routes) {
            return {
              statusCode: response.statusCode || 200,
              message: 'No routes available',
              data: {
                totalCount: 0,
                pageNumber: page,
                pageSize: pageSize,
                routes: [],
              },
            };
          }

          // Convert estimatedDuration to hours and minutes for display
          const routesWithDuration = response.data.routes.map((route) => {
            if (route.estimatedDuration !== undefined) {
              const totalMinutes = Math.floor(route.estimatedDuration / 60);
              return {
                ...route,
                durationHours: Math.floor(totalMinutes / 60),
                durationMinutes: totalMinutes % 60,
              };
            }
            return route;
          });

          return {
            ...response,
            data: {
              ...response.data,
              routes: routesWithDuration,
            },
          };
        }),
        catchError((error) => {
          console.error('Error fetching routes:', error);
          return throwError(() => new Error('Failed to load routes'));
        })
      );
  }

  // Get paginated routes with companyId filter
  getRoutesByCompanyId(
    companyId: number,
    page = 1,
    pageSize = 10
  ): Observable<PaginatedRoutesResponse> {
    const url = `${environment.apiUrl}/api/Routes/paginated?companyId=${companyId}&pageNumber=${page}&pageSize=${pageSize}`;

    console.log(`Fetching routes for company ID ${companyId}`);

    return this.http
      .get<PaginatedRoutesResponse>(url, this.getHttpOptions())
      .pipe(
        map((response) => {
          console.log('API Response:', response);

          if (!response || !response.data || !response.data.routes) {
            return {
              statusCode: response.statusCode || 200,
              message: `No routes available for company ID ${companyId}`,
              data: {
                totalCount: 0,
                pageNumber: page,
                pageSize: pageSize,
                routes: [],
              },
            };
          }

          // Convert estimatedDuration to hours and minutes for display
          const routesWithDuration = response.data.routes.map((route) => {
            if (route.estimatedDuration !== undefined) {
              const totalMinutes = Math.floor(route.estimatedDuration / 60);
              return {
                ...route,
                durationHours: Math.floor(totalMinutes / 60),
                durationMinutes: totalMinutes % 60,
              };
            }
            return route;
          });

          return {
            ...response,
            data: {
              ...response.data,
              routes: routesWithDuration,
            },
          };
        }),
        catchError((error) => {
          console.error('Error fetching routes:', error);
          return throwError(() => new Error('Failed to load routes'));
        })
      );
  }

  // Create new route
  createRoute(route: RouteCreateRequest): Observable<RouteResponse> {
    console.log('Creating route:', route);

    return this.http
      .post<RouteResponse>(this.apiUrl, route, this.getHttpOptions())
      .pipe(
        map((response) => {
          console.log('Route created successfully:', response);
          return response;
        }),
        catchError((error) => {
          console.error('Error creating route:', error);
          return throwError(() => new Error('Failed to create route'));
        })
      );
  }

  // Delete route
  deleteRoute(id: number): Observable<boolean> {
    return this.http
      .delete<unknown>(`${this.apiUrl}/${id}`, this.getHttpOptions())
      .pipe(
        map(() => true),
        catchError((error) => {
          console.error(`Error deleting route ID ${id}:`, error);
          return throwError(() => new Error('Failed to delete route'));
        })
      );
  }
}
