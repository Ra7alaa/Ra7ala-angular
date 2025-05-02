import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { Company, CompanyStatus } from '../../models/company.model';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { RtlDirective } from '../../../settings/directives/rtl.directive';
import { LanguageService } from '../../../../core/localization/language.service';

@Component({
  selector: 'app-companies-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslatePipe,
    RtlDirective,
  ],
  templateUrl: './companies-management.component.html',
  styleUrls: ['./companies-management.component.css'],
})
export class CompaniesManagementComponent implements OnInit {
  companies: Company[] = [];
  currentPage = 1;
  pageSize = 10;
  loading = false;
  companyStatus = CompanyStatus;

  constructor(
    private companyService: CompanyService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadAllCompanies();
  }

  loadAllCompanies(): void {
    this.loading = true;
    this.companyService
      .getAllCompanies(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.companies = Array.isArray(response) ? response : [];
          this.loading = false;
          console.log('Companies loaded:', this.companies);
        },
        error: (error) => {
          console.error('Error loading companies:', error);
          this.companies = [];
          this.loading = false;
        },
      });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadAllCompanies();
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
          statusKey = 'owner.companies.status.pending';
          break;
        case 1:
          statusKey = 'owner.companies.status.active';
          break;
        case 2:
          statusKey = 'owner.companies.status.rejected';
          break;
        case 3:
          statusKey = 'owner.companies.status.deleted';
          break;
        default:
          statusKey = 'owner.companies.status.unknown';
      }
    } else {
      // Handle enum values (for backward compatibility)
      switch (status) {
        case CompanyStatus.Approved:
          statusKey = 'owner.companies.status.active';
          break;
        case CompanyStatus.Pending:
          statusKey = 'owner.companies.status.pending';
          break;
        case CompanyStatus.Rejected:
          statusKey = 'owner.companies.status.rejected';
          break;
        default:
          statusKey = 'owner.companies.status.inactive';
      }
    }

    return statusKey;
  }

  deleteCompany(companyId: number): void {
    const confirmMessage = this.getTranslatedText(
      'owner.companies.delete_confirm'
    );

    if (confirm(confirmMessage)) {
      this.loading = true;
      this.companyService.deleteCompany(companyId).subscribe({
        next: () => {
          // Remove the company from the local array on success
          this.companies = this.companies.filter(
            (company) => company.id !== companyId
          );
          this.loading = false;
          alert(this.getTranslatedText('owner.companies.delete_success'));
        },
        error: (error) => {
          console.error('Error deleting company:', error);
          this.loading = false;
          alert(this.getTranslatedText('owner.companies.delete_error'));
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
