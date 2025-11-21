/**
 * Interfaces genéricas para reportes de concentración HHI
 * Permite reutilización para diferentes tipos de agrupación
 */

export interface HHIItem {
  /** Nombre del elemento (agencia, tipo de crédito, departamento, etc.) */
  nombre: string;
  /** Monto total del saldo de capital */
  monto: number;
  /** Número de operaciones */
  numeroOperaciones: number;
  /** Porcentaje de participación en la cartera total */
  participacion: number;
}

export interface HHIReporte<T extends HHIItem = HHIItem> {
  /** Índice HHI calculado */
  hhi: number;
  /** Nivel de riesgo basado en los umbrales HHI */
  nivelRiesgo: 'bajo' | 'moderado' | 'alto';
  /** Interpretación textual del nivel de riesgo */
  interpretacion: string;
  /** Monto total de la cartera analizada */
  totalCartera: number;
  /** Fecha y hora del cálculo */
  fechaCalculo: Date;
  /** Items ordenados por monto descendente */
  items: T[];
}

export interface HHIConfiguracion {
  /** Umbral inferior para considerar concentración baja (típicamente 1500) */
  umbralBajo: number;
  /** Umbral superior para considerar concentración moderada (típicamente 2500) */
  umbralModerado: number;
}

/**
 * Tipos específicos para diferentes agrupaciones
 */

export interface ConcentracionAgencia extends HHIItem {
  /** Para compatibilidad con código existente */
  agencia: string;
}

export interface ConcentracionTipoCredito extends HHIItem {
  /** Tipo de crédito específico */
  tipoCredito: string;
}

export interface ConcentracionDepartamento extends HHIItem {
  /** Departamento específico */
  departamento: string;
}

export interface ConcentracionDestinoCredito extends HHIItem {
  /** Destino de crédito específico */
  destinoCredito: string;
}

export interface ConcentracionPlazo extends HHIItem {
  /** Número de cuotas/plazo del crédito */
  plazo: string;
}

export interface ConcentracionZonaGeografica extends HHIItem {
  /** Zona geográfica específica */
  zonaGeografica: string;
}

export interface ConcentracionSectorEconomico extends HHIItem {
  /** Sector económico específico */
  sectorEconomico: string;
}

export interface ConcentracionCalificacionCR extends HHIItem {
  /** Calificación en Central de Riesgos */
  calificacionCR: string;
}

/**
 * Reportes específicos que extienden la interface genérica
 */

export interface HHIAgenciasReporte extends HHIReporte<ConcentracionAgencia> {
  /** Mantiene compatibilidad - items mapeados como agencias */
  agencias: ConcentracionAgencia[];
}

export interface HHITipoCreditoReporte extends HHIReporte<ConcentracionTipoCredito> {
  /** Items específicos para tipos de crédito */
  tipos: ConcentracionTipoCredito[];
}

export interface HHIDepartamentoReporte extends HHIReporte<ConcentracionDepartamento> {
  /** Items específicos para departamentos */
  departamentos: ConcentracionDepartamento[];
}

export interface HHIDestinoCreditoReporte extends HHIReporte<ConcentracionDestinoCredito> {
  /** Items específicos para destinos de crédito */
  destinos: ConcentracionDestinoCredito[];
}

export interface HHIPlazoReporte extends HHIReporte<ConcentracionPlazo> {
  /** Items específicos para plazos/número de cuotas */
  plazos: ConcentracionPlazo[];
}

export interface HHIZonaGeograficaReporte extends HHIReporte<ConcentracionZonaGeografica> {
  /** Items específicos para zonas geográficas */
  zonas: ConcentracionZonaGeografica[];
}

export interface HHISectorEconomicoReporte extends HHIReporte<ConcentracionSectorEconomico> {
  /** Items específicos para sectores económicos */
  sectores: ConcentracionSectorEconomico[];
}

export interface HHICalificacionCRReporte extends HHIReporte<ConcentracionCalificacionCR> {
  /** Items específicos para calificaciones CR */
  calificaciones: ConcentracionCalificacionCR[];
}
