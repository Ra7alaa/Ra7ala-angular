/**
 * Enum representing the different user types in the system
 */
export enum UserRole {
  SystemOwner = 'SystemOwner', // Owner of the entire system - can manage companies and create SuperAdmins
  SuperAdmin = 'SuperAdmin', // Company-level administrator - can manage company's admins
  Admin = 'Admin', // Company administrator - can manage company's resources
  Driver = 'Driver', // Driver for a company
  Passenger = 'Passenger', // Regular user/passenger
}

/**
 * Interface for basic user profile information common to all user types
 */
export interface UserProfile {
  id?: number;
  fullName?: string;
  email?: string;
  username?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  address?: string;
  dateOfBirth?: Date | string;
  dateCreated?: Date | string;
}

/**
 * Interface for authentication response from the API
 */
export interface AuthResponse {
  id: number;
  email?: string;
  token: string;
  userType: UserRole;
  fullName?: string;
  username?: string;
  companyId?: number;
  companyName?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
}

/**
 * Interface for login request
 */
export interface LoginRequest {
  emailOrUsername: string;
  password: string;
}

/**
 * Interface for passenger registration request
 */
export interface PassengerRegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName: string;
  profilePictureUrl?: string;
  address?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
}

/**
 * Interface for driver registration/creation request
 * (Used by company SuperAdmin)
 */
export interface DriverRegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  contactAddress: string;
  profilePictureUrl?: string;
  dateOfBirth?: string;
  phoneNumber?: string;
  companyId: number;
}

/**
 * Interface for admin/superadmin registration/creation request
 * (Used by SystemOwner or SuperAdmin)
 */
export interface AdminRegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName: string;
  userType: UserRole.Admin | UserRole.SuperAdmin;
  companyId: number;
  profilePictureUrl?: string;
  phoneNumber?: string;
}

/**
 * Interface for company creation request
 * (Used by SystemOwner)
 */
export interface CompanyCreateRequest {
  Name: string;
  Description: string;
  LogoUrl?: string;
  Address: string;
  Phone: string;
  Email: string;
  Website?: string;
  SuperAdminName: string;
  SuperAdminEmail: string;
  SuperAdminPhone: string;
}

/**
 * Interface for a Company entity
 */
export interface Company {
  id: number;
  name: string;
  description?: string;
  logoUrl?: string;
  address?: string;
  phoneNumber?: string;
  email?: string;
  dateCreated?: Date | string;
  superAdminId?: number;
}

/**
 * Interface for the complete user model
 * Including all possible properties for all user types
 */
export interface User extends UserProfile {
  token?: string;
  userType?: UserRole;
  companyId?: number;
  companyName?: string;

  // Driver specific properties
  licenseNumber?: string;
  licenseExpiryDate?: string;
  contactAddress?: string;
  driverStatus?: number; // 0 = inactive, 1 = active, etc.

  // Admin specific properties
  isActive?: boolean;

  // For display or permission checking
  isSystemOwner?: boolean;
  isSuperAdmin?: boolean;
  isCompanyAdmin?: boolean;
  isDriver?: boolean;
  isPassenger?: boolean;
}
