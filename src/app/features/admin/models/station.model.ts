export interface Station {
  id?: number;
  name: string;
  latitude: number;
  longitude: number;
  cityName: string;
  cityId?: number;
  isSystemOwned?: boolean;
  companyId?: number;
  companyName?: string;
}

export interface StationCreateRequest {
  name: string;
  latitude: number;
  longitude: number;
  cityId: number;
  cityName: string;
  companyId?: number;
  companyName?: string;
}

export interface StationUpdateRequest {
  id: number;
  name?: string;
  latitude?: number;
  longitude?: number;
  cityName: string;
  cityId?: number;
  isSystemOwned?: boolean;
  companyId?: number;
  companyName?: string;
}
