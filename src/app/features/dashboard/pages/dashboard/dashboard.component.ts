import { ChangeDetectionStrategy, Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthFacade } from '@core/auth/services/auth.facade';
import { HasRoleDirective } from '@core/auth/directives';

/**
 * Dashboard principal del sistema MIRAR.
 * Muestra diferentes secciones según el rol del usuario.
 */
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    HasRoleDirective,
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DashboardComponent {
  private authFacade = inject(AuthFacade);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);

  isClearing = signal<boolean>(false);

  // Información del usuario
  readonly userName = this.authFacade.userName;
  readonly userRoles = this.authFacade.userRoles;
  readonly isAdmin = this.authFacade.isAdmin;

  // Computed para mostrar el rol principal
  readonly mainRole = computed(() => {
    const roles = this.userRoles();
    if (roles.includes('admin')) return 'Administrador';
    if (roles.includes('jefe')) return 'Jefe de Área';
    if (roles.includes('tecnico')) return 'Técnico';
    if (roles.includes('epsa')) return 'Usuario EPSA';
    return 'Usuario';
  });

  // Stats de ejemplo (estos vendrían del backend)
  readonly stats = computed(() => ({
    totalEpsas: 150,
    myEpsas: this.authFacade.userEpsas()?.length ?? 0,
    pendingReports: 12,
    approvedReports: 45,
  }));

  /**
   * Limpia la base de datos IndexedDB y recarga la página
   * Útil cuando se actualizan los datos o hay problemas con el schema
   */
  clearDatabase(): void {
    this.confirmationService.confirm({
      message:
        '¿Deseas recargar los datos almacenados en tu navegador? ' +
        'Esto eliminará los datos locales y los volverá a cargar desde el servidor.',
      header: 'Confirmar Recarga de Datos',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Recargar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-warning',
      accept: () => {
        this.isClearing.set(true);

        // Eliminar la base de datos
        const deleteRequest = indexedDB.deleteDatabase('MirarGeoDatabase');

        deleteRequest.onsuccess = () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Datos recargados',
            detail: 'La página se recargará para aplicar los cambios',
            life: 2000,
          });

          // Recargar después de 2 segundos
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        };

        deleteRequest.onerror = () => {
          this.isClearing.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se pudo limpiar la base de datos',
            life: 5000,
          });
        };

        deleteRequest.onblocked = () => {
          this.isClearing.set(false);
          this.messageService.add({
            severity: 'warn',
            summary: 'Operación bloqueada',
            detail: 'Cierra todas las pestañas de la aplicación e intenta nuevamente',
            life: 5000,
          });
        };
      },
    });
  }
}
