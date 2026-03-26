/**
 * Configuración de Indicadores de Control Interno (IPC)
 * Basado en documento oficial "EXPLIC ipc.txt"
 */

import type { HHIConcentrationRange } from '@core/cartera';

/**
 * Dimensiones de análisis según documento
 */
export type IPCDimension = 'ingreso' | 'voluntad' | 'garantia';

/**
 * Tipo de dato del indicador
 */
export type IPCTipo = 'numerico' | 'categorico';

/**
 * Campo del CSV correspondiente al IPC
 */
export type IPCCampo =
  | 'ipc1_1'
  | 'ipc1_2'
  | 'ipc1_3'
  | 'ipc1_4'
  | 'ipc1_5'
  | 'ipc1_6'
  | 'ipc2'
  | 'ipc3'
  | 'ipc4'
  | 'ipc5'
  | 'ipc6'
  | 'ipc7'
  | 'ipc8'
  | 'ipc9'
  | 'ipc10'
  | 'ipc11'
  | 'ipc12'
  | 'ipc13'
  | 'ipc14'
  | 'ipc15'
  | 'ipc16'
  | 'ipc17'
  | 'ipc18'
  | 'ipc19'
  | 'ipc20'
  | 'ipc21'
  | 'ipc22'
  | 'ipc23'
  | 'ipc24';

/**
 * Configuración completa de un IPC
 */
export interface IPCConfig {
  /** Identificador único del IPC */
  id: string;

  /** Código del indicador (IPC1, IPC2, etc.) */
  codigo: string;

  /** Título descriptivo del indicador */
  titulo: string;

  /** Descripción técnica del indicador */
  descripcion: string;

  /** Dimensión de análisis a la que pertenece */
  dimensiones: IPCDimension[];

  /** Tipo de dato del indicador */
  tipo: IPCTipo;

  /** Campo del CSV donde se encuentra el valor */
  campo: IPCCampo;

  /** Unidad de medida (días, %, ratio, etc.) */
  unidad: string;

  /** Color primario para visualización */
  colorPrimario: string;

  /** Rangos personalizados (si aplica, sino usa HHI_CONCENTRATION_RANGES) */
  rangosCustom?: readonly HHIConcentrationRange[];

  /** Categorías para IPCs categóricos */
  categorias?: readonly IPCCategoria[];

  /** Interpretación semántica de los valores */
  interpretacion: {
    bajo: string;
    moderado: string;
    alto: string;
  };

  /** Indica si el indicador tiene interpretación invertida (menor = mejor) */
  invertido?: boolean;
}

/**
 * Categoría para IPCs categóricos (IPC2, IPC8)
 */
export interface IPCCategoria {
  /** Valor de la categoría */
  valor: string;

  /** Etiqueta para mostrar */
  label: string;

  /** Color asociado */
  color: string;

  /** Color hexadecimal */
  colorHex: string;

  /** Nivel de riesgo */
  riskLevel: 'bajo' | 'moderado' | 'medio-alto' | 'alto' | 'critico';
}

/**
 * Configuración de dimensión de análisis
 */
export interface DimensionConfig {
  /** Identificador de la dimensión */
  id: IPCDimension;

  /** Nombre para mostrar */
  nombre: string;

  /** Descripción de la dimensión */
  descripcion: string;

  /** Icono de la dimensión */
  icono: string;

  /** Color asociado */
  color: string;

  /** IPCs que pertenecen a esta dimensión */
  ipcs: IPCConfig[];
}

/**
 * Filtros de base de datos
 * Se aplican ANTES de calcular IPCs
 */
/**
 * Rango de monto predefinido
 */
export interface RangoMonto {
  id: string;
  label: string;
  min: number;
  max: number | null; // null para el último rango (30,000+)
}

/**
 * Rangos fijos de monto de crédito
 */
export const RANGOS_MONTO_CREDITO: RangoMonto[] = [
  { id: 'rango1', label: '100 - 1,000', min: 100, max: 1000 },
  { id: 'rango2', label: '1,001 - 2,000', min: 1001, max: 2000 },
  { id: 'rango3', label: '2,001 - 3,000', min: 2001, max: 3000 },
  { id: 'rango4', label: '3,001 - 4,000', min: 3001, max: 4000 },
  { id: 'rango5', label: '4,001 - 5,000', min: 4001, max: 5000 },
  { id: 'rango6', label: '6,001 - 10,000', min: 6001, max: 10000 },
  { id: 'rango7', label: '10,001 - 15,000', min: 10001, max: 15000 },
  { id: 'rango8', label: '15,001 - 20,000', min: 15001, max: 20000 },
  { id: 'rango9', label: '20,001 - 30,000', min: 20001, max: 30000 },
  { id: 'rango10', label: '30,001+', min: 30001, max: null },
];

/**
 * Rangos fijos de capacidad de pago
 */
export const RANGOS_CAPACIDAD_PAGO: RangoMonto[] = [
  { id: 'cp1', label: '10 - 100', min: 10, max: 100 },
  { id: 'cp2', label: '101 - 300', min: 101, max: 300 },
  { id: 'cp3', label: '301 - 1,000', min: 301, max: 1000 },
  { id: 'cp4', label: '1,001 - 3,000', min: 1001, max: 3000 },
  { id: 'cp5', label: '3,001 - 5,000', min: 3001, max: 5000 },
  { id: 'cp6', label: '5,001 - 10,000', min: 5001, max: 10000 },
  { id: 'cp7', label: 'Más de 10,000', min: 10001, max: null },
];

export interface DataFilters {
  /** Sedes/Agencias seleccionadas (multi-select) */
  sedes: string[];

  /** Géneros seleccionados */
  generos: string[];

  /** Rangos de monto de crédito seleccionados */
  montosCredito: string[]; // IDs de los rangos seleccionados

  /** Productos seleccionados (multi-select) */
  productos: string[];

  /** Zonas geográficas seleccionadas */
  zonas: string[];

  /** Categorías seleccionadas */
  categorias: string[];

  /** Calificaciones CR seleccionadas */
  calificacionesCR: string[];

  /** Rangos de capacidad de pago seleccionados */
  capacidadesPago: string[];
}
