import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../features/settings/pipes/translate.pipe';
import { TranslationService } from '../../../../core/localization/translation.service';

@Component({
  selector: 'app-trips-management',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './trips-management.component.html',
  styleUrl: './trips-management.component.css',
})
export class TripsManagementComponent {
  constructor(private translationService: TranslationService) {}
}
