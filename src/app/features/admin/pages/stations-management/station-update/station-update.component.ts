import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StationsService } from '../../../services/stations.service';
import { Station } from '../../../models/station.model';

@Component({
  selector: 'app-station-update',
  templateUrl: './station-update.component.html',
  styleUrls: ['./station-update.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
})
export class StationUpdateComponent implements OnInit {
  stationId!: number;
  stationForm: FormGroup;
  loading = true;
  error: string | null = null;
  isSystemOwned = true;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private stationsService: StationsService
  ) {
    this.stationForm = this.createForm();
  }

  ngOnInit(): void {
    this.stationId = +this.route.snapshot.paramMap.get('id')!;
    this.loadStationData();
  }

  createForm(): FormGroup {
    const form = this.fb.group({
      id: [null],
      name: ['', [Validators.required]],
      latitude: [0, [Validators.required]],
      longitude: [0, [Validators.required]],
      cityName: ['', [Validators.required]],
      isSystemOwned: [true],
      companyId: [0],
      companyName: [''],
    });

    // Subscribe to changes in isSystemOwned to update companyId
    form.get('isSystemOwned')?.valueChanges.subscribe((isSystemOwned) => {
      // Cast to boolean to ensure we don't have null assignment issues
      this.isSystemOwned = !!isSystemOwned;
      if (isSystemOwned) {
        form.get('companyId')?.setValue(0);
        form.get('companyName')?.setValue('');
      } else if (form.get('companyId')?.value === 0) {
        form.get('companyId')?.setValue(null);
      }
    });

    return form;
  }

  loadStationData(): void {
    this.loading = true;
    this.error = null;

    this.stationsService.getStationById(this.stationId).subscribe({
      next: (station) => {
        // التحقق من أن المحطة ليست محطة نظام (companyId ليس null)
        if (station.companyId === null) {
          this.error = 'You do not have permission to edit this station.';
          this.loading = false;
          return;
        }

        this.updateFormWithStationData(station);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load station: ' + err.message;
        this.loading = false;
      },
    });
  }

  updateFormWithStationData(station: Station): void {
    this.stationForm.patchValue({
      id: station.id,
      name: station.name,
      latitude: station.latitude,
      longitude: station.longitude,
      cityName: station.cityName,
      isSystemOwned: station.isSystemOwned,
      companyId: station.companyId,
      companyName: station.companyName,
    });

    this.isSystemOwned = !!station.isSystemOwned;
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

    const stationData: Station = this.stationForm.value;

    // Ensure companyId is set to 0 for system-owned stations
    if (stationData.isSystemOwned) {
      stationData.companyId = 0;
      stationData.companyName = undefined;
    }

    this.stationsService.updateStation(stationData).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/admin/stations', this.stationId]);
      },
      error: (err) => {
        this.error = 'Failed to update station: ' + err.message;
        this.loading = false;
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/admin/stations', this.stationId]);
  }
}
