import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login'),
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register'),
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./forgot/forgot.password'),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
];
