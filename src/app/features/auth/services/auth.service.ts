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
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('user');
      }
    }
  }

  hasRole(roles: UserRole | UserRole[]): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    if (!currentUser.userType) {
      // Try to determine role from isXXX properties
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

  // Helper method to check if user is admin or higher
  isAdminOrHigher(): boolean {
    return this.hasRole([
      UserRole.Admin,
      UserRole.SuperAdmin,
      UserRole.SystemOwner,
    ]);
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map((response) => {
          // Create a complete user object with role flags
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
            // Add role flags
            isSystemOwner: response.userType === UserRole.SystemOwner,
            isSuperAdmin: response.userType === UserRole.SuperAdmin,
            isCompanyAdmin: response.userType === UserRole.Admin,
            isDriver: response.userType === UserRole.Driver,
            isPassenger: response.userType === UserRole.Passenger,
          };

          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        }),
        catchError((error) => throwError(() => error))
      );
  }

  registerPassenger(data: PassengerRegisterRequest): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/register/passenger`, data)
      .pipe(catchError((error) => throwError(() => error)));
  }

  updateProfile(userData: Partial<User>): Observable<User> {
    const currentUser = this.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http
      .put<User>(`${this.apiUrl}/profile/${currentUser.id}`, userData)
      .pipe(
        tap((updatedUser) => {
          // Merge the updated user data with current user data
          const newUserData = { ...currentUser, ...updatedUser };

          // Update localStorage
          localStorage.setItem('user', JSON.stringify(newUserData));

          // Update the BehaviorSubject
          this.currentUserSubject.next(newUserData);
        }),
        catchError((error) => throwError(() => error))
      );
  }

  logout(): void {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}
