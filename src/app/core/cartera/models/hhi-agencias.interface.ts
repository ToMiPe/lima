/**
 * Interfaces para el análisis HHI (Herfindahl-Hirschman Index) por Agencias
 * Permite evaluar la concentración de riesgo en la cartera
 */

export interface ConcentracionAgencia {
  agencia: string;
  monto: number; // Suma de saldo_capital
  participacion: number; // % del total de la cartera
  numeroOperaciones: number; // Cantidad de operaciones
}

export interface HHIAgenciasReporte {
  hhi: number; // Índice HHI calculado
  nivelRiesgo: 'bajo' | 'moderado' | 'alto';
  interpretacion: string; // Descripción del nivel
  totalCartera: number; // Monto total de la cartera
  fechaCalculo: Date; // Cuando se calculó
  agencias: ConcentracionAgencia[]; // Detalle por agencia
}

export interface HHIEvolucion {
  mes: string;
  hhi: number;
  fecha: Date;
}

export interface HHIConfiguracion {
  umbralBajo: number; // < 1500
  umbralModerado: number; // 1500-2500
  // >= 2500 es alto
}
