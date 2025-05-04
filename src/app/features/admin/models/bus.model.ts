/**
 * Interface for a Bus entity
 */
export interface Bus {
  id?: number;
  registrationNumber: string;
  model: string;
  capacity: number;
  amenityDescription: string;
  isActive: boolean;
  companyId: number;
  companyName?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Interface for creating a new Bus - Backend expects PascalCase field names
 */
export interface BusCreateRequest {
  RegistrationNumber: string;
  Model: string;
  Capacity: number;
  AmenityDescription: string;
  IsActive: boolean;
  CompanyId: number;
}

/**
 * Interface for updating an existing Bus
 */
export interface BusUpdateRequest {
  id: number;
  registrationNumber?: string;
  model?: string;
  capacity?: number;
  amenityDescription?: string;
  isActive?: boolean;
}

/**
 * Interface for bus response from API
 */
export interface BusesResponse {
  statusCode: number;
  message: string;
  data: Bus[];
}

/**
 * Interface for single bus response from API
 */
export interface BusResponse {
  statusCode: number;
  message: string;
  data: Bus;
}
