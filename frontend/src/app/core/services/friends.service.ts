import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import type { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class FriendsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/friends`;

  getAll() {
    return this.http.get<User[]>(this.base);
  }

  follow(userId: number) {
    return this.http.post<void>(`${this.base}/${userId}/follow`, {});
  }

  unfollow(userId: number) {
    return this.http.delete<void>(`${this.base}/${userId}/follow`);
  }
}
