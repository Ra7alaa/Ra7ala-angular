import { Component, OnInit } from '@angular/core';
import { SearchComponent } from '../../../../shared/components/search/search.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  // Add standalone components to imports array
  imports: [SearchComponent],
})
export class HomeComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    // Initialize component
  }

  // Handle search results
  handleSearch(searchData: any): void {
    console.log('Search data:', searchData);
    // Implement search logic or navigation to results page
  }
}
