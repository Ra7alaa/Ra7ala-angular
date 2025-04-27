import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../features/settings/pipes/translate.pipe';
import { TranslationService } from '../../../../core/localization/translation.service';

@Component({
  selector: 'app-routes-management',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './routes-management.component.html',
  styleUrl: './routes-management.component.css',
})
export class RoutesManagementComponent {
  constructor(private translationService: TranslationService) {}
}
