import { InjectionToken } from '@angular/core';
import { CarteraRepository } from '../repositories/cartera-repository.interface';

/**
 * Token de inyección para el Repository Pattern de Cartera
 * Permite cambiar fácilmente entre implementaciones (CSV local, API, etc.)
 */
export const CARTERA_REPOSITORY_TOKEN = new InjectionToken<CarteraRepository>('CarteraRepository');

/**
 * Configuración del proveedor para diferentes ambientes
 */
export interface RepositoryConfig {
  type: 'csv' | 'api';
  apiUrl?: string;
}
