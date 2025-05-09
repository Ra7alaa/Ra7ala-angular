export enum CompanyStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface CompanyStatistics {
  totalAdmins: number;
  totalDrivers: number;
  totalBuses: number;
  totalRoutes: number;
  totalFeedbacks: number;
}

export interface CompanySuperAdmin {
  id: string;
  fullName: string;
  email: string;
  phone: string;
}

export interface Company {
  id: number;
  name: string;
  logoUrl: string;
  status: CompanyStatus;
  averageRating: number;
  totalRatings: number;
  email: string;
  phone: string;
  address: string;
  createdDate: Date;
  approvedDate?: Date;
  description: string;
  superAdmin?: CompanySuperAdmin;
  statistics?: CompanyStatistics;
  taxDocumentUrl?: string;
  rejectionReason?: string;
}

export interface CompanyResponse {
  companies: Company[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}
