import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { API_URL } from '../../core/api.config';
import { HeaderComponent } from '../../shared/header.component';
import { DailyOccupancy, ZoneOccupancy } from '../../core/models';

@Component({
  selector: 'app-occupation',
  imports: [DatePipe, FormsModule, HeaderComponent],
  template: `
    <app-header />

    <main class="mx-auto max-w-4xl p-6">
      <h1 class="mb-6 text-2xl font-bold">Suivi d'occupation</h1>

      <section aria-labelledby="current-title">
        <h2 id="current-title" class="mb-1 text-xl font-semibold">En temps réel</h2>
        <p class="mb-3 text-gray-700">
          Postes occupés en ce moment. Mise à jour toutes les 5 secondes.
        </p>

        @if (current.error()) {
          <p role="alert" class="text-red-800">Impossible de charger l'occupation.</p>
        } @else if (current.hasValue()) {
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left">
              <caption class="sr-only">
                Occupation actuelle par salle
              </caption>
              <thead>
                <tr class="border-b-2 border-gray-400">
                  <th scope="col" class="p-2">Salle</th>
                  <th scope="col" class="p-2">Postes occupés</th>
                  <th scope="col" class="p-2">Taux</th>
                </tr>
              </thead>
              <tbody>
                @for (zone of current.value(); track zone.zoneId) {
                  <tr class="border-b border-gray-300">
                    <th scope="row" class="p-2 font-medium">{{ zone.zoneNom }}</th>
                    <td class="p-2">{{ zone.occupied }} sur {{ zone.capacity }}</td>
                    <td class="p-2">
                      <div class="flex items-center gap-2">
                        <div class="h-2 w-32 rounded bg-gray-200" aria-hidden="true">
                          <div
                            class="h-2 rounded bg-blue-800"
                            [style.width.%]="percent(zone.occupied, zone.capacity)"
                          ></div>
                        </div>
                        <span>{{ percent(zone.occupied, zone.capacity) }} %</span>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p role="status">Chargement…</p>
        }
      </section>

      <section aria-labelledby="history-title" class="mt-10">
        <h2 id="history-title" class="mb-3 text-xl font-semibold">Historique</h2>

        <div class="mb-4 flex flex-wrap gap-4">
          <div class="flex flex-col gap-1">
            <label for="from" class="font-medium">Du</label>
            <input
              id="from"
              type="date"
              [max]="to()"
              [(ngModel)]="from"
              class="rounded border border-gray-500 px-3 py-2"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="to" class="font-medium">Au</label>
            <input
              id="to"
              type="date"
              [min]="from()"
              [(ngModel)]="to"
              class="rounded border border-gray-500 px-3 py-2"
            />
          </div>
        </div>

        @if (invalidPeriod()) {
          <p role="alert" class="text-red-800">La date de fin doit être après la date de début.</p>
        } @else if (history.error()) {
          <p role="alert" class="text-red-800">
            Impossible de charger l'historique (période de 90 jours maximum).
          </p>
        } @else if (history.hasValue()) {
          <div class="overflow-x-auto">
            <table class="w-full border-collapse text-left">
              <caption class="sr-only">
                Postes occupés par jour et par salle, sur la capacité de la salle
              </caption>
              <thead>
                <tr class="border-b-2 border-gray-400">
                  <th scope="col" class="p-2">Jour</th>
                  @for (name of columns(); track name) {
                    <th scope="col" class="p-2">{{ name }}</th>
                  }
                </tr>
              </thead>
              <tbody>
                @for (row of rows(); track row.date) {
                  <tr class="border-b border-gray-300">
                    <th scope="row" class="p-2 font-medium">{{ row.date | date: 'dd/MM/yyyy' }}</th>
                    @for (cell of row.cells; track cell.zoneNom) {
                      <td class="p-2">{{ cell.occupied }}/{{ cell.capacity }}</td>
                    }
                  </tr>
                }
              </tbody>
            </table>
          </div>
        } @else {
          <p role="status">Chargement…</p>
        }
      </section>
    </main>
  `,
})
export class OccupationComponent {
  // Période de l'historique : les 7 derniers jours par défaut ('sv-SE' donne le format AAAA-MM-JJ)
  readonly to = signal(this.format(new Date()));
  readonly from = signal(this.format(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000)));

  readonly invalidPeriod = computed(() => this.from() > this.to());

  readonly current = httpResource<ZoneOccupancy[]>(() => `${API_URL}/occupation/current`);

  // Pas de requête (undefined) tant que la période est invalide
  readonly history = httpResource<DailyOccupancy[]>(() =>
    this.invalidPeriod() || !this.from() || !this.to()
      ? undefined
      : `${API_URL}/occupation/history?from=${this.from()}&to=${this.to()}`,
  );

  // L'API renvoie une ligne par jour et par salle : on les regroupe par jour pour faire un tableau
  readonly rows = computed(() => {
    const byDate = new Map<string, DailyOccupancy[]>();
    for (const item of this.history.value() ?? []) {
      byDate.set(item.date, [...(byDate.get(item.date) ?? []), item]);
    }
    return [...byDate.entries()].map(([date, cells]) => ({ date, cells }));
  });

  // Noms des salles, utilisés comme en-têtes de colonnes
  readonly columns = computed(() => (this.rows()[0]?.cells ?? []).map((cell) => cell.zoneNom));

  constructor() {
    // Rafraîchit l'occupation en temps réel toutes les 5 secondes
    const timer = setInterval(() => this.current.reload(), 5000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  percent(occupied: number, capacity: number) {
    return Math.round((occupied * 100) / capacity);
  }

  private format(date: Date) {
    return date.toLocaleDateString('sv-SE');
  }
}
