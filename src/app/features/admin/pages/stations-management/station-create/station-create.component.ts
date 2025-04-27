import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { StationsService } from '../../../services/stations.service';
import { StationCreateRequest } from '../../../models/station.model';
import { AuthService } from '../../../../auth/services/auth.service';
import { User, UserRole } from '../../../../auth/models/user.model';
import { TranslatePipe } from '../../../../../features/settings/pipes/translate.pipe';
import { TranslationService } from '../../../../../core/localization/translation.service';

@Component({
  selector: 'app-station-create',
  templateUrl: './station-create.component.html',
  styleUrls: ['./station-create.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TranslatePipe,
  ],
})
export class StationCreateComponent implements OnInit {
  stationForm: FormGroup;
  loading = false;
  error: string | null = null;
  isSystemOwned = true;
  currentUser: User | null = null;

  // Expose UserRole enum to the template
  UserRole = UserRole;

  // Flag to know if user can create system-owned stations
  canCreateSystemStations = false;

  constructor(
    private fb: FormBuilder,
    private stationsService: StationsService,
    private authService: AuthService,
    private router: Router,
    private translateService: TranslationService
  ) {
    this.stationForm = this.fb.group({
      name: ['', [Validators.required]],
      latitude: [0, [Validators.required]],
      longitude: [0, [Validators.required]],
      cityName: ['', [Validators.required]],
      isSystemOwned: [true],
      companyId: [0],
      companyName: [''],
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();

    // Check if user has permission to create system stations
    this.canCreateSystemStations =
      this.currentUser?.userType === UserRole.SystemOwner ||
      this.currentUser?.userType === UserRole.SuperAdmin;

    // If user is a company admin, set default values for company stations
    if (this.currentUser?.userType === UserRole.Admin) {
      this.isSystemOwned = false;
      this.stationForm.get('isSystemOwned')?.setValue(false);
      this.stationForm.get('isSystemOwned')?.disable(); // Disable the field
      this.stationForm.get('companyId')?.setValue(this.currentUser.companyId);

      // Set company name from the user profile if available
      if (this.currentUser.companyName) {
        this.stationForm
          .get('companyName')
          ?.setValue(this.currentUser.companyName);
        this.stationForm.get('companyName')?.disable(); // Make it read-only for company admins
      }
    }

    // Subscribe to changes in isSystemOwned to update companyId
    this.stationForm
      .get('isSystemOwned')
      ?.valueChanges.subscribe((isSystemOwned) => {
        this.isSystemOwned = isSystemOwned;
        if (isSystemOwned) {
          this.stationForm.get('companyId')?.setValue(0);
          this.stationForm.get('companyName')?.setValue('');
        } else if (this.currentUser?.userType === UserRole.Admin) {
          // For company admin, set their company ID and name
          this.stationForm
            .get('companyId')
            ?.setValue(this.currentUser.companyId);
          if (this.currentUser.companyName) {
            this.stationForm
              .get('companyName')
              ?.setValue(this.currentUser.companyName);
          }
        } else {
          this.stationForm.get('companyId')?.setValue(null);
        }
      });
  }

  onSubmit(): void {
    if (this.stationForm.invalid) {
      // Mark all fields as touched to trigger validation errors
      Object.keys(this.stationForm.controls).forEach((key) => {
        this.stationForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.loading = true;
    this.error = null;

    // Create a copy of the form value to handle disabled controls
    const formValue = { ...this.stationForm.getRawValue() };
    const stationData: StationCreateRequest = formValue;

    // For company admins, ensure station is assigned to their company
    if (this.currentUser?.userType === UserRole.Admin) {
      stationData.isSystemOwned = false;
      stationData.companyId = this.currentUser.companyId;
    } else {
      // Ensure companyId is set to 0 for system-owned stations
      if (stationData.isSystemOwned) {
        stationData.companyId = 0;
        stationData.companyName = undefined;
      }
    }

    this.stationsService.createStation(stationData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/stations']);
      },
      error: (err) => {
        this.error =
          this.translateService.translate(
            'admin.stations.create_station.error'
          ) +
          ': ' +
          err.message;
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/stations']);
  }
}
