import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { Poste, Zone, ZoneOccupancy } from '../../core/models';
import { ReservationFormComponent } from './reservation-form.component';
import { HeaderComponent } from '../../shared/header.component';

@Component({
  selector: 'app-zones',
  imports: [HeaderComponent, ReservationFormComponent],
  template: `
    <app-header />

    <main class="mx-auto max-w-4xl p-6">
      <h1 class="mb-6 text-2xl font-bold">Salles et postes</h1>

      <section aria-labelledby="zones-title">
        <h2 id="zones-title" class="mb-3 text-xl font-semibold">Salles</h2>

        @if (zones.isLoading()) {
          <p role="status">Chargement des salles…</p>
        } @else if (zones.error()) {
          <p role="alert" class="text-red-800">Impossible de charger les salles.</p>
        } @else {
          <ul class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            @for (zone of zones.value(); track zone.id) {
              <li>
                <button
                  type="button"
                  [attr.aria-pressed]="zone.id === selectedZoneId()"
                  (click)="selectedZoneId.set(zone.id)"
                  class="cursor-pointer flex h-28 w-full flex-col items-center justify-center rounded border-2 border-gray-800 p-2 text-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                  [class]="
                    zone.id === selectedZoneId()
                      ? 'bg-blue-800 text-white'
                      : 'bg-white text-gray-900 hover:bg-blue-50'
                  "
                >
                  <span class="font-semibold">{{ zone.nom }} [{{ zone.code }}]</span>
                  <span>{{ freeLabel(zone) }}</span>
                </button>
              </li>
            }
          </ul>
        }
      </section>

      <section aria-labelledby="postes-title" class="mt-8">
        <h2 id="postes-title" class="mb-3 text-xl font-semibold">
          @if (selectedZone(); as zone) {
            Postes de la salle {{ zone.nom }}
          } @else {
            Postes
          }
        </h2>

        @if (!selectedZone()) {
          <p>Choisissez une salle pour voir ses postes.</p>
        } @else if (postes.error()) {
          <p role="alert" class="text-red-800">Impossible de charger les postes.</p>
        } @else if (postes.hasValue()) {
          <ul class="grid grid-cols-2 gap-3 sm:grid-cols-4">
            @for (poste of postes.value(); track poste.id) {
              <li
                class="rounded border-2 p-3"
                [class]="
                  poste.occupied
                    ? 'border-red-700 bg-red-50 text-red-900'
                    : 'border-green-700 bg-green-50 text-green-900'
                "
              >
                <span class="block font-semibold">{{ poste.numero }}</span>
                <span>{{ poste.occupied ? 'Occupé' : 'Libre' }}</span>
              </li>
            }
          </ul>
        } @else {
          <p role="status">Chargement des postes…</p>
        }
      </section>

      @if (selectedZone(); as zone) {
        <app-reservation-form
          [zoneId]="zone.id"
          [postes]="postes.value() ?? []"
          (reserved)="refresh()"
        />
      }
    </main>
  `,
})
export class ZonesComponent {
  readonly selectedZoneId = signal<number | null>(null);

  // Occupation en temps réel, pour afficher le nombre de postes libres par salle
  readonly occupation = httpResource<ZoneOccupancy[]>(() => `${API_URL}/occupation/current`);

  freeLabel(zone: Zone) {
    const item = this.occupation.value()?.find((o) => o.zoneId === zone.id);
    return item
      ? `${item.capacity - item.occupied} libres sur ${zone.capacite}`
      : `${zone.capacite} postes`;
  }

  // Charge la liste des salles
  readonly zones = httpResource<Zone[]>(() => `${API_URL}/zones`);

  // Charge les postes de la salle choisie. Tant qu'aucune salle n'est choisie, aucune requête n'est envoyée.
  readonly postes = httpResource<Poste[]>(() => {
    const id = this.selectedZoneId();
    return id ? `${API_URL}/zones/${id}/postes` : undefined;
  });

  // Objet Zone complet correspondant à la salle choisie
  readonly selectedZone = computed(() =>
    this.zones.value()?.find((zone) => zone.id === this.selectedZoneId()),
  );

  // Recharge les postes de la salle et l'occupation de toutes les salles
  refresh() {
    this.postes.reload();
    this.occupation.reload();
  }

  constructor() {
    // Met à jour les postes toutes les 5 secondes, et arrête le minuteur quand l'écran est quitté
    const timer = setInterval(() => this.refresh(), 5000);

    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
}
