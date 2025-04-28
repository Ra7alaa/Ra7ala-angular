import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Only set Content-Type if not already set and if there's a body
    let modifiedRequest = request;
    
    // IMPORTANT FIX: Don't change Content-Type for FormData requests
    if (request.body && !request.headers.has('Content-Type') && !(request.body instanceof FormData)) {
      modifiedRequest = request.clone({
        setHeaders: {
          'Content-Type': 'application/json'
        }
      });
    }

    // Log outgoing requests for debugging
    console.log('Outgoing request:', {
      url: modifiedRequest.url,
      method: modifiedRequest.method,
      headers: this.getHeadersAsObject(modifiedRequest),
      body: request.body instanceof FormData ? 'FormData (content not shown)' : modifiedRequest.body
    });

    return next.handle(modifiedRequest).pipe(
      tap({
        next: (event: HttpEvent<any>) => {},
        error: (error) => {
          console.error('API request error:', {
            url: modifiedRequest.url,
            status: error.status,
            statusText: error.statusText,
            error: error.error
          });
        }
      })
    );
  }
  
  // Helper to convert headers to a plain object for logging
  private getHeadersAsObject(request: HttpRequest<any>): Record<string, string> {
    const headers: Record<string, string> = {};
    request.headers.keys().forEach(key => {
      headers[key] = request.headers.get(key) || '';
    });
    return headers;
  }
}
