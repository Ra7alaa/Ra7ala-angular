export interface TripStation {
  stationId: number;
  stationName: string;
  cityId: number;
  cityName: string;
  sequenceNumber: number;
  arrivalTime: string | null;
  departureTime: string | null;
}

export interface Trip {
  id: number;
  routeId: number;
  routeName: string;
  departureTime: string;
  arrivalTime: string;
  driverId: string;
  driverName: string;
  driverPhoneNumber: string;
  busId: number;
  busRegistrationNumber: string;
  isCompleted: boolean;
  availableSeats: number;
  companyId: number;
  companyName: string;
  price: number;
  tripStations: TripStation[];
}

export interface TripCreateRequest {
  routeId: number;
  departureTime: string;
  arrivalTime: string;
  driverId: string;
  busId: number;
  availableSeats: number;
  price: number;
}

export interface TripUpdateRequest {
  id: number;
  routeId?: number;
  departureTime?: string;
  arrivalTime?: string;
  driverId?: string;
  busId?: number;
  isCompleted?: boolean;
  availableSeats?: number;
  price?: number;
}

export interface TripsData {
  totalCount: number;
  pageSize: number;
  currentPage: number;
  totalPages: number;
  trips: Trip[];
}

export interface PaginatedTripsResponse {
  statusCode: number;
  message: string;
  data: TripsData;
}
