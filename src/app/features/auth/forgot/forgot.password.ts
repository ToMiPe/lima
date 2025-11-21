import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { BrandPanelComponent } from '../components/brand-panel.component';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    ButtonModule,
    InputTextModule,
    TooltipModule,
    BrandPanelComponent,
  ],
  templateUrl: './forgot.password.html',
  styleUrl: './forgot.password.scss',
})
export default class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  readonly errorMessage = signal<string>('');
  readonly isLoading = signal<boolean>(false);
  readonly emailSent = signal<boolean>(false);

  readonly forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  onSubmit() {
    if (this.forgotForm.valid) {
      this.errorMessage.set('');
      this.isLoading.set(true);

      // Simular envío de email
      setTimeout(() => {
        this.isLoading.set(false);
        this.emailSent.set(true);
      }, 2000);

      // TODO: Implementar forgot password real
      // this.authService.forgotPassword(this.forgotForm.value.email).subscribe({...});
    }
  }

  resendEmail() {
    this.emailSent.set(false);
    this.onSubmit();
  }
}
