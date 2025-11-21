import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { TokenService } from '../services/token.service';

/**
 * Interceptor para manejar errores HTTP globales.
 *
 * IMPORTANTE: NO inyecta AuthState para evitar dependencias circulares.
 * Usa TokenService directamente para limpiar tokens.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      switch (error.status) {
        case 401:
          // Diferenciar entre error de login/profile y token expirado
          if (
            req.url.includes('/auth/login') ||
            req.url.includes('/auth/register') ||
            req.url.includes('/auth/change-password') ||
            req.url.includes('/auth/profile')
          ) {
            // Error en endpoints de auth/profile - el componente maneja el error
            console.warn('⚠️ Error 401 - Manejado por componente');
            // NO llamar a logout() ni redirigir - solo propagar el error
          } else if (req.url.includes('/auth/refresh')) {
            // Error al refrescar token - cerrar sesión
            console.warn('⚠️ Error 401 - Token refresh falló, cerrando sesión');
            tokenService.clearAllTokens();
            router.navigate(['/auth/login']);
          } else if (req.url.includes('/auth/')) {
            // Otros endpoints de auth - NO cerrar sesión
            console.warn('⚠️ Error 401 en endpoint de auth:', req.url);
          } else {
            // Token expirado en request normal (endpoints protegidos) - cerrar sesión
            console.warn('⚠️ Error 401 - Token inválido/expirado, cerrando sesión');
            tokenService.clearAllTokens();
            router.navigate(['/auth/login']);
          }
          break;

        case 403:
          // Diferenciar entre error de login/profile y acceso denegado real
          if (
            req.url.includes('/auth/login') ||
            req.url.includes('/auth/register') ||
            req.url.includes('/auth/change-password') ||
            req.url.includes('/auth/profile')
          ) {
            // Error en endpoints de auth/profile - el componente maneja el error
            console.warn('⚠️ Error 403 - Credenciales/datos inválidos (manejado por componente)');
            // NO redirigir - dejar que el componente maneje el error
          } else {
            // Acceso denegado real - usuario autenticado pero sin permisos
            console.warn('⚠️ Error 403 - Acceso denegado a recurso protegido');
            router.navigate(['/unauthorized']);
          }
          break;

        case 404:
          console.warn('⚠️ Error 404 - Recurso no encontrado:', req.url);
          break;

        case 500:
          // Error del servidor
          console.error('❌ Error 500 - Error del servidor:', error);
          break;

        default:
          console.error('❌ Error HTTP:', error.status, error.message);
      }

      // SIEMPRE propagar el error para que el componente lo maneje
      return throwError(() => error);
    }),
  );
};
