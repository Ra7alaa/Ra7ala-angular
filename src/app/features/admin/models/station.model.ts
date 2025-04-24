export interface Station {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  cityName: string;
  isSystemOwned: boolean;
  companyId?: number; // 0 means system-owned station
  companyName?: string; // Company name if the station is owned by a company
}

export interface StationCreateRequest {
  name: string;
  latitude: number;
  longitude: number;
  cityName: string;
  isSystemOwned: boolean;
  companyId?: number; // 0 means system-owned station
  companyName?: string;
}

export interface StationUpdateRequest {
  id: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  cityName?: string;
  isSystemOwned?: boolean;
  companyId?: number; // 0 means system-owned station
  companyName?: string;
}
