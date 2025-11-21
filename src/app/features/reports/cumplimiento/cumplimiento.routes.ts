import { Routes } from '@angular/router';

/**
 * Rutas del módulo de Cumplimiento
 */
export const CUMPLIMIENTO_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/cumplimiento-map.component').then((m) => m.CumplimientoMapComponent),
    data: {
      title: 'Reporte de Cumplimiento',
      breadcrumb: 'Cumplimiento',
    },
  },
  {
    path: ':departamento',
    loadComponent: () =>
      import('./pages/cumplimiento-map.component').then((m) => m.CumplimientoMapComponent),
    data: {
      title: 'Reporte de Cumplimiento por Departamento',
      breadcrumb: 'Cumplimiento',
    },
  },
];

export default CUMPLIMIENTO_ROUTES;
