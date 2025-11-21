/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { TooltipModule } from 'primeng/tooltip';
import { CheckboxModule } from 'primeng/checkbox';
import { AuthFacade } from '@core/auth/services';
import { BrandPanelComponent } from '../components/brand-panel.component';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    TooltipModule,
    CheckboxModule,
    RouterLink,
    BrandPanelComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export default class Login {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly authFacade = inject(AuthFacade);

  readonly errorMessage = signal<string>('');

  readonly loginForm = this.fb.group({
    emailOrUsername: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false],
  });

  onSubmit() {
    if (this.loginForm.valid) {
      this.errorMessage.set('');

      this.authFacade.login(this.loginForm.value as any).subscribe({
        next: () => {
          // Usar queueMicrotask para asegurar que los signals se actualicen primero
          queueMicrotask(() => {
            this.router.navigate(['/dashboard']);
          });
        },
        error: (error) => {
          console.error('Login error:', error);

          // Manejo de errores basado en el código HTTP
          if (error.status === 401 || error.status === 403) {
            // Backend puede enviar 401 o 403 para credenciales incorrectas
            this.errorMessage.set('Credenciales incorrectas. Verifique su usuario y contraseña.');
          } else if (error.status === 404) {
            this.errorMessage.set('Usuario no encontrado.');
          } else if (error.status === 500) {
            this.errorMessage.set('Error del servidor. Por favor, intente más tarde.');
          } else if (error.status === 0) {
            this.errorMessage.set('No se puede conectar con el servidor. Verifique su conexión.');
          } else {
            this.errorMessage.set('Error al iniciar sesión. Por favor, intente nuevamente.');
          }
        },
      });
    }
  }
}
