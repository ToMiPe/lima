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

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      jefe: 'Jefe de Área',
      tecnico: 'Técnico',
      epsa: 'Usuario EPSA',
    };

    return labels[role] ?? role.charAt(0).toUpperCase() + role.slice(1);
  }

  getRoleSeverity(role: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' {
    const severities: Record<
      string,
      'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'
    > = {
      admin: 'danger',
      jefe: 'warn',
      tecnico: 'info',
      epsa: 'success',
    };

    return severities[role] ?? 'secondary';
  }
}
