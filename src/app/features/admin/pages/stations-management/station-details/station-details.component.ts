import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StationsService } from '../../../services/stations.service';
import { Station } from '../../../models/station.model';
import { AuthService } from '../../../../auth/services/auth.service';
import { User, UserRole } from '../../../../auth/models/user.model';
import { MapService } from '../../../../../shared/services/map.service';

@Component({
  selector: 'app-station-details',
  templateUrl: './station-details.component.html',
  styleUrls: ['./station-details.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class StationDetailsComponent implements OnInit {
  stationId!: number;
  station: Station | null = null;
  loading = true;
  error: string | null = null;
  currentUser: User | null = null;
  mapLoaded = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stationsService: StationsService,
    private authService: AuthService,
    private mapService: MapService
  ) {}

  ngOnInit(): void {
    this.stationId = +this.route.snapshot.paramMap.get('id')!;
    this.currentUser = this.authService.getCurrentUser();
    this.loadStationDetails();
    this.loadGoogleMaps();
  }

  loadGoogleMaps(): void {
    // استخدام خدمة الخريطة لتحميل Google Maps API
    this.mapService.loadGoogleMapsApi().subscribe((loaded) => {
      this.mapLoaded = loaded;
      if (loaded && this.station) {
        setTimeout(() => this.initMap(), 100);
      }
    });
  }

  initMap(): void {
    if (!this.station || !this.mapLoaded) {
      return;
    }

    // استخدام خدمة الخريطة لإنشاء خريطة
    try {
      const latitude =
        typeof this.station.latitude === 'string'
          ? parseFloat(this.station.latitude)
          : this.station.latitude;
      const longitude =
        typeof this.station.longitude === 'string'
          ? parseFloat(this.station.longitude)
          : this.station.longitude;

      if (isNaN(latitude) || isNaN(longitude)) {
        console.error(
          'إحداثيات غير صالحة',
          this.station.latitude,
          this.station.longitude
        );
        return;
      }

      this.mapService.createMap(
        'station-map',
        latitude,
        longitude,
        15,
        this.station.name
      );
    } catch (error) {
      console.error('خطأ في تهيئة الخريطة:', error);
    }
  }

  loadStationDetails(): void {
    this.loading = true;
    this.error = null;

    this.stationsService.getStationById(this.stationId).subscribe({
      next: (station) => {
        this.station = station;
        this.loading = false;

        // عند تحميل بيانات المحطة، قم بتهيئة الخريطة إذا كانت API محملة
        if (this.mapLoaded) {
          setTimeout(() => this.initMap(), 100);
        }
      },
      error: (err) => {
        this.error = 'Failed to load station details: ' + err.message;
        this.loading = false;
      },
    });
  }

  // Check if current user can edit the station
  canEditStation(): boolean {
    if (!this.currentUser || !this.station) return false;

    // System owners can edit any station
    if (this.currentUser.role === UserRole.SystemOwner) {
      return true;
    }

    // Company admins can only edit their own company's stations
    if (this.currentUser.role === UserRole.CompanyAdmin) {
      // Can't edit system stations
      if (this.station.isSystemOwned) {
        return false;
      }

      // Can only edit stations belonging to their company
      return this.station.companyId === this.currentUser.companyId;
    }

    return false;
  }

  // Check if current user can delete the station
  canDeleteStation(): boolean {
    if (!this.currentUser || !this.station) return false;

    // System owners can delete any station
    if (this.currentUser.role === UserRole.SystemOwner) {
      return true;
    }

    // Company admins can only delete their own company's stations
    if (this.currentUser.role === UserRole.CompanyAdmin) {
      // Can't delete system stations
      if (this.station.isSystemOwned) {
        return false;
      }

      // Can only delete stations belonging to their company
      return this.station.companyId === this.currentUser.companyId;
    }

    return false;
  }

  navigateToEdit(): void {
    if (!this.canEditStation()) {
      alert('You do not have permission to edit this station.');
      return;
    }
    this.router.navigate(['/admin/stations', this.stationId, 'edit']);
  }

  navigateToList(): void {
    this.router.navigate(['/admin/stations']);
  }

  deleteStation(): void {
    if (!this.canDeleteStation()) {
      alert('You do not have permission to delete this station.');
      return;
    }

    if (confirm('Are you sure you want to delete this station?')) {
      this.loading = true;
      this.stationsService.deleteStation(this.stationId).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/admin/stations']);
        },
        error: (err) => {
          this.error = 'Failed to delete station: ' + err.message;
          this.loading = false;
        },
      });
    }
  }
}
