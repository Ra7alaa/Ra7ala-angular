import {
  Component,
  OnInit,
  HostListener,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../features/settings/pipes/translate.pipe';
import { TranslationService } from '../../../../core/localization/translation.service';
import { BusesService } from '../../services/buses.service';
import { AuthService } from '../../../auth/services/auth.service';
import { Bus } from '../../models/bus.model';
import { User, UserRole } from '../../../auth/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from '../../../../core/localization/language.service';
import { RtlDirective } from '../../../../features/settings/directives/rtl.directive';

// Import components
import { BusCreateComponent } from './components/bus-create/bus-create.component';

@Component({
  selector: 'app-buses-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe,
    RtlDirective,
    BusCreateComponent,
  ],
  templateUrl: './buses-management.component.html',
  styleUrl: './buses-management.component.css',
})
export class BusesManagementComponent implements OnInit {
  buses: Bus[] = [];
  filteredBuses: Bus[] = []; // For filtered view
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
  selectedBus: Bus | null = null;

  // RTL control
  isRtl = false;

  constructor(
    private busesService: BusesService,
    private authService: AuthService,
    private translationService: TranslationService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadBuses();

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

  loadBuses(): void {
    this.loading = true;
    this.error = null;

    // Get company ID - use default company ID 1 if not available
    const companyId = this.currentUser?.companyId || 1;

    this.busesService.getBusesByCompanyId(companyId).subscribe({
      next: (response: Bus[]) => {
        // API returns array of buses directly
        this.buses = response || [];
        this.filteredBuses = [...this.buses];
        this.applyPagination();
        this.loading = false;
        console.log('Loaded buses:', this.buses);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading buses:', err);
        this.error = 'Failed to load buses. Please try again.';
        this.loading = false;
        // Ensure buses is an empty array on error
        this.buses = [];
        this.filteredBuses = [];
      },
    });
  }

  // Handler for bus creation event
  onBusCreated(success: boolean): void {
    if (success) {
      // Close the modal programmatically
      document.getElementById('closeAddBusModal')?.click();
      // Reload buses
      this.loadBuses();
    }
  }

  // Method to delete a bus
  deleteBus(id: number): void {
    if (
      confirm(
        this.translationService.translate('admin.buses.delete_confirm') ||
          'Are you sure you want to delete this bus?'
      )
    ) {
      this.busesService.deleteBus(id).subscribe({
        next: () => {
          // Reload buses
          this.loadBuses();
          // Clear selection if the deleted bus was selected
          if (this.selectedBus && this.selectedBus.id === id) {
            this.selectedBus = null;
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error deleting bus:', err);
          this.error = 'Failed to delete bus. Please try again.';
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

  // Apply search filter to buses
  private applySearchFilter(): void {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      // If search term is empty, show all buses
      this.filteredBuses = [...this.buses];
      this.updatePaginationForFilteredResults();
      return;
    }

    const searchTermLower = this.searchTerm.toLowerCase().trim();

    // Filter buses based on search term
    this.filteredBuses = this.buses.filter(
      (bus) =>
        bus.registrationNumber?.toLowerCase().includes(searchTermLower) ||
        bus.model?.toLowerCase().includes(searchTermLower) ||
        bus.amenityDescription?.toLowerCase().includes(searchTermLower) ||
        `#BS-${(bus.id || 0).toString().padStart(3, '0')}`
          .toLowerCase()
          .includes(searchTermLower) ||
        // Search by capacity (convert to string for comparison)
        (bus.capacity !== undefined &&
          bus.capacity.toString().includes(searchTermLower))
    );

    // Update pagination
    this.updatePaginationForFilteredResults();
  }

  // Update pagination info based on filtered results
  private updatePaginationForFilteredResults(): void {
    this.totalPages = Math.ceil(this.filteredBuses.length / this.itemsPerPage);

    // Reset to page 1 if current page is now invalid
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  // Pagination
  applyPagination(): void {
    this.totalPages = Math.ceil(this.filteredBuses.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get paginatedBuses(): Bus[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredBuses.slice(startIndex, startIndex + this.itemsPerPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
