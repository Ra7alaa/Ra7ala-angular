import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  User,
  LoginRequest,
  UserRole,
  PassengerRegisterRequest,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/Auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    // استرجاع بيانات المستخدم من التخزين المحلي عند بدء التطبيق
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
        console.log('تم تحميل بيانات المستخدم من التخزين المحلي:', user);
      } catch (error) {
        console.error('فشل في تحليل بيانات المستخدم المخزنة:', error);
        localStorage.removeItem('user');
      }
    }
  }

  /**
   * تسجيل الدخول باستخدام البريد الإلكتروني/اسم المستخدم وكلمة المرور
   */
  login(credentials: LoginRequest): Observable<User> {
    console.log('طلب تسجيل الدخول بالبيانات التالية:', {
      emailOrUsername: credentials.emailOrUsername,
      password: '******',
    });

    return this.http
      .post<Record<string, unknown>>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response) => console.log('استجابة الخادم الأصلية:', response)),
        map((response) => {
          // استخراج الرمز المميز (token) من الاستجابة
          let token = '';
          let userData: Record<string, unknown> = {};

          // معالجة مختلف أشكال الاستجابة
          if (response['data']) {
            // الحالة 1: البيانات في خاصية data
            userData = response['data'] as Record<string, unknown>;
            token = (userData['token'] as string) || '';
          } else if (response['token']) {
            // الحالة 2: البيانات مباشرة في الاستجابة
            userData = response as Record<string, unknown>;
            token = response['token'] as string;
          }

          if (!token) {
            throw new Error('فشل في المصادقة: لم يتم استلام رمز مميز (token)');
          }

          if (!userData) {
            throw new Error('فشل في المصادقة: لم يتم استلام بيانات المستخدم');
          }

          // إنشاء كائن المستخدم من البيانات المستلمة
          const user: User = {
            id:
              typeof userData['id'] === 'string'
                ? parseInt(userData['id'], 10)
                : (userData['id'] as number),
            fullName: ((userData['fullName'] as string) ||
              (response['message'] as string) ||
              '') as string,
            email: (userData['email'] as string) || '',
            username: (userData['username'] as string) || '',
            token: token,
            userType: userData['userType'] as UserRole,
            companyId: userData['companyId'] as number | undefined,
            companyName: userData['companyName'] as string | undefined,
            profilePictureUrl: userData['profilePictureUrl'] as
              | string
              | undefined,
            phoneNumber: userData['phoneNumber'] as string | undefined,
            // إضافة علامات الأدوار
            isSystemOwner: userData['userType'] === UserRole.SystemOwner,
            isSuperAdmin: userData['userType'] === UserRole.SuperAdmin,
            isCompanyAdmin: userData['userType'] === UserRole.Admin,
            isDriver: userData['userType'] === UserRole.Driver,
            isPassenger: userData['userType'] === UserRole.Passenger,
          };

          console.log('تم إنشاء كائن المستخدم:', user);

          // تخزين بيانات المستخدم في التخزين المحلي
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);

          // الحصول على بيانات الملف الشخصي الكاملة
          this.getMyProfile().subscribe({
            next: (fullProfile) =>
              console.log('تم الحصول على الملف الشخصي الكامل:', fullProfile),
            error: (err) =>
              console.error('خطأ في الحصول على الملف الشخصي:', err),
          });

          return user;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('خطأ في طلب تسجيل الدخول:', error);
          let errorMessage = 'فشل تسجيل الدخول';

          if (
            error.error &&
            typeof error.error === 'object' &&
            'message' in error.error
          ) {
            errorMessage = error.error['message'] as string;
          } else if (error.message) {
            errorMessage = error.message;
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * الحصول على الملف الشخصي الكامل للمستخدم الحالي
   */
  getMyProfile(): Observable<User> {
    const currentUser = this.getCurrentUser();

    // إذا لم يتوفر رمز مميز (token)، إرجاع خطأ
    if (!currentUser || !currentUser.token) {
      return throwError(() => new Error('تسجيل الدخول مطلوب'));
    }

    return this.http.get<User>(`${this.apiUrl}/my-profile`).pipe(
      tap((profile) => {
        console.log('تم استلام الملف الشخصي الكامل:', profile);

        // دمج بيانات الملف الشخصي مع بيانات المستخدم الحالية، مع الاحتفاظ بالرمز المميز (token)
        const updatedUser: User = {
          ...profile,
          token: currentUser.token,
          // إضافة علامات الأدوار
          isSystemOwner: profile.userType === UserRole.SystemOwner,
          isSuperAdmin: profile.userType === UserRole.SuperAdmin,
          isCompanyAdmin: profile.userType === UserRole.Admin,
          isDriver: profile.userType === UserRole.Driver,
          isPassenger: profile.userType === UserRole.Passenger,
        };

        // تحديث التخزين المحلي وموضوع المستخدم الحالي
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);
      }),
      catchError((error) => {
        console.error('خطأ في الحصول على الملف الشخصي للمستخدم:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * التحقق مما إذا كان المستخدم يمتلك دورًا معينًا
   */
  hasRole(roles: UserRole | UserRole[]): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    if (!currentUser.userType) {
      // محاولة تحديد الدور من خلال خصائص isXXX
      if (currentUser.isSystemOwner)
        return Array.isArray(roles)
          ? roles.includes(UserRole.SystemOwner)
          : roles === UserRole.SystemOwner;
      if (currentUser.isSuperAdmin)
        return Array.isArray(roles)
          ? roles.includes(UserRole.SuperAdmin)
          : roles === UserRole.SuperAdmin;
      if (currentUser.isCompanyAdmin)
        return Array.isArray(roles)
          ? roles.includes(UserRole.Admin)
          : roles === UserRole.Admin;
      if (currentUser.isDriver)
        return Array.isArray(roles)
          ? roles.includes(UserRole.Driver)
          : roles === UserRole.Driver;
      if (currentUser.isPassenger)
        return Array.isArray(roles)
          ? roles.includes(UserRole.Passenger)
          : roles === UserRole.Passenger;

      return false;
    }

    if (Array.isArray(roles)) {
      return roles.some((role) => currentUser.userType === role);
    }

    return currentUser.userType === roles;
  }

  /**
   * التحقق مما إذا كان المستخدم مشرف أو أعلى
   */
  isAdminOrHigher(): boolean {
    return this.hasRole([
      UserRole.Admin,
      UserRole.SuperAdmin,
      UserRole.SystemOwner,
    ]);
  }

  /**
   * تحديث بيانات الملف الشخصي للمستخدم
   */
  updateProfile(userData: Partial<User>): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('المستخدم غير مصادق عليه'));
    }

    return this.http
      .put<User>(`${this.apiUrl}/profile/${currentUser.id}`, userData)
      .pipe(
        tap((updatedUser) => {
          // دمج بيانات المستخدم المحدثة مع بيانات المستخدم الحالية
          const newUserData = { ...currentUser, ...updatedUser };

          // تحديث التخزين المحلي
          localStorage.setItem('user', JSON.stringify(newUserData));

          // تحديث BehaviorSubject
          this.currentUserSubject.next(newUserData);
        }),
        catchError((error) => throwError(() => error))
      );
  }

  /**
   * تسجيل الخروج
   */
  logout(): void {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  /**
   * التحقق مما إذا كان المستخدم مسجل الدخول
   */
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  /**
   * الحصول على بيانات المستخدم الحالي
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * تسجيل مستخدم جديد كراكب
   */
  registerPassenger(data: PassengerRegisterRequest): Observable<User> {
    console.log('بيانات تسجيل الراكب:', { ...data, password: '******' });

    // Try these endpoints in order until one works
    const endpoints = [
      '/register-passenger', // First try
      '/register/passenger', // Second try
      '/passenger/register', // Third try
    ];

    // Format date to yyyy-MM-dd if it's a Date object
    const formattedData = { ...data };
    if (formattedData.dateOfBirth) {
      // Check if it's a Date object by checking if it has a toISOString method
      if (
        formattedData.dateOfBirth &&
        typeof formattedData.dateOfBirth === 'object' &&
        'toISOString' in formattedData.dateOfBirth
      ) {
        // It's a Date object
        formattedData.dateOfBirth = (formattedData.dateOfBirth as Date)
          .toISOString()
          .split('T')[0];
      } else if (
        typeof formattedData.dateOfBirth === 'string' &&
        formattedData.dateOfBirth.includes('/')
      ) {
        // Convert date format from MM/DD/YYYY to YYYY-MM-DD if needed
        const parts = formattedData.dateOfBirth.split('/');
        if (parts.length === 3) {
          formattedData.dateOfBirth = `${parts[2]}-${parts[0].padStart(
            2,
            '0'
          )}-${parts[1].padStart(2, '0')}`;
        }
      }
    }

    return this.tryRegisterEndpoints(endpoints, 0, formattedData);
  }

  /**
   * Helper method to try multiple registration endpoints
   */
  private tryRegisterEndpoints(
    endpoints: string[],
    index: number,
    data: PassengerRegisterRequest
  ): Observable<User> {
    if (index >= endpoints.length) {
      return throwError(
        () => new Error('Failed to register: All API endpoints failed')
      );
    }

    return this.http
      .post<Record<string, unknown>>(`${this.apiUrl}${endpoints[index]}`, data)
      .pipe(
        tap((response) =>
          console.log(`استجابة التسجيل من ${endpoints[index]}:`, response)
        ),
        map((response) => {
          let userData: Record<string, unknown> = {};

          // Handle different response formats
          if (response['data']) {
            userData = response['data'] as Record<string, unknown>;
          } else {
            userData = response as Record<string, unknown>;
          }

          // Create user object from response data
          const user: User = {
            id:
              typeof userData['id'] === 'string'
                ? parseInt(userData['id'], 10)
                : (userData['id'] as number),
            fullName: (userData['fullName'] as string) || '',
            email: (userData['email'] as string) || '',
            username: (userData['username'] as string) || '',
            userType: UserRole.Passenger,
            // Add role flags
            isSystemOwner: false,
            isSuperAdmin: false,
            isCompanyAdmin: false,
            isDriver: false,
            isPassenger: true,
          };

          console.log('تم إنشاء مستخدم:', user);
          return user;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error(
            `خطأ في تسجيل الراكب باستخدام ${endpoints[index]}:`,
            error
          );

          // If we get a 404, try the next endpoint
          if (error.status === 404 && index < endpoints.length - 1) {
            console.log(
              `محاولة استخدام نقطة النهاية التالية: ${endpoints[index + 1]}`
            );
            return this.tryRegisterEndpoints(endpoints, index + 1, data);
          }

          // Otherwise return the error
          let errorMessage = 'فشل التسجيل';

          if (
            error.error &&
            typeof error.error === 'object' &&
            'message' in error.error
          ) {
            errorMessage = error.error['message'] as string;
          } else if (error.message) {
            errorMessage = error.message;
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }

  /**
   * توجيه المستخدم إلى الصفحة المناسبة حسب دوره
   */
  redirectBasedOnRole(user: User): void {
    // إذا لم يكن هناك مستخدم، توجيه إلى صفحة تسجيل الدخول
    if (!user) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // توجيه حسب دور المستخدم
    if (user.isSystemOwner) {
      // توجيه مالك النظام إلى لوحة تحكم المالك
      this.router.navigate(['/owner/dashboard']);
    } else if (user.isSuperAdmin || user.isCompanyAdmin) {
      // توجيه المشرف الأعلى أو المشرف إلى لوحة تحكم الإدارة
      this.router.navigate(['/admin/dashboard']);
    } else if (user.isDriver) {
      // توجيه السائق إلى صفحة السائق
      this.router.navigate(['/driver/dashboard']);
    } else {
      // توجيه الراكب إلى الصفحة الرئيسية
      this.router.navigate(['/']);
    }
  }
}
