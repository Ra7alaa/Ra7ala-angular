import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Language,
  LanguageService,
} from '../../../../core/localization/language.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentLanguage!: Language;
  private subscriptions: Subscription[] = [];

  constructor(public languageService: LanguageService) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    // Subscribe to language changes
    this.subscriptions.push(
      this.languageService.language$.subscribe((language) => {
        this.currentLanguage = language;
      })
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }
}
