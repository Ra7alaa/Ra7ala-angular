import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../features/settings/pipes/translate.pipe';
import { RtlDirective } from '../../../features/settings/directives/rtl.directive';

@Component({
  selector: 'app-rejection-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, RtlDirective],
  templateUrl: './rejection-modal.component.html',
  styleUrls: ['./rejection-modal.component.css'],
})
export class RejectionModalComponent {
  @Input() isOpen = false;
  @Output() confirmRejection = new EventEmitter<string>();
  @Output() cancelRejection = new EventEmitter<void>();

  rejectionReason = '';
  selectedPredefinedReason = '';

  predefinedReasons = [
    'owner.company_requests.rejection_reasons.incomplete_info',
    'owner.company_requests.rejection_reasons.invalid_docs',
    'owner.company_requests.rejection_reasons.duplicate',
    'owner.company_requests.rejection_reasons.not_eligible',
    'owner.company_requests.rejection_reasons.suspicious',
    'owner.company_requests.rejection_reasons.unverifiable',
  ];

  selectPredefinedReason(reason: string): void {
    this.selectedPredefinedReason = reason;
    this.rejectionReason = reason;
  }

  onConfirm(): void {
    this.confirmRejection.emit(this.rejectionReason);
    this.resetModal();
  }

  onCancel(): void {
    this.cancelRejection.emit();
    this.resetModal();
  }

  private resetModal(): void {
    this.rejectionReason = '';
    this.selectedPredefinedReason = '';
  }
}
