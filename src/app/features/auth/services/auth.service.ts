import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  User,
  UserRole,
  AuthResponse,
  LoginRequest,
  PassengerRegisterRequest,
  DriverRegisterRequest,
  AdminRegisterRequest,
  CompanyCreateRequest,
  Company,
} from '../models/user.model';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/api/Auth`;
  private companyApiUrl = `${environment.apiUrl}/api/Companies`;

  constructor(private router: Router, private http: HttpClient) {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.setUserRoleFlags(user);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Failed to parse stored user data:', error);
        localStorage.removeItem('user');
      }
    }
  }

  // Login method - works for all user types
  login(credentials: LoginRequest): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map((response) => this.processUserResponse(response)),
        catchError(this.handleError)
      );
  }

  // Register passenger method
  registerPassenger(registerData: PassengerRegisterRequest): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register/passenger`, registerData)
      .pipe(
        map((response) => this.processUserResponse(response)),
        catchError(this.handleError)
      );
  }

  // Register driver method (for SuperAdmins)
  registerDriver(driverData: DriverRegisterRequest): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register/driver`, driverData)
      .pipe(
        map((response) => this.processUserResponse(response)),
        catchError(this.handleError)
      );
  }

  // Register admin method (for SystemOwner and SuperAdmins)
  registerAdmin(adminData: AdminRegisterRequest): Observable<User> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register/admin`, adminData)
      .pipe(
        map((response) => this.processUserResponse(response)),
        catchError(this.handleError)
      );
  }

// from chat دالة للتحقق من الكود (بس مافيش ال2 اند بوينت دول اصلا )
verifyCode(email: string, code: string): Observable<any> {
  return this.http
    .post<any>(`${this.apiUrl}/verify-code`, { email, code })
    .pipe(catchError(this.handleError)); // استدعاء دالة التعامل مع الأخطاء
}

resendCode(email: string): Observable<any> {
  return this.http
    .post<any>(`${this.apiUrl}/resend-code`, { email })
    .pipe(catchError(this.handleError)); // استدعاء دالة التعامل مع الأخطاء
}


  // Create a company (for SystemOwner)
  createCompany(companyData: CompanyCreateRequest): Observable<Company> {
    return this.http
      .post<Company>(`${this.companyApiUrl}`, companyData)
      .pipe(catchError(this.handleError));
  }

  // Get companies (for SystemOwner)
  getCompanies(): Observable<Company[]> {
    return this.http
      .get<Company[]>(`${this.companyApiUrl}`)
      .pipe(catchError(this.handleError));
  }

  // Get a specific company by ID
  getCompanyById(id: number): Observable<Company> {
    return this.http
      .get<Company>(`${this.companyApiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Update a company (for SystemOwner)
  updateCompany(
    id: number,
    companyData: Partial<Company>
  ): Observable<Company> {
    return this.http
      .put<Company>(`${this.companyApiUrl}/${id}`, companyData)
      .pipe(catchError(this.handleError));
  }

  // Delete a company (for SystemOwner)
  deleteCompany(id: number): Observable<any> {
    return this.http
      .delete(`${this.companyApiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // Get admins for a company (for SuperAdmin)
  getCompanyAdmins(companyId: number): Observable<User[]> {
    let params = new HttpParams();
    params = params.append('companyId', companyId.toString());
    params = params.append('userType', UserRole.Admin);

    return this.http
      .get<User[]>(`${this.apiUrl}/users`, { params })
      .pipe(catchError(this.handleError));
  }

  // Get drivers for a company (for SuperAdmin/Admin)
  getCompanyDrivers(companyId: number): Observable<User[]> {
    let params = new HttpParams();
    params = params.append('companyId', companyId.toString());
    params = params.append('userType', UserRole.Driver);

    return this.http
      .get<User[]>(`${this.apiUrl}/users`, { params })
      .pipe(catchError(this.handleError));
  }

  // Process user response and set up the user object
  private processUserResponse(response: AuthResponse): User {
    if (!response || !response.token) {
      throw new Error('Invalid authentication response');
    }

    const user: User = {
      id: response.id,
      email: response.email,
      username: response.username || response.email,
      fullName: response.fullName || 'Guest',
      token: response.token,
      userType: response.userType,
      companyId: response.companyId,
      companyName: response.companyName,
      profilePictureUrl: response.profilePictureUrl,
      phoneNumber: response.phoneNumber,
    };

    this.setUserRoleFlags(user);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSubject.next(user);

    return user;
  }

  // Set boolean flags based on user role for easier permission checking
  private setUserRoleFlags(user: User): void {
    if (!user || !user.userType) return;

    user.isSystemOwner = user.userType === UserRole.SystemOwner;
    user.isSuperAdmin = user.userType === UserRole.SuperAdmin;
    user.isCompanyAdmin = user.userType === UserRole.Admin;
    user.isDriver = user.userType === UserRole.Driver;
    user.isPassenger = user.userType === UserRole.Passenger;
  }

  // Error handling
  private handleError(error: HttpErrorResponse) {
    console.error('API error:', error);

    if (error.status === 0) {
      // Network error
      return throwError(
        () =>
          new Error(
            'Cannot connect to server. Please check your internet connection.'
          )
      );
    }

    const errorMessage =
      error.error?.message || error.message || 'An unknown error occurred';
    return throwError(() => new Error(errorMessage));
  }

  // Forgot password
  forgotPassword(email: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  // Reset password
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/reset-password`, { token, newPassword })
      .pipe(catchError(this.handleError));
  }

  // Verify reset token
  verifyResetToken(token: string): Observable<boolean> {
    return this.http
      .post<boolean>(`${this.apiUrl}/verify-reset-token`, { token })
      .pipe(catchError(this.handleError));
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.http.put<AuthResponse>(`${this.apiUrl}/profile`, userData).pipe(
      map((response) => this.processUserResponse(response)),
      catchError(this.handleError)
    );
  }

  // Change password
  changePassword(
    currentPassword: string,
    newPassword: string
  ): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/change-password`, { currentPassword, newPassword })
      .pipe(catchError(this.handleError));
  }

  // Logout
  logout(): void {
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']);
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Check if user has specific role
  hasRole(role: UserRole | UserRole[]): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser || !currentUser.userType) return false;

    if (Array.isArray(role)) {
      return role.includes(currentUser.userType);
    }

    return currentUser.userType === role;
  }

  // Check if user is company admin or higher
  isAdminOrHigher(): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser || !currentUser.userType) return false;

    return [UserRole.SystemOwner, UserRole.SuperAdmin, UserRole.Admin].includes(
      currentUser.userType
    );
  }

  // Check if user is super admin or higher
  isSuperAdminOrHigher(): boolean {
    const currentUser = this.currentUserSubject.value;
    if (!currentUser || !currentUser.userType) return false;

    return [UserRole.SystemOwner, UserRole.SuperAdmin].includes(
      currentUser.userType
    );
  }
}
