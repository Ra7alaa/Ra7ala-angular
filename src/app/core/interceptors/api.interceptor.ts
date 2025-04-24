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

    // Clone the request to add default headers if not present
    let apiRequest = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    // Add Authorization header if we have a token in localStorage
    const token = localStorage.getItem('auth_token');
    if (token) {
      apiRequest = apiRequest.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Process the modified request with timeout and error handling
    return next.handle(apiRequest).pipe(
      timeout(environment.apiTimeout),
      catchError((error: HttpErrorResponse | TimeoutError) => {
        if (error instanceof TimeoutError) {
          console.error('Request timeout:', apiRequest.url);
          return throwError(
            () => new Error('Request timed out. Please try again.')
          );
        }

        if (error instanceof HttpErrorResponse) {
          // Handle different HTTP error statuses
          switch (error.status) {
            case 401: // Unauthorized
              console.error('Unauthorized request:', apiRequest.url);
              // You might want to redirect to login page or refresh token
              return throwError(
                () => new Error('You need to log in to access this resource.')
              );

            case 403: // Forbidden
              console.error('Forbidden request:', apiRequest.url);
              return throwError(
                () =>
                  new Error(
                    'You do not have permission to access this resource.'
                  )
              );

            case 404: // Not Found
              console.error('Resource not found:', apiRequest.url);
              return throwError(
                () => new Error('The requested resource was not found.')
              );

            case 500: // Server Error
              console.error('Server error:', apiRequest.url, error);
              return throwError(
                () =>
                  new Error(
                    'An internal server error occurred. Please try again later.'
                  )
              );

            default:
              console.error('HTTP error:', error);
              return throwError(
                () => new Error('An error occurred. Please try again.')
              );
          }
        }

        // For any other types of errors
        console.error('Unknown error:', error);
        return throwError(
          () => new Error('An unexpected error occurred. Please try again.')
        );
      })
    );
  }
}
