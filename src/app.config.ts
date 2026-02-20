import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import localeEsPe from '@angular/common/locales/es-PE';
import {
  provideRouter,
  withComponentInputBinding,
  withEnabledBlockingInitialNavigation,
  withInMemoryScrolling,
  withRouterConfig,
} from '@angular/router';
import Aura from '@primeuix/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';

import { spanishTranslation } from '@core/i18N/es';
import { MessageService } from 'primeng/api';
import { registerLocaleData } from '@angular/common';
import {
  authInterceptor,
  errorInterceptor,
  loggingInterceptor,
  tokenRefreshInterceptor,
} from '@core/auth/interceptors';
import { CARTERA_REPOSITORY_TOKEN, CsvCarteraRepository } from '@core/cartera';
import { provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import { TooltipComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
// import { ApiCarteraRepository } from '@core/cartera';

// Registrar componentes de ECharts necesarios
echarts.use([PieChart, TooltipComponent, LegendComponent, CanvasRenderer]);

// Registrar el locale español (Perú)
registerLocaleData(localeEsPe);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      appRoutes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withEnabledBlockingInitialNavigation(),
      withRouterConfig({ onSameUrlNavigation: 'reload' }),
      withComponentInputBinding(),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        tokenRefreshInterceptor,
        errorInterceptor,
        loggingInterceptor, // Solo en desarrollo
      ]),
    ),
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideBrowserGlobalErrorListeners(),
    providePrimeNG({
      theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } },
      ripple: false,
      translation: spanishTranslation,
    }),
    MessageService,
    { provide: LOCALE_ID, useValue: 'es-PE' },
    provideEchartsCore({ echarts }),

    // 🎯 CONFIGURACIÓN DEL REPOSITORY PATTERN
    // Cambia fácilmente entre implementaciones:

    // ✅ OPCIÓN 1: CSV Local (actual)
    { provide: CARTERA_REPOSITORY_TOKEN, useClass: CsvCarteraRepository },

    // 🚀 OPCIÓN 2: API REST (para el futuro - solo descomenta esta línea y comenta la de arriba)
    // { provide: CARTERA_REPOSITORY_TOKEN, useClass: ApiCarteraRepository },
  ],
};
