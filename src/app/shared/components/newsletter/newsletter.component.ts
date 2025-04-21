import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.css'],
})
export class NewsletterComponent {
  email: string = '';

  onSubmit() {
    if (this.email) {
      console.log('Subscription email:', this.email);
      // Here you would typically call a service to subscribe the user
      this.email = ''; // Reset the form
    }
  }
}
