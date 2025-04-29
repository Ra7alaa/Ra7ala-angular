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

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // الحصول على المستخدم الحالي من خدمة المصادقة
    const currentUser = this.authService.getCurrentUser();

    // إذا كان المستخدم مسجل الدخول ولديه رمز مميز (token)، إضافته إلى رؤوس الطلب
    if (currentUser && currentUser.token) {
      console.log(`إضافة رمز المصادقة إلى الطلب: ${request.url}`);
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${currentUser.token}`,
        },
      });
    }

    // معالجة الطلب والتقاط أي أخطاء
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // إذا حصلنا على خطأ 401 (غير مصرح به)، قم بتسجيل خروج المستخدم
        if (error.status === 401) {
          console.error(
            'انتهت صلاحية رمز المصادقة أو غير صالح، جاري تسجيل الخروج'
          );
          this.authService.logout();
        }
        return throwError(() => error);
      })
    );
  }
}
