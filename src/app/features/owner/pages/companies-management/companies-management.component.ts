import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompanyService } from '../../services/company.service';
import { Company, CompanyStatus } from '../../models/company.model';

@Component({
  selector: 'app-companies-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './companies-management.component.html',
  styleUrls: ['./companies-management.component.css'],
})
export class CompaniesManagementComponent implements OnInit {
  companies: Company[] = [];
  currentPage = 1;
  pageSize = 10;
  loading = false;
  companyStatus = CompanyStatus;

  constructor(private companyService: CompanyService) {}

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

  getStatusPillClass(status: CompanyStatus): string {
    switch (status) {
      case CompanyStatus.Approved:
        return 'status-pill-active';
      case CompanyStatus.Pending:
        return 'status-pill-pending';
      default:
        return 'status-pill-inactive';
    }
  }

  getSimpleStatus(status: CompanyStatus): string {
    switch (status) {
      case CompanyStatus.Approved:
        return 'Active';
      case CompanyStatus.Pending:
        return 'Pending';
      default:
        return 'Inactive';
    }
  }
}
