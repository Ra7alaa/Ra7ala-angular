import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DriversService } from '../../../../services/drivers.service';
import { Driver } from '../../../../models/driver.model';

// تعريف حالات السائق
enum DriverStatus {
  Active = 0,
  OnLeave = 1,
  Suspended = 2,
}

@Component({
  selector: 'app-driver-details',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './driver-details.component.html',
  styleUrls: ['./driver-details.component.css'],
})
export class DriverDetailsComponent implements OnInit {
  driver: Driver | null = null;
  loading = true;
  error: string | null = null;
  driverStatus = DriverStatus;
  driverId = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private driversService: DriversService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      if (params['id']) {
        this.driverId = params['id'];
        this.loadDriverDetails(this.driverId);
      } else {
        this.error = 'لم يتم تحديد معرف السائق';
        this.loading = false;
      }
    });
  }

  loadDriverDetails(id: string): void {
    this.loading = true;
    this.error = null;

    console.log(`محاولة تحميل بيانات السائق بالمعرف: ${id}`);

    this.driversService.getDriverDetails(id).subscribe({
      next: (driver: Driver) => {
        console.log('تم الحصول على تفاصيل السائق:', driver);
        this.driver = driver;
        this.loading = false;
      },
      error: (error) => {
        console.error('خطأ في تحميل بيانات السائق:', error);

        // في حالة الفشل، نجرب استخدام الطريقة البديلة
        this.tryFallbackMethod(id);
      },
    });
  }

  // طريقة بديلة في حالة فشل طريقة التحميل الأساسية
  tryFallbackMethod(id: string): void {
    console.log('محاولة تحميل البيانات بطريقة بديلة...');

    this.driversService.getAllDriversWithoutParams().subscribe({
      next: (drivers: Driver[]) => {
        console.log(
          `تم تحميل ${drivers.length} سائق، البحث عن السائق رقم ${id}`
        );

        const foundDriver = drivers.find((driver) => driver.id === id);

        if (foundDriver) {
          console.log('تم العثور على السائق:', foundDriver);
          this.driver = foundDriver;
          this.loading = false;
        } else {
          this.error = 'لم يتم العثور على السائق المطلوب';
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('خطأ في الطريقة البديلة لتحميل بيانات السائق:', error);
        this.error =
          'حدث خطأ أثناء تحميل بيانات السائق. يرجى المحاولة مرة أخرى.';
        this.loading = false;
      },
    });
  }

  formatDate(dateString?: string | null): string {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-EG');
  }

  getDriverStatus(status?: number): { text: string; class: string } {
    switch (status) {
      case DriverStatus.Active:
        return { text: 'نشط', class: 'badge bg-success' };
      case DriverStatus.OnLeave:
        return { text: 'في إجازة', class: 'badge bg-warning' };
      case DriverStatus.Suspended:
        return { text: 'موقوف', class: 'badge bg-danger' };
      default:
        return { text: 'غير معروف', class: 'badge bg-secondary' };
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/drivers']);
  }
}
