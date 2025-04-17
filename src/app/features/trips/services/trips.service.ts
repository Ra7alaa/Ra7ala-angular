import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Trip } from '../models/trip.model';

@Injectable({
  providedIn: 'root',
})
export class TripsService {
  private trips: Trip[] = [
    {
      id: 1,
      title: 'Explore the Pyramids of Giza',
      description:
        'Experience the wonders of ancient Egypt with a guided tour of the Pyramids of Giza and the Sphinx. This trip includes hotel accommodation, transportation, and an expert Egyptologist guide.',
      price: 1200,
      imageUrl: 'https://images.unsplash.com/photo-1503177119275-0aa32b3a9368',
      duration: 3,
      location: 'Cairo, Egypt',
      rating: 4.8,
      featured: true,
      departureDate: new Date('2025-06-15'),
      returnDate: new Date('2025-06-18'),
      maxGroupSize: 12,
      category: 'Cultural',
    },
    {
      id: 2,
      title: 'Safari Adventure in Kenya',
      description:
        "Embark on an unforgettable safari adventure in Kenya's Maasai Mara National Reserve. Witness the incredible wildlife and experience authentic African culture.",
      price: 2500,
      imageUrl: 'https://images.unsplash.com/photo-1547471080-91f9f7d40a39',
      duration: 7,
      location: 'Maasai Mara, Kenya',
      rating: 4.9,
      featured: true,
      departureDate: new Date('2025-07-10'),
      returnDate: new Date('2025-07-17'),
      maxGroupSize: 8,
      category: 'Adventure',
    },
    {
      id: 3,
      title: 'Beautiful Beaches of Bali',
      description:
        'Relax on the beautiful beaches of Bali, Indonesia. Enjoy surfing, snorkeling, and exploring the rich local culture and cuisine.',
      price: 1800,
      imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
      duration: 10,
      location: 'Bali, Indonesia',
      rating: 4.6,
      featured: false,
      departureDate: new Date('2025-08-05'),
      returnDate: new Date('2025-08-15'),
      maxGroupSize: 10,
      category: 'Beach',
    },
    {
      id: 4,
      title: 'Hiking in the Swiss Alps',
      description:
        'Experience the breathtaking views of the Swiss Alps with guided hiking tours. Stay in charming mountain lodges and enjoy Swiss hospitality.',
      price: 2200,
      imageUrl: 'https://images.unsplash.com/photo-1527683363572-c4fdec146bc6',
      duration: 6,
      location: 'Interlaken, Switzerland',
      rating: 4.7,
      featured: false,
      departureDate: new Date('2025-09-20'),
      returnDate: new Date('2025-09-26'),
      maxGroupSize: 8,
      category: 'Mountain',
    },
    {
      id: 5,
      title: 'City Tour of Istanbul',
      description:
        'Discover the rich history and vibrant culture of Istanbul, where East meets West. Visit iconic landmarks like the Hagia Sophia, Blue Mosque, and Grand Bazaar.',
      price: 1500,
      imageUrl: 'https://images.unsplash.com/photo-1527838832700-5059252407fa',
      duration: 5,
      location: 'Istanbul, Turkey',
      rating: 4.5,
      featured: true,
      departureDate: new Date('2025-10-10'),
      returnDate: new Date('2025-10-15'),
      maxGroupSize: 15,
      category: 'Urban',
    },
    {
      id: 6,
      title: 'Northern Lights in Iceland',
      description:
        'Witness the magical Northern Lights in Iceland. This trip includes glacier hiking, hot spring visits, and stays in remote locations for optimal aurora viewing.',
      price: 3000,
      imageUrl: 'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe',
      duration: 8,
      location: 'Reykjavik, Iceland',
      rating: 4.9,
      featured: true,
      departureDate: new Date('2025-11-15'),
      returnDate: new Date('2025-11-23'),
      maxGroupSize: 10,
      category: 'Adventure',
    },
  ];

  constructor() {}

  getAllTrips(): Observable<Trip[]> {
    return of(this.trips);
  }

  getTrip(id: number): Observable<Trip | undefined> {
    const trip = this.trips.find((trip) => trip.id === id);
    return of(trip);
  }

  getFeaturedTrips(): Observable<Trip[]> {
    return of(this.trips.filter((trip) => trip.featured));
  }

  searchTrips(term: string): Observable<Trip[]> {
    if (!term.trim()) {
      return this.getAllTrips();
    }

    term = term.toLowerCase();
    const filteredTrips = this.trips.filter(
      (trip) =>
        trip.title.toLowerCase().includes(term) ||
        trip.description.toLowerCase().includes(term) ||
        trip.location.toLowerCase().includes(term) ||
        trip.category?.toLowerCase().includes(term)
    );

    return of(filteredTrips);
  }

  getTripsByCategory(category: string): Observable<Trip[]> {
    const filteredTrips = this.trips.filter(
      (trip) => trip.category?.toLowerCase() === category.toLowerCase()
    );

    return of(filteredTrips);
  }
}
