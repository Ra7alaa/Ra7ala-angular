import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslatePipe } from '../../../../../../features/settings/pipes/translate.pipe';
import { BusesService } from '../../../../services/buses.service';
import { AuthService } from '../../../../../auth/services/auth.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-bus-create',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './bus-create.component.html',
  styleUrl: './bus-create.component.css',
})
export class BusCreateComponent implements OnInit {
  @Output() busCreated = new EventEmitter<boolean>();

  busForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  companyId = 0;

  constructor(
    private busesService: BusesService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    this.companyId = currentUser?.companyId || 1; // استخدام الشركة 1 كقيمة افتراضية
  }

  // Initialize form - نفس أسماء الحقول كما في النموذج
  initializeForm(): void {
    this.busForm = this.fb.group({
      RegistrationNumber: ['', Validators.required],
      Model: ['', Validators.required],
      Capacity: ['', [Validators.required, Validators.min(1)]],
      AmenityDescription: ['', Validators.required],
      IsActive: [true],
    });
  }

  // Create new bus
  createBus(): void {
    if (this.busForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.busForm.controls).forEach((key) => {
        this.busForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    // إنشاء كائن FormData
    const formData = new FormData();
    formData.append(
      'RegistrationNumber',
      this.busForm.value.RegistrationNumber
    );
    formData.append('Model', this.busForm.value.Model);
    formData.append('Capacity', this.busForm.value.Capacity.toString()); // تحويل الرقم إلى نص
    formData.append(
      'AmenityDescription',
      this.busForm.value.AmenityDescription
    );
    formData.append('IsActive', this.busForm.value.IsActive.toString()); // تحويل البوليان إلى نص
    formData.append('CompanyId', (this.companyId || 1).toString()); // استخدام الشركة 1 كقيمة افتراضية وتحويلها لنص

    console.log('FormData being sent to API:');
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    this.busesService
      .createBus(formData) // إرسال FormData بدلاً من الكائن
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (response) => {
          console.log('Bus created successfully:', response);
          this.resetForm();
          this.busCreated.emit(true);
        },
        error: (err: HttpErrorResponse | Error) => {
          // Handle both HttpErrorResponse and Error
          console.error('Error creating bus:', err);

          if (
            err instanceof HttpErrorResponse &&
            err.error &&
            typeof err.error === 'object'
          ) {
            // محاولة استخراج رسائل الخطأ من الاستجابة
            const errorMessages: string[] = [];

            // التحقق من وجود رسائل خطأ محددة
            if (err.error.errors) {
              Object.keys(err.error.errors).forEach((key) => {
                const fieldErrors = err.error.errors[key];
                if (Array.isArray(fieldErrors)) {
                  errorMessages.push(...fieldErrors);
                } else if (typeof fieldErrors === 'string') {
                  errorMessages.push(fieldErrors);
                }
              });
            }

            // إذا كانت هناك رسائل خطأ محددة، اعرضها
            if (errorMessages.length > 0) {
              this.error = errorMessages.join(', ');
            } else {
              this.error =
                err.error.message || 'Failed to create bus. Please try again.';
            }
          } else if (err instanceof Error) {
            // Handle generic Error (e.g., from throwError in service)
            this.error =
              err.message || 'Failed to create bus. Please try again.';
          } else {
            this.error = 'Failed to create bus. Please try again.';
          }
          this.busCreated.emit(false);
        },
      });
  }

  // Reset form
  resetForm(): void {
    this.busForm.reset();
    this.busForm.patchValue({
      IsActive: true,
    });
    this.error = null;
  }
}
