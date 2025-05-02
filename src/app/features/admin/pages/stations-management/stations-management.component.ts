import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StationsService } from '../../services/stations.service';
import { Station } from '../../models/station.model';
import { AuthService } from '../../../auth/services/auth.service';
import { User, UserRole } from '../../../auth/models/user.model';
import { TranslatePipe } from '../../../../features/settings/pipes/translate.pipe';
import { TranslationService } from '../../../../core/localization/translation.service';

@Component({
  selector: 'app-stations-management',
  templateUrl: './stations-management.component.html',
  styleUrls: ['./stations-management.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslatePipe],
})
export class StationsManagementComponent implements OnInit {
  stations: Station[] = [];
  loading = false;
  error: string | null = null;
  currentUser: User | null = null;

  // Expose UserRole enum to the template
  UserRole = UserRole;

  // Filtering
  filterSystemOwned: boolean | null = null;
  searchTerm = '';

  // Pagination
  currentPage = 1;
  pageSize = 20; // Fixed page size at 20
  totalItems = 0;

  constructor(
    private stationsService: StationsService,
    private authService: AuthService,
    private router: Router,
    private translateService: TranslationService
  ) {}

  ngOnInit(): void {
    this.loadStations();
    this.currentUser = this.authService.getCurrentUser();
  }

  loadStations(): void {
    this.loading = true;
    this.error = null;

    this.stationsService.getAllStations().subscribe({
      next: (stations) => {
        this.stations = stations;
        this.totalItems = stations.length;

        // Check if current page is valid after data is loaded
        this.validateCurrentPage();

        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load stations: ' + err.message;
        this.loading = false;
      },
    });
  }

  // Validate that current page is within valid range
  validateCurrentPage(): void {
    const maxPage = this.totalPages;
    if (maxPage > 0 && this.currentPage > maxPage) {
      this.currentPage = maxPage;
    } else if (this.currentPage < 1) {
      this.currentPage = 1;
    }
  }

  // Filter stations based on search term and system owned filter
  get filteredStations(): Station[] {
    const filtered = this.stations.filter((station) => {
      // Apply system ownership filter if set
      if (
        this.filterSystemOwned !== null &&
        station.isSystemOwned !== this.filterSystemOwned
      ) {
        return false;
      }

      // Apply search term if set
      if (this.searchTerm && this.searchTerm.trim() !== '') {
        const term = this.searchTerm.toLowerCase();
        return (
          station.name.toLowerCase().includes(term) ||
          station.cityName.toLowerCase().includes(term) ||
          (station.companyName &&
            station.companyName.toLowerCase().includes(term))
        );
      }

      return true;
    });

    this.totalItems = filtered.length;

    // Validate current page after filtering
    this.validateCurrentPage();

    // Apply pagination with fixed page size
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(startIndex, startIndex + this.pageSize);
  }

  // Get the start item number of the current page
  get startItemNumber(): number {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  // Get the end item number of the current page
  get endItemNumber(): number {
    if (this.totalItems === 0) return 0;
    return Math.min(
      (this.currentPage - 1) * this.pageSize + this.filteredStations.length,
      this.totalItems
    );
  }

  // Pagination methods
  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItems / this.pageSize));
  }

  get pages(): number[] {
    const visiblePages = 5; // Number of page buttons to show
    const pagesArray: number[] = [];

    if (this.totalPages <= visiblePages) {
      // Show all pages if total pages is less than visible pages
      for (let i = 1; i <= this.totalPages; i++) {
        pagesArray.push(i);
      }
    } else {
      // Calculate range of pages to show
      let startPage = Math.max(
        1,
        this.currentPage - Math.floor(visiblePages / 2)
      );
      let endPage = startPage + visiblePages - 1;

      // Adjust if we're near the end
      if (endPage > this.totalPages) {
        endPage = this.totalPages;
        startPage = Math.max(1, endPage - visiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pagesArray.push(i);
      }
    }

    return pagesArray;
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;

      // Use setTimeout to ensure DOM is updated before scrolling
      setTimeout(() => {
        // Find table element and scroll to it if exists
        const tableElement = document.querySelector('.table-responsive');
        if (tableElement) {
          tableElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Fallback: scroll to top if table not found
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 0);
    }
  }

  // Check if current user can create station
  canCreateStation(): boolean {
    if (!this.currentUser) return false;

    // System Owners and SuperAdmins can create any station
    if (
      this.currentUser.userType === UserRole.SystemOwner ||
      this.currentUser.userType === UserRole.SuperAdmin
    ) {
      return true;
    }

    // Admins can only create stations for their company
    if (this.currentUser.userType === UserRole.Admin) {
      return true; // They can create, but in the creation form we'll restrict to company stations
    }

    return false;
  }

  // Check if current user can edit a specific station
  canEditStation(station: Station): boolean {
    if (!this.currentUser) return false;

    // System Owners and SuperAdmins can edit any station
    if (
      this.currentUser.userType === UserRole.SystemOwner ||
      this.currentUser.userType === UserRole.SuperAdmin
    ) {
      return true;
    }

    // Admins can only edit their own company's stations
    if (this.currentUser.userType === UserRole.Admin) {
      // Can't edit system stations
      if (station.isSystemOwned) {
        return false;
      }

      // Can only edit stations belonging to their company
      return station.companyId === this.currentUser.companyId;
    }

    return false;
  }

  // Check if current user can delete a specific station
  canDeleteStation(station: Station): boolean {
    if (!this.currentUser) return false;

    // System Owners and SuperAdmins can delete any station
    if (
      this.currentUser.userType === UserRole.SystemOwner ||
      this.currentUser.userType === UserRole.SuperAdmin
    ) {
      return true;
    }

    // Admins can only delete their own company's stations
    if (this.currentUser.userType === UserRole.Admin) {
      // Can't delete system stations
      if (station.isSystemOwned) {
        return false;
      }

      // Can only delete stations belonging to their company
      return station.companyId === this.currentUser.companyId;
    }

    return false;
  }

  // Navigate to station details
  viewStationDetails(id: number): void {
    this.router.navigate(['/admin/stations', id]);
  }

  // Navigate to station edit
  navigateToEdit(id: number): void {
    const station = this.stations.find((s) => s.id === id);
    if (station && !this.canEditStation(station)) {
      alert(
        this.translateService.translate('admin.stations.no_permission_edit')
      );
      return;
    }

    this.router.navigate(['/admin/stations', id, 'edit']);
  }

  // Navigate to create new station
  navigateToCreate(): void {
    if (!this.canCreateStation()) {
      alert(
        this.translateService.translate('admin.stations.no_permission_create')
      );
      return;
    }

    this.router.navigate(['/admin/stations/create']);
  }

  // Delete a station
  deleteStation(id: number): void {
    const station = this.stations.find((s) => s.id === id);
    if (!station) {
      alert(this.translateService.translate('admin.stations.not_found'));
      return;
    }

    if (!this.canDeleteStation(station)) {
      alert(
        this.translateService.translate('admin.stations.no_permission_delete')
      );
      return;
    }

    if (
      confirm(this.translateService.translate('admin.stations.confirm_delete'))
    ) {
      this.loading = true;
      this.stationsService.deleteStation(id).subscribe({
        next: () => {
          this.stations = this.stations.filter((s) => s.id !== id);
          this.loading = false;
        },
        error: (err) => {
          this.error =
            this.translateService.translate('admin.stations.delete_error') +
            ': ' +
            err.message;
          this.loading = false;
        },
      });
    }
  }

  // Filter by system owned status
  filterByOwnership(isSystemOwned: boolean | null): void {
    this.filterSystemOwned = isSystemOwned;
    this.currentPage = 1; // Reset to first page when filtering
  }

  // Reset all filters
  resetFilters(): void {
    this.filterSystemOwned = null;
    this.searchTerm = '';
    this.currentPage = 1; // Reset to first page when clearing filters
  }

  // Helper method to get city translation
  getCityTranslation(cityName: string): string {
    // Normalize city name to handle differences from API
    const normalizedCityName = this.normalizeCityName(cityName);

    // Try to get translation using normalized city name
    const translationKey = `cities.${normalizedCityName}`;
    const translation = this.translateService.translate(translationKey);

    // If translation returns the key itself, it means translation is not found
    // In this case, return the original city name with first letter capitalized
    if (translation === translationKey) {
      return this.capitalizeFirstLetter(cityName);
    }

    return translation;
  }

  // Helper to normalize city names from API to match translation keys
  private normalizeCityName(cityName: string): string {
    // Convert to lowercase and remove any special formatting
    let normalized = cityName.toLowerCase().trim();

    // Handle common formatting in city names from API
    normalized = normalized.replace(/cities\./, '');

    // Remove dots
    normalized = normalized.replace(/\./g, '');

    // Replace spaces with underscores for multi-word city names
    normalized = normalized.replace(/\s+/g, '_');

    // Special case mappings for city names that don't match our translation keys
    const mappings: Record<string, string> = {
      el_mahalla_el_kubra: 'el_mahalla',
      'cities.damietta': 'damietta',
      damietta: 'damietta',
      'cities.el_mahalla_el_kubra': 'el_mahalla',
      kafr_el_sheikh: 'kafr_el_sheikh',
      'cities.kafr_el_sheikh': 'kafr_el_sheikh',
      el_santa: 'el_santa',
    };

    return mappings[normalized] || normalized;
  }

  // Helper to capitalize first letter of each word in city name
  private capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
}
