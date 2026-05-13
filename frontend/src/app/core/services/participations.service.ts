import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ParticipationsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/activities`;

  join(activityId: number) {
    return this.http.post<void>(`${this.base}/${activityId}/join`, {});
  }

  leave(activityId: number) {
    return this.http.delete<void>(`${this.base}/${activityId}/leave`);
  }

  approve(activityId: number, userId: number) {
    return this.http.put<void>(`${this.base}/${activityId}/participants/${userId}/approve`, {});
  }

  remove(activityId: number, userId: number) {
    return this.http.delete<void>(`${this.base}/${activityId}/participants/${userId}`);
  }
}
