import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  User,
  AuthResponse,
  LoginRequest,
  PassengerRegisterRequest,
  UserRole,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/Auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private router: Router, private http: HttpClient) {
    this.loadStoredUser();
    console.log('AuthService initialized with API URL:', this.apiUrl);
  }

  private loadStoredUser(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user && user.token) {
          this.currentUserSubject.next(user);
          this.refreshUserData();
        } else {
          this.clearUserData();
        }
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        this.clearUserData();
      }
    }
  }

  private refreshUserData(): void {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.id) return;

    console.log('Refreshing user data for ID:', currentUser.id);
    this.http.get<User>(`${this.apiUrl}/profile`).subscribe({
      next: (updatedUser) => {
        console.log('Received updated user data:', updatedUser);
        const userData = {
          ...currentUser,
          ...updatedUser,
          token: currentUser.token
        };
        this.updateStoredUser(userData);
      },
      error: (error) => {
        console.error('Failed to refresh user data:', error);
        if (error.status === 401) {
          this.clearUserData();
        }
      }
    });
  }

  private clearUserData(): void {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  private updateStoredUser(user: User): void {
    console.log('Updating stored user data:', user);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  hasRole(roles: UserRole | UserRole[]): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    if (!currentUser.userType) {
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

  isAdminOrHigher(): boolean {
    return this.hasRole([
      UserRole.Admin,
      UserRole.SuperAdmin,
      UserRole.SystemOwner,
    ]);
  }

  login(credentials: LoginRequest): Observable<User> {
    console.log('Login attempt with credentials:', { emailOrUsername: credentials.emailOrUsername, password: '****' });
    console.log('Sending request to:', `${this.apiUrl}/login`);
    
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => console.log('Received auth response:', { ...response, token: '****' })),
        map((response) => {
          const user: User = {
            id: response.id,
            fullName: response.fullName,
            email: response.email,
            username: response.username,
            token: response.token,
            userType: response.userType,
            companyId: response.companyId,
            companyName: response.companyName,
            profilePictureUrl: response.profilePictureUrl,
            phoneNumber: response.phoneNumber,
            isSystemOwner: response.userType === UserRole.SystemOwner,
            isSuperAdmin: response.userType === UserRole.SuperAdmin,
            isCompanyAdmin: response.userType === UserRole.Admin,
            isDriver: response.userType === UserRole.Driver,
            isPassenger: response.userType === UserRole.Passenger,
          };
          
          console.log('Mapped user object:', { ...user, token: '****' });
          this.updateStoredUser(user);
          return user;
        }),
        catchError(error => {
          console.error('Login error:', error);
          return throwError(() => new Error(error.error?.message || 'حدث خطأ أثناء تسجيل الدخول'));
        })
      );
  }

  registerPassenger(data: PassengerRegisterRequest): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/register/passenger`, data)
      .pipe(catchError((error) => throwError(() => error)));
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    console.log('Updating profile with data:', userData);
    const currentUser = this.getCurrentUser();
    if (!currentUser?.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http
      .put<User>(`${this.apiUrl}/profile`, userData)
      .pipe(
        tap((updatedUser) => {
          console.log('Received updated user data:', updatedUser);
          const newUserData = {
            ...currentUser,
            ...updatedUser,
            token: currentUser.token
          };
          this.updateStoredUser(newUserData);
        })
      );
  }

  uploadProfilePicture(file: File): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser?.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    return this.http
      .post<User>(`${this.apiUrl}/profile/upload-picture`, formData)
      .pipe(
        tap((updatedUser) => {
          const newUserData = {
            ...currentUser,
            ...updatedUser,
            token: currentUser.token
          };
          this.updateStoredUser(newUserData);
        })
      );
  }

  logout(): void {
    this.clearUserData();
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    const currentUser = this.getCurrentUser();
    return !!(currentUser && currentUser.token);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
