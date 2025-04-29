// import { Injectable } from '@angular/core';
// import {
//   HttpClient,
//   HttpErrorResponse,
//   HttpParams,
// } from '@angular/common/http';
// import { Observable, throwError } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { environment } from '../../../../environments/environment';
// import {
//   User,
//   UserRole,
//   AdminRegisterRequest,
//   DriverRegisterRequest,
// } from '../../auth/models/user.model';

// @Injectable({
//   providedIn: 'root',
// })
// export class UserManagementService {
//   private apiUrl = `${environment.apiUrl}/api/Users`;
//   private authApiUrl = `${environment.apiUrl}/api/Auth`;

//   constructor(private http: HttpClient) {}

//   /**
//    * Get all users (with optional filters)
//    * @param userType Optional user type filter
//    * @param companyId Optional company ID filter
//    */
//   getUsers(userType?: UserRole, companyId?: number): Observable<User[]> {
//     let params = new HttpParams();

//     if (userType) {
//       params = params.append('userType', userType);
//     }

//     if (companyId) {
//       params = params.append('companyId', companyId.toString());
//     }

//     return this.http
//       .get<User[]>(this.apiUrl, { params })
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * Get a specific user by ID
//    */
//   getUserById(id: number): Observable<User> {
//     return this.http
//       .get<User>(`${this.apiUrl}/${id}`)
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * Create a new admin user (requires SystemOwner or SuperAdmin permission)
//    */
//   createAdmin(adminData: AdminRegisterRequest): Observable<User> {
//     return this.http
//       .post<User>(`${this.authApiUrl}/register/admin`, adminData)
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * Create a new driver user (requires SuperAdmin or Admin permission)
//    */
//   createDriver(driverData: DriverRegisterRequest): Observable<User> {
//     return this.http
//       .post<User>(`${this.authApiUrl}/register/driver`, driverData)
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * Update a user
//    */
//   updateUser(id: number, userData: Partial<User>): Observable<User> {
//     return this.http
//       .put<User>(`${this.apiUrl}/${id}`, userData)
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * Delete a user
//    */
//   deleteUser(id: number): Observable<any> {
//     return this.http
//       .delete(`${this.apiUrl}/${id}`)
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * Reset a user's password (admin function)
//    */
//   resetUserPassword(userId: number): Observable<any> {
//     return this.http
//       .post(`${this.apiUrl}/${userId}/reset-password`, {})
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * Change a user's status (activate/deactivate)
//    */
//   changeUserStatus(userId: number, isActive: boolean): Observable<any> {
//     return this.http
//       .post(`${this.apiUrl}/${userId}/status`, { isActive })
//       .pipe(catchError(this.handleError));
//   }

//   /**
//    * Get admins for a specific company
//    */
//   getCompanyAdmins(companyId: number): Observable<User[]> {
//     return this.getUsers(UserRole.Admin, companyId);
//   }

//   /**
//    * Get drivers for a specific company
//    */
//   getCompanyDrivers(companyId: number): Observable<User[]> {
//     return this.getUsers(UserRole.Driver, companyId);
//   }

//   /**
//    * Get all system owners
//    */
//   getSystemOwners(): Observable<User[]> {
//     return this.getUsers(UserRole.SystemOwner);
//   }

//   /**
//    * Get all super admins
//    */
//   getSuperAdmins(): Observable<User[]> {
//     return this.getUsers(UserRole.SuperAdmin);
//   }

//   /**
//    * Error handling
//    */
//   private handleError(error: HttpErrorResponse) {
//     console.error('API error:', error);

//     if (error.status === 0) {
//       // Network error
//       return throwError(
//         () =>
//           new Error(
//             'Cannot connect to server. Please check your internet connection.'
//           )
//       );
//     }

//     const errorMessage =
//       error.error?.message || error.message || 'An unknown error occurred';
//     return throwError(() => new Error(errorMessage));
//   }
// }
