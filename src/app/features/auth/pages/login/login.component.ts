import { Component, OnInit } from '@angular/core';
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
import { TranslationService } from '../../../../core/localization/translation.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  imports: [ReactiveFormsModule, CommonModule, RouterModule, TranslatePipe],
  standalone: true,
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private authService: AuthService,
    public translationService: TranslationService
  ) {
    this.loginForm = this.formBuilder.group({
      emailOrUsername: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    console.log('تم تهيئة مكون تسجيل الدخول');

    // التوجيه إذا كان المستخدم مسجل الدخول بالفعل
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnUserRole();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    console.log(
      'تم تبديل وضوح كلمة المرور:',
      this.showPassword ? 'ظاهرة' : 'مخفية'
    );
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      console.error('فشل التحقق من صحة النموذج', this.loginForm.errors);
      // إظهار رسائل الخطأ للحقول غير الصالحة
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const emailOrUsername = this.loginForm.get('emailOrUsername')?.value;
    const password = this.loginForm.get('password')?.value;

    console.log('محاولة تسجيل الدخول باستخدام:', {
      emailOrUsername,
      password: '******',
    });
    console.time('طلب تسجيل الدخول');

    // إنشاء كائن LoginRequest ليتناسب مع توقيع AuthService.login
    const loginRequest = {
      emailOrUsername,
      password,
    };

    this.authService
      .login(loginRequest)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          console.timeEnd('طلب تسجيل الدخول');
          console.log('اكتمل طلب تسجيل الدخول');
        })
      )
      .subscribe({
        next: (user) => {
          console.log(
            'تم تسجيل الدخول بنجاح مع بيانات الملف الشخصي الكاملة:',
            user
          );
          this.redirectBasedOnUserRole();
        },
        error: (error) => {
          console.error('خطأ في تسجيل الدخول:', error);
          this.errorMessage = error.message || 'حدث خطأ أثناء تسجيل الدخول';
        },
      });
  }

  /**
   * توجيه المستخدم بناءً على دوره
   */
  private redirectBasedOnUserRole(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    // استخدام دالة التوجيه الجديدة في خدمة المصادقة
    this.authService.redirectBasedOnRole(user);
  }

  translate(key: string): string {
    return this.translationService.translate(key);
  }
}
