import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './components/search/search.component';
import { NewsletterComponent } from './components/newsletter/newsletter.component';
import { HasPermissionDirective } from './directives/has-permission.directive';

@NgModule({
  imports: [
    CommonModule,
    SearchComponent,
    NewsletterComponent,
    HasPermissionDirective,
  ],
  exports: [SearchComponent, NewsletterComponent, HasPermissionDirective],
})
export class SharedModule {}
