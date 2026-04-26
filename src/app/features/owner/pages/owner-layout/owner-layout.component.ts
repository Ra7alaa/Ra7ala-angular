import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CompanyService } from '../../services/company.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { RtlDirective } from '../../../settings/directives/rtl.directive';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-owner-layout',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    CommonModule,
    TranslatePipe,
    RtlDirective,
  ],
  templateUrl: './owner-layout.component.html',
  styleUrl: './owner-layout.component.css',
  standalone: true,
})
export class OwnerLayoutComponent implements OnInit, OnDestroy {
  pendingRequestsCount = 0;
  isSidebarVisible = false;
  private subscription: Subscription | null = null;

  constructor(
    private companyService: CompanyService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPendingRequestsCount();

    // Subscribe to real-time updates from the service
    this.subscription = this.companyService.pendingCount$.subscribe((count) => {
      this.pendingRequestsCount = count;
    });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleSidebar(): void {
    this.isSidebarVisible = !this.isSidebarVisible;
  }

  loadPendingRequestsCount(): void {
    // Use a temporary subscription for the initial load
    const tempSubscription = this.companyService
      .getPendingCompanies(1, 99)
      .subscribe({
        next: (response) => {
          const count = response.totalCount || 0;
          this.pendingRequestsCount = count;
          // Update the shared count in the service
          this.companyService.updatePendingCount(count);
        },
        error: (error) => {
          console.error('Error loading pending requests count:', error);
          this.pendingRequestsCount = 0;
        },
        complete: () => {
          tempSubscription.unsubscribe();
        },
      });
  }
  // تسجيل الخروج
  logout(): void {
    this.authService.logout();
    this.isSidebarVisible = false;
    window.location.href = '/auth/login';
  }
}
