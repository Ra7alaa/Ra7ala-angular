import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Trip } from '../../models/trip.model';
import { TripsService } from '../../services/trips.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.css'],
  imports: [CommonModule, RouterModule],
  standalone: true,
})
export class TripDetailsComponent implements OnInit {
  trip: Trip | undefined;

  constructor(
    private route: ActivatedRoute,
    private tripsService: TripsService
  ) {}

  ngOnInit(): void {
    this.getTrip();
  }

  getTrip(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tripsService.getTrip(id).subscribe((trip) => {
      this.trip = trip;
    });
  }
}
