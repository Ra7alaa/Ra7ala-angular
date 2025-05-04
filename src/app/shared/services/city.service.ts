import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface City {
  id: number;
  name: string;
  governorate: string;
  stations: any[];
}

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private apiUrl = 'https://localhost:7111/api/City';

  constructor(private http: HttpClient) { }

  getAllCities(): Observable<City[]> {
    return this.http.get<City[]>(this.apiUrl);
  }
}
