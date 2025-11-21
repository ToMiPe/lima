import { Injectable, signal, computed } from '@angular/core';

/**
 * Servicio para mantener el contexto de la EPSA actualmente seleccionada.
 * Útil para verificar permisos sin pasar epsaId manualmente en cada directiva.
 *
 * @example
 * // En un guard o resolver
 * epsaContext.setCurrentEpsa('EPSA-001');
 *
 * // En un componente
 * const epsaId = epsaContext.currentEpsaId();
 *
 * // En una directiva
 * <button *hasPermission="'update'">Editar</button>
 * // Usa automáticamente la EPSA del contexto
 */
@Injectable({
  providedIn: 'root',
})
export class EpsaContextService {
  private readonly _currentEpsaId = signal<string | null>(null);

  /**
   * Signal readonly con el ID de la EPSA actual
   */
  readonly currentEpsaId = this._currentEpsaId.asReadonly();

  /**
   * Computed para verificar si hay una EPSA seleccionada
   */
  readonly hasEpsaSelected = computed(() => this._currentEpsaId() !== null);

  /**
   * Establece la EPSA actual.
   * Típicamente llamado desde un guard o resolver.
   *
   * @param epsaId - ID de la EPSA a establecer como actual
   */
  setCurrentEpsa(epsaId: string): void {
    this._currentEpsaId.set(epsaId);
  }

  /**
   * Limpia el contexto de EPSA actual.
   * Útil al salir de módulos específicos de EPSA.
   */
  clear(): void {
    this._currentEpsaId.set(null);
  }

  /**
   * Obtiene el ID de la EPSA actual (no reactivo).
   * Útil para funciones que no necesitan reactividad.
   */
  getCurrentEpsaId(): string | null {
    return this._currentEpsaId();
  }
}
