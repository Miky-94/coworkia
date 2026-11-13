import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Connexion – Coworkia',
    loadComponent: () =>
      import('./features/login/login.component').then((file) => file.LoginComponent),
  },
  {
    path: 'zones',
    title: 'Salles et postes – Coworkia',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/zones/zones.component').then((file) => file.ZonesComponent),
  },
  {
    path: 'reservations',
    title: 'Mes réservations – Coworkia',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/reservations/reservations.component').then(
        (file) => file.ReservationsComponent,
      ),
  },
  {
    path: 'occupation',
    title: "Suivi d'occupation – Coworkia",
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/occupation/occupation.component').then((file) => file.OccupationComponent),
  },
  { path: '**', redirectTo: 'zones' },
];
