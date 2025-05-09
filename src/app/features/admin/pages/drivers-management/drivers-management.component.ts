import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../../../features/settings/pipes/translate.pipe';
import { TranslationService } from '../../../../core/localization/translation.service';
import { DriversService } from '../../services/drivers.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Driver } from '../../models/driver.model';
import { User, UserRole } from '../../../auth/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from '../../../../core/localization/language.service';
import { RtlDirective } from '../../../../features/settings/directives/rtl.directive';

// Import components
import { DriverCreateComponent } from './components/driver-create/driver-create.component';

@Component({
  selector: 'app-drivers-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe,
    RtlDirective,
    DriverCreateComponent,
  ],
  templateUrl: './drivers-management.component.html',
  styleUrl: './drivers-management.component.css',
})
export class DriversManagementComponent implements OnInit {
  drivers: Driver[] = [];
  filteredDrivers: Driver[] = []; // For filtered view
  loading = false;
  error: string | null = null;
  currentUser: User | null = null;

  // Reference to search input for button click
  @ViewChild('searchInput') searchInput!: ElementRef;

  // Responsive properties
  screenWidth = window.innerWidth;
  isMobile = this.screenWidth < 768;
  itemsPerPage = this.isMobile ? 5 : 10;
  currentPage = 1;
  totalPages = 1;
  searchTerm = '';

  // Expose UserRole enum to the template
  UserRole = UserRole;

  // Expose Math object to template
  Math = Math;

  // For edit and details
  selectedDriver: Driver | null = null;

  // RTL control
  isRtl = false;

  constructor(
    private driversService: DriversService,
    private authService: AuthService,
    private translationService: TranslationService,
    private languageService: LanguageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadDrivers();

    // Subscribe to language changes for RTL support
    this.languageService.language$.subscribe((language) => {
      this.isRtl = language.rtl;
    });

    // Set initial responsive values
    this.updateResponsiveSettings();
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.updateResponsiveSettings();
  }

  updateResponsiveSettings(): void {
    this.screenWidth = window.innerWidth;
    this.isMobile = this.screenWidth < 768;
    this.itemsPerPage = this.isMobile ? 5 : 10;
    this.applyPagination();
  }

  loadDrivers(): void {
    this.loading = true;
    this.error = null;

    this.driversService.getAllDriversWithoutParams().subscribe({
      next: (response: Driver[]) => {
        // API returns array of drivers directly
        this.drivers = response || [];
        this.filteredDrivers = [...this.drivers];
        this.applyPagination();
        this.loading = false;
        console.log('Loaded drivers:', this.drivers);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading drivers:', err);
        this.error = 'Failed to load drivers. Please try again.';
        this.loading = false;
        // Ensure drivers is an empty array on error
        this.drivers = [];
        this.filteredDrivers = [];
      },
    });
  }

  // Get count of available drivers
  getAvailableDriversCount(): number {
    return this.drivers.filter((driver) => driver.isAvailable).length;
  }

  // Get count of recently added drivers (within last 30 days)
  getRecentlyAddedCount(): number {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.drivers.filter((driver) => {
      if (!driver.dateCreated) return false;
      const createdDate = new Date(driver.dateCreated);
      return createdDate >= thirtyDaysAgo;
    }).length;
  }

  // Handler for driver creation event
  onDriverCreated(success: boolean): void {
    if (success) {
      // Close the modal programmatically
      document.getElementById('closeAddDriverModal')?.click();
      // Reload drivers
      this.loadDrivers();
    }
  }

  // Method to delete a driver
  deleteDriver(id: string): void {
    if (
      confirm(
        this.translationService.translate('admin.drivers.delete_confirm') ||
          'Are you sure you want to delete this driver?'
      )
    ) {
      this.driversService.deleteDriver(id).subscribe({
        next: () => {
          // Reload drivers
          this.loadDrivers();
          // Clear selection if the deleted driver was selected
          if (this.selectedDriver && this.selectedDriver.id === id) {
            this.selectedDriver = null;
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error deleting driver:', err);
          this.error = 'Failed to delete driver. Please try again.';
        },
      });
    }
  }

  // Search functionality
  search(term: string): void {
    this.searchTerm = term.toLowerCase();
    this.applySearchFilter();
    console.log(`Search term applied: ${this.searchTerm}`);
  }

  // Apply search filter to drivers
  private applySearchFilter(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      // If search term is empty, show all drivers
      this.filteredDrivers = [...this.drivers];
      this.updatePaginationForFilteredResults();
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase().trim();

    // Filter drivers based on search term
    this.filteredDrivers = this.drivers.filter(
      (driver) =>
        driver.fullName?.toLowerCase().includes(searchTermLower) ||
        driver.email?.toLowerCase().includes(searchTermLower) ||
        driver.phoneNumber?.toLowerCase().includes(searchTermLower) ||
        driver.licenseNumber?.toLowerCase().includes(searchTermLower) ||
        driver.companyName?.toLowerCase().includes(searchTermLower)
    );

    // Update pagination
    this.updatePaginationForFilteredResults();
  }

  // Update pagination info based on filtered results
  private updatePaginationForFilteredResults(): void {
    this.totalPages = Math.ceil(
      this.filteredDrivers.length / this.itemsPerPage
    );

    // Reset to page 1 if current page is now invalid
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  // Pagination
  applyPagination(): void {
    this.totalPages = Math.ceil(
      this.filteredDrivers.length / this.itemsPerPage
    );
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get paginatedDrivers(): Driver[] {
    const startIdx = (this.currentPage - 1) * this.itemsPerPage;
    const endIdx = startIdx + this.itemsPerPage;
    return this.filteredDrivers.slice(startIdx, endIdx);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // دالة محسنة للانتقال إلى صفحة تفاصيل السائق
  viewDriverDetails(driverId: string): void {
    console.log('Navigating to driver details:', driverId);
    // استخدام المسار المطلق وهو الأكثر موثوقية
    this.router.navigate(['/admin/drivers', driverId]);
  }
}
