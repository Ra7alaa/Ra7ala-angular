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
import { AdminsService } from '../../services/admins.service';
import { AuthService } from '../../../auth/services/auth.service';
import { User, UserRole } from '../../../auth/models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { LanguageService } from '../../../../core/localization/language.service';
import { RtlDirective } from '../../../../features/settings/directives/rtl.directive';
import { AdminCreateComponent } from './components/admin-create/admin-create.component';

@Component({
  selector: 'app-admins-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe,
    RtlDirective,
    AdminCreateComponent,
  ],
  templateUrl: './admins-management.component.html',
  styleUrl: './admins-management.component.css',
})
export class AdminsManagementComponent implements OnInit {
  admins: User[] = [];
  filteredAdmins: User[] = []; // For filtered view
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
  selectedAdmin: User | null = null;

  // RTL control
  isRtl = false;

  constructor(
    private adminsService: AdminsService,
    private authService: AuthService,
    private translationService: TranslationService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    this.loadAdmins();

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

  loadAdmins(): void {
    this.loading = true;
    this.error = null;

    this.adminsService.getCompanyAdmins().subscribe({
      next: (response: User[]) => {
        this.admins = response || [];
        this.filteredAdmins = [...this.admins];
        this.applyPagination();
        this.loading = false;
        console.log('Loaded admins:', this.admins);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error loading admins:', err);
        this.error = 'Failed to load admins. Please try again.';
        this.loading = false;
        // Ensure admins is an empty array on error
        this.admins = [];
        this.filteredAdmins = [];
      },
    });
  }

  // Handler for admin creation event
  onAdminCreated(success: boolean): void {
    if (success) {
      // Close the modal programmatically
      document.getElementById('closeAddAdminModal')?.click();
      // Reload admins
      this.loadAdmins();
    }
  }

  // Method to delete an admin
  deleteAdmin(id: string): void {
    if (
      confirm(
        this.translationService.translate('admin.admins.delete_confirm') ||
          'Are you sure you want to delete this admin?'
      )
    ) {
      this.adminsService.deleteAdmin(id).subscribe({
        next: () => {
          // Reload admins
          this.loadAdmins();
          // Clear selection if the deleted admin was selected
          if (this.selectedAdmin && this.selectedAdmin.id === id) {
            this.selectedAdmin = null;
          }
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error deleting admin:', err);
          this.error = 'Failed to delete admin. Please try again.';
        },
      });
    }
  }

  // Search functionality
  search(term: string): void {
    this.searchTerm = term.toLowerCase().trim();
    this.applySearchFilter();
    this.currentPage = 1; // Reset to first page when searching
    this.applyPagination();
  }

  // Apply search filter to admins
  private applySearchFilter(): void {
    if (!this.searchTerm) {
      this.filteredAdmins = [...this.admins];
    } else {
      this.filteredAdmins = this.admins.filter(
        (admin) =>
          admin.fullName.toLowerCase().includes(this.searchTerm) ||
          admin.email.toLowerCase().includes(this.searchTerm) ||
          (admin.phoneNumber &&
            admin.phoneNumber.toLowerCase().includes(this.searchTerm))
      );
    }
    this.updatePaginationForFilteredResults();
  }

  // Update pagination info based on filtered results
  private updatePaginationForFilteredResults(): void {
    this.totalPages = Math.ceil(this.filteredAdmins.length / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  // Pagination
  applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.filteredAdmins = [...this.admins].slice(startIndex, endIndex);

    this.totalPages = Math.ceil(this.admins.length / this.itemsPerPage);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
    this.applyPagination();
  }

  get paginationArray(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = this.isMobile ? 3 : 5;
    const halfPagesToShow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(1, this.currentPage - halfPagesToShow);
    const endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
}
