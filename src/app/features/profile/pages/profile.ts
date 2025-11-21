import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AuthFacade } from '@core/auth/services';
import { AvatarModule } from 'primeng/avatar';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { PersonalInfoComponent } from './components/personal-info/personal-info.component';
import { SecurityComponent } from './components/security/security.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    AvatarModule,
    TagModule,
    TabsModule,
    PersonalInfoComponent,
    SecurityComponent,
  ],
  templateUrl: './profile.html',
})
export class Profile {
  private readonly authFacade = inject(AuthFacade);

  user = this.authFacade.user;

  getInitials(): string {
    const name = this.user()?.name || '';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  /**
   * Obtiene el label de un rol para mostrar en UI
   * ✅ DINÁMICO: Si llega un rol nuevo, lo capitaliza automáticamente
   *
   * Ejemplos:
   * - 'admin' → 'Administrador' (configurado)
   * - 'supervisor' → 'Supervisor' (auto-generado)
   * - 'analista-senior' → 'Analista-senior' (auto-generado)
   */
  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      jefe: 'Jefe de Área',
      tecnico: 'Técnico',
      epsa: 'Usuario EPSA',
      // Agrega aquí roles nuevos si quieres un label personalizado
    };

    // ✅ Si el rol no está configurado, capitaliza automáticamente
    return labels[role] ?? role.charAt(0).toUpperCase() + role.slice(1);
  }

  /**
   * Obtiene el color/severidad de un rol para PrimeNG Tag
   * ✅ DINÁMICO: Roles nuevos usan color secundario por defecto
   */
  getRoleSeverity(role: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severities: Record<
      string,
      'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'
    > = {
      admin: 'danger',
      jefe: 'warn',
      tecnico: 'info',
      epsa: 'success',
      // Agrega aquí roles nuevos si quieres un color personalizado
    };

    // ✅ Si el rol no está configurado, usa color secundario
    return severities[role] ?? 'secondary';
  }
}
