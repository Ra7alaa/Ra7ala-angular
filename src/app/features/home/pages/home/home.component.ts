import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../../../trips/models/trip.model';
import { TripsService } from '../../../trips/services/trips.service';
import { SearchComponent } from '../../../../shared/components/search/search.component';
import { CommonTripsComponent } from '../../components/common-trips/common-trips.component';
import { SharedModule } from '../../../../shared/shared.module';
import {
  ThemeService,
  ThemeOption,
} from '../../../../core/themes/theme.service';
import {
  LanguageService,
  Language,
} from '../../../../core/localization/language.service';
import {
  TranslationService,
  TranslationDictionary,
} from '../../../../core/localization/translation.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

  constructor(
    private tripsService: TripsService,
    private themeService: ThemeService,
    private languageService: LanguageService,
    private translationService: TranslationService
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
    this.currentTheme = this.themeService.getCurrentTheme();
  }

  ngOnInit(): void {
    // Load common trips
    this.loadCommonTrips();

    // الاشتراك في تغييرات اللغة
    this.languageService.language$.subscribe((language: Language) => {
      this.currentLanguage = language;
    });

    // الاشتراك في تغييرات السمة
    this.themeService.theme$.subscribe((theme: ThemeOption) => {
      this.currentTheme = theme;
    });

    // الاشتراك في تغييرات الترجمة
    this.translationService.translations$.subscribe(
      (translations: TranslationDictionary) => {
        this.translations = translations;
      }
    );
  }

  loadCommonTrips(): void {
    this.tripsService.getMostCommonTrips().subscribe({
      next: (trips: Trip[]) => {
        this.commonTrips = trips;
      },
      error: (error: any) => {
        console.error('Error loading common trips:', error);

        // Fallback data with high-quality images
        this.commonTrips = [
          {
            id: 1,
            title: 'Cappadocia Trip',
            description: 'Hot air balloon experience over Cappadocia',
            price: 15,
            imageUrl:
              'https://images.unsplash.com/photo-1525824921880-9a984b8c17b7?q=80&w=1470&auto=format&fit=crop',
            duration: 3,
            location: 'Cappadocia',
            rating: 4.9,
          },
          {
            id: 2,
            title: 'Cairo Trip',
            description: 'Visit the Great Pyramids of Giza',
            price: 15,
            imageUrl:
              'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?q=80&w=1470&auto=format&fit=crop',
            duration: 3,
            location: 'Cairo',
            rating: 4.8,
          },
          {
            id: 3,
            title: 'Alexandria Trip',
            description: 'Explore the beautiful beaches and resorts',
            price: 15,
            imageUrl:
              'https://images.unsplash.com/photo-1602544516567-991bc5b40a7b?q=80&w=1632&auto=format&fit=crop',
            duration: 3,
            location: 'Alexandria',
            rating: 4.7,
          },
          {
            id: 4,
            title: 'Luxor Trip',
            description: 'Explore ancient temples and historic sites',
            price: 15,
            imageUrl:
              'https://images.unsplash.com/photo-1587975838055-9f8f3e9e5d4f?q=80&w=1632&auto=format&fit=crop',
            duration: 3,
            location: 'Luxor',
            rating: 4.6,
          },
        ];
      },
    });
  }

  // Search handler
  handleSearch(searchData: any): void {
    console.log('Search Data:', searchData);
    // Implement search logic here
  }
}
