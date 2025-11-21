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
import { UserRole } from '../interfaces/auth.interfaces';

@Directive({
  selector: '[hasRole]',
  standalone: true,
})
export class HasRoleDirective implements OnInit, OnDestroy {
  private readonly authFacade = inject(AuthFacade);
  private readonly templateRef = inject(TemplateRef<any>);
  private readonly viewContainer = inject(ViewContainerRef);
  private readonly destroyRef = inject(DestroyRef);

  @Input() hasRole!: UserRole | UserRole[];
  @Input() hasRoleStrategy: 'any' | 'all' = 'any';

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
    const userRoles = this.authFacade.userRoles();
    this.updateView(userRoles);
  }

  private updateView(userRoles: UserRole[]): void {
    const requiredRoles = Array.isArray(this.hasRole) ? this.hasRole : [this.hasRole];

    const hasRequiredRole =
      this.hasRoleStrategy === 'all'
        ? requiredRoles.every((role) => userRoles.includes(role))
        : requiredRoles.some((role) => userRoles.includes(role));

    if (hasRequiredRole && !this.hasView) {
      this.viewContainer.createEmbeddedView(this.templateRef);
      this.hasView = true;
    } else if (!hasRequiredRole && this.hasView) {
      this.viewContainer.clear();
      this.hasView = false;
    }
  }

  ngOnDestroy(): void {
    this.viewContainer.clear();
  }
}
