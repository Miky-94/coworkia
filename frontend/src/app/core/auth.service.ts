import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { API_URL } from './api.config';

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}

const STORAGE_KEY = 'coworkia_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  // Session en cours : null si personne n'est connecté
  private readonly session = signal<AuthResponse | null>(this.load());

  readonly token = computed(() => this.session()?.token ?? null);
  readonly email = computed(() => this.session()?.email ?? null);
  readonly isLoggedIn = computed(() => this.session() !== null);

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${API_URL}/auth/login`, { email, password }).pipe(
      tap((response) => {
        this.session.set(response);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(response));
      }),
    );
  }

  logout() {
    this.session.set(null);
    sessionStorage.removeItem(STORAGE_KEY);
    this.router.navigate(['/login']);
  }

  // Relit la session au rechargement de la page
  private load(): AuthResponse | null {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }
}
