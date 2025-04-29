import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';

// تعليق استيراد ApiInterceptor مؤقتًا إلى أن يتم تنفيذه
// import { ApiInterceptor } from './api.interceptor';

export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
  // { provide: HTTP_INTERCEPTORS, useClass: ApiInterceptor, multi: true },
];
