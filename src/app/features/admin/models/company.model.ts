/**
 * Company model
 */
export interface Company {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  logoUrl?: string;
  taxDocumentUrl?: string; // Added field for tax document URL
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Company creation request model
 */
export interface CompanyCreateRequest {
  Name: string;
  Description: string;
  Address: string;
  Phone: string;
  Email: string;
  Website?: string;
  SuperAdminName: string;
  SuperAdminEmail: string;
  SuperAdminPhone: string;
  Logo?: File;
  TaxDocument?: File; // Added field for tax document file
}
