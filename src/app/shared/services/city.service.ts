import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface City {
  id: number;
  name: string;
  governorate: string;
  stations: unknown[];
}

@Injectable({
  providedIn: 'root',
})
export class CityService {
  private apiUrl = `${environment.apiUrl}/City`;

  constructor(private http: HttpClient) {}

  getAllCities(): Observable<City[]> {
    return this.http.get<City[]>(this.apiUrl);
  }
}
