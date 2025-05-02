import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../services/company.service';
import { Company } from '../../models/company.model';
import { FormatDatePipe } from '../../../../shared/pipes/format-date.pipe';
import { RejectionModalComponent } from '../../../../shared/components/rejection-modal/rejection-modal.component';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { RtlDirective } from '../../../settings/directives/rtl.directive';
import { LanguageService } from '../../../../core/localization/language.service';

@Component({
  selector: 'app-company-requests',
  imports: [
    CommonModule,
    FormsModule,
    FormatDatePipe,
    RejectionModalComponent,
    TranslatePipe,
    RtlDirective,
  ],
  templateUrl: './company-requests.component.html',
  styleUrl: './company-requests.component.css',
  standalone: true,
})
export class CompanyRequestsComponent implements OnInit {
  pendingCompanies: Company[] = [];
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 0;
  loading = false;
  Math = Math; // Exposing Math object to use in template

  // Action handling properties
  processingAction = false;
  selectedCompanyId: number | null = null;
  isRejectionModalOpen = false;
  actionMessage = '';
  showActionMessage = false;
  actionMessageType: 'success' | 'error' = 'success';

  constructor(
    private companyService: CompanyService,
    private languageService: LanguageService
  ) {}

  ngOnInit(): void {
    this.loadPendingCompanies();
  }

  loadPendingCompanies(): void {
    this.loading = true;
    this.companyService
      .getPendingCompanies(this.currentPage, this.pageSize)
      .subscribe({
        next: (response) => {
          this.pendingCompanies = response.companies;
          this.totalItems = response.totalCount;
          this.totalPages = response.totalPages;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading pending companies:', error);
          this.loading = false;
        },
      });
  }

  changePage(page: number): void {
    this.currentPage = page;
    this.loadPendingCompanies();
  }

  // Company action methods
  approveCompany(company: Company): void {
    if (this.processingAction) return;

    this.processingAction = true;
    this.selectedCompanyId = company.id;

    this.companyService.reviewCompany(company.id, true).subscribe({
      next: () => {
        this.showMessage('owner.company_requests.messages.approved', 'success');
        this.loadPendingCompanies();
        this.processingAction = false;
        this.selectedCompanyId = null;
      },
      error: (error) => {
        console.error('Error approving company', error);
        this.showMessage(
          'owner.company_requests.messages.approve_error',
          'error'
        );
        this.processingAction = false;
        this.selectedCompanyId = null;
      },
    });
  }

  openRejectModal(company: Company): void {
    this.selectedCompanyId = company.id;
    this.isRejectionModalOpen = true;
  }

  onRejectConfirm(rejectionReason: string): void {
    if (!this.selectedCompanyId || this.processingAction) return;

    const companyId = this.selectedCompanyId;

    this.processingAction = true;
    this.companyService
      .reviewCompany(companyId, false, rejectionReason)
      .subscribe({
        next: () => {
          this.showMessage(
            'owner.company_requests.messages.rejected',
            'success'
          );
          this.loadPendingCompanies();
          this.processingAction = false;
          this.selectedCompanyId = null;
          this.isRejectionModalOpen = false;
        },
        error: (error) => {
          console.error('Error rejecting company', error);
          this.showMessage(
            'owner.company_requests.messages.reject_error',
            'error'
          );
          this.processingAction = false;
          this.selectedCompanyId = null;
          this.isRejectionModalOpen = false;
        },
      });
  }

  onRejectCancel(): void {
    this.selectedCompanyId = null;
    this.isRejectionModalOpen = false;
  }

  showMessage(messageKey: string, type: 'success' | 'error'): void {
    // Get translated message using TranslationService
    // We'll use the message key directly and let the translate pipe handle the translation in the template
    this.actionMessage = messageKey;
    this.actionMessageType = type;
    this.showActionMessage = true;

    // Auto hide the message after 5 seconds
    setTimeout(() => {
      this.showActionMessage = false;
    }, 5000);
  }
}
