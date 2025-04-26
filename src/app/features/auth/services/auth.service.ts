import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap, catchError } from 'rxjs/operators';

interface User {
  id?: string;
  name?: string;
  email: string;
  token?: string;
}

interface AuthResponse {
  token: string;
  id: string;
  email: string;
  username: string;
  fullName: string;
  userType: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://localhost:7111/api/Auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, { name, email, password })
      .pipe(
        tap(response => {
          const user: User = {
            id: response.id,
            name: response.fullName,
            email: response.email,
            token: response.token
          };
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('Registration error:', error);
          if (error.status === 0) {
            return throwError(() => new Error('Unable to connect to the server. Please make sure the backend is running.'));
          }
          return throwError(() => error);
        })
      );
  }

  registerPassenger(user: {
    email: string;
    username: string;
    password: string;
    fullName: string;
    profilePictureUrl: string;
    address: string;
    dateOfBirth: string;
    phoneNumber: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('https://localhost:7111/api/Auth/register/passenger', user).pipe(
      tap(response => {
        const user: User = {
          id: response.id,
          name: response.fullName,
          email: response.email,
          token: response.token
        };
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          const user: User = {
            id: response.id,
            name: response.fullName,
            email: response.email,
            token: response.token
          };
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError(error => {
          console.error('Login error:', error);
          if (error.status === 0) {
            return throwError(() => new Error('Unable to connect to the server. Please make sure the backend is running.'));
          }
          return throwError(() => error);
        })
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
