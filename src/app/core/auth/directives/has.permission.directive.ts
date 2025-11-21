/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @angular-eslint/directive-selector */
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
  OnInit,
  OnDestroy,
  inject,
  DestroyRef,
} from '@angular/core';
import { AuthFacade } from '../services/auth.facade';
import { EpsaContextService } from '@core/context/epsa-context.service';
import { PermissionAction } from '../interfaces/auth.interfaces';

/**
 * Directiva estructural para mostrar/ocultar elementos según permisos en una EPSA.
 *
 * Puede usar la EPSA del contexto actual (establecida por epsaContextGuard)
 * o una EPSA específica mediante el input hasPermissionEpsa.
 *
 * @example
 * // Usa la EPSA del contexto (de la ruta)
 * <button *hasPermission="'update'">Editar</button>
 *
 * // Especifica EPSA manualmente
 * <button *hasPermission="'delete'; hasPermissionEpsa: 'EPSA-001'">Eliminar</button>
 *
 * // Múltiples permisos (OR)
 * <button *hasPermission="['update', 'delete']">Modificar</button>
 */
@Directive({
  selector: '[hasPermission]',
  standalone: true,
})
export class HasPermissionDirective implements OnInit, OnDestroy {
  private readonly authFacade = inject(AuthFacade);
  private readonly epsaContext = inject(EpsaContextService);
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() hasPermission!: PermissionAction | PermissionAction[];
  @Input() hasPermissionEpsa?: string; // ID de la EPSA (opcional si hay contexto)

  private hasView = false;
  private checkInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    // Verificación inicial
    this.checkAndUpdateView();

    // Observar cambios cada 100ms
    this.checkInterval = setInterval(() => {
      this.checkAndUpdateView();
    }, 100);

    // Limpiar interval al destruir
    this.destroyRef.onDestroy(() => {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
      }
    });
  }

  private checkAndUpdateView(): void {
    const user = this.authFacade.user();
    const currentEpsa = this.epsaContext.currentEpsaId();
    this.updateView(user, currentEpsa);
  }

  private updateView(user: any, currentEpsa: string | null): void {
    if (!user) {
      this.hideView();
      return;
    }

    // Usar EPSA específica o la del contexto
    const epsaId = this.hasPermissionEpsa ?? currentEpsa;

    if (!epsaId) {
      console.warn('hasPermission: No se especificó hasPermissionEpsa y no hay EPSA en contexto');
      this.hideView();
      return;
    }

    const requiredPermissions = Array.isArray(this.hasPermission)
      ? this.hasPermission
      : [this.hasPermission];

    const hasRequiredPermission = this.authFacade.hasAnyPermission(epsaId, requiredPermissions);

    if (hasRequiredPermission && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRequiredPermission && this.hasView) {
      this.hideView();
    }
  }

  private hideView(): void {
    this.viewContainer.clear();
    this.hasView = false;
  }

  ngOnDestroy(): void {
    this.viewContainer.clear();
  }
}
