export interface PaginatedResponse {
  data: any[];
  total: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
}