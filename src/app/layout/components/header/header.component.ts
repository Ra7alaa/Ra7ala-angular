import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { User } from '../../../features/auth/models/user.model';

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
      if (user) {
        this.currentUser = { ...user, id: Number(user.id) };
      } else {
        this.currentUser = null;
      }
    });
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
