import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { User, UserRole } from '../../../features/auth/models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  currentUser: User | null = null;
  isMobileMenuOpen = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Subscribe to changes in the authentication state
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  isAdminUser(): boolean {
    return (
      this.currentUser?.userType === UserRole.Admin ||
      this.currentUser?.userType === UserRole.SuperAdmin ||
      this.currentUser?.userType === UserRole.SystemOwner
    );
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenuIfOpen(): void {
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.closeMobileMenuIfOpen();
  }
}
