/**
 * Rangos de mora por monto (en Soles peruanos)
 *
 * Define los límites de mora con colores asociados para visualización
 * en los indicadores IPC1.1 a IPC1.6 (mora por tramos de días)
 *
 * Interpretación:
 * - 0 S/: Sin mora (verde oscuro)
 * - 0.01-100: Mora mínima (verde claro)
 * - 100-500: Mora baja (amarillo verdoso)
 * - 500-1000: Mora moderada (amarillo)
 * - 1000-5000: Mora considerable (naranja)
 * - 5000-10000: Mora alta (rojo claro)
 * - >10000: Mora crítica (rojo oscuro)
 */

import type { HHIConcentrationRange } from './hhi-concentration-ranges';

export interface MoraRange {
  /** Límite inferior del rango (inclusive) */
  from: number;

  /** Límite superior del rango (inclusive) */
  to: number;

  /** Color asignado al rango en formato Tailwind CSS */
  color: string;

  /** Color en formato hexadecimal para uso en charts/gráficos */
  colorHex: string;

  /** Etiqueta descriptiva del rango */
  label: string;

  /** Nivel de riesgo asociado */
  riskLevel: 'sin-mora' | 'minima' | 'baja' | 'moderada' | 'considerable' | 'alta' | 'critica';
}

/**
 * Configuración de rangos de mora por monto (en Soles peruanos)
 */
export const RANGOS_MORA_MONTO: readonly MoraRange[] = [
  {
    from: 0,
    to: 0,
    color: 'text-green-600',
    colorHex: '#16A34A', // Verde oscuro
    label: '0 S/ (Sin mora)',
    riskLevel: 'sin-mora',
  },
  {
    from: 0.01,
    to: 100,
    color: 'text-green-400',
    colorHex: '#4ADE80', // Verde claro
    label: '0.01 - 100 S/',
    riskLevel: 'minima',
  },
  {
    from: 100.01,
    to: 500,
    color: 'text-lime-500',
    colorHex: '#A3E635', // Amarillo verdoso
    label: '100 - 500 S/',
    riskLevel: 'baja',
  },
  {
    from: 500.01,
    to: 1000,
    color: 'text-yellow-500',
    colorHex: '#EAB308', // Amarillo
    label: '500 - 1,000 S/',
    riskLevel: 'moderada',
  },
  {
    from: 1000.01,
    to: 5000,
    color: 'text-orange-500',
    colorHex: '#F97316', // Naranja
    label: '1,000 - 5,000 S/',
    riskLevel: 'considerable',
  },
  {
    from: 5000.01,
    to: 10000,
    color: 'text-red-500',
    colorHex: '#EF4444', // Rojo claro
    label: '5,000 - 10,000 S/',
    riskLevel: 'alta',
  },
  {
    from: 10000.01,
    to: Infinity,
    color: 'text-red-600',
    colorHex: '#DC2626', // Rojo oscuro
    label: '> 10,000 S/',
    riskLevel: 'critica',
  },
];

/**
 * Convierte los rangos de mora a formato HHIConcentrationRange para compatibilidad
 */
export const RANGOS_MORA_MONTO_AS_HHI: readonly HHIConcentrationRange[] = RANGOS_MORA_MONTO.map(
  (r) => ({
    from: r.from,
    to: r.to,
    color: r.color,
    colorHex: r.colorHex,
    label: r.label,
    riskLevel:
      r.riskLevel === 'sin-mora'
        ? 'bajo'
        : r.riskLevel === 'minima'
          ? 'bajo'
          : r.riskLevel === 'baja'
            ? 'moderado'
            : r.riskLevel === 'moderada'
              ? 'moderado'
              : r.riskLevel === 'considerable'
                ? 'medio-alto'
                : r.riskLevel === 'alta'
                  ? 'alto'
                  : 'critico',
  }),
);

/**
 * Obtiene el rango de mora correspondiente a un monto dado
 * @param value Monto de mora en Soles peruanos (S/)
 * @returns El rango de mora correspondiente
 */
export function getMoraRange(value: number): MoraRange {
  const range = RANGOS_MORA_MONTO.find((r) => value >= r.from && value <= r.to);
  return range || RANGOS_MORA_MONTO[0]; // Default: sin mora
}
