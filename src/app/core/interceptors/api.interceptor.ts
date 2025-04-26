import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  constructor() {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Skip interception for non-API requests
    if (!request.url.includes(environment.apiUrl)) {
      return next.handle(request);
    }

    // Clone the request to add default headers
    let apiRequest = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });

    // Process the modified request with timeout and error handling
    return next.handle(apiRequest).pipe(
      timeout(environment.apiTimeout || 30000),
      catchError((error: HttpErrorResponse | TimeoutError) => {
        if (error instanceof TimeoutError) {
          console.error('Request timeout:', apiRequest.url);
          return throwError(() => new Error('Request timed out. Please try again.'));
        }

        if (error instanceof HttpErrorResponse) {
          // Handle different HTTP error statuses
          switch (error.status) {
            case 0: // CORS or network error
              console.error('CORS or Network error:', apiRequest.url, error);
              return throwError(() => new Error('Unable to connect to the server. Please check your internet connection.'));

            case 400: // Bad Request
              console.error('Bad Request:', apiRequest.url, error);
              const errorMessage = error.error?.message || error.error || 'Invalid data provided';
              return throwError(() => new Error(errorMessage));

            case 401: // Unauthorized
              console.error('Unauthorized request:', apiRequest.url);
              return throwError(() => new Error('You need to log in to access this resource.'));

            case 403: // Forbidden
              console.error('Forbidden request:', apiRequest.url);
              return throwError(() => new Error('You do not have permission to access this resource.'));

            case 404: // Not Found
              console.error('Resource not found:', apiRequest.url);
              return throwError(() => new Error('The requested resource was not found.'));

            case 500: // Server Error
              console.error('Server error:', apiRequest.url, error);
              return throwError(() => new Error('An internal server error occurred. Please try again later.'));

            default:
              console.error('HTTP error:', error);
              return throwError(() => new Error(error.error?.message || 'An error occurred. Please try again.'));
          }
        }

        console.error('Unknown error:', error);
        return throwError(() => new Error('An unexpected error occurred. Please try again.'));
      })
    );
  }
}
