import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, switchMap, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';
import { environment } from '../../../../environments/environment';
import { RegisterResponse } from '../pages/register/register.component';
@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/Auth`;
  private user$ = new BehaviorSubject<User | null>(null);
  currentUser$ = this.user$.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
  ) {
    const stored = localStorage.getItem('user');
    if (stored) this.user$.next(JSON.parse(stored));
  }

  login(creds: {
    emailOrUsername: string;
    password: string;
    rememberMe?: boolean;
  }): Observable<User> {
    return this.http
      .post<{
        statusCode: number;
        data: { token: string };
      }>(`${this.api}/login`, creds)
      .pipe(
        map((res) => res.data.token),
        switchMap((token) => this.fetchProfile(token)),
        map((user) => {
          localStorage.setItem('user', JSON.stringify(user));
          this.user$.next(user);
          this.redirect(user.userType);
          return user;
        }),
        catchError((e) => throwError(() => e)),
      );
  }

  private fetchProfile(token: string): Observable<User> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http
      .get<User>(`${this.api}/my-profile`, { headers })
      .pipe(map((profile) => ({ ...profile, token })));
  }

  logout() {
    localStorage.removeItem('user');
    this.user$.next(null);
    this.router.navigateByUrl('/auth/login');
  }

  isLoggedIn() {
    return !!this.user$.value;
  }

  getCurrentUser(): User | null {
    return this.user$.value;
  }

  hasRole(roles: UserRole | readonly UserRole[]): boolean {
    const currentUser = this.user$.value;
    if (!currentUser) {
      return false;
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(currentUser.userType);
  }

  isAdminOrHigher(): boolean {
    return this.hasRole([
      UserRole.SystemOwner,
      UserRole.SuperAdmin,
      UserRole.Admin,
    ]);
  }

  /**
   * تحديث الملف الشخصي مع دعم رفع الصورة
   * @param formData FormData تحتوي على بيانات الملف الشخصي والصورة
   * @returns Observable مع بيانات المستخدم المحدثة
   */
  updatePassengerProfile(formData: FormData): Observable<User> {
    if (!this.user$.value) {
      return throwError(() => new Error('User not authenticated'));
    }

    const token = this.user$.value.token;
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http
      .put<User>(`${this.api}/update-passenger`, formData, { headers })
      .pipe(
        // بعد التحديث نقوم بجلب بيانات الملف الشخصي مرة أخرى لضمان استرجاع أحدث البيانات
        switchMap(() => {
          return this.http
            .get<User>(`${this.api}/my-profile`, { headers })
            .pipe(map((profileData) => ({ ...profileData, token })));
        }),
        map((updatedUser) => {
          // حفظ البيانات المحدثة في الذاكرة المحلية
          const newUser = {
            ...this.user$.value,
            ...updatedUser,
            token,
          };

          // تحديث البيانات المخزنة محليًا
          localStorage.setItem('user', JSON.stringify(newUser));
          this.user$.next(newUser);

          return newUser;
        }),
        catchError((error) => throwError(() => error)),
      );
  }

  // دالة تسجيل مستخدم جديد مع ملف صورة
  registerPassengerWithFile(formData: FormData): Observable<RegisterResponse> {
    return this.http
      .post<RegisterResponse>(`${this.api}/register-passenger`, formData)
      .pipe(catchError((error) => throwError(() => error)));
  }

  /**
   * Get the company ID of the current user from stored profile data.
   * Returns an error if the user is not authenticated or has no companyId.
   */
  getCompanyId(): Observable<number> {
    const currentUser = this.getCurrentUser();

    if (!currentUser) {
      return throwError(() => new Error('User not authenticated'));
    }

    if (currentUser.companyId) {
      return of(Number(currentUser.companyId));
    }

    return throwError(() => new Error('Company ID not found in user profile'));
  }

  /**
   * Redirect user to appropriate dashboard based on role
   */
  redirectBasedOnRole(user: User): void {
    if (!user) return;
    this.redirect(user.userType);
  }

  private redirect(role: UserRole) {
    switch (role) {
      case UserRole.SystemOwner:
        this.router.navigate(['/owner/dashboard']);
        break;
      case UserRole.SuperAdmin:
      case UserRole.Admin:
        this.router.navigate(['/admin/dashboard']);
        break;
      case UserRole.Driver:
      case UserRole.Passenger:
      default:
        this.router.navigate(['/']);
        break;
    }
  }
}
