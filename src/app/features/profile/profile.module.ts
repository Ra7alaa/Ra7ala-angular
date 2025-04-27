import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileRoutingModule } from './profile-routing.module';
import { UserProfileComponent } from './pages/profile/user-profile.component';
import { TranslatePipe } from '../settings/pipes/translate.pipe';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ProfileRoutingModule,
    UserProfileComponent, // إضافة المكون كاستيراد لكونه standalone
    TranslatePipe, // إضافة أنبوب الترجمة بشكل صريح
  ],
  exports: [TranslatePipe], // تصدير أنبوب الترجمة للاستخدام في المكونات الفرعية
})
export class ProfileModule {}
