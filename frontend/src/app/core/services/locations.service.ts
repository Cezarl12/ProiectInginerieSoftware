import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { Location, CreateLocationDto, UpdateLocationDto, PagedResult } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class LocationsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/locations`;

  getAll(page = 1, pageSize = 20) {
    // status=1 → Approved only (Pending/Rejected are never shown publicly)
    const params = new HttpParams().set('page', page).set('pageSize', pageSize).set('status', 1);
    return this.http.get<PagedResult<Location>>(this.base, { params });
  }

  getNearby(lat: number, lng: number, radiusKm = 5) {
    const params = new HttpParams()
      .set('lat', lat)
      .set('lng', lng)
      .set('radiusKm', radiusKm);
    return this.http.get<Location[]>(`${this.base}/nearby`, { params });
  }

  getById(id: number) {
    return this.http.get<Location>(`${this.base}/${id}`);
  }

  create(dto: CreateLocationDto) {
    return this.http.post<Location>(this.base, dto);
  }

  update(id: number, dto: UpdateLocationDto) {
    return this.http.put<Location>(`${this.base}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getPending(page = 1, pageSize = 20) {
    const params = new HttpParams().set('status', 0).set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<Location>>(this.base, { params });
  }

  approve(id: number) {
    return this.http.post<Location>(`${this.base}/${id}/approve`, {});
  }

  reject(id: number) {
    return this.http.post<Location>(`${this.base}/${id}/reject`, {});
  }
}
