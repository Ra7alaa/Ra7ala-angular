// import { Injectable } from '@angular/core';
// import {
//   HttpInterceptor,
//   HttpRequest,
//   HttpHandler,
//   HttpEvent,
// } from '@angular/common/http';
// import { Observable } from 'rxjs';
// import { environment } from '../../../environments/environment';

// @Injectable()
// export class ApiInterceptor implements HttpInterceptor {
//   intercept(
//     request: HttpRequest<unknown>,
//     next: HttpHandler
//   ): Observable<HttpEvent<unknown>> {
//     // إذا كان الطلب بالفعل يحتوي على URL كامل (يبدأ بـ http أو https)، لا نقوم بتعديله
//     if (request.url.startsWith('http')) {
//       return next.handle(request);
//     }

//     // إضافة عنوان API الأساسي إلى الطلبات التي لا تحتوي على URL كامل
//     const apiRequest = request.clone({
//       url: `${environment.apiUrl}${request.url}`,
//     });

//     return next.handle(apiRequest);

//   }
  
//   // Helper to convert headers to a plain object for logging
//   private getHeadersAsObject(request: HttpRequest<any>): Record<string, string> {
//     const headers: Record<string, string> = {};
//     request.headers.keys().forEach(key => {
//       headers[key] = request.headers.get(key) || '';
//     });
//     return headers;
//   }
// }
