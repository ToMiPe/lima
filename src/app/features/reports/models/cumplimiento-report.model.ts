/**
 * Modelos e Interfaces para el Reporte de Cumplimiento
 *
 * Este módulo define los tipos de datos utilizados en el reporte
 * de cumplimiento georreferenciado de cartera.
 */

/**
 * Tipos de clasificación de riesgo basados en porcentaje de cumplimiento
 */
export type ClasificacionRiesgo = 'verde' | 'naranja' | 'rojo';

/**
 * Descripción legible de la clasificación
 */
export type DescripcionRiesgo = 'Bajo Riesgo' | 'Riesgo Medio' | 'Alto Riesgo';

/**
 * Punto georreferenciado con información de cumplimiento
 * Representa un crédito individual en el mapa
 */
export interface PuntoCumplimiento {
  // Identificación única
  id: string;

  // Geolocalización (validada)
  latitud: number;
  longitud: number;

  // Cálculo de cumplimiento
  montoColocado: number;
  saldoCapital: number;
  porcentajeCumplimiento: number; // 0-100

  // Clasificación de riesgo
  color: ClasificacionRiesgo;
  clasificacion: DescripcionRiesgo;

  // Información del crédito
  codCredito: string;
  tipoCredito: string;
  situacion: string;
  diasAtraso: number;
  fechaDesembolso: string;
  fechaVencimiento: string;

  // Información del cliente
  codCliente: number;
  nombreCliente: string;
  genero: 'M' | 'F';
  edad?: number;

  // Información de la agencia
  codAgencia: number;
  nombreAgencia: string;
  asesor: string;

  // Información geográfica
  departamento: string;
  provincia: string;
  distrito: string;

  // Metadatos adicionales
  cantidadCreditosCliente?: number;
  esMultiCredito?: boolean;
}

/**
 * Filtros disponibles para el reporte de cumplimiento
 */
export interface FiltrosCumplimiento {
  // Filtros geográficos
  departamento?: string;
  provincia?: string;
  distrito?: string;

  // Filtros de clasificación
  colores?: ClasificacionRiesgo[]; // Múltiples colores permitidos

  // Filtros de agencia y crédito
  agencias?: string[]; // Multi-select
  tiposCredito?: string[]; // Multi-select
  asesores?: string[]; // Multi-select

  // Filtros de montos
  montoMin?: number;
  montoMax?: number;

  // Filtros de porcentaje
  porcentajeMin?: number;
  porcentajeMax?: number;

  // Filtros de estado
  situaciones?: string[]; // VIGENTE, VENCIDO, etc.
  diasAtrasoMin?: number;
  diasAtrasoMax?: number;

  // Filtros de cliente
  genero?: 'M' | 'F';
  edadMin?: number;
  edadMax?: number;

  // Búsqueda de texto
  textoBusqueda?: string; // Busca en cliente o código
}

/**
 * Resumen estadístico del reporte procesado
 */
export interface ReporteSummary {
  // Contadores generales
  totalRegistrosOriginales: number;
  totalRegistrosProcesados: number;
  totalRegistrosExcluidos: number;

  // Detalle de exclusiones
  excluidos: {
    sinUbicacion: number;
    ubicacionInvalida: number;
    saldoCero: number;
    datosIncompletos: number;
    fueraDeRangos: number;
  };

  // Distribución por clasificación
  distribucion: {
    verde: number;
    naranja: number;
    rojo: number;
  };

  // Estadísticas de porcentajes
  porcentajes: {
    min: number;
    max: number;
    promedio: number;
    mediana: number;
  };

  // Estadísticas de montos
  montos: {
    totalColocado: number;
    totalSaldoCapital: number;
    promedioColocado: number;
    promedioSaldo: number;
  };

  // Top agencias con más riesgo
  topAgenciasRiesgo?: {
    agencia: string;
    totalCreditos: number;
    porcentajeRojo: number;
  }[];

  // Timestamp del reporte
  fechaGeneracion: Date;
}

/**
 * Configuración para los rangos de clasificación
 */
export interface RangosClasificacion {
  verde: { min: number; max: number }; // Por defecto: 0-49
  naranja: { min: number; max: number }; // Por defecto: 50-75
  rojo: { min: number; max: number }; // Por defecto: 76-100
}

/**
 * Límites geográficos de Perú para validación
 */
export const LIMITES_PERU = {
  latitud: {
    min: -18.5, // Sur (con margen)
    max: 0.5, // Norte (con margen)
  },
  longitud: {
    min: -82, // Oeste (con margen)
    max: -68, // Este (con margen)
  },
} as const;

/**
 * Rangos por defecto para clasificación de riesgo
 * Alto riesgo (rojo): 76% o más del monto colocado pendiente
 * Riesgo medio (naranja): 50-75% pendiente
 * Bajo riesgo (verde): 49% o menos pendiente
 */
export const RANGOS_DEFAULT: RangosClasificacion = {
  verde: { min: 0, max: 49 },
  naranja: { min: 50, max: 75 },
  rojo: { min: 76, max: 100 },
} as const;

/**
 * Colores en formato hexadecimal para visualización
 */
export const COLORES_CLASIFICACION = {
  verde: '#10B981', // emerald-500 - Bajo riesgo
  naranja: '#F59E0B', // amber-500 - Riesgo medio
  rojo: '#EF4444', // red-500 - Alto riesgo
  gris: '#6B7280', // gray-500 - Sin clasificar
} as const;

/**
 * Configuración de clustering para MapLibre
 */
export interface ClusterConfig {
  radius: number; // Radio en píxeles
  maxZoom: number; // Zoom máximo para clustering
  minZoom?: number; // Zoom mínimo (opcional)
}

/**
 * Configuración por defecto del clustering
 */
export const CLUSTER_CONFIG_DEFAULT: ClusterConfig = {
  radius: 60,
  maxZoom: 14,
  minZoom: 0,
} as const;

/**
 * Razones de exclusión de registros
 */
export enum RazonExclusion {
  SIN_LATITUD = 'sin_latitud',
  SIN_LONGITUD = 'sin_longitud',
  LATITUD_INVALIDA = 'latitud_invalida',
  LONGITUD_INVALIDA = 'longitud_invalida',
  UBICACION_FUERA_PERU = 'ubicacion_fuera_peru',
  SALDO_CERO = 'saldo_capital_cero',
  MONTO_INVALIDO = 'monto_colocado_invalido',
  DATOS_INCOMPLETOS = 'datos_incompletos',
}

/**
 * Registro de un crédito excluido con su razón
 */
export interface RegistroExcluido {
  codCredito: string;
  cliente: string;
  razon: RazonExclusion;
  detalles?: string;
}

/**
 * GeoJSON Feature para integración con MapLibre
 */
export interface CumplimientoFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: PuntoCumplimiento;
}

/**
 * GeoJSON FeatureCollection completa
 */
export interface CumplimientoFeatureCollection {
  type: 'FeatureCollection';
  features: CumplimientoFeature[];
}
