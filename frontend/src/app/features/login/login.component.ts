import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <main class="mx-auto max-w-sm p-6">
      <h1 class="mb-6 text-2xl font-bold">Connexion</h1>

      <form (ngSubmit)="submit()" class="flex flex-col gap-4">
        <div class="flex flex-col gap-1">
          <label for="email" class="font-medium">Adresse e-mail</label>
          <input
            id="email"
            name="email"
            type="email"
            autocomplete="email"
            required
            [(ngModel)]="email"
            class="rounded border border-gray-500 px-3 py-2"
          />
        </div>

        <div class="flex flex-col gap-1">
          <label for="password" class="font-medium">Mot de passe</label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            [(ngModel)]="password"
            class="rounded border border-gray-500 px-3 py-2"
          />
        </div>

        @if (error()) {
          <p role="alert" class="text-red-800">{{ error() }}</p>
        }

        <button
          type="submit"
          [disabled]="loading()"
          class="rounded bg-blue-800 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          Se connecter
        </button>
      </form>
    </main>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  submit() {
    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.email(), this.password()).subscribe({
      next: () => this.router.navigate(['/zones']),
      error: (err) => {
        this.error.set(
          err.status === 401
            ? 'Adresse e-mail ou mot de passe incorrect.'
            : 'Service indisponible, réessayez plus tard.',
        );
        this.loading.set(false);
      },
    });
  }
}
