import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { User, UpdateUserDto } from '../models/user.model';
import type { PagedResult } from '../models/location.model';

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  getMe() {
    return this.http.get<User>(`${this.base}/me`);
  }

  getById(id: number) {
    return this.http.get<User>(`${this.base}/${id}`);
  }

  getAll(page = 1, pageSize = 20) {
    const params = new HttpParams().set('page', page).set('pageSize', pageSize);
    return this.http.get<PagedResult<User>>(this.base, { params });
  }

  update(dto: UpdateUserDto) {
    return this.http.put<User>(`${this.base}/me`, dto);
  }

  uploadPhoto(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string; user: User }>(`${this.base}/me/photo`, formData);
  }

  promoteToAdmin(userId: number) {
    return this.http.post<void>(`${this.base}/${userId}/promote-to-admin`, {});
  }
}
