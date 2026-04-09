import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';
import { Router } from '@angular/router';

/**
 * Interceptor para manejar refresh de tokens cuando expiran.
 *
 * IMPORTANTE: NO inyecta AuthState para evitar dependencias circulares.
 * En su lugar, simplemente redirige al login cuando el token expira.
 */
export const tokenRefreshInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es error 401 (no autorizado)
      if (error.status === 401) {
        // Evitar redirect en endpoints de auth
        if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
          return throwError(() => error);
        }
        // Limpiar tokens
        tokenService.clearAllTokens();

        // Redirigir a login
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: router.url },
        });
      }

      return throwError(() => error);
    }),
  );
};
