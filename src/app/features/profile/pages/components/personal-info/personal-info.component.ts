import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthFacade } from '@core/auth/services';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-personal-info',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, FileUploadModule],
  templateUrl: './personal-info.component.html',
})
export class PersonalInfoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authFacade = inject(AuthFacade);
  private readonly messageService = inject(MessageService);

  user = this.authFacade.user;
  isUpdatingProfile = signal(false);

  profileForm!: FormGroup;

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const currentUser = this.user();

    this.profileForm = this.fb.group({
      firstName: [currentUser?.firstName || '', [Validators.required, Validators.minLength(2)]],
      lastName: [currentUser?.lastName || '', [Validators.required, Validators.minLength(2)]],
      email: [
        { value: currentUser?.email || '', disabled: true },
        [Validators.required, Validators.email],
      ],
      username: [{ value: currentUser?.username || '', disabled: true }],
    });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.isUpdatingProfile.set(true);

    const data = {
      firstName: this.profileForm.value.firstName,
      lastName: this.profileForm.value.lastName,
    };

    this.authFacade.updateProfile(data).subscribe({
      next: (response) => {
        this.isUpdatingProfile.set(false);
        this.messageService.add({
          severity: 'success',
          summary: 'Perfil Actualizado',
          detail: response.message || 'Tu información personal ha sido actualizada correctamente',
          life: 3000,
        });
        this.profileForm.markAsPristine();
      },
      error: (error) => {
        this.isUpdatingProfile.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.error?.message || 'No se pudo actualizar el perfil. Intente nuevamente.',
          life: 5000,
        });
      },
    });
  }

  resetProfileForm(): void {
    const currentUser = this.user();
    this.profileForm.patchValue({
      firstName: currentUser?.firstName || '',
      lastName: currentUser?.lastName || '',
      email: currentUser?.email || '',
    });
    this.profileForm.markAsPristine();
  }
}
