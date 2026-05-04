export interface Location {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  sports: string;
  surface?: string | null;
  hasLights: boolean;
  mainPhotoUrl?: string | null;
  secondaryPhotoUrls: string[];
  details?: string | null;
  status: string;
  proposedByUserId?: number | null;
  proposedByUsername?: string | null;
  createdAt: string;
  distanceKm?: number | null;
}

export interface CreateLocationDto {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  sports: string;
  surface?: string | null;
  hasLights: boolean;
  mainPhotoUrl?: string | null;
  secondaryPhotoUrls?: string[];
  details?: string | null;
}

export interface UpdateLocationDto {
  name?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  sports?: string | null;
  surface?: string | null;
  hasLights?: boolean | null;
  mainPhotoUrl?: string | null;
  secondaryPhotoUrls?: string[] | null;
  details?: string | null;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
