import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompanyService } from '../../services/company.service';
import { Company } from '../../models/company.model';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, of, tap } from 'rxjs';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { RtlDirective } from '../../../settings/directives/rtl.directive';
import { LanguageService } from '../../../../core/localization/language.service';

interface Activity {
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  icon: string;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, TranslatePipe, RtlDirective],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true,
})
export class DashboardComponent implements OnInit {
  // Dashboard data
  activeCompaniesCount = 0;
  pendingRequestsCount = 0;
  dailyTripsCount = 0;

  // Recent data
  recentRequests: Company[] = [];
  recentActivities: Activity[] = [];
  recentCompanies: Company[] = [];

  // Loading states
  isLoading = true;
  hasError = false;

  // Debug information
  debugInfo = {
    apiCalls: [] as string[],
    responses: [] as unknown[],
    errors: [] as string[],
  };

  constructor(
    private companyService: CompanyService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading = true;
    this.hasError = false;
    this.debugInfo.apiCalls = [];
    this.debugInfo.responses = [];
    this.debugInfo.errors = [];

    console.log('Starting to load dashboard data...');

    // Using forkJoin to load data in parallel
    forkJoin({
      activeCompanies: this.companyService.getActiveCompanies(1, 10).pipe(
        tap((response) => {
          console.log(
            'Raw active companies response:',
            JSON.stringify(response)
          );
        }),
        catchError((error) => {
          console.error('Failed to fetch active companies', error);
          this.debugInfo.errors.push(
            `Active companies error: ${error.message || JSON.stringify(error)}`
          );
          return of(null);
        })
      ),
      pendingCompanies: this.companyService.getPendingCompanies(1, 10).pipe(
        tap((response) => {
          console.log(
            'Raw pending companies response:',
            JSON.stringify(response)
          );
        }),
        catchError((error) => {
          console.error('Failed to fetch pending companies', error);
          this.debugInfo.errors.push(
            `Pending companies error: ${error.message || JSON.stringify(error)}`
          );
          return of(null);
        })
      ),

      recentlyRegisteredCompanies: this.companyService
        .getActiveCompanies(1, 5)
        .pipe(
          tap((response) => {
            console.log(
              'Raw recently registered companies response:',
              JSON.stringify(response)
            );
          }),
          catchError((error) => {
            console.error(
              'Failed to fetch recently registered companies',
              error
            );
            this.debugInfo.errors.push(
              `Recently registered companies error: ${
                error.message || JSON.stringify(error)
              }`
            );
            return of(null);
          })
        ),
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          console.log('Dashboard data loading completed');
          console.log('Debug info:', this.debugInfo);
        })
      )
      .subscribe({
        next: (results) => {
          console.log('API responses received:', results);

          // Handle active companies
          if (results.activeCompanies) {
            this.debugInfo.apiCalls.push('getActiveCompanies');
            this.debugInfo.responses.push(results.activeCompanies);

            // Check if we have companies array
            if (
              results.activeCompanies.companies &&
              Array.isArray(results.activeCompanies.companies)
            ) {
              // Calculate active companies count based on length of array instead of totalCount
              this.activeCompaniesCount =
                results.activeCompanies.companies.length;
            } else {
              // Fallback to totalCount if available
              this.activeCompaniesCount =
                results.activeCompanies.totalCount || 0;
            }

            console.log(
              'Active companies count (calculated):',
              this.activeCompaniesCount
            );
          }

          // Handle pending companies
          if (results.pendingCompanies) {
            this.debugInfo.apiCalls.push('getPendingCompanies');
            this.debugInfo.responses.push(results.pendingCompanies);

            // Check if we have companies array
            if (
              results.pendingCompanies.companies &&
              Array.isArray(results.pendingCompanies.companies)
            ) {
              // Calculate pending requests count based on length of array instead of totalCount
              this.pendingRequestsCount =
                results.pendingCompanies.companies.length;
              this.recentRequests = results.pendingCompanies.companies;
            } else {
              // Fallback to totalCount if available
              this.pendingRequestsCount =
                results.pendingCompanies.totalCount || 0;
              this.recentRequests = [];
            }

            console.log(
              'Pending requests count (calculated):',
              this.pendingRequestsCount
            );
            console.log('Recent requests:', this.recentRequests);
          }

          // Handle recently registered companies
          if (results.recentlyRegisteredCompanies) {
            this.debugInfo.apiCalls.push('getAllCompanies');
            this.debugInfo.responses.push(results.recentlyRegisteredCompanies);

            // Check if we have companies array
            if (
              results.recentlyRegisteredCompanies.companies &&
              Array.isArray(results.recentlyRegisteredCompanies.companies)
            ) {
              this.recentCompanies =
                results.recentlyRegisteredCompanies.companies;
            } else {
              this.recentCompanies = [];
            }

            console.log('Recently registered companies:', this.recentCompanies);
          }

          // Calculate daily trips - for now, let's use a better calculation based on active companies count
          // Since each company might have multiple routes and multiple daily trips
          if (this.activeCompaniesCount > 0) {
            // Assuming each company has an average of 3 daily trips per route
            const averageTripsPerRoute = 3;
            this.dailyTripsCount = this.recentCompanies.reduce(
              (total, company) => {
                const routes = company.statistics?.totalRoutes || 0;
                return total + routes * averageTripsPerRoute;
              },
              0
            );

            // If we still have 0, set a minimum number based on companies
            if (this.dailyTripsCount === 0) {
              this.dailyTripsCount = this.activeCompaniesCount * 5; // Each company runs minimum 5 trips daily
            }
          }

          console.log('Daily trips count (calculated):', this.dailyTripsCount);

          // Mock recent activities to match the actual companies
          if (this.recentCompanies.length > 0) {
            this.recentActivities = [];

            // Create activities based on actual companies
            this.recentCompanies.slice(0, 2).forEach((company) => {
              this.recentActivities.push({
                type: 'approval',
                title: `Manager assigned to ${company.name}`,
                message: `${
                  company.superAdmin?.fullName || 'A new manager'
                } has been assigned as manager for ${company.name}`,
                timestamp: new Date(),
                icon: 'fas fa-check-circle',
                status: 'success',
              });
            });

            // Add a standard rejection activity
            this.recentActivities.push({
              type: 'rejection',
              title: 'Request from invalid company rejected',
              message: 'Request rejected due to missing required documents',
              timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
              icon: 'fas fa-times-circle',
              status: 'danger',
            });
          } else {
            // Fallback mock activities
            this.recentActivities = [
              {
                type: 'approval',
                title: 'Manager assigned to Cairo Bus Company',
                message:
                  'Ahmed Mohamed has been assigned as manager for Cairo Bus Company',
                timestamp: new Date(),
                icon: 'fas fa-check-circle',
                status: 'success',
              },
              {
                type: 'rejection',
                title: 'Request from invalid company rejected',
                message: 'Request rejected due to missing required documents',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                icon: 'fas fa-times-circle',
                status: 'danger',
              },
              {
                type: 'approval',
                title: 'Request from Alexandria Transport Company approved',
                message:
                  'Registration request approved and company account created',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
                icon: 'fas fa-check-circle',
                status: 'success',
              },
            ];
          }
        },
        error: (error) => {
          console.error('Overall error loading dashboard data', error);
          this.hasError = true;
          this.debugInfo.errors.push(
            `Overall error: ${error.message || JSON.stringify(error)}`
          );
        },
      });
  }

  refresh(): void {
    console.log('Refreshing dashboard data...');
    this.loadDashboardData();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return this.translate('common.not_available');

    const currentLang = this.languageService.getCurrentLanguage().code;
    const locale = currentLang === 'ar' ? 'ar-EG' : 'en-US';

    return new Date(date).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  translate(key: string): string {
    // This is a helper method that would typically use TranslationService directly
    // but since we're using the pipe in the template, we just need this for programmatic translation
    return key === 'common.not_available'
      ? this.languageService.getCurrentLanguage().code === 'ar'
        ? 'غير متاح'
        : 'N/A'
      : key;
  }
}
