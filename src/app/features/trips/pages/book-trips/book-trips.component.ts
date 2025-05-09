import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TripData } from '../../../../shared/services/trip-results.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';

@Component({
  selector: 'app-book-trips',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterModule],
  templateUrl: './book-trips.component.html',
  styleUrls: ['./book-trips.component.css'],
})
export class BookTripsComponent implements OnInit {
  trips: TripData[] = [];
  searchParams: any;
  error = false;

  constructor(private router: Router) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.trips = navigation.extras.state['trips'] || [];
      this.searchParams = navigation.extras.state['searchParams'];
      this.error = navigation.extras.state['error'] || false;
    }
  }

  ngOnInit(): void {
    // لا نقوم بالتوجيه حتى لو كانت قائمة الرحلات فارغة
    // الصفحة ستعرض رسالة "لا توجد رحلات" بدلا من ذلك
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}
