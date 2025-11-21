import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { AuthFacade } from '@core/auth/services';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
  ],
  templateUrl: './security.component.html',
})
export class SecurityComponent {
  private fb = inject(FormBuilder);
  private authFacade = inject(AuthFacade);
  private messageService = inject(MessageService);

  isChangingPassword = false;

  passwordForm: FormGroup = this.fb.group(
    {
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmNewPassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordMatchValidator,
    },
  );

  changePassword() {
    if (this.passwordForm.valid) {
      this.isChangingPassword = true;

      const { currentPassword, newPassword } = this.passwordForm.value;

      this.authFacade.changePassword({ currentPassword, newPassword }).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Éxito',
            detail: 'Contraseña actualizada correctamente',
          });
          this.resetPasswordForm();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message || 'Error al cambiar la contraseña',
          });
        },
        complete: () => {
          this.isChangingPassword = false;
        },
      });
    }
  }

  resetPasswordForm() {
    this.passwordForm.reset();
  }

  private passwordMatchValidator(group: FormGroup): Record<string, boolean> | null {
    const newPassword = group.get('newPassword')?.value;
    const confirmNewPassword = group.get('confirmNewPassword')?.value;

    if (newPassword && confirmNewPassword && newPassword !== confirmNewPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }
}
