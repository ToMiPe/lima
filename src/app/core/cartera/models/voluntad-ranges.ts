/**
 * Rangos para IPCs de Voluntad de Pago
 *
 * Define los límites de valores con colores asociados para visualización
 * en los indicadores IPC3 (Mora proporcional), IPC6 (Recurrencia de mora),
 * IPC10 (Nivel de contagio), IPC12 (Rechazos)
 *
 * Interpretación:
 * - 0: Sin problema (verde oscuro)
 * - 0-5: Muy bajo (verde)
 * - 5-10: Bajo (verde claro)
 * - 10-20: Moderado (amarillo)
 * - 20-40: Medio-alto (naranja)
 * - 40-60: Alto (rojo claro)
 * - >60: Crítico (rojo oscuro)
 */

import type { HHIConcentrationRange } from './hhi-concentration-ranges';

/**
 * Configuración de rangos para IPCs de voluntad de pago (en %)
 * Estos rangos se usan cuando queremos una escala verde-amarillo-rojo
 * sin penalizar valores fuera de 0-100%
 */
export const RANGOS_VOLUNTAD_PAGO: readonly HHIConcentrationRange[] = [
  {
    from: 0,
    to: 0,
    color: 'text-green-600',
    colorHex: '#16A34A', // Verde oscuro
    label: '0% (Sin problema)',
    riskLevel: 'bajo',
  },
  {
    from: 0.01,
    to: 5,
    color: 'text-green-500',
    colorHex: '#22C55E', // Verde
    label: '0% - 5%',
    riskLevel: 'bajo',
  },
  {
    from: 5.01,
    to: 10,
    color: 'text-lime-500',
    colorHex: '#84CC16', // Verde claro
    label: '5% - 10%',
    riskLevel: 'bajo',
  },
  {
    from: 10.01,
    to: 20,
    color: 'text-yellow-500',
    colorHex: '#EAB308', // Amarillo
    label: '10% - 20%',
    riskLevel: 'moderado',
  },
  {
    from: 20.01,
    to: 40,
    color: 'text-orange-500',
    colorHex: '#F97316', // Naranja
    label: '20% - 40%',
    riskLevel: 'medio-alto',
  },
  {
    from: 40.01,
    to: 60,
    color: 'text-red-500',
    colorHex: '#EF4444', // Rojo claro
    label: '40% - 60%',
    riskLevel: 'alto',
  },
  {
    from: 60.01,
    to: Infinity,
    color: 'text-red-600',
    colorHex: '#DC2626', // Rojo oscuro
    label: '> 60%',
    riskLevel: 'critico',
  },
];
