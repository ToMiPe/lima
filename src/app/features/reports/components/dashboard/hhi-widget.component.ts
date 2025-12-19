import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SkeletonModule } from 'primeng/skeleton';

import {
  CARTERA_REPOSITORY_TOKEN,
  type CarteraRepository,
  type HHIAgenciasReporte,
} from '@core/cartera';

@Component({
  selector: 'app-hhi-widget',
  imports: [CommonModule, RouterModule, ButtonModule, SkeletonModule],
  templateUrl: './hhi-widget.component.html',
})
export class HHIWidgetComponent implements OnInit {
  private carteraRepository = inject(CARTERA_REPOSITORY_TOKEN) as CarteraRepository;

  reporteAgencias = signal<HHIAgenciasReporte | null>(null);
  reporteTipoCredito = signal<HHIAgenciasReporte | null>(null);
  reporteDestinoCredito = signal<HHIAgenciasReporte | null>(null);
  reportePlazo = signal<HHIAgenciasReporte | null>(null);
  reporteZonaGeografica = signal<HHIAgenciasReporte | null>(null);
  reporteSectorEconomico = signal<HHIAgenciasReporte | null>(null);
  reporteCalificacionCR = signal<HHIAgenciasReporte | null>(null);

  reporteMayorRiesgo = signal<{
    titulo: string;
    ruta: string;
    datos: HHIAgenciasReporte;
  } | null>(null);

  isLoading = signal(false);

  ngOnInit() {
    this.cargarDatos();
  }

  async cargarDatos() {
    this.isLoading.set(true);

    try {
      const [
        datosAgencias,
        datosTipoCredito,
        datosDestinoCredito,
        datosPlazo,
        datosZonaGeografica,
        datosSectorEconomico,
        datosCalificacionCR,
      ] = await Promise.all([
        this.carteraRepository.getHHIAgencias(),
        this.carteraRepository.getHHITipoCredito(),
        this.carteraRepository.getHHIDestinoCredito(),
        this.carteraRepository.getHHIPlazo(),
        this.carteraRepository.getHHIZonaGeografica(),
        this.carteraRepository.getHHISectorEconomico(),
        this.carteraRepository.getHHICalificacionCR(),
      ]);

      this.reporteAgencias.set(datosAgencias);
      this.reporteTipoCredito.set(datosTipoCredito);
      this.reporteDestinoCredito.set(datosDestinoCredito);
      this.reportePlazo.set(datosPlazo);
      this.reporteZonaGeografica.set(datosZonaGeografica);
      this.reporteSectorEconomico.set(datosSectorEconomico);
      this.reporteCalificacionCR.set(datosCalificacionCR);

      // Determinar el reporte con mayor HHI (excluyendo Agencias y Tipo de Crédito que ya se muestran)
      const reportesComparar = [
        {
          titulo: 'Destino de Crédito',
          ruta: '/reports/hhi-destino-credito',
          datos: datosDestinoCredito,
        },
        { titulo: 'Número de Cuotas', ruta: '/reports/hhi-plazo', datos: datosPlazo },
        {
          titulo: 'Zona Geográfica',
          ruta: '/reports/hhi-zona-geografica',
          datos: datosZonaGeografica,
        },
        {
          titulo: 'Sector Económico',
          ruta: '/reports/hhi-sector-economico',
          datos: datosSectorEconomico,
        },
        {
          titulo: 'Calificación CR',
          ruta: '/reports/hhi-calificacion-cr',
          datos: datosCalificacionCR,
        },
      ];

      const mayorRiesgo = reportesComparar.reduce((max, reporte) =>
        reporte.datos.hhi > max.datos.hhi ? reporte : max,
      );

      this.reporteMayorRiesgo.set(mayorRiesgo);
    } catch (error) {
      console.error('Error cargando HHI widget:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getTop3(
    items: {
      agencia: string;
      participacion: number;
      monto: number;
      numeroOperaciones: number;
    }[],
  ) {
    return items.slice(0, 3);
  }

  getSeverity(nivel: 'bajo' | 'moderado' | 'alto'): 'success' | 'warn' | 'danger' {
    switch (nivel) {
      case 'bajo':
        return 'success';
      case 'moderado':
        return 'warn';
      case 'alto':
        return 'danger';
    }
  }

  getParticipacionColor(participacion: number): string {
    if (participacion > 20) return 'text-danger';
    if (participacion > 10) return 'text-warning';
    return 'text-success';
  }
}
