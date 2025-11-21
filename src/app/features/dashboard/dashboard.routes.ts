import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';

/**
 * Rutas del módulo Dashboard
 */
export const DASHBOARD_ROUTES: Routes = [
  {
    path: '',
    component: HomeComponent,
    title: 'Dashboard',
  },
];
