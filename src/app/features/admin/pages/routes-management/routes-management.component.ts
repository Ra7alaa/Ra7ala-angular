import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../features/settings/pipes/translate.pipe';
import { TranslationService } from '../../../../core/localization/translation.service';
import { RoutesService } from '../../services/routes.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Route, PaginatedRoutesResponse } from '../../models/route.model';
import { User, UserRole } from '../../../auth/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from '../../../../core/localization/language.service';
import { RtlDirective } from '../../../../features/settings/directives/rtl.directive';

// Import new components
import { RouteCreateComponent } from './components/route-create/route-create.component';
// import { RouteEditComponent } from './components/route-edit/route-edit.component';

@Component({
  selector: 'app-routes-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe,
    RtlDirective,
    RouteCreateComponent,
    // RouteEditComponent,
  ],
  templateUrl: './routes-management.component.html',
  styleUrl: './routes-management.component.css',
})
export class RoutesManagementComponent implements OnInit {
  routes: Route[] = [];
  loading = false;
  error: string | null = null;
  currentUser: User | null = null;

  // Expose UserRole enum to the template
  UserRole = UserRole;

  // Expose Math object to template
  Math = Math;

  // Filtering
  searchTerm = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;

  // For edit and details
  selectedRoute: Route | null = null;

  // City options for dropdowns (might be needed for reference)
  cityOptions = [
    { id: 1, name: 'Cairo' },
    { id: 2, name: 'Alexandria' },
    { id: 3, name: 'Luxor' },
    { id: 4, name: 'Aswan' },
    { id: 5, name: 'Hurghada' },
    { id: 6, name: 'Sharm El Sheikh' },
    { id: 7, name: 'Tanta' },
    { id: 8, name: 'Mansoura' },
    { id: 9, name: 'Port Said' },
    { id: 10, name: 'Suez' },
  ];

  // RTL control
  isRtl = false;

  constructor(
    private routesService: RoutesService,
    private authService: AuthService,
    private translationService: TranslationService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadRoutes();

    // Subscribe to language changes for RTL support
    this.languageService.language$.subscribe((language) => {
      this.isRtl = language.rtl;
    });
  }

  loadRoutes(): void {
    this.loading = true;
    this.error = null;

    // Check if the user has a company ID (for company admins)
    const companyId = this.currentUser?.companyId;

    // If user is company admin, fetch routes for their company
    // Otherwise, fetch all routes for system owners
    if (companyId) {
      this.routesService
        .getRoutesByCompanyId(companyId, this.currentPage, this.pageSize)
        .subscribe({
          next: (response: PaginatedRoutesResponse) => {
            // Handle the API response format where routes are in data.routes
            if (response.data && response.data.routes) {
              this.routes = response.data.routes;
              this.totalItems = response.data.totalCount;
              this.totalPages = Math.ceil(
                response.data.totalCount / response.data.pageSize
              );
            } else {
              this.routes = [];
              this.totalItems = 0;
              this.totalPages = 0;
            }
            this.loading = false;
            console.log('Loaded routes:', this.routes);
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error loading routes:', err);
            this.error = 'Failed to load routes. Please try again.';
            this.loading = false;
            // Ensure routes is an empty array on error
            this.routes = [];
          },
        });
    } else {
      // For system owners or super admins who can see all routes
      this.routesService
        .getAllRoutes(this.currentPage, this.pageSize)
        .subscribe({
          next: (response: PaginatedRoutesResponse) => {
            // Handle the API response format where routes are in data.routes
            if (response.data && response.data.routes) {
              this.routes = response.data.routes;
              this.totalItems = response.data.totalCount;
              this.totalPages = Math.ceil(
                response.data.totalCount / response.data.pageSize
              );
            } else {
              this.routes = [];
              this.totalItems = 0;
              this.totalPages = 0;
            }
            this.loading = false;
            console.log('Loaded routes for system owner:', this.routes);
          },
          error: (err: HttpErrorResponse) => {
            console.error('Error loading routes:', err);
            this.error = 'Failed to load routes. Please try again.';
            this.loading = false;
            // Ensure routes is an empty array on error
            this.routes = [];
          },
        });
    }
  }

  // Method to filter routes by status
  filterByStatus(status: 'all' | 'active' | 'inactive'): void {
    this.statusFilter = status;
    // Reset to first page when filtering
    this.currentPage = 1;
    this.loadRoutes();
  }

  // Method to search routes
  searchRoutes(): void {
    // Reset to first page when searching
    this.currentPage = 1;
    this.loadRoutes();
  }

  // Method for pagination
  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.loadRoutes();
  }

  // Format duration string from hours and minutes or estimatedDuration
  formatDuration(
    hours: number | undefined,
    minutes: number | undefined
  ): string {
    // Check for route with estimatedDuration first
    const route = this.routes.find(
      (r) => r.durationHours === hours && r.durationMinutes === minutes
    );

    if (route && route.estimatedDuration) {
      // Convert total minutes from API to hours and minutes
      const totalMinutes = route.estimatedDuration;
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${h} ${this.translationService.translate(
        'admin.routes.hours_placeholder'
      )}, ${m} ${this.translationService.translate(
        'admin.routes.minutes_placeholder'
      )}`;
    }

    // Otherwise use hours and minutes directly
    const h = hours ?? 0; // Use 0 if hours is undefined
    const m = minutes ?? 0; // Use 0 if minutes is undefined
    return `${h} ${this.translationService.translate(
      'admin.routes.hours_placeholder'
    )}, ${m} ${this.translationService.translate(
      'admin.routes.minutes_placeholder'
    )}`;
  }

  // Find city name by ID
  getCityNameById(id: number): string {
    const city = this.cityOptions.find((c) => c.id === id);
    return city ? city.name : 'Unknown';
  }

  // Handler for route creation event
  onRouteCreated(success: boolean): void {
    if (success) {
      // Close the modal programmatically
      document.getElementById('closeAddRouteModal')?.click();
      // Reload routes
      this.loadRoutes();
    }
  }

  // Handler for route update event
  onRouteUpdated(success: boolean): void {
    if (success) {
      // Close the modal programmatically
      document.getElementById('closeEditRouteModal')?.click();
      // Reload routes
      this.loadRoutes();
      // Clear selection
      this.selectedRoute = null;
    }
  }

  // Set up the selected route for editing
  selectRouteForEdit(route: Route): void {
    this.selectedRoute = route;
  }

  // View route details
  viewRouteDetails(route: Route): void {
    this.selectedRoute = route;
  }

  // Method to delete a route
  deleteRoute(id: number): void {
    if (
      confirm(this.translationService.translate('admin.routes.delete_confirm'))
    ) {
      this.routesService.deleteRoute(id).subscribe({
        next: () => {
          // Reload routes
          this.loadRoutes();
          // Clear selection if the deleted route was selected
          if (this.selectedRoute && this.selectedRoute.id === id) {
            this.selectedRoute = null;
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error deleting route:', err);
          this.error = 'Failed to delete route. Please try again.';
        },
      });
    }
  }
}
