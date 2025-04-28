import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from "../../../settings/pipes/translate.pipe";

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
  googleMapUrl?: string;
}

@Component({
  selector: 'app-common-trips',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './common-trips.component.html',
  styleUrl: './common-trips.component.css',
})
export class CommonTripsComponent {
  @Input() trips: Trip[] = [];
  currentPage = 0;
  itemsPerPage = 3;
  filteredTrips: Trip[] = [];
  searchTerm: string = '';
  selectedCity: string = '';
  cities: string[] = [];

  ngOnInit() {
    this.trips = this.trips.map(trip => ({
      ...trip,
      imageUrl: this.getImagePath(trip.imageUrl),
      imageUrl1: this.getImagePath(trip.imageUrl1),
      imageUrl2: this.getImagePath(trip.imageUrl2),
      imageUrl3: this.getImagePath(trip.imageUrl3)
    }));
    this.filteredTrips = this.trips;
    this.cities = [...new Set(this.trips.map(trip => trip.location))];
  }

  ngOnChanges() {
    this.filteredTrips = this.trips;
    this.cities = [...new Set(this.trips.map(trip => trip.location))];
    this.filterTrips();
  }

  getCurrentPageTrips(): Trip[] {
    const start = this.currentPage * this.itemsPerPage;
    return this.filteredTrips.slice(start, start + this.itemsPerPage);
  }

  getTotalPages(): number {
    return Math.ceil(this.filteredTrips.length / this.itemsPerPage);
  }

  getPages(): number[] {
    return Array.from({ length: this.getTotalPages() }, (_, i) => i);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.getTotalPages()) {
      this.currentPage = page;
    }
  }

  scrollLeft(): void {
    this.goToPage(this.currentPage - 1);
  }

  scrollRight(): void {
    this.goToPage(this.currentPage + 1);
  }

  filterTrips(): void {
    this.filteredTrips = this.trips.filter(trip => {
      const matchesSearch = this.searchTerm ? 
        trip.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        trip.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        trip.location.toLowerCase().includes(this.searchTerm.toLowerCase())
        : true;
      
      const matchesCity = this.selectedCity ? 
        trip.location === this.selectedCity 
        : true;

      return matchesSearch && matchesCity;
    });
    this.currentPage = 0;
  }

  private getImagePath(url: string): string {
    return url?.startsWith('http') ? url : `assets/images/${url}`;
  }

  scrollToSection(): void {
    const element = document.getElementById('common-trips');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
