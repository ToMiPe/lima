/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpInterceptorFn } from '@angular/common/http';
import { tap } from 'rxjs';

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startTime = Date.now();

  return next(req).pipe(
    tap({
      next: (response) => {
        const elapsed = Date.now() - startTime;
        if (response.type === 4) {
          // HttpEventType.Response
          // Only log when the response is complete
          console.log(` ${req.method} ${req.url} - ${(response as any).status} (${elapsed}ms)`);
        }
      },
      error: (error) => {
        const elapsed = Date.now() - startTime;
        console.error(` ${req.method} ${req.url} - ${error.status} (${elapsed}ms)`, error);
      },
    }),
  );
};
