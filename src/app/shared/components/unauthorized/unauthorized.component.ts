import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

/**
 * Componente que se muestra cuando un usuario no tiene permisos para acceder a una ruta.
 */
@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, CardModule],
  template: `
    <div class="flex align-items-center justify-content-center" style="min-height: 100vh;">
      <p-card styleClass="w-full max-w-30rem">
        <div class="text-center">
          <!-- Ícono de acceso denegado -->
          <div class="mb-4">
            <i class="pi pi-lock" style="font-size: 4rem; color: var(--red-500);"></i>
          </div>

          <!-- Título -->
          <h1 class="text-4xl font-bold mb-3 text-red-500">Acceso Denegado</h1>

          <!-- Mensaje -->
          <p class="text-lg mb-4 text-600">
            No tienes los permisos necesarios para acceder a esta página.
          </p>

          <p class="text-sm mb-5 text-500">
            Si crees que esto es un error, contacta con el administrador del sistema.
          </p>

          <!-- Botones de acción -->
          <div class="flex gap-3 justify-content-center">
            <p-button
              label="Volver Atrás"
              icon="pi pi-arrow-left"
              severity="secondary"
              (onClick)="goBack()"
            />
            <p-button label="Ir al Dashboard" icon="pi pi-home" [routerLink]="['/dashboard']" />
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        background: var(--surface-ground);
      }
    `,
  ],
})
export class UnauthorizedComponent {
  private router = inject(Router);

  goBack(): void {
    window.history.back();
  }
}
