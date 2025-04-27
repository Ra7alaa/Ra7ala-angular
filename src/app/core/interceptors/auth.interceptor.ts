import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Get the current user from the auth service
    const currentUser = this.authService.getCurrentUser();

    console.log('AuthInterceptor - Current request URL:', request.url);
    console.log('AuthInterceptor - Is user logged in:', !!currentUser);

    // If the user is logged in and has a token, add it to the request headers
    if (currentUser && currentUser.token) {
      console.log('AuthInterceptor - Adding Authorization header');
      request = request.clone({
        headers: request.headers.set('Authorization', `Bearer ${currentUser.token}`)
      });
    } else {
      console.log('AuthInterceptor - No token available');
    }

    return next.handle(request);
  }
}
