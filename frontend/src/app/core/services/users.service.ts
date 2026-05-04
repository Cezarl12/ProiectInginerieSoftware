import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { User, UpdateUserDto } from '../models/user.model';

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

  update(id: number, dto: UpdateUserDto) {
    return this.http.put<User>(`${this.base}/${id}`, dto);
  }
}
