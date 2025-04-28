import { Injectable } from '@angular/core';
import { Trip } from '../models/trip.model';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

interface PaginatedResponse {
  trips: Trip[];
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class TripsService {
  constructor() {}

  getTripById(id: number): Observable<Trip | undefined> {
    const trip = this.trips.find(t => t.id === id);
    return of(trip).pipe(delay(500)); // Simulate network delay
  }

  getAllTrips(page: number = 1, pageSize: number = 6): Observable<PaginatedResponse> {
    const startIndex = (page - 1) * pageSize;
    const paginatedTrips = this.trips.slice(startIndex, startIndex + pageSize);
    return of({
      trips: paginatedTrips,
      total: this.trips.length
    });
  }

  searchTrips(searchTerm: string, page: number = 1, pageSize: number = 6): Observable<PaginatedResponse> {
    const filteredTrips = this.trips.filter(trip => 
      trip.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    const startIndex = (page - 1) * pageSize;
    const paginatedTrips = filteredTrips.slice(startIndex, startIndex + pageSize);
    
    return of({
      trips: paginatedTrips,
      total: filteredTrips.length
    });
  }

  getMostCommonTrips(): Observable<PaginatedResponse> {
    const commonTrips = this.trips.slice(0, 3);
    return of({
      trips: commonTrips,
      total: commonTrips.length
    });
  }

  private trips: Trip[] = [
    {
      id: 1,
      title: 'Cairo Adventure',
      description: 'Explore the pyramids, Egyptian Museum, and Khan el-Khalili bazaar. Experience the rich history and culture of Egypt\'s capital city.',
      price: 150,
      imageUrl: 'cairo1.jpg',
      imageUrl1: 'cairo2.jpeg',
      imageUrl2: 'cairo3.jpeg',
      imageUrl3: 'cairo4.jpeg',
      duration: 3,
      location: 'Cairo',
      googleMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d110502.76983794796!2d31.18928244962797!3d30.059488594140673!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14583fa60b21beeb%3A0x79dfb296e8423bba!2sCairo%2C%20Cairo%20Governorate%2C%20Egypt!5e0!3m2!1sen!2s'
    },
    {
      id: 2,
      title: 'Alexandria Beach Trip',
      description: 'Experience the "Bride of the Mediterranean" - a city where ancient wonders meet modern coastal charm. Discover the Bibliotheca Alexandrina, explore the historic Citadel of Qaitbay, and stroll along the famous Corniche.',
      price: 120,
      imageUrl: 'Alex1.jpeg',
      imageUrl1: 'Alex2.jpeg',
      imageUrl2: 'Alex3.jpeg',
      imageUrl3: 'Alex4.jpg',
      duration: 2,
      location: 'Alexandria',
      googleMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d109628.83029079439!2d29.842085601038318!3d31.224034223210114!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14f5c49126710fd3%3A0xb4e0cda629ee6bb9!2sAlexandria%2C%20Alexandria%20Governorate%2C%20Egypt!5e0!3m2!1sen!2s'
    },
    {
      id: 3,
      title: 'Luxor Heritage Tour',
      description: 'Visit the Valley of Kings, Luxor Temple, and Karnak Temple. Experience the ancient wonders of Egypt\'s open-air museum.',
      price: 180,
      imageUrl: 'luxor1.jpeg',
      imageUrl1: 'luxor2.jpeg',
      imageUrl2: 'luxor3.jpg',
      imageUrl3: 'luxor1.jpeg',
      duration: 4,
      location: 'Luxor',
      googleMapUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d57765.48489380107!2d32.59277562167967!3d25.687669199999997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x144915844802b951%3A0x7fd2dd5b8204f236!2sLuxor%2C%20Luxor%20City%2C%20Luxor%20Governorate%2C%20Egypt!5e0!3m2!1sen!2s'
    }
  ];
}
