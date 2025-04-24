import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StationsService } from '../../services/stations.service';
import { Station } from '../../models/station.model';
import { AuthService } from '../../../auth/services/auth.service';
import { User, UserRole } from '../../../auth/models/user.model';

@Component({
  selector: 'app-stations-management',
  templateUrl: './stations-management.component.html',
  styleUrls: ['./stations-management.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
})
export class StationsManagementComponent implements OnInit {
  stations: Station[] = [];
  loading: boolean = false;
  error: string | null = null;
  currentUser: User | null = null;

  // Filtering
  filterSystemOwned: boolean | null = null;
  searchTerm: string = '';

  // Pagination
  currentPage: number = 1;
  pageSize: number = 20; // Fixed page size at 20
  totalItems: number = 0;

  constructor(
    private stationsService: StationsService,
    private authService: AuthService,
    private router: Router
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
        this.loading = false;

        // Check if current page is valid after data is loaded
        this.validateCurrentPage();
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

  // Check if current user can create stations
  canCreateStation(): boolean {
    if (!this.currentUser) return false;

    // System owners can create any station
    if (this.currentUser.role === UserRole.SystemOwner) {
      return true;
    }

    // Company admins can only create stations for their company
    if (this.currentUser.role === UserRole.CompanyAdmin) {
      return true; // They can create, but in the creation form we'll restrict to company stations
    }

    return false;
  }

  // Check if current user can edit a specific station
  canEditStation(station: Station): boolean {
    if (!this.currentUser) return false;

    // System owners can edit any station
    if (this.currentUser.role === UserRole.SystemOwner) {
      return true;
    }

    // Company admins can only edit their own company's stations
    if (this.currentUser.role === UserRole.CompanyAdmin) {
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

    // System owners can delete any station
    if (this.currentUser.role === UserRole.SystemOwner) {
      return true;
    }

    // Company admins can only delete their own company's stations
    if (this.currentUser.role === UserRole.CompanyAdmin) {
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
      alert('You do not have permission to edit this station.');
      return;
    }

    this.router.navigate(['/admin/stations', id, 'edit']);
  }

  // Navigate to create new station
  navigateToCreate(): void {
    if (!this.canCreateStation()) {
      alert('You do not have permission to create a new station.');
      return;
    }

    this.router.navigate(['/admin/stations/create']);
  }

  // Delete a station
  deleteStation(id: number): void {
    const station = this.stations.find((s) => s.id === id);
    if (!station) {
      alert('Station not found.');
      return;
    }

    if (!this.canDeleteStation(station)) {
      alert('You do not have permission to delete this station.');
      return;
    }

    if (confirm('Are you sure you want to delete this station?')) {
      this.loading = true;
      this.stationsService.deleteStation(id).subscribe({
        next: () => {
          this.stations = this.stations.filter((s) => s.id !== id);
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Failed to delete station: ' + err.message;
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
}
