import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from './components/search/search.component';
import { NewsletterComponent } from './components/newsletter/newsletter.component';

@NgModule({
  imports: [CommonModule, SearchComponent, NewsletterComponent],
  // exports: [SearchComponent, NewsletterComponent],
})
export class SharedModule {}
