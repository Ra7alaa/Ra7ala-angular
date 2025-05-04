import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TripSearchComponent } from './components/trip-search/trip-search.component';
import { TripResultsComponent } from './components/trip-results/trip-results.component';
import { BookingComponent } from './pages/booking/booking.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      { path: 'search', component: TripSearchComponent },
      { path: 'results', component: TripResultsComponent },
      { path: 'booking/:tripId', component: BookingComponent }
    ]),
    TripSearchComponent,
    TripResultsComponent,
    BookingComponent
  ]
})
export class TripsModule { }
