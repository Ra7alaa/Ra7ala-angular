// book-trips.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TripData } from '../../../../shared/services/trip-results.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';

@Component({
  selector: 'app-book-trips',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './book-trips.component.html',
  styleUrls: ['./book-trips.component.css'],
})
export class BookTripsComponent {
  trips: TripData[] = [];
  searchParams: Record<string, unknown> | null = null;
  error = false;

  constructor(private router: Router) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state) {
      this.trips = nav.extras.state['trips'] ?? [];
      this.searchParams = nav.extras.state['searchParams'] ?? null;
      this.error = nav.extras.state['error'] ?? false;
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
