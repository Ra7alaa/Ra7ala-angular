import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, TimeoutError, timer } from 'rxjs';
import { catchError, timeout, retryWhen, delayWhen, take, mergeMap } from 'rxjs/operators';
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
      console.log('Skipping non-API request:', request.url);
      return next.handle(request);
    }

    console.log('Intercepting API request:', request.url);

    // Clone the request to add default headers
    let apiRequest = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      withCredentials: true
    });

    console.log('Modified request headers:', apiRequest.headers);

    // Process the modified request with timeout and error handling
    return next.handle(apiRequest).pipe(
      timeout(environment.apiTimeout || 30000),
      retryWhen(errors => 
        errors.pipe(
          mergeMap((error, index) => {
            const retryAttempt = index + 1;
            console.log(`Retry attempt ${retryAttempt} for ${apiRequest.url}`, error);
            
            if (this.shouldRetry(error) && retryAttempt <= 3) {
              const delay = Math.min(1000 * Math.pow(2, retryAttempt), 10000);
              console.log(`Retrying in ${delay}ms`);
              return timer(delay);
            }
            
            throw error;
          }),
          take(3)
        )
      ),
      catchError((error: HttpErrorResponse | TimeoutError) => {
        if (error instanceof TimeoutError) {
          console.error('Request timeout:', apiRequest.url);
          return throwError(() => new Error('انتهت مهلة الطلب. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'));
        }

        if (error instanceof HttpErrorResponse) {
          if (!navigator.onLine) {
            console.error('Network is offline');
            return throwError(() => new Error('أنت غير متصل بالإنترنت. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى.'));
          }

          switch (error.status) {
            case 0:
              console.error('Network or CORS error:', apiRequest.url, error);
              return throwError(() => new Error('تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت أو المحاولة لاحقاً.'));

            case 400:
              console.error('Bad Request:', apiRequest.url, error);
              const errorMessage = error.error?.message || error.error || 'بيانات غير صالحة';
              return throwError(() => new Error(errorMessage));

            case 401:
              console.error('Unauthorized request:', apiRequest.url);
              return throwError(() => new Error('انتهت صلاحية جلستك. يرجى تسجيل الدخول مرة أخرى.'));

            case 403:
              console.error('Forbidden request:', apiRequest.url);
              return throwError(() => new Error('ليس لديك صلاحية للوصول إلى هذا المورد.'));

            case 404:
              console.error('Resource not found:', apiRequest.url);
              return throwError(() => new Error('تعذر العثور على المورد المطلوب.'));

            case 500:
              console.error('Server error:', apiRequest.url, error);
              return throwError(() => new Error('حدث خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.'));

            case 502:
            case 503:
            case 504:
              console.error('Server unavailable:', apiRequest.url, error);
              return throwError(() => new Error('الخادم غير متاح حالياً. يرجى المحاولة مرة أخرى لاحقاً.'));

            default:
              console.error('HTTP error:', error);
              return throwError(() => new Error(error.error?.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'));
          }
        }

        console.error('Unknown error:', error);
        return throwError(() => new Error('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'));
      })
    );
  }

  private shouldRetry(error: any): boolean {
    return (
      error instanceof TimeoutError ||
      (!navigator.onLine) ||
      (error instanceof HttpErrorResponse &&
        (error.status === 0 || // Network/CORS error
         error.status === 502 || // Bad Gateway
         error.status === 503 || // Service Unavailable
         error.status === 504)) // Gateway Timeout
    );
  }
}
