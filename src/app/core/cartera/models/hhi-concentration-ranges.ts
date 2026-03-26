/**
 * Configuración de rangos de concentración HHI (Herfindahl-Hirschman Index)
 *
 * Define los límites de concentración con sus colores asociados para
 * visualización en reportes y análisis de cartera.
 *
 * Interpretación:
 * - < 0%: Valores anómalos (gris oscuro)
 * - 0-20%: Concentración baja/saludable (verde)
 * - 20-40%: Concentración moderada (naranja)
 * - 40-60%: Concentración media-alta (amarillo)
 * - 60-80%: Concentración alta (celeste - requiere atención)
 * - 80-100%: Concentración muy alta (rojo - riesgo crítico)
 * - > 100%: Valores anómalos (gris oscuro)
 */

/**
 * Interfaz que define un rango de concentración HHI
 */
export interface HHIConcentrationRange {
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
  riskLevel: 'anomalo' | 'bajo' | 'moderado' | 'medio-alto' | 'alto' | 'critico';
}

/**
 * Configuración centralizada de rangos de concentración HHI.
 * Usar este array como única fuente de verdad para todos los reportes.
 */
export const HHI_CONCENTRATION_RANGES: readonly HHIConcentrationRange[] = [
  {
    from: -Infinity,
    to: 0,
    color: 'text-gray-700',
    colorHex: '#374151',
    label: '< 0%',
    riskLevel: 'anomalo',
  },
  {
    from: 0,
    to: 20,
    color: 'text-green-600',
    colorHex: '#16A34A',
    label: '0% - 20%',
    riskLevel: 'bajo',
  },
  {
    from: 20.001,
    to: 40,
    color: 'text-orange-500',
    colorHex: '#F97316',
    label: '20% - 40%',
    riskLevel: 'moderado',
  },
  {
    from: 40.001,
    to: 60,
    color: 'text-yellow-500',
    colorHex: '#EAB308',
    label: '40% - 60%',
    riskLevel: 'medio-alto',
  },
  {
    from: 60.001,
    to: 80,
    color: 'text-cyan-500',
    colorHex: '#06B6D4',
    label: '60% - 80%',
    riskLevel: 'alto',
  },
  {
    from: 80.001,
    to: 100,
    color: 'text-red-600',
    colorHex: '#DC2626',
    label: '80% - 100%',
    riskLevel: 'critico',
  },
  {
    from: 100.001,
    to: Infinity,
    color: 'text-gray-700',
    colorHex: '#374151',
    label: '> 100%',
    riskLevel: 'anomalo',
  },
];

/**
 * Obtiene el rango de concentración correspondiente a un valor HHI dado
 * @param value Valor HHI a clasificar (en porcentaje, ej: 45.5)
 * @returns El rango de concentración correspondiente
 */
export function getHHIRange(value: number): HHIConcentrationRange {
  const range = HHI_CONCENTRATION_RANGES.find((r) => value > r.from && value <= r.to);

  return range || HHI_CONCENTRATION_RANGES[0]; // Default: anomalo
}

/**
 * Obtiene el color Tailwind CSS para un valor HHI dado
 * @param value Valor HHI a clasificar
 * @returns Clase CSS de Tailwind para el color
 */
export function getHHIColor(value: number): string {
  return getHHIRange(value).color;
}

/**
 * Obtiene el color hexadecimal para un valor HHI dado
 * @param value Valor HHI a clasificar
 * @returns Color en formato hexadecimal
 */
export function getHHIColorHex(value: number): string {
  return getHHIRange(value).colorHex;
}

/**
 * Obtiene la etiqueta del rango para un valor HHI dado
 * @param value Valor HHI a clasificar
 * @returns Etiqueta descriptiva del rango
 */
export function getHHILabel(value: number): string {
  return getHHIRange(value).label;
}

/**
 * Obtiene el nivel de riesgo para un valor HHI dado
 * @param value Valor HHI a clasificar
 * @returns Nivel de riesgo asociado
 */
export function getHHIRiskLevel(value: number): string {
  return getHHIRange(value).riskLevel;
}
