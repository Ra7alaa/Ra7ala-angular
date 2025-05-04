export interface Driver {
  id: string;
  fullName: string; // Changed from 'name' to 'fullName' to match API response
  phoneNumber: string;
  email?: string;
  isAvailable?: boolean;
  profilePictureUrl?: string | null;
  dateOfBirth?: string;
  address?: string;
  dateCreated?: string;
  lastLogin?: string | null;
  companyId?: number;
  companyName?: string;
  licenseNumber?: string;
  driverStatus?: number;
  userType?: string;
}

export interface DriversResponse {
  statusCode: number;
  message: string;
  data: Driver[];
}

export interface DriverResponse {
  statusCode: number;
  message: string;
  data: Driver;
}

export interface PaginatedDriversResponse {
  statusCode: number;
  message: string;
  data: {
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    drivers: Driver[];
  };
}
