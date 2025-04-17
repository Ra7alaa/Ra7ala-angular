import { Component, OnInit } from '@angular/core';
import { Trip } from '../../models/trip.model';
import { TripsService } from '../../services/trips.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-trips-list',
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.css'],
  imports: [CommonModule, RouterModule],
})
export class TripsListComponent implements OnInit {
  allTrips: Trip[] = [];
  featuredTrips: Trip[] = [];
  filteredTrips: Trip[] = [];

  searchTerm: string = '';
  selectedCategory: string = '';

  constructor(private tripsService: TripsService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.tripsService.getAllTrips().subscribe((trips) => {
      this.allTrips = trips;
      this.filteredTrips = trips;
    });

    this.tripsService.getFeaturedTrips().subscribe((trips) => {
      this.featuredTrips = trips;
    });
  }

  search(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;

    if (this.searchTerm && this.searchTerm.trim() !== '') {
      this.tripsService.searchTrips(this.searchTerm).subscribe((trips) => {
        this.filteredTrips = trips;
      });
    } else if (this.selectedCategory) {
      this.filterByCategory(this.selectedCategory);
    } else {
      this.filteredTrips = this.allTrips;
    }
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;

    if (category && category.trim() !== '') {
      this.tripsService.getTripsByCategory(category).subscribe((trips) => {
        this.filteredTrips = trips;
      });
    } else {
      this.filteredTrips = this.allTrips;
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.filteredTrips = this.allTrips;
  }
}
