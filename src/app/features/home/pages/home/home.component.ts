import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../../shared/components/search/search.component';
import { CommonTripsComponent } from '../../components/common-trips/common-trips.component';
import { SharedModule } from '../../../../shared/shared.module';
import { ThemeService, ThemeOption } from '../../../../core/themes/theme.service';
import { LanguageService, Language } from '../../../../core/localization/language.service';
import { TranslationService, TranslationDictionary } from '../../../../core/localization/translation.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Trip {
  id: number;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  imageUrl1: string;
  imageUrl2: string;
  imageUrl3: string;
  duration: number;
  location: string;
  googleMapUrl: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    SearchComponent,
    CommonTripsComponent,
    SharedModule,
    TranslatePipe,
    RouterModule,
    FormsModule
  ],
})
export class HomeComponent implements OnInit {
  commonTrips: Trip[] = [];
  currentLanguage: Language;
  currentTheme: ThemeOption;
  translations: TranslationDictionary = {};
  selectedTripId: number | null = null;

  constructor(
    private themeService: ThemeService,
    private languageService: LanguageService,
    private translationService: TranslationService,
    private sanitizer: DomSanitizer
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  ngOnInit(): void {
    this.loadCommonTrips();
    this.loadTranslations();
  }

  loadTranslations(): void {
    this.translationService.translations$.subscribe(translations => {
      this.translations = translations;
    });
  }

  loadCommonTrips(): void {
    // Local trip data
    this.commonTrips = [
      {
        id: 1,
        title: 'Cairo Adventure',
        description: 'Experience the magic of ancient pyramids and modern city life',
        price: 150,
        imageUrl: 'cairo1.jpg',
        imageUrl1: 'cairo2.jpeg',
        imageUrl2: 'cairo3.jpeg',
        imageUrl3: 'cairo4.jpeg',
        duration: 3,
        location: 'Cairo',
        googleMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110502.76983794796!2d31.18928244962797!3d30.059488594140673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583fa60b21beeb%3A0x79dfb296e8423bba!2sCairo%2C%20Cairo%20Governorate%2C%20Egypt!5e0!3m2!1sen!2s'
      },
      {
        id: 2,
        title: 'Alexandria Beach Trip',
        description: 'Explore beautiful Mediterranean beaches and historic landmarks',
        price: 120,
        imageUrl: 'Alex1.jpeg',
        imageUrl1: 'Alex2.jpeg',
        imageUrl2: 'Alex3.jpeg',
        imageUrl3: 'Alex4.jpg',
        duration: 2,
        location: 'Alexandria',
        googleMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d109628.83029079439!2d29.842085601038318!3d31.224034223210114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f5c49126710fd3%3A0xb4e0cda629ee6bb9!2sAlexandria%2C%20Alexandria%20Governorate%2C%20Egypt!5e0!3m2!1sen!2s'
      },
      {
        id: 3,
        title: 'Luxor Heritage Tour',
        description: 'Discover ancient temples and Egyptian history',
        price: 180,
        imageUrl: 'luxor1.jpeg',
        imageUrl1: 'luxor2.jpeg',
        imageUrl2: 'luxor3.jpg',
        imageUrl3: 'luxor1.jpeg',
        duration: 4,
        location: 'Luxor',
        googleMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57765.48489380107!2d32.59277562167967!3d25.687669199999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x144915844802b951%3A0x7fd2dd5b8204f236!2sLuxor%2C%20Luxor%20City%2C%20Luxor%20Governorate%2C%20Egypt!5e0!3m2!1sen!2s'
      }
    ];
  }

  // Search handler
  handleSearch(searchData: any): void {
    console.log('Search Data:', searchData);
    // Implement search logic here
  }

  getSelectedTrip(): Trip | undefined {
    return this.commonTrips.find(trip => trip.id === Number(this.selectedTripId));
  }

  sanitizeMapUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
