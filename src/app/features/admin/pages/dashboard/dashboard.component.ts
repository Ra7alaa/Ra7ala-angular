import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Language,
  LanguageService,
} from '../../../../core/localization/language.service';
import { TranslatePipe } from '../../../settings/pipes/translate.pipe';
import { Subscription, forkJoin, of, Observable } from 'rxjs';
import { BusesService } from '../../services/buses.service';
import { RoutesService } from '../../services/routes.service';
import { StationsService } from '../../services/stations.service';
import { TripsService } from '../../services/trips.service';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/models/user.model';
import { PaginatedRoutesResponse } from '../../models/route.model';
import { Station } from '../../models/station.model';
import { Trip, PaginatedTripsResponse } from '../../models/trip.model';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

// Interfaz MockTrip para los datos estáticos de muestra que tienen una estructura diferente
interface MockTrip {
  id: number;
  routeName: string;
  departureTime: string;
  price: number;
  status?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit, OnDestroy {
  currentLanguage!: Language;
  private subscriptions: Subscription[] = [];
  currentUser: User | null = null;

  // Statistics properties
  activeRoutes = 0;
  totalStations = 0;
  totalRevenue = '$12,865';

  // Trip data
  totalTrips = 4; // Static count
  recentTrips: Trip[] = [];

  // Datos de muestra para usar en caso de error o cuando no hay datos reales
  mockTrips: MockTrip[] = [
    {
      id: 1,
      routeName: 'Cairo Adventure',
      departureTime: '2025-05-15T09:00:00',
      price: 150,
      status: 'upcoming',
    },
    {
      id: 2,
      routeName: 'Alexandria Beach Trip',
      departureTime: '2025-05-18T08:30:00',
      price: 120,
      status: 'upcoming',
    },
    {
      id: 3,
      routeName: 'Luxor Heritage Tour',
      departureTime: '2025-05-20T07:00:00',
      price: 180,
      status: 'upcoming',
    },
  ];

  // Placeholder percentages - replace with actual logic if needed
  tripsChangePercent = 5.27;
  routesChangePercent = 3.12;
  stationsChangePercent = -0.82;
  revenueChangePercent = 8.34;

  constructor(
    public languageService: LanguageService,
    private busesService: BusesService,
    private routesService: RoutesService,
    private stationsService: StationsService,
    private tripsService: TripsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.languageService.language$.subscribe((language) => {
        this.currentLanguage = language;
      })
    );

    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      console.log('Current User for Dashboard:', this.currentUser);
      this.loadDashboardData();
    } else {
      console.error('User not logged in, cannot load dashboard data.');
    }
  }

  loadDashboardData(): void {
    if (!this.currentUser) return;

    const companyId = this.currentUser.companyId;

    let routesObservable: Observable<PaginatedRoutesResponse>;
    let tripsObservable: Observable<PaginatedTripsResponse>;

    // Inicializar las peticiones basadas en la existencia del companyId
    if (companyId) {
      routesObservable = this.routesService.getRoutesByCompanyId(
        companyId,
        1,
        1
      );
      tripsObservable = this.tripsService.getTripsByCompanyId(companyId, 1, 3); // Obtener los 3 viajes más recientes
    } else {
      routesObservable = of({
        statusCode: 200,
        message: 'No company ID associated with user.',
        data: { totalCount: 0, pageNumber: 1, pageSize: 1, routes: [] },
      });
      tripsObservable = this.tripsService.getAllTrips(1, 3); // Obtener los 3 viajes más recientes para el administrador general
    }

    // Modificado para filtrar estaciones con companyId no nulo
    const stationsObservable: Observable<number> = this.stationsService
      .getAllStations()
      .pipe(
        map((stations: Station[]) => {
          const stationsWithCompanyId = stations.filter(
            (station) => station.companyId !== null
          );
          return stationsWithCompanyId.length;
        })
      );

    const data$ = forkJoin({
      routesData: routesObservable,
      totalNonNullStations: stationsObservable,
      tripsData: tripsObservable.pipe(
        catchError((error) => {
          console.error('Error loading trips:', error);
          return of({
            statusCode: 500,
            message: 'Failed to load trips',
            data: { trips: [], totalCount: 0 },
          });
        })
      ),
    });

    this.subscriptions.push(
      data$.subscribe(
        ({ routesData, totalNonNullStations, tripsData }) => {
          // Actualizar rutas y estaciones
          this.activeRoutes =
            routesData && routesData.data ? routesData.data.totalCount : 0;
          this.totalStations = totalNonNullStations || 0;

          // Actualizar datos de viajes
          if (tripsData && tripsData.data && tripsData.data.trips) {
            this.recentTrips = tripsData.data.trips.slice(0, 3);
            this.totalTrips = tripsData.data.totalCount || 0;
            console.log('Recent trips loaded from API:', this.recentTrips);
          } else {
            console.warn('No trip data returned from API, using defaults');
            // Convertir los datos mock a formato Trip para mantener la estructura
            this.createMockTripsIfNeeded();
          }
        },
        (error) => {
          console.error('Error loading dashboard data:', error);
          this.activeRoutes = 0;
          this.totalStations = 0;
          // Usar datos de muestra en caso de error
          this.createMockTripsIfNeeded();
        }
      )
    );
  }

  // Crear objetos Trip a partir de los datos de muestra
  createMockTripsIfNeeded(): void {
    // Comprobar si ya tenemos datos
    if (this.recentTrips.length === 0) {
      // Convertir mockTrips a formato Trip
      this.mockTrips.forEach((mockTrip) => {
        const trip: Trip = {
          id: mockTrip.id,
          routeId: mockTrip.id,
          routeName: mockTrip.routeName,
          departureTime: mockTrip.departureTime,
          arrivalTime: '',
          driverId: '1',
          driverName: 'Sample Driver',
          driverPhoneNumber: '123-456-7890',
          busId: 1,
          busRegistrationNumber: 'BUS-001',
          isCompleted: false,
          availableSeats: 40,
          companyId: 1,
          companyName: 'Sample Company',
          price: mockTrip.price,
          tripStations: [],
        };
        this.recentTrips.push(trip);
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  isPositive(change: number): boolean {
    return change >= 0;
  }

  // Helper methods for trip status display
  getTripStatusBadge(trip: Trip): string {
    const today = new Date();
    const departureDate = new Date(trip.departureTime);

    if (trip.isCompleted) {
      return 'bg-secondary status-badge completed';
    } else if (
      departureDate.getTime() - today.getTime() <
      24 * 60 * 60 * 1000
    ) {
      return 'bg-success status-badge in-progress';
    } else {
      return 'bg-primary status-badge upcoming';
    }
  }

  getTripStatusText(trip: Trip): string {
    const today = new Date();
    const departureDate = new Date(trip.departureTime);

    if (trip.isCompleted) {
      return 'admin.dashboard.completed';
    } else if (
      departureDate.getTime() - today.getTime() <
      24 * 60 * 60 * 1000
    ) {
      return 'admin.dashboard.in_progress';
    } else {
      return 'admin.dashboard.upcoming';
    }
  }

  // Método para navegar a otras páginas
  navigateTo(route: string): void {
    this.router.navigateByUrl(route);
  }
}
