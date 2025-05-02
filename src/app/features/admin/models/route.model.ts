/**
 * Interface for a Route Station entity
 */
export interface RouteStation {
  stationId: number;
  stationName: string;
  cityId: number;
  cityName: string;
  sequenceNumber: number;
}

/**
 * Interface for a city station with sequence number (used in API requests)
 */
export interface CityStationSequence {
  stationId: number;
  sequenceNumber: number;
}

/**
 * Interface for a Route entity
 */
export interface Route {
  id?: number;
  name?: string;
  startCityId: number;
  startCityName: string;
  endCityId: number;
  endCityName: string;
  distance: number; // in kilometers
  estimatedDuration?: number;
  durationHours?: number; // For form compatibility
  durationMinutes?: number; // For form compatibility
  isActive: boolean;
  companyId: number;
  companyName?: string;
  routeStations?: RouteStation[];
  startCityStationIds?: CityStationSequence[];
  endCityStationIds?: CityStationSequence[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface for creating a new Route
 */
export interface RouteCreateRequest {
  name?: string;
  startCityId: number;
  startCityName?: string;
  endCityId: number;
  endCityName?: string;
  distance: number;
  durationHours?: number;
  durationMinutes?: number;
  estimatedDuration?: number;
  isActive: boolean;
  companyId: number;
  startCityStationIds?: number[] | CityStationSequence[];
  endCityStationIds?: number[] | CityStationSequence[];
}

/**
 * Interface for updating an existing Route
 */
export interface RouteUpdateRequest {
  id: number;
  name?: string;
  startCityId?: number;
  startCityName?: string;
  endCityId?: number;
  endCityName?: string;
  distance?: number;
  durationHours?: number;
  durationMinutes?: number;
  isActive?: boolean;
  startCityStationIds?: number[] | CityStationSequence[];
  endCityStationIds?: number[] | CityStationSequence[];
}

/**
 * Interface for route response from API
 */
export interface RoutesResponse {
  statusCode: number;
  message: string;
  data: Route[];
}

/**
 * Interface for single route response from API
 */
export interface RouteResponse {
  statusCode: number;
  message: string;
  data: Route;
}

/**
 * Interface for the nested routes data structure returned by the API
 */
export interface RoutesData {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  routes: Route[];
}

/**
 * Interface for paginated route response from API
 */
export interface PaginatedRoutesResponse {
  statusCode: number;
  message: string;
  data: RoutesData;
  totalCount?: number;
  pageSize?: number;
  currentPage?: number;
  totalPages?: number;
}
