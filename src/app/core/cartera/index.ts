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
