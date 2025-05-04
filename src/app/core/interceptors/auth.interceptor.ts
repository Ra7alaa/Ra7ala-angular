import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from '../../features/auth/services/auth.service';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Get current user directly from auth service
    const currentUser = this.authService.getCurrentUser();

    // If user is logged in and has a token, add it to request headers
    if (currentUser && currentUser.token) {
      // Clone the request with the Authorization header
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
    }

    // Process the request and handle errors
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // If unauthorized error (401), log out the user
        if (error.status === 401) {
          console.error('Auth token expired or invalid, logging out');
          this.authService.logout();
        }

        // If forbidden error (403), handle appropriately
        if (error.status === 403) {
          console.error(
            `FORBIDDEN ERROR (403) for ${request.url}:`,
            error.message
          );

          // Don't redirect on API calls
          if (!request.url.includes('/api/')) {
            console.log('Redirecting to error page for 403 error');
            this.router.navigate(['/error/403']);
          }
        }

        return throwError(() => error);
      })
    );
  }
}
