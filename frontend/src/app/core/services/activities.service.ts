import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { Activity, CreateActivityDto, UpdateActivityDto, ActivityFilter } from '../models/activity.model';
import type { User } from '../models/user.model';
import type { PagedResult } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class ActivitiesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/activities`;

  getAll(filter?: ActivityFilter, page = 1, pageSize = 50) {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (filter?.sport) params = params.set('sport', filter.sport);
    if (filter?.type != null) params = params.set('type', filter.type);
    if (filter?.fromDate) params = params.set('fromDate', filter.fromDate);
    if (filter?.toDate) params = params.set('toDate', filter.toDate);
    if (filter?.locationId) params = params.set('locationId', filter.locationId);
    return this.http.get<PagedResult<Activity>>(this.base, { params });
  }

  getJoined() {
    return this.http.get<Activity[]>(`${this.base}/me/joined`);
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

  getParticipants(activityId: number, page = 1, pageSize = 100) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<User>>(`${this.base}/${activityId}/participants`, { params });
  }
}
