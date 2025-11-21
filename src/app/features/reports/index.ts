/**
 * Barrel exports para el módulo de reportes
 * Facilita las importaciones de componentes relacionados con reportes
 */

// Pages
export { HHIAgenciasComponent } from './pages/hhi-agencias/hhi-agencias.component';

// Components
export { HHIWidgetComponent } from './components/dashboard/hhi-widget.component';

// Cumplimiento Report
export { CumplimientoMapComponent } from './cumplimiento/pages/cumplimiento-map.component';
export { CumplimientoReportService } from './services/cumplimiento-report.service';
export * from './models/cumplimiento-report.model';

// Routes
export { reportsRoutes } from './reports.routes';
