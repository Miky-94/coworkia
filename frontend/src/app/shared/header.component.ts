import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-header',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <header class="flex flex-wrap items-center justify-between gap-4 border-b border-gray-300 p-4">
      <p class="text-xl font-bold">Coworkia – Paris République</p>
      <nav aria-label="Navigation principale" class="flex flex-wrap items-center gap-4">
        <a routerLink="/zones" routerLinkActive="font-bold underline" ariaCurrentWhenActive="page"
          >Salles</a
        >
        <a
          routerLink="/occupation"
          routerLinkActive="font-bold underline"
          ariaCurrentWhenActive="page"
          >Occupation</a
        >
        <a
          routerLink="/reservations"
          routerLinkActive="font-bold underline"
          ariaCurrentWhenActive="page"
          >Mes réservations</a
        >
        <span>{{ auth.email() }}</span>
        <button type="button" (click)="auth.logout()" class="underline">Se déconnecter</button>
      </nav>
    </header>
  `,
})
export class HeaderComponent {
  readonly auth = inject(AuthService);
}
