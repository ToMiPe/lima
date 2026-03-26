/**
 * Barrel export para el dominio Cartera
 * Facilita las importaciones organizando todo el dominio
 */

// Modelos
export type { ReporteCartera } from './models/reporte-cartera.interface';
export type {
  ConcentracionAgencia,
  HHIAgenciasReporte,
  HHIConfiguracion,
} from './models/hhi-agencias.interface';
export type {
  HHIItem,
  HHIReporte,
  ConcentracionTipoCredito,
  ConcentracionDepartamento,
  HHITipoCreditoReporte,
  HHIDepartamentoReporte,
} from './models/hhi.interface';
export type {
  HHIConcentrationRange,
} from './models/hhi-concentration-ranges';
export {
  HHI_CONCENTRATION_RANGES,
  getHHIRange,
  getHHIColor,
  getHHIColorHex,
  getHHILabel,
  getHHIRiskLevel,
} from './models/hhi-concentration-ranges';
export type { MoraRange } from './models/mora-ranges';
export { RANGOS_MORA_MONTO, RANGOS_MORA_MONTO_AS_HHI, getMoraRange } from './models/mora-ranges';
export { RANGOS_VOLUNTAD_PAGO } from './models/voluntad-ranges';

// Repositories
export type {
  CarteraRepository,
  EstadisticasCartera,
} from './repositories/cartera-repository.interface';

export { CsvCarteraRepository } from './repositories/csv-cartera.repository';
export { ApiCarteraRepository } from './repositories/api-cartera.repository';

// Services
export { HHICalculatorService } from './services/hhi-calculator.service';

// Tokens
export { CARTERA_REPOSITORY_TOKEN } from './tokens/cartera-repository.token';
