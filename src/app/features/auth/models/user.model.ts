export enum UserRole {
  SystemOwner = 'SYSTEM_OWNER',
  CompanyAdmin = 'COMPANY_ADMIN',
  Customer = 'CUSTOMER',
}

export interface User {
  id?: number;
  name?: string;
  email: string;
  token?: string;
  role?: UserRole;
  companyId?: number; // For company admins, references their company
  companyName?: string; // Company name for company admins
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
