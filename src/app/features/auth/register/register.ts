import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { AuthFacade } from '@core/auth/services';
import { BrandPanelComponent } from '../components/brand-panel.component';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    CheckboxModule,
    TooltipModule,
    ConfirmDialogModule,
    BrandPanelComponent,
  ],
  providers: [ConfirmationService],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export default class Register {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly authFacade = inject(AuthFacade);
  private readonly confirmationService = inject(ConfirmationService);

  readonly errorMessage = signal<string>('');
  readonly isLoading = signal<boolean>(false);

  readonly registerForm = this.fb.group(
    {
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]],
    },
    { validators: this.passwordMatchValidator },
  );

  passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  showTermsDialog() {
    // Prevenir que el checkbox se marque automáticamente
    this.registerForm.patchValue({ acceptTerms: false });

    this.confirmationService.confirm({
      header: 'Términos y Condiciones - MIRAR AAPS',
      message: `
        <div style="text-align: left; max-height: 400px; overflow-y: auto;">
          <h4>Autoridad de Fiscalización y Control Social de Agua Potable y Saneamiento Básico</h4>

          <h5>1. Aceptación de Términos</h5>
          <p>Al solicitar el registro en el Sistema Integral de Monitoreo de Riesgos (MIRAR), usted acepta que:</p>
          <ul>
            <li>La información proporcionada es veraz y verificable</li>
            <li>Su solicitud estará sujeta a revisión y aprobación por parte del personal técnico de AAPS</li>
            <li>El acceso al sistema será otorgado únicamente a personal autorizado de entidades reguladas</li>
            <li>Recibirá una notificación por correo electrónico sobre el estado de su solicitud</li>
          </ul>

          <h5>2. Proceso de Aprobación</h5>
          <ul>
            <li>Su solicitud será revisada por el equipo técnico de AAPS en un plazo de 2 a 5 días hábiles</li>
            <li>En caso de ser aprobado, recibirá las credenciales de acceso por correo electrónico</li>
            <li>AAPS se reserva el derecho de rechazar solicitudes sin previo aviso</li>
          </ul>

          <h5>3. Uso de Datos Personales</h5>
          <ul>
            <li>Sus datos serán utilizados exclusivamente para fines de gestión del sistema</li>
            <li>La información será tratada conforme a la normativa vigente de protección de datos</li>
            <li>AAPS garantiza la confidencialidad de su información personal</li>
          </ul>

          <h5>4. Responsabilidades del Usuario</h5>
          <ul>
            <li>Mantener la confidencialidad de sus credenciales de acceso</li>
            <li>Utilizar el sistema únicamente para fines institucionales autorizados</li>
            <li>Reportar cualquier uso indebido o vulneración de seguridad</li>
          </ul>

          <p><strong>¿Acepta estos términos y condiciones?</strong></p>
        </div>
      `,
      acceptLabel: 'Sí, Acepto',
      rejectLabel: 'No Acepto',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      defaultFocus: 'reject',
      accept: () => {
        this.registerForm.patchValue({ acceptTerms: true });
      },
      reject: () => {
        this.registerForm.patchValue({ acceptTerms: false });
      },
    });
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.errorMessage.set('');
      this.isLoading.set(true);

      // Simular registro por ahora
      setTimeout(() => {
        this.isLoading.set(false);
        this.router.navigate(['/auth/login'], {
          queryParams: { message: 'registered' },
        });
      }, 2000);
    }
  }
}
