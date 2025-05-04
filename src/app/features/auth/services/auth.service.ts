import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  User,
  LoginRequest,
  UserRole,
  LoginResponse,
  PassengerRegisterRequest,
} from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/api/Auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Flag to indicate whether authentication is initialized
  private authInitialized = false;

  constructor(private router: Router, private http: HttpClient) {
    // Initialize authentication state immediately
    this.initializeAuth();
  }

  // Initialize authentication state - this method will be called only once
  private initializeAuth(): void {
    try {
      const storedUser = localStorage.getItem('user');

      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user && user.token) {
          console.log('Authentication initialized from stored user data');
          this.currentUserSubject.next(user);
        }
      }

      this.authInitialized = true;
    } catch (error) {
      console.error('Error initializing authentication state:', error);
      this.authInitialized = true;
    }
  }

  // Login method using only data returned from login response
  login(credentials: LoginRequest): Observable<User> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        map((response) => {
          console.log('Login response received:', response);

          // التحقق من صحة الاستجابة
          if (response.statusCode !== 200 || !response.data) {
            throw new Error(response.message || 'Login failed');
          }

          // استخراج البيانات الأساسية للمستخدم من الاستجابة
          const userData = response.data;
          console.log('User data from login response:', userData);

          // إنشاء كائن المستخدم من بيانات الاستجابة فقط
          const user: User = {
            id: userData.id,
            email: userData.email,
            username: userData.username,
            fullName: userData.fullName,
            token: userData.token,
            userType: userData.userType,
            // تعيين علامات الأدوار بناءً على نوع المستخدم
            isSystemOwner: userData.userType === UserRole.SystemOwner,
            isSuperAdmin: userData.userType === UserRole.SuperAdmin,
            isCompanyAdmin: userData.userType === UserRole.Admin,
            isDriver: userData.userType === UserRole.Driver,
            isPassenger: userData.userType === UserRole.Passenger,
          };

          console.log('User object created with userType:', user.userType);

          // تخزين بيانات المستخدم وتحديث حالة المصادقة
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);

          // توجيه المستخدم مباشرة بناء على userType من استجابة تسجيل الدخول
          this.redirectUserBasedOnResponse(user);

          return user;
        }),
        catchError((error) => {
          console.error('Login error:', error);
          return throwError(() => new Error(error.message || 'Login failed'));
        })
      );
  }

  // Redirect immediately based on login response
  private redirectUserBasedOnResponse(user: User): void {
    if (!user || !user.token) {
      console.error('Cannot redirect: Invalid user or missing token');
      return;
    }

    console.log('Redirecting user based on userType:', user.userType);

    // Ensure userType is properly parsed
    const userTypeValue =
      typeof user.userType === 'string'
        ? isNaN(Number(user.userType))
          ? user.userType
          : Number(user.userType)
        : user.userType;

    console.log('Parsed userType value:', userTypeValue);

    // Direct navigation based on user type from login response
    if (userTypeValue === UserRole.SystemOwner || user.isSystemOwner) {
      console.log('Navigating to system owner dashboard');
      this.router.navigateByUrl('/owner/dashboard', { replaceUrl: true });
    } else if (
      userTypeValue === UserRole.SuperAdmin ||
      userTypeValue === UserRole.Admin ||
      user.isSuperAdmin ||
      user.isCompanyAdmin
    ) {
      console.log('Navigating to admin dashboard');
      this.router.navigateByUrl('/admin/dashboard', { replaceUrl: true });
    } else if (userTypeValue === UserRole.Driver || user.isDriver) {
      console.log('Navigating to driver dashboard');
      this.router.navigateByUrl('/driver/dashboard', { replaceUrl: true });
    } else {
      console.log('Navigating to passenger home page');
      this.router.navigateByUrl('/', { replaceUrl: true });
    }
  }

  // Get user profile with improved token handling
  getMyProfile(): Observable<User> {
    // Get current user to access token
    const currentUser = this.getCurrentUser();

    if (!currentUser || !currentUser.token) {
      return throwError(() => new Error('Login required'));
    }

    // Define interface for profile response
    interface ProfileResponse {
      id: string;
      email?: string;
      username: string;
      fullName?: string;
      userType: UserRole;
      profilePictureUrl?: string;
      phoneNumber?: string;
      address?: string;
      dateOfBirth?: string;
      companyID?: number;
      companyId?: number;
      companyName?: string;
      department?: string;
    }

    return this.http.get<ProfileResponse>(`${this.apiUrl}/my-profile`).pipe(
      map((profile) => {
        // Merge profile data with current user data (keeping token)
        const updatedUser: User = {
          ...currentUser,
          ...profile,
          token: currentUser.token, // Keep token from current user
          // Set role flags based on userType
          isSystemOwner: profile.userType === UserRole.SystemOwner,
          isSuperAdmin: profile.userType === UserRole.SuperAdmin,
          isCompanyAdmin: profile.userType === UserRole.Admin,
          isDriver: profile.userType === UserRole.Driver,
          isPassenger:
            profile.userType === UserRole.Passenger || !profile.userType,
          // Set additional profile fields
          phoneNumber: profile.phoneNumber || '',
          profilePictureUrl: profile.profilePictureUrl || '',
          address: profile.address || '',
          dateOfBirth: profile.dateOfBirth || '',
          companyId: profile.companyID || profile.companyId || 0,
          companyName: profile.companyName || '',
          department: profile.department || '',
        };

        // Update stored user
        localStorage.setItem('user', JSON.stringify(updatedUser));
        this.currentUserSubject.next(updatedUser);

        return updatedUser;
      }),
      catchError((error) => {
        console.error('Error getting profile:', error);
        return throwError(() => error);
      })
    );
  }

  // Get company ID from user profile
  getCompanyId(): Observable<number> {
    return this.getMyProfile().pipe(
      map((profile) => {
        const companyId = profile.companyId!;
        console.log('Company ID retrieved from profile:', companyId);
        return companyId;
      }),
      catchError((error) => {
        console.error('Error getting company ID:', error);
        return throwError(() => new Error('Failed to get company ID'));
      })
    );
  }

  // Improved logout with cleanup
  logout(): void {
    // Clear all auth data
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Remove the separate token storage too
    this.currentUserSubject.next(null);

    // Navigate to login
    this.router.navigateByUrl('/auth/login');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  // Redirect user based on role
  redirectBasedOnRole(user: User): void {
    if (!user) {
      this.router.navigateByUrl('/auth/login');
      return;
    }

    console.log('Redirecting based on role - User type:', user.userType);

    // Parse userType to ensure it's handled correctly if it's a string
    let userTypeValue: UserRole;
    if (typeof user.userType === 'string') {
      // Handle numeric strings or enum name strings
      if (!isNaN(Number(user.userType))) {
        userTypeValue = Number(user.userType);
      } else {
        // Handle enum as string name
        userTypeValue = UserRole[user.userType as keyof typeof UserRole];
      }
    } else {
      userTypeValue = user.userType;
    }

    console.log('Parsed user type value:', userTypeValue);

    // Also check role flags as backup
    const isSystemOwner =
      user.isSystemOwner || userTypeValue === UserRole.SystemOwner;
    const isSuperAdmin =
      user.isSuperAdmin || userTypeValue === UserRole.SuperAdmin;
    const isAdmin = user.isCompanyAdmin || userTypeValue === UserRole.Admin;
    const isDriver = user.isDriver || userTypeValue === UserRole.Driver;

    // Redirect based on user role with replaceUrl to prevent back navigation to login
    if (isSystemOwner) {
      console.log('Redirecting to owner dashboard...');
      this.router.navigateByUrl('/owner/dashboard', { replaceUrl: true });
    } else if (isSuperAdmin || isAdmin) {
      console.log('Redirecting to admin dashboard...');
      this.router.navigateByUrl('/admin/dashboard', { replaceUrl: true });
    } else if (isDriver) {
      console.log('Redirecting to driver dashboard...');
      this.router.navigateByUrl('/driver/dashboard', { replaceUrl: true });
    } else {
      console.log('Redirecting to home page as passenger or default...');
      this.router.navigateByUrl('/', { replaceUrl: true });
    }
  }

  // Check if user has specific role
  hasRole(role: UserRole | UserRole[]): boolean {
    const currentUser = this.getCurrentUser();
    if (!currentUser) return false;

    if (Array.isArray(role)) {
      return role.includes(currentUser.userType);
    }

    return currentUser.userType === role;
  }

  // Register a new passenger with improved navigation
  registerPassenger(data: PassengerRegisterRequest): Observable<User> {
    interface RegisterResponse {
      statusCode?: number;
      message?: string;
      data?: {
        id?: string;
        email?: string;
        username?: string;
        fullName?: string;
        token?: string;
        phoneNumber?: string;
        profilePictureUrl?: string;
        address?: string;
        dateOfBirth?: string;
        userType?: UserRole;
      };
    }

    return this.http
      .post<RegisterResponse>(`${this.apiUrl}/register-passenger`, data)
      .pipe(
        map((response) => {
          // Check if response has the expected structure
          if (response.statusCode && response.statusCode !== 200) {
            throw new Error(response.message || 'Registration failed');
          }

          // Create a user object from the response
          const userData = response.data || {};
          const user: User = {
            id: userData.id || '',
            email: userData.email || data.email,
            username: userData.username || data.username,
            fullName: userData.fullName || data.fullName,
            token: userData.token || '',
            userType: UserRole.Passenger, // Default to passenger for registrations
            phoneNumber: userData.phoneNumber || data.phoneNumber,
            profilePictureUrl:
              userData.profilePictureUrl || data.profilePictureUrl,
            address: userData.address || data.address,
            dateOfBirth: userData.dateOfBirth || data.dateOfBirth,
            isPassenger: true,
          };

          // Only save to localStorage if we got a token back
          if (userData.token) {
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);

            // Auto-navigate to appropriate page
            this.redirectBasedOnRole(user);
          }

          return user;
        }),
        catchError((error) => {
          console.error('Registration error:', error);
          return throwError(() => error);
        })
      );
  }

  // Update user profile information
  updateProfile(userData: Partial<User>): Observable<User> {
    const currentUser = this.getCurrentUser();

    if (!currentUser || !currentUser.id) {
      return throwError(() => new Error('User not authenticated'));
    }

    return this.http
      .put<User>(`${this.apiUrl}/profile/${currentUser.id}`, userData)
      .pipe(
        map((updatedProfile) => {
          // Merge updated profile with current user data
          const updatedUser = {
            ...currentUser,
            ...updatedProfile,
            token: currentUser.token, // Ensure token is preserved
          };

          // Update in localStorage and subject
          localStorage.setItem('user', JSON.stringify(updatedUser));
          this.currentUserSubject.next(updatedUser);

          return updatedUser;
        }),
        catchError((error) => {
          console.error('Error updating profile:', error);
          return throwError(() => error);
        })
      );
  }
}
