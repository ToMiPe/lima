import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabsModule } from 'primeng/tabs';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';

import {
  CARTERA_REPOSITORY_TOKEN,
  type CarteraRepository,
  type HHIAgenciasReporte,
} from '@core/cartera';

@Component({
  selector: 'app-hhi-widget',
  standalone: true,
  imports: [CommonModule, RouterModule, CardModule, ButtonModule, TagModule, TabsModule, SkeletonModule, TooltipModule],
  template: `
    <!-- Grid de 3 Cards Principales -->
    <div class="grid mb-4">
      <!-- Card 1: HHI por Agencias -->
      <div class="col-12 lg:col-4">
        <div class="hhi-card" routerLink="/reports/hhi-agencias">
          <div class="card-header">
            <div class="flex align-items-center gap-2 mb-3">
              <div class="icon-wrapper bg-blue-100">
                <i class="pi pi-building text-xl text-blue-600"></i>
              </div>
              <div class="flex-1">
                <h4 class="card-title">HHI por Agencias</h4>
                @if (reporteAgencias(); as datos) {
                  <span class="record-count">
                    HHI: {{ datos.hhi | number: '1.0-0' : 'es-PE' }} -
                    <span [class]="'severity-' + datos.nivelRiesgo">{{ datos.nivelRiesgo.toUpperCase() }}</span>
                  </span>
                }
              </div>
              <button class="nav-button">
                <i class="pi pi-arrow-right text-blue-600"></i>
              </button>
            </div>
          </div>

          @if (reporteAgencias(); as datos) {
            <div class="card-body">
              <p class="card-description">Top 3 agencias con mayor concentración:</p>
              <div class="top3-list">
                @for (item of getTop3(datos.agencias); track item.agencia; let i = $index) {
                  <div class="top3-item">
                    <div class="rank-badge" [attr.data-rank]="i + 1">{{ i + 1 }}</div>
                    <div class="flex-1 min-w-0">
                      <div class="item-name">{{ item.agencia }}</div>
                      <div class="item-ops">{{ item.numeroOperaciones | number: '1.0-0' : 'es-PE' }} ops</div>
                    </div>
                    <div class="text-right">
                      <div [class]="'item-percent ' + getParticipacionColor(item.participacion)">
                        {{ item.participacion | number: '1.1-1' : 'es-PE' }}%
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="card-body">
              <p-skeleton height="1rem" class="mb-2" />
              @for (i of [1, 2, 3]; track i) {
                <p-skeleton height="2.5rem" class="mb-2" />
              }
            </div>
          }
        </div>
      </div>

      <!-- Card 2: HHI por Tipo de Crédito -->
      <div class="col-12 lg:col-4">
        <div class="hhi-card" routerLink="/reports/hhi-tipo-credito">
          <div class="card-header">
            <div class="flex align-items-center gap-2 mb-3">
              <div class="icon-wrapper bg-green-100">
                <i class="pi pi-tags text-xl text-green-600"></i>
              </div>
              <div class="flex-1">
                <h4 class="card-title">HHI por Tipo de Crédito</h4>
                @if (reporteTipoCredito(); as datos) {
                  <span class="record-count">
                    HHI: {{ datos.hhi | number: '1.0-0' : 'es-PE' }} -
                    <span [class]="'severity-' + datos.nivelRiesgo">{{ datos.nivelRiesgo.toUpperCase() }}</span>
                  </span>
                }
              </div>
              <button class="nav-button">
                <i class="pi pi-arrow-right text-green-600"></i>
              </button>
            </div>
          </div>

          @if (reporteTipoCredito(); as datos) {
            <div class="card-body">
              <p class="card-description">Top 3 tipos con mayor concentración:</p>
              <div class="top3-list">
                @for (item of getTop3(datos.agencias); track item.agencia; let i = $index) {
                  <div class="top3-item">
                    <div class="rank-badge" [attr.data-rank]="i + 1">{{ i + 1 }}</div>
                    <div class="flex-1 min-w-0">
                      <div class="item-name">{{ item.agencia }}</div>
                      <div class="item-ops">{{ item.numeroOperaciones | number: '1.0-0' : 'es-PE' }} ops</div>
                    </div>
                    <div class="text-right">
                      <div [class]="'item-percent ' + getParticipacionColor(item.participacion)">
                        {{ item.participacion | number: '1.1-1' : 'es-PE' }}%
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          } @else {
            <div class="card-body">
              <p-skeleton height="1rem" class="mb-2" />
              @for (i of [1, 2, 3]; track i) {
                <p-skeleton height="2.5rem" class="mb-2" />
              }
            </div>
          }
        </div>
      </div>

      <!-- Card 3: HHI con Mayor Riesgo -->
      <div class="col-12 lg:col-4">
        @if (reporteMayorRiesgo(); as riesgo) {
          <div class="hhi-card" [routerLink]="riesgo.ruta">
            <div class="card-header">
              <div class="flex align-items-center gap-2 mb-3">
                <div class="icon-wrapper bg-orange-100">
                  <i class="pi pi-exclamation-triangle text-xl text-orange-600"></i>
                </div>
                <div class="flex-1">
                  <h4 class="card-title">Mayor Concentración</h4>
                  <span class="record-count">
                    {{ riesgo.titulo }} - HHI: {{ riesgo.datos.hhi | number: '1.0-0' : 'es-PE' }}
                  </span>
                </div>
                <button class="nav-button">
                  <i class="pi pi-arrow-right text-orange-600"></i>
                </button>
              </div>
            </div>

            <div class="card-body">
              <p class="card-description">Top 3 con mayor riesgo de concentración:</p>
              <div class="top3-list">
                @for (item of getTop3(riesgo.datos.agencias); track item.agencia; let i = $index) {
                  <div class="top3-item">
                    <div class="rank-badge" [attr.data-rank]="i + 1">{{ i + 1 }}</div>
                    <div class="flex-1 min-w-0">
                      <div class="item-name">{{ item.agencia }}</div>
                      <div class="item-ops">{{ item.numeroOperaciones | number: '1.0-0' : 'es-PE' }} ops</div>
                    </div>
                    <div class="text-right">
                      <div [class]="'item-percent ' + getParticipacionColor(item.participacion)">
                        {{ item.participacion | number: '1.1-1' : 'es-PE' }}%
                      </div>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        } @else {
          <div class="hhi-card">
            <div class="card-header">
              <p-skeleton height="3rem" />
            </div>
            <div class="card-body">
              <p-skeleton height="1rem" class="mb-2" />
              @for (i of [1, 2, 3]; track i) {
                <p-skeleton height="2.5rem" class="mb-2" />
              }
            </div>
          </div>
        }
      </div>
    </div>

    <!-- Acceso Rápido a Todos los Análisis -->
    <div class="card">
      <div class="flex align-items-center gap-2 mb-3">
        <i class="pi pi-chart-pie text-lg text-blue-500"></i>
        <h4 class="text-sm font-semibold text-900 m-0">Todos los Análisis de Concentración</h4>
      </div>
      <div class="grid">
        <div class="col-12 sm:col-6 lg:col-3">
          <button
            pButton
            label="Agencias"
            icon="pi pi-building"
            class="p-button-outlined p-button-sm w-full justify-content-start"
            routerLink="/reports/hhi-agencias"
          ></button>
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <button
            pButton
            label="Tipo de Crédito"
            icon="pi pi-tags"
            class="p-button-outlined p-button-sm w-full justify-content-start"
            routerLink="/reports/hhi-tipo-credito"
          ></button>
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <button
            pButton
            label="Destino de Crédito"
            icon="pi pi-compass"
            class="p-button-outlined p-button-sm w-full justify-content-start"
            routerLink="/reports/hhi-destino-credito"
          ></button>
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <button
            pButton
            label="Número de Cuotas"
            icon="pi pi-calendar"
            class="p-button-outlined p-button-sm w-full justify-content-start"
            routerLink="/reports/hhi-plazo"
          ></button>
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <button
            pButton
            label="Zona Geográfica"
            icon="pi pi-map-marker"
            class="p-button-outlined p-button-sm w-full justify-content-start"
            routerLink="/reports/hhi-zona-geografica"
          ></button>
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <button
            pButton
            label="Sector Económico"
            icon="pi pi-briefcase"
            class="p-button-outlined p-button-sm w-full justify-content-start"
            routerLink="/reports/hhi-sector-economico"
          ></button>
        </div>
        <div class="col-12 sm:col-6 lg:col-3">
          <button
            pButton
            label="Calificación CR"
            icon="pi pi-star"
            class="p-button-outlined p-button-sm w-full justify-content-start"
            routerLink="/reports/hhi-calificacion-cr"
          ></button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }

      .grid {
        width: 100%;
      }

      .hhi-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 1px solid #e9ecef;
        height: 100%;
        display: flex;
        flex-direction: column;

        &:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }
      }

      .card-header {
        border-bottom: 1px solid #f1f3f5;
        padding-bottom: 0.75rem;
        margin-bottom: 0.75rem;
      }

      .icon-wrapper {
        width: 48px;
        height: 48px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .card-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: #495057;
        margin: 0;
        line-height: 1.3;
      }

      .record-count {
        font-size: 0.75rem;
        color: #6c757d;
        font-weight: 500;
      }

      .severity-bajo {
        color: #28a745;
        font-weight: 600;
      }

      .severity-moderado {
        color: #fd7e14;
        font-weight: 600;
      }

      .severity-alto {
        color: #dc3545;
        font-weight: 600;
      }

      .nav-button {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.2s;
        display: flex;
        align-items: center;
        justify-content: center;

        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }
      }

      .card-body {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .card-description {
        font-size: 0.875rem;
        color: #6c757d;
        margin: 0 0 0.5rem 0;
        font-weight: 500;
      }

      .top3-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .top3-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem;
        border-radius: 6px;
        background: #f8f9fa;
        transition: background 0.2s;

        &:hover {
          background: #e9ecef;
        }
      }

      .rank-badge {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 700;
        font-size: 0.75rem;
        flex-shrink: 0;

        &[data-rank='1'] {
          background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
          color: #856404;
          box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
        }

        &[data-rank='2'] {
          background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
          color: #495057;
          box-shadow: 0 2px 4px rgba(192, 192, 192, 0.3);
        }

        &[data-rank='3'] {
          background: linear-gradient(135deg, #cd7f32 0%, #e5a05d 100%);
          color: #fff;
          box-shadow: 0 2px 4px rgba(205, 127, 50, 0.3);
        }
      }

      .item-name {
        font-size: 0.875rem;
        font-weight: 600;
        color: #212529;
        line-height: 1.3;
      }

      .item-ops {
        font-size: 0.75rem;
        color: #6c757d;
      }

      .item-percent {
        font-size: 0.875rem;
        font-weight: 700;
      }

      .text-danger {
        color: #dc3545;
      }

      .text-warning {
        color: #fd7e14;
      }

      .text-success {
        color: #28a745;
      }

      .flex {
        display: flex;
      }

      .align-items-center {
        align-items: center;
      }

      .gap-2 {
        gap: 0.5rem;
      }

      .mb-3 {
        margin-bottom: 0.75rem;
      }

      .mb-2 {
        margin-bottom: 0.5rem;
      }

      .flex-1 {
        flex: 1;
        min-width: 0;
      }

      .min-w-0 {
        min-width: 0;
      }

      .text-right {
        text-align: right;
      }
    `,
  ],
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
        { titulo: 'Destino de Crédito', ruta: '/reports/hhi-destino-credito', datos: datosDestinoCredito },
        { titulo: 'Número de Cuotas', ruta: '/reports/hhi-plazo', datos: datosPlazo },
        { titulo: 'Zona Geográfica', ruta: '/reports/hhi-zona-geografica', datos: datosZonaGeografica },
        { titulo: 'Sector Económico', ruta: '/reports/hhi-sector-economico', datos: datosSectorEconomico },
        { titulo: 'Calificación CR', ruta: '/reports/hhi-calificacion-cr', datos: datosCalificacionCR },
      ];

      const mayorRiesgo = reportesComparar.reduce((max, reporte) =>
        reporte.datos.hhi > max.datos.hhi ? reporte : max
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
