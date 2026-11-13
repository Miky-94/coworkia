import { DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { API_URL } from '../../core/api.config';
import { HeaderComponent } from '../../shared/header.component';
import { Reservation } from '../../core/models';
import { ReservationService } from '../../core/reservation.service';

@Component({
  selector: 'app-reservations',
  imports: [DatePipe, HeaderComponent],
  template: `
    <app-header />

    <main class="mx-auto max-w-4xl p-6">
      <h1 class="mb-4 text-2xl font-bold">Mes réservations</h1>

      @if (cancelError()) {
        <p role="alert" class="mb-4 text-red-800">L'annulation a échoué, réessayez.</p>
      }

      @if (reservations.isLoading()) {
        <p role="status">Chargement…</p>
      } @else if (reservations.error()) {
        <p role="alert" class="text-red-800">Impossible de charger vos réservations.</p>
      } @else if (reservations.value()?.length === 0) {
        <p>Vous n'avez aucune réservation.</p>
      } @else {
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left">
            <caption class="sr-only">
              Liste de mes réservations
            </caption>
            <thead>
              <tr class="border-b-2 border-gray-400">
                <th scope="col" class="p-2">Salle</th>
                <th scope="col" class="p-2">Poste</th>
                <th scope="col" class="p-2">Début</th>
                <th scope="col" class="p-2">Fin</th>
                <th scope="col" class="p-2">Statut</th>
                <th scope="col" class="p-2">Action</th>
              </tr>
            </thead>
            <tbody>
              @for (reservation of reservations.value(); track reservation.id) {
                <tr class="border-b border-gray-300">
                  <td class="p-2">{{ reservation.zoneNom }}</td>
                  <td class="p-2">{{ reservation.posteNumero }}</td>
                  <td class="p-2">{{ reservation.debut | date: 'dd/MM/yyyy HH:mm' }}</td>
                  <td class="p-2">{{ reservation.fin | date: 'dd/MM/yyyy HH:mm' }}</td>
                  <td class="p-2">
                    {{ reservation.statut === 'CONFIRMEE' ? 'Confirmée' : 'Annulée' }}
                  </td>
                  <td class="p-2">
                    @if (canCancel(reservation)) {
                      <button
                        type="button"
                        (click)="cancel(reservation)"
                        class="cursor-pointer text-red-800 underline"
                        [attr.aria-label]="
                          'Annuler la réservation du poste ' +
                          reservation.posteNumero +
                          ' du ' +
                          (reservation.debut | date: 'dd/MM/yyyy HH:mm')
                        "
                      >
                        Annuler
                      </button>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </main>
  `,
})
export class ReservationsComponent {
  private readonly reservationService = inject(ReservationService);

  readonly reservations = httpResource<Reservation[]>(() => `${API_URL}/reservations/me`);
  readonly cancelError = signal(false);

  // Seules les réservations confirmées et pas encore terminées peuvent être annulées
  canCancel(reservation: Reservation) {
    return reservation.statut === 'CONFIRMEE' && new Date(reservation.fin) > new Date();
  }

  cancel(reservation: Reservation) {
    this.cancelError.set(false);
    this.reservationService.cancel(reservation.id).subscribe({
      next: () => this.reservations.reload(),
      error: () => this.cancelError.set(true),
    });
  }
}
