import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css'],
})
export class ErrorPageComponent implements OnInit {
  @Input() errorCode: string = '404';
  @Input() errorTitle: string = 'Page Not Found';
  @Input() errorMessage: string =
    'The page you are looking for does not exist.';
  @Input() showHomeButton: boolean = true;
  @Input() showBackButton: boolean = true;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Get error data from route data if available
    this.route.data.subscribe((data) => {
      if (data['errorCode']) this.errorCode = data['errorCode'];
      if (data['errorTitle']) this.errorTitle = data['errorTitle'];
      if (data['errorMessage']) this.errorMessage = data['errorMessage'];
    });

    // Get error code from route params if available (for the :code route)
    this.route.params.subscribe((params) => {
      if (params['code'] && !this.route.snapshot.data['errorCode']) {
        this.errorCode = params['code'];
        // Set default messages based on error code
        this.setDefaultErrorMessages(params['code']);
      }
    });
  }

  private setDefaultErrorMessages(code: string): void {
    switch (code) {
      case '401':
        this.errorTitle = 'Unauthorized';
        this.errorMessage = 'You need to be logged in to access this page.';
        break;
      case '403':
        this.errorTitle = 'Access Denied';
        this.errorMessage = 'You do not have permission to access this page.';
        break;
      case '404':
        this.errorTitle = 'Page Not Found';
        this.errorMessage = 'The page you are looking for does not exist.';
        break;
      case '500':
        this.errorTitle = 'Server Error';
        this.errorMessage =
          'An internal server error occurred. Please try again later.';
        break;
      default:
        this.errorTitle = 'Error';
        this.errorMessage = 'An unexpected error occurred.';
    }
  }

  goBack(): void {
    window.history.back();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
