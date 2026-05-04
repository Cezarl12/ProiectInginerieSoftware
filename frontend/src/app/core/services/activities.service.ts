import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { Activity, CreateActivityDto, UpdateActivityDto, ActivityFilter } from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class ActivitiesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/activities`;

  getAll(filter?: ActivityFilter) {
    let params = new HttpParams();
    if (filter?.sport) params = params.set('sport', filter.sport);
    if (filter?.type != null) params = params.set('type', filter.type);
    if (filter?.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter?.toDate) params = params.set('toDate', filter.toDate);
    if (filter?.locationId) params = params.set('locationId', filter.locationId);
    return this.http.get<Activity[]>(this.base, { params });
  }

  getById(id: number) {
    return this.http.get<Activity>(`${this.base}/${id}`);
  }

  create(dto: CreateActivityDto) {
    return this.http.post<Activity>(this.base, dto);
  }

  update(id: number, dto: UpdateActivityDto) {
    return this.http.put<Activity>(`${this.base}/${id}`, dto);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
