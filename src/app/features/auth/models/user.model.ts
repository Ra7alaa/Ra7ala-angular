/**
 * User role types in the system
 */
export enum UserRole {
  SystemOwner = 0,
  SuperAdmin = 1,
  Admin = 2,
  Driver = 3,
  Passenger = 4,
}

/**
 * Basic user data interface
 */
export interface User {
  id: string;
  email?: string;
  username: string;
  fullName?: string;
  token: string;
  userType: UserRole;
  profilePictureUrl?: string;
  phoneNumber?: string;
  // Adding role flag properties to fix errors in app.routes.ts
  isSystemOwner?: boolean;
  isSuperAdmin?: boolean;
  isCompanyAdmin?: boolean;
  isDriver?: boolean;
  isPassenger?: boolean;
  // Adding properties needed for UserProfileComponent
  address?: string;
  dateOfBirth?: string;
  // Adding companyId for StationsService
  companyId?: number;
  companyName?: string;
  // Adding department for admin users
  department?: string;
}

/**
 * Login request interface
 */
export interface LoginRequest {
  emailOrUsername: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  statusCode: number;
  message: string;
  data: {
    id: string;
    email: string;
    username: string;
    fullName: string;
    userType: UserRole;
    token: string;
  };
}

/**
 * Passenger registration request interface
 */
export interface PassengerRegisterRequest {
  email: string;
  username: string;
  password: string;
  fullName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  address?: string;
  dateOfBirth?: string;
}
