export enum UserRole {
  SystemOwner = "Owner",
  SuperAdmin = "SuperAdmin",
  Admin = "Admin",
  Driver = "Driver",
  Passenger = "Passenger",
  // SystemOwner = 0,
  // SuperAdmin = 1,
  // AdminVal = 2,
  // Driver = 3,
  // Passenger = 4,
}

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  userType: UserRole;
  token: string;
  // profile fields
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  companyId?: number;
  companyName?: string;
  profilePictureUrl?: string;
}
