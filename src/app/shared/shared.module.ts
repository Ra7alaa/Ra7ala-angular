import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './components/search/search.component';
import { NewsletterComponent } from './components/newsletter/newsletter.component';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { BackButtonComponent } from './components/back-button/back-button.component';

@NgModule({
  imports: [
    CommonModule,
    SearchComponent,
    NewsletterComponent,
    HasPermissionDirective,
    BackButtonComponent,
  ],
  exports: [
    SearchComponent, 
    NewsletterComponent, 
    HasPermissionDirective,
    BackButtonComponent
  ],
})
export class SharedModule {}
