import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CompanyService } from '../../../admin/services/company.service';
// import { CompanyCreateRequest } from '../../models/user.model'; // Import the CompanyCreateRequest model
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import {
  LanguageService,
  Language,
} from '../../../../core/localization/language.service';
import {
  ThemeService,
  ThemeOption,
} from '../../../../core/themes/theme.service';
import { TranslationService } from '../../../../core/localization/translation.service';
import { RtlDirective } from '../../../settings/directives/rtl.directive';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

// Define the CompanyCreateRequest interface to include Website
interface CompanyCreateRequest {
  Name: string;
  Description: string;
  LogoUrl: string;
  Address: string;
  Phone: string;
  Email: string;
  Website: string; // Should be string to match the backend API expectation
  SuperAdminName: string;
  SuperAdminEmail: string;
  SuperAdminPhone: string;
}

@Component({
  selector: 'app-company-register',
  templateUrl: './company-register.component.html',
  styleUrls: ['./company-register.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe,
    RtlDirective,
  ],
  providers: [TranslationService],
})
export class CompanyRegisterComponent implements OnInit, OnDestroy {
  companyForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  logoFile: File | null = null;
  currentLanguage!: Language;
  currentTheme!: ThemeOption;
  private subscriptions: Subscription[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private companyService: CompanyService,
    private languageService: LanguageService,
    private themeService: ThemeService,
    private translationService: TranslationService
  ) {
    // Initialize with current settings
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.currentTheme = this.themeService.getCurrentTheme();

    // Create form with stronger validators to match backend requirements
    this.companyForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(5)]],
      logoUrl: [''],
      address: ['', [Validators.required, Validators.minLength(5)]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\+?[0-9]{10,14}$/)],
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      website: [''],
      superAdminName: ['', [Validators.required, Validators.minLength(3)]],
      superAdminEmail: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.pattern(
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
          ),
        ],
      ],
      superAdminPhone: [
        '',
        [Validators.required, Validators.pattern(/^\+?[0-9]{10,14}$/)],
      ],
    });
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.subscriptions.push(
      this.languageService.language$.subscribe((language) => {
        this.currentLanguage = language;
      })
    );

    // Subscribe to theme changes
    this.subscriptions.push(
      this.themeService.theme$.subscribe((theme) => {
        this.currentTheme = theme;
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  onLogoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.logoFile = file;

      // Store the file in the service for submission
      this.companyService.setLogoFile(file);

      console.log(
        'Logo file selected:',
        file.name,
        'size:',
        file.size,
        'type:',
        file.type
      );
    }
  }

  onSubmit() {
    if (this.companyForm.invalid) {
      // Mark all fields as touched to trigger validation display
      Object.keys(this.companyForm.controls).forEach((key) => {
        const control = this.companyForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });

      console.log('Form validation errors:', this.getFormValidationErrors());
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // Create properly capitalized keys for backend API compatibility
    const companyData: CompanyCreateRequest = {
      Name: this.companyForm.get('name')?.value,
      Description: this.companyForm.get('description')?.value,
      LogoUrl: '', // Logo handling is done via the separate logoFile property
      Address: this.companyForm.get('address')?.value,
      Phone: this.companyForm.get('phoneNumber')?.value,
      Email: this.companyForm.get('email')?.value,
      Website: this.companyForm.get('website')?.value || '',
      SuperAdminName: this.companyForm.get('superAdminName')?.value,
      SuperAdminEmail: this.companyForm.get('superAdminEmail')?.value,
      SuperAdminPhone: this.companyForm.get('superAdminPhone')?.value,
    };

    // Log data being submitted
    console.log('Form data to be submitted:', {
      ...companyData,
      LogoFile: this.logoFile ? `File: ${this.logoFile.name}` : 'No file',
    });

    // Check if the form has a logo file
    if (this.logoFile) {
      // Set the logo file in the service
      this.companyService.setLogoFile(this.logoFile);
    }

    this.companyService.createCompany(companyData).subscribe({
      next: (response) => {
        console.log('Company registration successful:', response);
        this.router.navigate(['/auth/login']);
      },
      error: (error: HttpErrorResponse) => {
        console.error('Company registration error:', error);

        if (error.error?.errors) {
          // Handle validation errors from the API
          const errorMessages: string[] = [];
          for (const field in error.error.errors) {
            if (
              Object.prototype.hasOwnProperty.call(error.error.errors, field)
            ) {
              error.error.errors[field].forEach((message: string) => {
                errorMessages.push(`${field}: ${message}`);

                // Map backend field names to form control names and mark as invalid
                const formField = this.getFormFieldName(field);
                const control = this.companyForm.get(formField);
                if (control) {
                  control.setErrors({ serverError: message });
                  control.markAsTouched();
                }
              });
            }
          }
          this.errorMessage = errorMessages.join(', ');
        } else {
          this.errorMessage =
            error.error?.title ||
            error.message ||
            'An error occurred during company registration';
        }
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }

  // Debug function to directly test the API
  testApiDirectly() {
    console.log('Running direct API test...');
    this.companyService.testCompanyCreation().subscribe({
      next: (response) => {
        console.log('TEST API SUCCESS:', response);
        alert('API test successful! See console for details.');
      },
      error: (error) => {
        console.error('TEST API ERROR:', error);
        alert(`API test failed: ${error.message || 'Unknown error'}`);
      },
    });
  }

  // Helper method to get validation errors
  private getFormValidationErrors(): Record<string, unknown> {
    const errors: Record<string, unknown> = {};
    Object.keys(this.companyForm.controls).forEach((key) => {
      const control = this.companyForm.get(key);
      if (control?.errors) {
        errors[key] = control.errors;
      }
    });
    return errors;
  }

  // Helper method to map backend field names to form control names
  private getFormFieldName(backendField: string): string {
    const fieldMapping: Record<string, string> = {
      Name: 'name',
      Email: 'email',
      Phone: 'phoneNumber',
      Address: 'address',
      Description: 'description',
      SuperAdminName: 'superAdminName',
      SuperAdminEmail: 'superAdminEmail',
      SuperAdminPhone: 'superAdminPhone',
    };
    return fieldMapping[backendField] || backendField.toLowerCase();
  }
}
