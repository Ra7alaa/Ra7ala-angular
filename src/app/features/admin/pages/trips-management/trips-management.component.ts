import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../features/settings/pipes/translate.pipe';
import { TranslationService } from '../../../../core/localization/translation.service';
import { TripsService } from '../../services/trips.service';
import { Trip, PaginatedTripsResponse } from '../../models/trip.model';
import { LanguageService } from '../../../../core/localization/language.service';
import { UserRole } from '../../../auth/models/user.model';
import { TripCreateComponent } from './components/trip-create/trip-create.component';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-trips-management',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule, TripCreateComponent],
  templateUrl: './trips-management.component.html',
  styleUrl: './trips-management.component.css',
})
export class TripsManagementComponent implements OnInit {
  // Trip data
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalTrips = 0;
  totalPages = 1;
  itemsPerPage = 10; // عدد العناصر في كل صفحة
  totalItems = 0; // إجمالي عدد العناصر

  // Filters
  searchTerm = '';
  selectedStatus = '';

  // Loading state
  isLoading = false;
  errorMessage = '';

  // User role and company ID
  isSystemOwner = false;
  companyId: number | null = null;

  constructor(
    private tripsService: TripsService,
    private translationService: TranslationService,
    private languageService: LanguageService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check if user is system owner
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.userType === UserRole.SystemOwner) {
      this.isSystemOwner = true;
      // If system owner, load all trips directly
      this.loadTrips();
    } else {
      // For other roles, get company ID first then load trips
      this.getCompanyIdAndLoadTrips();
    }
  }

  getCompanyIdAndLoadTrips(): void {
    // Use the new method to get companyId from profile
    this.authService.getCompanyId().subscribe({
      next: (companyId: number) => {
        console.log('Company ID retrieved from profile:', companyId);
        this.companyId = companyId;
        // Load trips after getting companyId
        this.loadTrips();
      },
      error: (error: Error) => {
        console.error('Error getting company ID:', error);
        this.errorMessage = 'Failed to get company ID. Cannot load trips.';
        // Try to get from localStorage as fallback
        this.getUserDataFromLocalStorage();
        if (this.companyId) {
          this.loadTrips();
        }
      },
    });
  }

  getUserDataFromLocalStorage(): void {
    // This is now a fallback method
    try {
      const userString = localStorage.getItem('user');
      if (userString) {
        const userData = JSON.parse(userString);

        // Extract companyId from localStorage
        if (userData && userData.companyId) {
          this.companyId = Number(userData.companyId);
          console.log(
            'CompanyId retrieved from localStorage fallback:',
            this.companyId
          );
        }

        // Check if user is system owner
        if (userData && userData.userType === UserRole.SystemOwner) {
          this.isSystemOwner = true;
        }
      } else {
        console.log('No user data found in localStorage');
      }
    } catch (error) {
      console.error('Error retrieving user data from localStorage:', error);
    }
  }

  loadTrips(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // If companyId is available (user is company admin), filter by company
    if (this.companyId) {
      this.tripsService
        .getTripsByCompanyId(this.companyId, this.currentPage, this.pageSize)
        .subscribe({
          next: (response) => {
            this.handleTripsResponse(response);
          },
          error: (error) => {
            this.handleError(error);
          },
        });
    } else {
      // Otherwise load all trips (system owner)
      this.tripsService.getAllTrips(this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.handleTripsResponse(response);
        },
        error: (error) => {
          this.handleError(error);
        },
      });
    }
  }

  handleTripsResponse(response: PaginatedTripsResponse): void {
    this.isLoading = false;
    if (response.statusCode === 200 && response.data) {
      this.trips = response.data.trips || [];
      this.filteredTrips = this.trips;
      this.totalTrips = response.data.totalCount || 0;
      this.totalItems = response.data.totalCount || 0; // تعيين إجمالي عدد العناصر
      this.currentPage = response.data.currentPage || 1;
      this.pageSize = response.data.pageSize || 10;
      this.itemsPerPage = response.data.pageSize || 10; // تعيين عدد العناصر في كل صفحة
      this.totalPages = response.data.totalPages || 1;
    } else {
      this.errorMessage = response.message || 'Error loading trips';
      this.trips = [];
      this.filteredTrips = [];
    }
  }

  handleError(error: unknown): void {
    this.isLoading = false;
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred';
    this.errorMessage = errorMessage || 'An error occurred while loading trips';
    console.error('Error loading trips:', error);
    this.trips = [];
    this.filteredTrips = [];
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadTrips();
  }

  filterByStatus(status: string): void {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadTrips();
  }

  goToPage(page: number): void {
    if (page !== this.currentPage && page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadTrips();
    }
  }

  // Called when a trip is successfully created
  onTripCreated(success: boolean): void {
    if (success) {
      // Close the modal programmatically
      document.getElementById('closeAddTripModal')?.click();

      // Show success message (you could add a toast/notification system here)
      console.log('Trip created successfully!');

      // Reload trips to show the newly created trip
      this.loadTrips();
    }
  }

  // Delete a trip
  deleteTrip(id: number): void {
    if (
      confirm(this.translationService.translate('admin.trips.confirm_delete'))
    ) {
      this.tripsService.deleteTrip(id).subscribe({
        next: (success: boolean) => {
          if (success) {
            console.log('Trip deleted successfully');
            this.loadTrips(); // Reload trips after deletion
          } else {
            this.errorMessage = 'Failed to delete trip';
          }
        },
        error: (error: Error) => {
          console.error('Error deleting trip:', error);
          this.errorMessage = error.message || 'Failed to delete trip';
        },
      });
    }
  }

  get pages(): number[] {
    if (this.totalPages <= 5) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }

    if (this.currentPage <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (this.currentPage >= this.totalPages - 2) {
      return [
        this.totalPages - 4,
        this.totalPages - 3,
        this.totalPages - 2,
        this.totalPages - 1,
        this.totalPages,
      ];
    }

    return [
      this.currentPage - 2,
      this.currentPage - 1,
      this.currentPage,
      this.currentPage + 1,
      this.currentPage + 2,
    ];
  }
}
