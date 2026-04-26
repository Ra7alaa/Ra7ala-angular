import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Trip } from '../../models/trip.model';
import { TripsService } from '../../services/trips.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import {
  LanguageService,
  Language,
} from '../../../../core/localization/language.service';
import { ThemeService } from '../../../../core/themes/theme.service';

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.css'],
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  standalone: true,
})
export class TripDetailsComponent implements OnInit {
  trip: Trip | undefined;
  selectedTravelers = 1;
  currentLanguage!: Language;

  constructor(
    private route: ActivatedRoute,
    private tripsService: TripsService,
    private sanitizer: DomSanitizer,
    private languageService: LanguageService,
    private themeService: ThemeService
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    this.getTrip();

    // Subscribe to language changes
    this.languageService.language$.subscribe((language) => {
      this.currentLanguage = language;
    });
  }

  // Helper method to check if the current theme is dark
  isDarkTheme(): boolean {
    return this.themeService.isDarkTheme();
  }

  getTrip(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tripsService.getTripById(id).subscribe((trip: Trip | undefined) => {
      if (trip) {
        this.trip = {
          ...trip,
          imageUrl: this.getImagePath(trip.imageUrl),
          imageUrl1: this.getImagePath(trip.imageUrl1),
          imageUrl2: this.getImagePath(trip.imageUrl2),
          imageUrl3: this.getImagePath(trip.imageUrl3),
        };
      }
    });
  }

  private getImagePath(url: string): string {
    return url?.startsWith('http') ? url : `assets/images/${url}`;
  }

  updateTravelers(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedTravelers = Number(select.value);
  }

  getTotalPrice(): number {
    return this.trip ? this.trip.price * this.selectedTravelers : 0;
  }

  getSecureMapUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
