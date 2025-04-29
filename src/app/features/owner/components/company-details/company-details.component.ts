import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Company, CompanyStatus } from '../../models/company.model';
import { CompanyService } from '../../services/company.service';

@Component({
  selector: 'app-company-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './company-details.component.html',
  styleUrl: './company-details.component.css',
})
export class CompanyDetailsComponent implements OnInit {
  company?: Company;
  companyId?: number;
  loading = true;
  error = false;

  constructor(
    private route: ActivatedRoute,
    private companyService: CompanyService
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

  getStatusClass(status: CompanyStatus): string {
    switch (status) {
      case CompanyStatus.Approved:
        return 'status-active';
      case CompanyStatus.Pending:
        return 'status-pending';
      case CompanyStatus.Rejected:
        return 'status-rejected';
      default:
        return 'status-inactive';
    }
  }
}
