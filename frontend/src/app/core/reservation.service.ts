import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from './api.config';
import { Reservation } from './models';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);

  create(posteId: number, debut: string, fin: string) {
    return this.http.post<Reservation>(`${API_URL}/reservations`, { posteId, debut, fin });
  }

  cancel(id: number) {
    return this.http.delete<void>(`${API_URL}/reservations/${id}`);
  }
}
