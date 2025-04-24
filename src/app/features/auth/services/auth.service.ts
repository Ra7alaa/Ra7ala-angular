import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User, UserRole } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Demo users for testing without backend
  private users: User[] = [
    {
      id: 1,
      name: 'أحمد محمد',
      email: 'ahmed@example.com',
      token: 'token_123',
      role: UserRole.SystemOwner,
    },
    {
      id: 2,
      name: 'مريم أحمد',
      email: 'mariam@example.com',
      token: 'token_456',
      role: UserRole.CompanyAdmin,
      companyId: 5,
      companyName: 'شركة السفر الشرقية',
    },
  ];

  constructor(private router: Router) {
    // Check if user is stored in localStorage on init
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Observable<User> {
    // Mock API call
    const user = this.users.find((u) => u.email === email);

    if (user) {
      return of(user).pipe(
        delay(1000), // Simulate network delay
        tap((user) => {
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        })
      );
    }

    return throwError(() => new Error('بريد إلكتروني أو كلمة مرور غير صحيحة'));
  }

  register(name: string, email: string, password: string): Observable<User> {
    // Check if user already exists
    const userExists = this.users.some((u) => u.email === email);

    if (userExists) {
      return throwError(() => new Error('البريد الإلكتروني مستخدم بالفعل'));
    }

    // Create new user
    const newUser: User = {
      id: this.users.length + 1,
      name,
      email,
      token: `token_${Date.now()}`,
      role: UserRole.Customer, // Default role
    };

    // In a real app, you would send this to an API
    return of(newUser).pipe(
      delay(1000), // Simulate network delay
      tap((user) => {
        this.users.push(user); // Add to demo users
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
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
