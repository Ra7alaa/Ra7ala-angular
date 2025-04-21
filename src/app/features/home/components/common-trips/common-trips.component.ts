import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Trip } from '../../../trips/models/trip.model';

@Component({
  selector: 'app-common-trips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './common-trips.component.html',
  styleUrl: './common-trips.component.css',
})
export class CommonTripsComponent {
  @Input() trips: Trip[] = [];
  currentPage = 0;

  scrollLeft(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.scrollToCurrentPage();
    }
  }

  scrollRight(): void {
    if (this.currentPage < 2) {
      this.currentPage++;
      this.scrollToCurrentPage();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.scrollToCurrentPage();
  }

  private scrollToCurrentPage(): void {
    // Get the container and cards
    const container = document.querySelector('.overflow-auto');
    const cards = document.querySelectorAll('.card');

    if (container && cards.length > this.currentPage) {
      // Calculate the scroll position based on the current page
      const cardElement = cards[this.currentPage] as HTMLElement;
      container.scrollLeft = cardElement.offsetLeft - 16; // Adjust for container padding

      // Update active dot
      this.updateActiveDot();
    }
  }

  private updateActiveDot(): void {
    const dots = document.querySelectorAll('.btn.p-0');
    dots.forEach((dot, index) => {
      if (index === this.currentPage) {
        dot.classList.add('active-dot');
      } else {
        dot.classList.remove('active-dot');
      }
    });
  }
}
