import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CompanyService } from '../../services/company.service';
import { Company } from '../../models/company.model';

@Component({
  selector: 'app-company-requests',
  imports: [CommonModule, FormsModule],
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

  constructor(private companyService: CompanyService) {}

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
}
