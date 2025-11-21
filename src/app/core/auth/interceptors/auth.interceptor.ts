import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { TokenService } from '../services/token.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenService);

  // URLs que no necesitan token
  const excludedUrls = ['/auth/login', '/auth/register', '/auth/refresh'];
  const shouldExclude = excludedUrls.some((url) => req.url.includes(url));

  if (shouldExclude) {
    return next(req);
  }

  const token = tokenService.getAccessToken();

  if (token && !tokenService.isTokenExpired(token)) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(authReq);
  }

  return next(req);
};
