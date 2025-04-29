import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Trip } from '../../models/trip.model';
import { TripsService } from '../../services/trips.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { TranslatePipe } from "../../../settings/pipes/translate.pipe";

@Component({
  selector: 'app-trip-details',
  templateUrl: './trip-details.component.html',
  styleUrls: ['./trip-details.component.css'],
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  standalone: true,
})
export class TripDetailsComponent implements OnInit {
  trip: Trip | undefined;
  selectedTravelers: number = 1;

  constructor(
    private route: ActivatedRoute,
    private tripsService: TripsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.getTrip();
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
          imageUrl3: this.getImagePath(trip.imageUrl3)
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
