import { Component, OnInit } from '@angular/core';
import { Trip } from '../../models/trip.model';
import { TripsService } from '../../services/trips.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface TripResponse {
  trips: Trip[];
  total: number;
}

@Component({
  selector: 'app-trips-list',
  templateUrl: './trips-list.component.html',
  styleUrls: ['./trips-list.component.css'],
  imports: [CommonModule, RouterModule, FormsModule],
  standalone: true,
})
export class TripsListComponent implements OnInit {
  trips: Trip[] = [];
  filteredTrips: Trip[] = [];
  searchTerm: string = '';
  
  // Pagination
  currentPage: number = 1;
  pageSize: number = 6;
  totalTrips: number = 0;
  
  constructor(private tripsService: TripsService) {}

  ngOnInit(): void {
    this.loadTrips();
  }

  loadTrips(): void {
    this.tripsService.getAllTrips(this.currentPage, this.pageSize).subscribe(({trips, total}: TripResponse) => {
      this.trips = trips;
      this.filteredTrips = trips;
      this.totalTrips = total;
    });
  }

  onSearch(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.currentPage = 1; // Reset to first page when searching

    if (this.searchTerm.trim()) {
      this.tripsService.searchTrips(this.searchTerm, this.currentPage, this.pageSize)
        .subscribe(({trips, total}: TripResponse) => {
          this.filteredTrips = trips;
          this.totalTrips = total;
        });
    } else {
      this.loadTrips();
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    if (this.searchTerm.trim()) {
      this.tripsService.searchTrips(this.searchTerm, this.currentPage, this.pageSize)
        .subscribe(({trips, total}: TripResponse) => {
          this.filteredTrips = trips;
          this.totalTrips = total;
        });
    } else {
      this.loadTrips();
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalTrips / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({length: this.totalPages}, (_, i) => i + 1);
  }
}
