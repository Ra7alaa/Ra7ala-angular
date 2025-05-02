import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { CompanyService } from '../../services/company.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { RtlDirective } from '../../../settings/directives/rtl.directive';

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
  private subscription: Subscription | null = null;

  constructor(private companyService: CompanyService) {}

  ngOnInit(): void {
    this.loadPendingRequestsCount();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  loadPendingRequestsCount(): void {
    this.subscription = this.companyService
      .getPendingCompanies(1, 99)
      .subscribe({
        next: (response) => {
          this.pendingRequestsCount = response.totalCount || 0;
        },
        error: (error) => {
          console.error('Error loading pending requests count:', error);
          this.pendingRequestsCount = 0;
        },
      });
  }
}
