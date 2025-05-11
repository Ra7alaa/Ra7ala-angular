import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  CompanyService,
  CompanyProfile,
  FeedbackRequest,
} from '../../services/company.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-company-profile',
  templateUrl: './company-profile.component.html',
  styleUrls: ['./company-profile.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
})
export class CompanyProfileComponent implements OnInit {
  companyId!: number;
  company: CompanyProfile | null = null;
  feedbackForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  submitSuccess = false;
  selectedRating = 0;
  private apiBaseUrl = environment.apiUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private companyService: CompanyService,
    private fb: FormBuilder
  ) {
    this.feedbackForm = this.fb.group({
      rating: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  ngOnInit(): void {
    this.companyId = +this.route.snapshot.params['id'];
    if (this.companyId) {
      this.loadCompanyProfile();
    } else {
      this.error = 'Invalid company ID';
    }
  }

  loadCompanyProfile(): void {
    this.companyService.getCompanyProfile(this.companyId).subscribe({
      next: (profile) => {
        this.company = profile;
      },
      error: (err) => {
        this.error = 'Failed to load company profile';
        console.error('Error loading company profile:', err);
      },
    });
  }

  onSubmit(): void {
    if (this.feedbackForm.invalid) {
      Object.keys(this.feedbackForm.controls).forEach((key) => {
        const control = this.feedbackForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const feedback: FeedbackRequest = {
      rating: this.feedbackForm.get('rating')?.value,
      comment: this.feedbackForm.get('comment')?.value.trim(),
    };

    this.companyService.submitFeedback(this.companyId, feedback).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.feedbackForm.reset({ rating: 0, comment: '' });
        // Update company ratings after successful feedback
        if (this.company) {
          this.loadCompanyProfile();
        }
        setTimeout(() => {
          this.submitSuccess = false;
        }, 3000);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.error = err.message || 'Failed to submit feedback';
        console.error('Error submitting feedback:', err);
      },
    });
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.feedbackForm.patchValue({ rating });
  }

  getRatingArray(): number[] {
    return Array(5)
      .fill(0)
      .map((_, i) => i + 1);
  }

  getStarClass(starNumber: number): string {
    const rating = this.company?.averageRating || 0;
    if (starNumber <= rating) {
      return 'bi-star-fill text-warning';
    }
    return 'bi-star text-muted';
  }

  getFeedbackStarClass(starNumber: number): string {
    const rating = this.feedbackForm.get('rating')?.value || 0;
    if (starNumber <= rating) {
      return 'bi-star-fill text-warning';
    }
    return 'bi-star text-muted';
  }

  /**
   * Gets the full URL for company logo
   * Uses the same strategy as the header component for consistency
   */
  getFullLogoUrl(logoUrl: string | null | undefined): string {
    if (!logoUrl) {
      return 'assets/images/default-avatar.svg';
    }

    // If URL starts with http:// or https://, it's a complete URL
    if (logoUrl.startsWith('http://') || logoUrl.startsWith('https://')) {
      return logoUrl;
    }

    // If URL starts with "/", it's a relative path from the server
    if (logoUrl.startsWith('/')) {
      return `${this.apiBaseUrl}${logoUrl}`;
    }

    // If URL starts with "assets/", it's a local path
    if (logoUrl.startsWith('assets/')) {
      return logoUrl;
    }

    // By default, assume it's a relative path from the server
    return `${this.apiBaseUrl}/${logoUrl}`;
  }
}
