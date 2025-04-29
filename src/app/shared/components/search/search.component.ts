import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TranslatePipe } from '../../../features/settings/pipes/translate.pipe';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InputTextModule,
    DropdownModule,
    ButtonModule,
    CalendarModule,
    FloatLabelModule,
    TranslatePipe
  ],
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent implements OnInit {
  @Output() search = new EventEmitter<any>();

  // Form fields
  fromToValue: string = '';
  tripType: string = 'return';
  dateRange: string = '';
  passengersInfo: string = '1 Passenger, Economy';
  showPromoCode: boolean = false;
  promoCode: string = '';

  constructor() {}

  ngOnInit(): void {}

  onSearch(): void {
    const searchData = {
      fromTo: this.fromToValue,
      tripType: this.tripType,
      dateRange: this.dateRange,
      passengersInfo: this.passengersInfo,
      promoCode: this.promoCode,
    };
    this.search.emit(searchData);
  }

  togglePromoCode(): void {
    this.showPromoCode = !this.showPromoCode;
  }

  // Split from-to value into origin and destination
  get origin(): string {
    return this.fromToValue.split('-')[0]?.trim() || '';
  }

  get destination(): string {
    return this.fromToValue.split('-')[1]?.trim() || '';
  }
}
