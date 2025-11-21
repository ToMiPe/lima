import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  // Dashboard - Pantalla principal
  {
    path: '',
    loadChildren: () =>
      import('./app/features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  // Reporte de Mapa por Departamento
  {
    path: 'reports/map/:department',
    loadComponent: () =>
      import('./app/features/reports-maps/pages/report-map-depto.component').then(
        (m) => m.ReportMapDeptoComponent,
      ),
  },
  // Reportes de Concentración HHI
  {
    path: 'reports',
    loadChildren: () =>
      import('./app/features/reports/reports.routes').then((m) => m.reportsRoutes),
  },
  // Rutas de desarrollo/testing
  // Fallback
  {
    path: '**',
    redirectTo: '',
  },
];
