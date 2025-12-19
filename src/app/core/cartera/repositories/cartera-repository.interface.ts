/**
 * Repository Interface - Abstracción para acceso a datos de Cartera
 * Permite cambiar entre CSV local, API REST, GraphQL, etc.
 */

import { ReporteCartera } from '../models/reporte-cartera.interface';
import { HHIAgenciasReporte } from '../models/hhi-agencias.interface';

export interface EstadisticasCartera {
  total: number;
  totalMonto: number;
  totalSaldo: number;
  porDepartamento: Record<string, number>;
}

export interface CarteraRepository {
  // Inicialización
  initialize(): Promise<void>;

  // Consultas básicas
  count(): Promise<number>;
  getEstadisticas(): Promise<EstadisticasCartera>;
  getByDepartamento(departamento: string): Promise<ReporteCartera[]>;
  getAllRecords(): Promise<ReporteCartera[]>;

  // Análisis HHI
  getHHIAgencias(): Promise<HHIAgenciasReporte>;
  getHHITipoCredito(): Promise<HHIAgenciasReporte>;
  getHHIDestinoCredito(): Promise<HHIAgenciasReporte>;
  getHHIPlazo(): Promise<HHIAgenciasReporte>;
  getHHIZonaGeografica(): Promise<HHIAgenciasReporte>;
  getHHISectorEconomico(): Promise<HHIAgenciasReporte>;
  getHHICalificacionCR(): Promise<HHIAgenciasReporte>;

  // Utilidades
  clearData(): Promise<void>;
  refreshData(): Promise<void>;

  // Estado
  isLoading(): boolean;
  getLastUpdate(): Date | null;
}
