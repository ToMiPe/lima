/* eslint-disable @typescript-eslint/no-unused-vars */
import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { CanActivateFn } from '@angular/router';
import { AuthFacade } from '../services/auth.facade';
import { UserRole, PermissionAction } from '../interfaces/auth.interfaces';

/**
 * Guard para verificar permisos específicos en una EPSA
 * (Raramente usado - roleGuard es más común)
 */
export const permissionGuard = (epsaId: string, permission: PermissionAction): CanActivateFn => {
  return (route, state) => {
    const authFacade = inject(AuthFacade);
    const router = inject(Router);

    // Verificar si está autenticado
    if (!authFacade.isAuthenticated()) {
      router.navigate(['/auth/login']);
      return false;
    }

    // Verificar permisos
    if (authFacade.hasPermission(epsaId, permission)) {
      return true;
    }

    // Redirigir a página de acceso denegado
    router.navigate(['/unauthorized']);
    return false;
  };
};

/**
 * Guard para verificar roles del usuario
 * Uso: canActivate: [roleGuard], data: { roles: ['admin', 'tecnico'] }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authFacade = inject(AuthFacade);
  const router = inject(Router);

  if (!authFacade.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  // Obtener roles requeridos desde la configuración de la ruta
  const requiredRoles = route.data['roles'] as UserRole[] | undefined;

  if (!requiredRoles || requiredRoles.length === 0) {
    // Si no hay roles requeridos, permitir acceso
    return true;
  }

  // Verificar si el usuario tiene alguno de los roles requeridos
  const hasRole = authFacade.hasAnyRole(requiredRoles);

  if (hasRole) {
    return true;
  }

  // Redirigir a página de acceso denegado
  router.navigate(['/unauthorized']);
  return false;
};
