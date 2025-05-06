import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

// إضافة واجهة لاستجابة التسجيل
export interface RegisterResponse {
  statusCode: number;
  message: string;
  data: null | {
    id?: string;
    email?: string;
    username?: string;
    fullName?: string;
    token?: string;
  };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  standalone: true,
})
export class RegisterComponent {
  registerForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;
  isFormSubmitted = false;
  isProfilePictureSelected = false;
  selectedFile: File | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.registerForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', [Validators.required]],
      profilePictureUrl: [''],
      address: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      phoneNumber: [
        '',
        [Validators.required, Validators.pattern(/^\+?[0-9]{10,14}$/)],
      ],
      confirmPassword: ['', [Validators.required]],
    });
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const file = inputElement.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.isProfilePictureSelected = true;
    } else {
      this.selectedFile = null;
      this.isProfilePictureSelected = false;
    }
  }

  // مفاتيح تبديل رؤية كلمة المرور
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onSubmit(): void {
    this.isFormSubmitted = true;

    // التحقق من صحة النموذج وتحديد صورة الملف الشخصي
    if (this.registerForm.invalid || !this.isProfilePictureSelected) {
      // تحديد جميع الحقول كتم لمسها لإظهار الأخطاء
      Object.keys(this.registerForm.controls).forEach((key) => {
        const control = this.registerForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    // الحصول على قيم النموذج
    const dateOfBirthValue = this.registerForm.get('dateOfBirth')?.value;
    let formattedDateOfBirth = dateOfBirthValue;

    // تنسيق التاريخ إذا لزم الأمر
    if (dateOfBirthValue) {
      // التحقق مما إذا كان كائن تاريخ عن طريق التحقق مما إذا كان يحتوي على طريقة toISOString
      if (
        dateOfBirthValue &&
        typeof dateOfBirthValue === 'object' &&
        'toISOString' in dateOfBirthValue
      ) {
        formattedDateOfBirth = (dateOfBirthValue as Date)
          .toISOString()
          .split('T')[0]; // YYYY-MM-DD
      } else if (typeof dateOfBirthValue === 'string') {
        // محاولة ضمان أن التاريخ بتنسيق YYYY-MM-DD
        if (dateOfBirthValue.includes('/')) {
          const parts = dateOfBirthValue.split('/');
          if (parts.length === 3) {
            // معالجة تنسيق MM/DD/YYYY
            formattedDateOfBirth = `${parts[2]}-${parts[0].padStart(
              2,
              '0'
            )}-${parts[1].padStart(2, '0')}`;
          }
        } else if (dateOfBirthValue.includes('-')) {
          // ضمان تنسيق YYYY-MM-DD
          const parts = dateOfBirthValue.split('-');
          if (parts.length === 3) {
            formattedDateOfBirth = `${parts[0]}-${parts[1].padStart(
              2,
              '0'
            )}-${parts[2].padStart(2, '0')}`;
          }
        }
      }
    }

    // إنشاء كائن FormData للتعامل مع تحميل الملف
    const formData = new FormData();
    formData.append('email', this.registerForm.get('email')?.value);
    formData.append('username', this.registerForm.get('username')?.value);
    formData.append('password', this.registerForm.get('password')?.value);
    formData.append('fullName', this.registerForm.get('fullName')?.value);
    formData.append('phoneNumber', this.registerForm.get('phoneNumber')?.value);
    formData.append('address', this.registerForm.get('address')?.value);
    formData.append('dateOfBirth', formattedDateOfBirth);

    // إضافة كلمة المرور التأكيدية للتحقق في الباك اند
    formData.append(
      'confirmPassword',
      this.registerForm.get('confirmPassword')?.value
    );

    // إضافة ملف الصورة الشخصية
    if (this.selectedFile) {
      formData.append(
        'profilePicture',
        this.selectedFile,
        this.selectedFile.name
      );
    }

    console.log('إرسال بيانات التسجيل مع صورة الملف الشخصي');

    this.authService.registerPassengerWithFile(formData).subscribe({
      next: (response: RegisterResponse) => {
        console.log('تم التسجيل بنجاح:', response);

        // تحقق من حالة الاستجابة - إذا كان الكود 201 أو 200، يعتبر نجاحاً
        if (
          response &&
          (response.statusCode === 201 || response.statusCode === 200)
        ) {
          // عرض رسالة نجاح إذا كان هناك رسالة في الاستجابة
          if (response.message) {
            this.errorMessage = ''; // مسح أي رسائل خطأ سابقة
          }

          // توجيه المستخدم إلى صفحة تسجيل الدخول
          this.router.navigate(['/auth/login']);
        } else {
          // في حالة غير متوقعة
          this.isSubmitting = false;
          this.errorMessage = 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
        }
      },
      error: (error: HttpErrorResponse) => {
        console.error('خطأ في التسجيل:', error);

        this.isSubmitting = false;

        if (error.status === 400) {
          // محاولة استخراج أخطاء التحقق
          if (error.error && typeof error.error === 'object') {
            if (error.error.message) {
              this.errorMessage = error.error.message;
            } else if (error.error.errors) {
              // دمج رسائل الخطأ
              const errorMessages = [];
              for (const key in error.error.errors) {
                if (
                  Object.prototype.hasOwnProperty.call(error.error.errors, key)
                ) {
                  const errorArray = error.error.errors[key];
                  if (Array.isArray(errorArray)) {
                    errorMessages.push(...errorArray);
                  } else {
                    errorMessages.push(errorArray);
                  }
                }
              }
              this.errorMessage = errorMessages.join('. ');
            } else {
              this.errorMessage =
                'بيانات تسجيل غير صالحة. يرجى التحقق من المدخلات الخاصة بك.';
            }
          } else {
            this.errorMessage =
              'بيانات تسجيل غير صالحة. يرجى التحقق من المدخلات الخاصة بك.';
          }
        } else {
          this.errorMessage = 'حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.';
        }
      },
      complete: () => {
        this.isSubmitting = false;
      },
    });
  }
}
