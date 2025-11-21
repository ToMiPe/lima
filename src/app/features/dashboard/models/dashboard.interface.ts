/**
 * Interfaces y tipos para el módulo de Dashboard
 */

/**
 * KPI (Key Performance Indicator)
 */
export interface KPI {
  id: string;
  title: string;
  value: number;
  icon: string;
  color: 'green' | 'blue' | 'yellow' | 'red';
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  format: 'number' | 'currency' | 'percentage';
}

/**
 * Tipo de reporte disponible
 */
export interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'geographic' | 'financial' | 'social' | 'temporal';
  route: string;
  recordCount?: number;
  lastUpdate?: Date;
  color: string;
}

/**
 * Estadísticas del mapa por departamento
 */
export interface DepartmentStats {
  id: string;
  name: string;
  count: number;
  totalAmount: number;
  percentage: number;
  color: string;
  value?: number; // Valor numérico para el mapa (ej. cantidad de registros)
}

/**
 * Evento de click en el mapa
 */
export interface MapClickEvent {
  departmentId: string;
  departmentName: string;
  stats: DepartmentStats;
}
