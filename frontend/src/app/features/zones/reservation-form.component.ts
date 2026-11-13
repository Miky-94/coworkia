import { Component, inject, input, linkedSignal, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReservationService } from '../../core/reservation.service';
import { Poste } from '../../core/models';

@Component({
  selector: 'app-reservation-form',
  imports: [FormsModule],
  template: `
    <section aria-labelledby="form-title" class="mt-8 max-w-md">
      <h2 id="form-title" class="mb-3 text-xl font-semibold">Réserver un poste</h2>

      <form (ngSubmit)="submit()" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label for="poste" class="font-medium">Poste</label>
          <select
            id="poste"
            name="poste"
            [(ngModel)]="posteId"
            class="rounded border border-gray-500 px-3 py-2"
          >
            <option [ngValue]="null" disabled>Choisir un poste</option>
            @for (poste of postes(); track poste.id) {
              <option [ngValue]="poste.id">{{ poste.numero }}</option>
            }
          </select>
        </div>

        <div class="flex flex-col gap-1">
          <label for="date" class="font-medium">Date</label>
          <input
            id="date"
            name="date"
            type="date"
            [min]="today"
            [(ngModel)]="date"
            class="rounded border border-gray-500 px-3 py-2"
          />
        </div>

        <div class="flex gap-4">
          <div class="flex flex-1 flex-col gap-1">
            <label for="start" class="font-medium">Heure de début</label>
            <input
              id="start"
              name="start"
              type="time"
              [(ngModel)]="start"
              class="rounded border border-gray-500 px-3 py-2"
            />
          </div>
          <div class="flex flex-1 flex-col gap-1">
            <label for="end" class="font-medium">Heure de fin</label>
            <input
              id="end"
              name="end"
              type="time"
              [(ngModel)]="end"
              class="rounded border border-gray-500 px-3 py-2"
            />
          </div>
        </div>

        @if (message(); as msg) {
          <p
            [attr.role]="msg.type === 'error' ? 'alert' : 'status'"
            [class]="msg.type === 'error' ? 'text-red-800' : 'text-green-800'"
          >
            {{ msg.text }}
          </p>
        }

        <button
          type="submit"
          [disabled]="loading()"
          class="rounded bg-blue-800 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          Réserver
        </button>
      </form>
    </section>
  `,
})
export class ReservationFormComponent {
  private readonly reservations = inject(ReservationService);

  // Prévient le composant parent qu'une réservation vient d'être créée
  readonly reserved = output<void>();

  // Données reçues du composant parent
  readonly zoneId = input.required<number>();
  readonly postes = input.required<Poste[]>();

  // Se remet à null quand on change de salle, mais pas quand la liste des postes est rafraîchie
  readonly posteId = linkedSignal<number, number | null>({
    source: this.zoneId,
    computation: () => null,
  });

  // 'sv-SE' donne le format AAAA-MM-JJ en heure locale
  readonly today = new Date().toLocaleDateString('sv-SE');
  readonly date = signal(this.today);
  readonly start = signal('09:00');
  readonly end = signal('12:00');

  readonly loading = signal(false);
  readonly message = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  submit() {
    const posteId = this.posteId();
    if (posteId === null) {
      this.message.set({ type: 'error', text: 'Choisissez un poste.' });
      return;
    }

    const debut = `${this.date()}T${this.start()}:00`;
    const fin = `${this.date()}T${this.end()}:00`;
    if (fin <= debut) {
      this.message.set({ type: 'error', text: "L'heure de fin doit être après l'heure de début." });
      return;
    }

    this.loading.set(true);
    this.message.set(null);

    this.reservations.create(posteId, debut, fin).subscribe({
      next: () => {
        this.message.set({ type: 'success', text: 'Réservation confirmée.' });
        this.loading.set(false);
        this.reserved.emit();
      },
      error: (err) => {
        const text =
          err.status === 409
            ? 'Ce poste est déjà réservé sur ce créneau.'
            : err.status === 400
              ? 'Créneau invalide.'
              : 'Service indisponible, réessayez plus tard.';
        this.message.set({ type: 'error', text });
        this.loading.set(false);
      },
    });
  }
}
