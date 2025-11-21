import { Routes } from '@angular/router';
import { authGuard } from '@core/auth/guards';

export const PROFILE_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/profile').then((m) => m.Profile),
    canActivate: [authGuard],
  },
];
