import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth.service';
import { UserRole } from '../../../features/auth/models/user.model';

@Component({
  selector: 'app-error-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './error-page.component.html',
  styleUrls: ['./error-page.component.css'],
})
export class ErrorPageComponent implements OnInit {
  @Input() errorCode = '404';
  @Input() errorTitle = 'Page Not Found';
  @Input() errorMessage = 'The page you are looking for does not exist.';
  @Input() showHomeButton = true;
  @Input() showBackButton = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check for custom message in router state
    const navigation = this.router.getCurrentNavigation();
    if (navigation && navigation.extras.state) {
      const state = navigation.extras.state as { message?: string };
      if (state.message) {
        this.errorMessage = state.message;
      }
    }

    // Get error data from route data if available
    this.route.data.subscribe((data) => {
      if (data['errorCode']) this.errorCode = data['errorCode'];
      if (data['errorTitle']) this.errorTitle = data['errorTitle'];
      if (data['errorMessage'] && !this.errorMessage)
        this.errorMessage = data['errorMessage'];
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
    // Check if there's a previous page to go back to
    if (window.history.length > 1) {
      window.history.back();
    } else {
      // If there's no previous page, redirect to appropriate home page based on role
      this.goHome();
    }
  }

  goHome(): void {
    const currentUser = this.authService.getCurrentUser();

    if (currentUser) {
      // Redirect based on user role
      switch (currentUser.userType) {
        case UserRole.SystemOwner:
          this.router.navigate(['/owner/dashboard']);
          break;
        case UserRole.SuperAdmin:
        case UserRole.Admin:
          this.router.navigate(['/admin/dashboard']);
          break;
        case UserRole.Driver:
          this.router.navigate(['/driver/dashboard']);
          break;
        case UserRole.Passenger:
          this.router.navigate(['/']);
          break;
        default:
          this.router.navigate(['/']);
          break;
      }
    } else {
      // If no user is logged in, navigate to the main page
      this.router.navigate(['/']);
    }
  }
}
