import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Company, CompanyStatus } from '../../models/company.model';
import { CompanyService } from '../../services/company.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { RtlDirective } from '../../../settings/directives/rtl.directive';
import { LanguageService } from '../../../../core/localization/language.service';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, RtlDirective],
  templateUrl: './company-details.component.html',
  styleUrl: './company-details.component.css',
})
export class CompanyDetailsComponent implements OnInit {
  company?: Company;
  companyId?: number;
  loading = true;
  error = false;

  // Make CompanyStatus accessible in the template
  CompanyStatus = CompanyStatus;

  // Properties to store document information
  hasTaxDocument = false;
  hasRejectionReason = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    // استخراج معرّف الشركة من الرابط
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.companyId = +id; // تحويل النص إلى رقم
        this.loadCompanyDetails();
      }
    });
  }

  loadCompanyDetails(): void {
    if (this.companyId) {
      this.loading = true;
      console.log('Fetching company details for ID:', this.companyId);

      this.companyService.getCompanyById(this.companyId).subscribe({
        next: (response) => {
          console.log('Raw response from API:', response);

          // محاولة استخراج بيانات الشركة من الاستجابة بشكل أكثر مرونة
          // قد تكون البيانات في الكائن الرئيسي أو داخل حقل data أو company
          let companyData: unknown = response;

          if (response && typeof response === 'object') {
            const responseObj = response as Record<string, unknown>;
            // إذا كانت الاستجابة كائنًا، تحقق من الهيكل
            if (responseObj['data']) {
              companyData = responseObj['data'];
              console.log('Found company data in response.data');
            } else if (responseObj['company']) {
              companyData = responseObj['company'];
              console.log('Found company data in response.company');
            } else if (responseObj['result']) {
              companyData = responseObj['result'];
              console.log('Found company data in response.result');
            }
          }

          this.company = companyData as Company;
          console.log('Final company data:', this.company);

          // Check if the company has registration documents
          this.checkForDocuments();

          // Ensure statistics are available or default to zeros
          this.ensureStatistics();

          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading company details:', error);
          this.loading = false;
          this.error = true;
        },
        complete: () => {
          console.log('Company details request completed');
        },
      });
    }
  }

  /**
   * Check if company has any documents (tax docs, etc.)
   */
  checkForDocuments(): void {
    if (!this.company) return;

    // Check for tax document URL
    this.hasTaxDocument = !!(
      this.company.taxDocumentUrl && this.company.taxDocumentUrl.trim() !== ''
    );

    // Check for rejection reason if status is rejected
    if (
      (typeof this.company.status === 'number' && this.company.status === 2) ||
      this.company.status === CompanyStatus.Rejected
    ) {
      this.hasRejectionReason = !!(
        this.company.rejectionReason &&
        this.company.rejectionReason.trim() !== ''
      );
    }
  }

  /**
   * Ensure company has statistics object and is properly initialized based on status
   */
  ensureStatistics(): void {
    if (!this.company) return;

    // If company statistics don't exist, create them with zero values
    if (!this.company.statistics) {
      this.company.statistics = {
        totalAdmins: 0,
        totalDrivers: 0,
        totalBuses: 0,
        totalRoutes: 0,
        totalFeedbacks: 0,
      };
    }

    // If company is in pending or rejected state, ensure all statistics are set to zero
    if (
      (typeof this.company.status === 'number' &&
        (this.company.status === 0 || this.company.status === 2)) ||
      this.company.status === CompanyStatus.Pending ||
      this.company.status === CompanyStatus.Rejected
    ) {
      this.company.statistics.totalAdmins = 0;
      this.company.statistics.totalDrivers = 0;
      this.company.statistics.totalBuses = 0;
      this.company.statistics.totalRoutes = 0;
      this.company.statistics.totalFeedbacks = 0;
    }
  }

  /**
   * Get the document URL with proper formatting for display
   */
  getDocumentUrl(url: string): string {
    if (!url) return '';

    // If URL already has http/https, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    // If URL is relative (like the one in your example: "/uploads/documents/..."),
    // add the API base URL
    const baseUrl = this.companyService.getBaseUrl();
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  /**
   * Returns an array of filled stars based on rating
   */
  getRatingStars(rating: number): number[] {
    const fullStars = Math.floor(rating || 0);
    return Array(fullStars).fill(0);
  }

  /**
   * Returns an array of empty stars to complete 5 stars
   */
  getEmptyStars(rating: number): number[] {
    const emptyStars = 5 - Math.floor(rating || 0);
    return Array(emptyStars).fill(0);
  }

  getStatusPillClass(status: CompanyStatus | number): string {
    // Handle numeric status codes
    if (typeof status === 'number') {
      switch (status) {
        case 1: // Active
          return 'status-pill-active';
        case 0: // Pending
          return 'status-pill-pending';
        case 2: // Rejected
          return 'status-pill-rejected';
        case 3: // Deleted
          return 'status-pill-deleted';
        default:
          return 'status-pill-inactive';
      }
    }

    // Handle enum values (for backward compatibility)
    switch (status) {
      case CompanyStatus.Approved:
        return 'status-pill-active';
      case CompanyStatus.Pending:
        return 'status-pill-pending';
      case CompanyStatus.Rejected:
        return 'status-pill-rejected';
      default:
        return 'status-pill-inactive';
    }
  }

  getSimpleStatus(status: CompanyStatus | number): string {
    // Get status key for translation
    let statusKey: string;

    // Handle numeric status codes
    if (typeof status === 'number') {
      switch (status) {
        case 0:
          statusKey = 'owner.company_details.status.pending';
          break;
        case 1:
          statusKey = 'owner.company_details.status.active';
          break;
        case 2:
          statusKey = 'owner.company_details.status.rejected';
          break;
        case 3:
          statusKey = 'owner.company_details.status.deleted';
          break;
        default:
          statusKey = 'owner.company_details.status.unknown';
      }
    } else {
      // Handle enum values (for backward compatibility)
      switch (status) {
        case CompanyStatus.Approved:
          statusKey = 'owner.company_details.status.active';
          break;
        case CompanyStatus.Pending:
          statusKey = 'owner.company_details.status.pending';
          break;
        case CompanyStatus.Rejected:
          statusKey = 'owner.company_details.status.rejected';
          break;
        default:
          statusKey = 'owner.company_details.status.inactive';
      }
    }

    return statusKey;
  }

  /**
   * Check if the company status is pending (safely handles both number and enum types)
   */
  isPendingStatus(status: CompanyStatus | number): boolean {
    if (typeof status === 'number') {
      return status === 0; // 0 is the numeric code for pending
    } else {
      return status === CompanyStatus.Pending;
    }
  }

  deleteCompany(companyId: number): void {
    const confirmMessage = this.getTranslatedText(
      'owner.company_details.delete_confirm'
    );

    if (confirm(confirmMessage)) {
      this.loading = true;
      this.companyService.deleteCompany(companyId).subscribe({
        next: () => {
          this.loading = false;
          alert(this.getTranslatedText('owner.company_details.delete_success'));
          // Navigate to companies management page after successful deletion
          this.router.navigate(['/owner/companies']);
        },
        error: (error) => {
          console.error('Error deleting company:', error);
          this.loading = false;
          alert(this.getTranslatedText('owner.company_details.delete_error'));
        },
      });
    }
  }

  getTranslatedText(key: string): string {
    // This is a temporary method until we refactor the alert/confirm dialogs
    // The proper approach is to use the translate pipe in the template
    return key;
  }
}
