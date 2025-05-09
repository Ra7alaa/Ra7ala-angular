export interface Driver {
  id: string;
  fullName: string;
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

// Updated interface for driver registration request
export interface DriverRegistrationRequest {
  FullName: string;
  Email: string;
  PhoneNumber: string;
  LicenseNumber: string;
  LicenseExpiryDate: string;
  ContactAddress: string;
  HireDate: string;
  DateOfBirth?: string | null;
  CompanyId: number;
  UserType: string;
  ProfilePicture?: File | null;
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
