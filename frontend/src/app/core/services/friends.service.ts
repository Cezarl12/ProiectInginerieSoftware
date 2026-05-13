import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { User } from '../models/user.model';
import type { PagedResult } from '../models/location.model';
import type { Activity } from '../models/activity.model';

@Injectable({ providedIn: 'root' })
export class FriendsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/friends`;

  getMyFollowing(page = 1, pageSize = 50) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<User>>(this.base, { params });
  }

  getFollowers(userId: number, page = 1, pageSize = 50) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<User>>(`${environment.apiUrl}/users/${userId}/followers`, { params });
  }

  getFollowing(userId: number, page = 1, pageSize = 50) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<User>>(`${environment.apiUrl}/users/${userId}/following`, { params });
  }

  isFollowing(userId: number) {
    return this.http.get<{ isFollowing: boolean }>(`${this.base}/${userId}/is-following`);
  }

  follow(userId: number) {
    return this.http.post<void>(`${this.base}/${userId}`, {});
  }

  unfollow(userId: number) {
    return this.http.delete<void>(`${this.base}/${userId}`);
  }

  getUserActivities(userId: number) {
    return this.http.get<Activity[]>(`${this.base}/${userId}/activities`);
  }
}
