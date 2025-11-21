import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { EpsaContextService } from '@core/context/epsa-context.service';

/**
 * Guard para establecer la EPSA actual desde los parámetros de la ruta.
 *
 * Este guard debe usarse en rutas que contengan un parámetro 'epsaId' o 'id'.
 * Automáticamente captura el ID y lo establece en el EpsaContextService.
 *
 * @example
 * // En rutas
 * {
 *   path: 'epsas/:epsaId/areas',
 *   canActivate: [authGuard, epsaContextGuard],
 *   component: AreasComponent
 * }
 *
 * // En el componente, la EPSA ya está en contexto
 * <button *hasPermission="'update'">Editar</button>
 */
export const epsaContextGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const epsaContext = inject(EpsaContextService);

  // Intentar obtener epsaId de los parámetros de la ruta
  // Busca 'epsaId' primero, luego 'id' como fallback
  const epsaId = route.paramMap.get('epsaId') || route.paramMap.get('id');

  if (epsaId) {
    epsaContext.setCurrentEpsa(epsaId);
  } else {
    // Si no hay epsaId en la ruta, limpiar el contexto
    epsaContext.clear();
  }

  // Siempre permitir el acceso - este guard solo establece contexto
  return true;
};
