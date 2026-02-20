import { Routes } from '@angular/router';

export const reportsRoutes: Routes = [
  {
    path: '',
    redirectTo: 'hhi-agencias',
    pathMatch: 'full',
  },
  {
    path: 'hhi-agencias',
    title: 'HHI por Agencias',
    loadComponent: () =>
      import('./pages/hhi-agencias/hhi-agencias.component').then(
        (m) => m.HHIAgenciasComponent
      ),
  },
  {
    path: 'hhi-tipo-credito',
    title: 'HHI por Tipo de Crédito',
    loadComponent: () =>
      import('./pages/hhi-tipo-credito/hhi-tipo-credito.component').then(
        (m) => m.HHITipoCreditoComponent
      ),
  },
  {
    path: 'hhi-destino-credito',
    title: 'HHI por Destino de Crédito',
    loadComponent: () =>
      import('./pages/hhi-destino-credito/hhi-destino-credito.component').then(
        (m) => m.HHIDestinoCreditoComponent
      ),
  },
  {
    path: 'hhi-plazo',
    title: 'HHI por Número de Cuotas',
    loadComponent: () =>
      import('./pages/hhi-plazo/hhi-plazo.component').then((m) => m.HHIPlazoComponent),
  },
  {
    path: 'hhi-zona-geografica',
    title: 'HHI por Zona Geográfica',
    loadComponent: () =>
      import('./pages/hhi-zona-geografica/hhi-zona-geografica.component').then(
        (m) => m.HHIZonaGeograficaComponent
      ),
  },
  {
    path: 'hhi-sector-economico',
    title: 'HHI por Sector Económico',
    loadComponent: () =>
      import('./pages/hhi-sector-economico/hhi-sector-economico.component').then(
        (m) => m.HHISectorEconomicoComponent
      ),
  },
  {
    path: 'hhi-calificacion-cr',
    title: 'HHI por Calificación CR',
    loadComponent: () =>
      import('./pages/hhi-calificacion-cr/hhi-calificacion-cr.component').then(
        (m) => m.HHICalificacionCRComponent
      ),
  },
  {
    path: 'cumplimiento',
    title: 'Reporte de Cumplimiento',
    loadChildren: () => import('./cumplimiento/cumplimiento.routes'),
  },
  {
    path: 'ipc',
    title: 'Indicadores de Control Interno (IPC)',
    loadComponent: () =>
      import('./pages/ipc-unified/ipc-unified.component').then((m) => m.IPCUnifiedComponent),
  },
  // Futuras rutas para otros reportes HHI
];
