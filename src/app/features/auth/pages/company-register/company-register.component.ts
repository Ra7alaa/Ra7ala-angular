import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CompanyService } from '../../../admin/services/company.service';
import { CompanyCreateRequest } from '../../models/user.model';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { LanguageService, Language } from '../../../../core/localization/language.service';
import { ThemeService, ThemeOption } from '../../../../core/themes/theme.service';
import { TranslationService, TranslationDictionary } from '../../../../core/localization/translation.service';
import { RtlDirective } from '../../../settings/directives/rtl.directive';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-company-register',
  templateUrl: './company-register.component.html',
  styleUrls: ['./company-register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe, RtlDirective],
  providers: [TranslationService]
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

    this.companyForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      description: [''],
      logoUrl: [''],
      address: [''],
      phoneNumber: ['', [Validators.pattern(/^\+?[0-9]{10,14}$/)]],
      email: ['', [Validators.email]],
      website: [''],
      superAdminName: ['', [Validators.required]],
      superAdminEmail: ['', [Validators.required, Validators.email]],
      superAdminPhone: ['', [Validators.required, Validators.pattern(/^\+?[0-9]{10,14}$/)]]
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
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  onLogoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.logoFile = file;
      // In a real application, you would upload this file to your server
      // and get back a URL to store in logoUrl
      this.companyForm.patchValue({
        logoUrl: URL.createObjectURL(file)
      });
    }
  }

  onSubmit() {
    if (this.companyForm.invalid) {
      Object.keys(this.companyForm.controls).forEach(key => {
        const control = this.companyForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const companyData: CompanyCreateRequest = {
      name: this.companyForm.get('name')?.value,
      description: this.companyForm.get('description')?.value,
      logoUrl: this.companyForm.get('logoUrl')?.value,
      address: this.companyForm.get('address')?.value,
      phoneNumber: this.companyForm.get('phoneNumber')?.value,
      email: this.companyForm.get('email')?.value,
      website: this.companyForm.get('website')?.value
    };

    this.companyService.createCompany(companyData).subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.errorMessage = this.translationService.translate('auth.create_company.error') || 'An error occurred during company registration';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }
}