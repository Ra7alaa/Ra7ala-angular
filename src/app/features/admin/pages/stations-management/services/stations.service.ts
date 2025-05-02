// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable, catchError,  of, throwError } from 'rxjs';
// import {
//   Station,
//   StationCreateRequest,
//   StationUpdateRequest,
// } from '../../../models/station.model';
// import { environment } from '../../../../../../environments/environment';

// @Injectable({
//   providedIn: 'root',
// })
// export class StationsService {
//   private apiUrl = `${environment.apiUrl}/api/Station`;

//   // Mock data for development
//   private mockStations: Station[] = [
//     {
//       id: 1,
//       name: 'Cairo Main Station',
//       latitude: 30.0444,
//       longitude: 31.2357,
//       cityName: 'Cairo',
//       isSystemOwned: true,
//       companyId: 0,
//     },
//     {
//       id: 2,
//       name: 'Alexandria Station',
//       latitude: 31.2001,
//       longitude: 29.9187,
//       cityName: 'Alexandria',
//       isSystemOwned: true,
//       companyId: 0,
//     },
//     {
//       id: 3,
//       name: 'Sharm El Sheikh Station',
//       latitude: 27.9158,
//       longitude: 34.33,
//       cityName: 'Sharm El Sheikh',
//       isSystemOwned: false,
//       companyName: 'Eastern Tourism Company',
//       companyId: 5,
//     },
//   ];

//   constructor(private http: HttpClient) {}

//   // Get HTTP options with headers
//   private getHttpOptions() {
//     return {
//       headers: new HttpHeaders({
//         'Content-Type': 'application/json',
//         Accept: 'application/json',
//       }),
//     };
//   }

//   // Get all stations
//   getAllStations(): Observable<Station[]> {
//     return this.http.get<Station[]>(this.apiUrl, this.getHttpOptions()).pipe(
//       catchError((error) => {
//         console.error('Error fetching stations:', error);
//         return of(this.mockStations);
//       })
//     );
//   }

//   // Get station by ID
//   getStationById(id: number): Observable<Station> {
//     return this.http
//       .get<Station>(`${this.apiUrl}/${id}`, this.getHttpOptions())
//       .pipe(
//         catchError((error) => {
//           console.error(`Error fetching station with ID ${id}:`, error);
//           return throwError(() => new Error('Station not found'));
//         })
//       );
//   }

//   // Create new station
//   createStation(station: StationCreateRequest): Observable<Station> {
//     return this.http
//       .post<Station>(this.apiUrl, station, this.getHttpOptions())
//       .pipe(
//         catchError((error) => {
//           console.error('Error creating station:', error);
//           return throwError(() => new Error('Failed to create station'));
//         })
//       );
//   }

//   // Update station
//   updateStation(station: Station | StationUpdateRequest): Observable<Station> {
//     return this.http
//       .put<Station>(
//         `${this.apiUrl}/${station.id}`,
//         station,
//         this.getHttpOptions()
//       )
//       .pipe(
//         catchError((error) => {
//           console.error('Error updating station:', error);
//           return throwError(() => new Error('Failed to update station'));
//         })
//       );
//   }

//   // Delete station
//   deleteStation(id: number): Observable<boolean> {
//     return this.http
//       .delete<boolean>(`${this.apiUrl}/${id}`, this.getHttpOptions())
//       .pipe(
//         catchError((error) => {
//           console.error(`Error deleting station with ID ${id}:`, error);
//           return throwError(() => new Error('Failed to delete station'));
//         })
//       );
//   }

//   // Get stations by ownership (system or company)
//   getStationsByOwnership(isSystemOwned: boolean): Observable<Station[]> {
//     return this.http
//       .get<Station[]>(
//         `${this.apiUrl}?isSystemOwned=${isSystemOwned}`,
//         this.getHttpOptions()
//       )
//       .pipe(
//         catchError((error) => {
//           console.error(
//             `Error fetching stations by ownership (isSystemOwned: ${isSystemOwned}):`,
//             error
//           );
//           return of(
//             this.mockStations.filter(
//               (station) => station.isSystemOwned === isSystemOwned
//             )
//           );
//         })
//       );
//   }
// }
