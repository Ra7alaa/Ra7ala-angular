import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationService } from '../../../core/services/navigation.service';

@Component({
  selector: 'app-back-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button class="btn-back" (click)="goBack()">
      <i class="fas fa-arrow-left"></i> رجوع
    </button>
  `,
  styles: [`
    .btn-back {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background-color: transparent;
      border: 1px solid var(--border-color);
      border-radius: var(--border-radius);
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.2s ease-in-out;
    }

    .btn-back:hover {
      background-color: var(--surface-color);
    }

    [dir="rtl"] .btn-back i {
      transform: scaleX(-1);
    }
  `]
})
export class BackButtonComponent {
  constructor(private navigationService: NavigationService) {}

  goBack(): void {
    this.navigationService.goBack();
  }
}