import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';
import { TabsModule } from 'primeng/tabs';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import * as echarts from 'echarts/core';
import { PieChart, BarChart, LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import {
  CARTERA_REPOSITORY_TOKEN,
  type CarteraRepository,
  type HHIAgenciasReporte,
  type ConcentracionAgencia,
} from '@core/cartera';
import { HHINavigationComponent } from '../../components/hhi-navigation/hhi-navigation.component';

// Registrar componentes de ECharts
echarts.use([
  PieChart,
  BarChart,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  ToolboxComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-hhi-calificacion-cr',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TableModule,
    TagModule,
    ProgressSpinnerModule,
    MessageModule,
    TooltipModule,
    TabsModule,
    NgxEchartsDirective,
    HHINavigationComponent,
  ],
  providers: [provideEchartsCore({ echarts })],
  template: `
    <app-hhi-navigation activeReport="calificacion-cr" />

    <div class="dashboard-container">
      <!-- Main Content -->
      <main class="dashboard-main">
        @if (reporte(); as datos) {
          <!-- Hero Section: KPIs Principales -->
          <section class="hero-section animate-fade-in-up">
            <div class="hero-content">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- HHI Principal - Destacado -->
                <div>
                  <div class="kpi-card kpi-primary">
                    <div class="kpi-icon">
                      <i class="pi pi-chart-pie"></i>
                    </div>
                    <div class="kpi-content">
                      <div class="kpi-header">
                        <h3 class="kpi-label">Índice HHI</h3>
                        <i
                          class="pi pi-info-circle kpi-help"
                          pTooltip="El Índice HHI mide el grado de concentración. Valores menores a 1500 indican baja concentración, entre 1500-2500 moderada, y mayores a 2500 alta concentración."
                          tooltipPosition="top"
                        ></i>
                      </div>
                      <div class="kpi-value">{{ datos.hhi | number: '1.0-0' : 'es-PE' }}</div>
                      <div class="kpi-badge" [attr.data-level]="datos.nivelRiesgo">
                        <span [class]="'badge badge-' + datos.nivelRiesgo">
                          {{ datos.nivelRiesgo.toUpperCase() }}
                        </span>
                      </div>
                      <p class="kpi-description">{{ datos.interpretacion }}</p>
                    </div>
                  </div>
                </div>

                <!-- Total Capital -->
                <div>
                  <div class="kpi-card kpi-success">
                    <div class="kpi-icon">
                      <i class="pi pi-dollar"></i>
                    </div>
                    <div class="kpi-content">
                      <div class="kpi-header">
                        <h3 class="kpi-label">Total Capital</h3>
                        <i
                          class="pi pi-info-circle kpi-help"
                          pTooltip="Suma total del saldo de capital de todas las operaciones activas. Este es el monto total en riesgo que se está analizando."
                          tooltipPosition="top"
                        ></i>
                      </div>
                      <div class="kpi-value kpi-value-capital">
                        {{ datos.totalCartera | currency: 'PEN' : 'S/. ' : '1.0-2' : 'es-PE' }}
                      </div>
                      <div class="kpi-badge">
                        <span class="badge badge-success">ACTIVO</span>
                      </div>
                      <p class="kpi-description">Saldo de capital en cartera</p>
                    </div>
                  </div>
                </div>

                <!-- Total calificaciones -->
                <div class="md:col-span-2 lg:col-span-1">
                  <div class="kpi-card kpi-info">
                    <div class="kpi-icon">
                      <i class="pi pi-building"></i>
                    </div>
                    <div class="kpi-content">
                      <div class="kpi-header">
                        <h3 class="kpi-label">calificaciones de Crédito</h3>
                        <i
                          class="pi pi-info-circle kpi-help"
                          pTooltip="Número total de calificaciones de crédito con cartera activa. Más calificaciones puede indicar mejor diversificación del propósito de los créditos."
                          tooltipPosition="top"
                        ></i>
                      </div>
                      <div class="kpi-value">{{ datos.agencias.length }}</div>
                      <div class="kpi-badge">
                        <span class="badge badge-info">ACTIVOS</span>
                      </div>
                      <p class="kpi-description">calificaciones con cartera activa</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Analytics Section -->
          <section class="analytics-section">
            <div class="analytics-card">
              <div class="card-header">
                <h2 class="section-title">
                  <i class="pi pi-chart-line mr-2"></i>
                  Análisis Visual de Concentración
                </h2>
                <p class="section-subtitle">
                  Distribución y ranking de participación por calificación en CR
                </p>
              </div>

              <p-tabs value="0">
                <p-tabpanel value="0">
                  <ng-template #header>
                    <div class="flex items-center gap-2">
                      <i class="pi pi-chart-pie"></i>
                      <span>Distribución por Calificación CR</span>
                    </div>
                  </ng-template>
                  <div class="chart-container-tabs">
                    <div echarts [options]="pieChartOptions()" class="chart-content-tabs"></div>
                  </div>
                </p-tabpanel>

                <p-tabpanel value="1">
                  <ng-template #header>
                    <div class="flex items-center gap-2">
                      <i class="pi pi-chart-bar"></i>
                      <span>Ranking de Participación</span>
                    </div>
                  </ng-template>
                  <div class="chart-container-tabs">
                    <div echarts [options]="barChartOptions()" class="chart-content-tabs"></div>
                  </div>
                </p-tabpanel>
              </p-tabs>
            </div>

            <!-- Data Table Section -->
            <div class="analytics-card" style="margin-top: 2rem;">
              <div class="card-header">
                <h2 class="section-title">
                  <i class="pi pi-table mr-2"></i>
                  Detalle por Calificación en Central de Riesgos
                </h2>
                <p class="section-subtitle">
                  Información completa de concentración y participación ({{ datos.agencias.length }}
                  calificaciones)
                </p>
              </div>

              <div class="table-container">
                <p-table
                  [value]="datos.agencias"
                  [sortMode]="'multiple'"
                  styleClass="p-datatable-striped professional-table"
                  [scrollable]="true"
                  scrollHeight="600px"
                >
                  <ng-template pTemplate="header">
                    <tr>
                      <th pSortableColumn="agencia">
                        <div class="flex align-items-center">
                          <span class="font-semibold">Calificación CR</span>
                          <p-sortIcon field="agencia" />
                        </div>
                      </th>
                      <th pSortableColumn="monto" class="text-right">
                        <div class="flex align-items-center justify-content-end">
                          <span class="font-semibold">Monto (S/.)</span>
                          <p-sortIcon field="monto" />
                        </div>
                      </th>
                      <th pSortableColumn="participacion" class="text-right">
                        <div class="flex align-items-center justify-content-end">
                          <span class="font-semibold">Participación (%)</span>
                          <p-sortIcon field="participacion" />
                        </div>
                      </th>
                      <th pSortableColumn="numeroOperaciones" class="text-right">
                        <div class="flex align-items-center justify-content-end">
                          <span class="font-semibold">Operaciones</span>
                          <p-sortIcon field="numeroOperaciones" />
                        </div>
                      </th>
                      <th class="text-center">
                        <span class="font-semibold">Concentración</span>
                      </th>
                    </tr>
                  </ng-template>

                  <ng-template pTemplate="body" let-calificacion let-i="rowIndex">
                    <tr>
                      <td>
                        <div class="flex align-items-center gap-2">
                          <div class="rank-indicator" [attr.data-rank]="i < 3 ? 'top' : 'normal'">
                            {{ i + 1 }}
                          </div>
                          <span class="font-medium">{{ calificacion.agencia }}</span>
                          @if (i < 3) {
                            <span class="top-badge">TOP {{ i + 1 }}</span>
                          }
                        </div>
                      </td>
                      <td class="text-right">
                        <span class="font-mono font-semibold amount-text">
                          {{ calificacion.monto | currency: 'PEN' : 'S/. ' : '1.0-2' : 'es-PE' }}
                        </span>
                      </td>
                      <td class="text-right">
                        <div class="participation-cell">
                          <div class="participation-bar">
                            <div
                              class="participation-fill"
                              [style.width.%]="calificacion.participacion"
                            ></div>
                          </div>
                          <span class="font-mono font-semibold">
                            {{ calificacion.participacion | number: '1.2-2' : 'es-PE' }}%
                          </span>
                        </div>
                      </td>
                      <td class="text-right">
                        <span class="font-mono">{{
                          calificacion.numeroOperaciones | number: '1.0-0' : 'es-PE'
                        }}</span>
                      </td>
                      <td class="text-center">
                        <span
                          class="concentration-badge"
                          [attr.data-level]="
                            calificacion.participacion >= 25
                              ? 'high'
                              : calificacion.participacion >= 15
                                ? 'medium'
                                : 'low'
                          "
                        >
                          {{
                            calificacion.participacion >= 25
                              ? 'ALTA'
                              : calificacion.participacion >= 15
                                ? 'MEDIA'
                                : 'BAJA'
                          }}
                        </span>
                      </td>
                    </tr>
                  </ng-template>

                  <ng-template pTemplate="footer">
                    <tr class="totals-row">
                      <td class="font-bold">TOTAL</td>
                      <td class="text-right font-mono font-bold">
                        {{ datos.totalCartera | currency: 'PEN' : 'S/. ' : '1.0-2' : 'es-PE' }}
                      </td>
                      <td class="text-right font-mono font-bold">100.00%</td>
                      <td class="text-right font-mono font-bold">
                        {{ getTotalOperaciones(datos.agencias) | number: '1.0-0' : 'es-PE' }}
                      </td>
                      <td class="text-center">
                        <span class="hhi-total-badge">
                          HHI: {{ datos.hhi | number: '1.0-0' : 'es-PE' }}
                        </span>
                      </td>
                    </tr>
                  </ng-template>

                  <ng-template pTemplate="emptymessage">
                    <tr>
                      <td colspan="5" class="text-center py-6">
                        <div class="empty-state">
                          <i class="pi pi-info-circle text-3xl text-gray-400 mb-3"></i>
                          <p class="text-gray-500 mb-0">No hay datos disponibles</p>
                        </div>
                      </td>
                    </tr>
                  </ng-template>
                </p-table>
              </div>
            </div>
          </section>
        } @else if (isLoading()) {
          <!-- Professional Loading State -->
          <section class="hero-section">
            <div class="loading-state">
              <div class="loading-content">
                <p-progressSpinner ariaLabel="Cargando" styleClass="w-20 h-20" strokeWidth="3" />
                <h3 class="loading-title">Cargando Análisis HHI</h3>
                <p class="loading-text">
                  Procesando datos de concentración por calificación en CR...
                </p>
              </div>
            </div>
          </section>
        } @else {
          <!-- Error State -->
          <section class="hero-section">
            <div class="error-state">
              <div class="error-content">
                <i class="pi pi-exclamation-triangle error-icon"></i>
                <h3 class="error-title">Error al cargar datos</h3>
                <p class="error-text">
                  No se pudieron cargar los datos del análisis HHI. Por favor, intenta nuevamente.
                </p>
                <button
                  pButton
                  label="Reintentar"
                  icon="pi pi-refresh"
                  class="p-button-primary"
                  (click)="cargarDatos()"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </section>
        }
      </main>
    </div>
  `,
  styles: [
    `
      /* Professional Dashboard Styles - Matching Home Design */
      .dashboard-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      }

      /* Header Styles - Exact ADRA Theme */
      .dashboard-header {
        color: white;
        padding: 2rem 0;
        position: relative;
        overflow: hidden;
      }

      .dashboard-header::before {
        content: '';
        position: absolute;
        top: -50%;
        left: -50%;
        width: 200%;
        height: 200%;
        background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
        animation: pulse 4s ease-in-out infinite;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
        position: relative;
        z-index: 2;
      }

      .header-brand {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .header-back-btn {
        background: rgba(255, 255, 255, 0.1) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        color: white !important;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
      }

      .header-back-btn:hover {
        background: rgba(255, 255, 255, 0.2) !important;
        transform: translateX(-2px);
      }

      .brand-logo {
        font-size: 3rem;
        background: rgba(255, 255, 255, 0.2);
        padding: 1rem;
        border-radius: 1rem;
        backdrop-filter: blur(10px);
      }

      .brand-title {
        font-size: 2.5rem;
        font-weight: 800;
        margin: 0;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .brand-subtitle {
        font-size: 1.1rem;
        margin: 0;
        opacity: 0.9;
        font-weight: 300;
      }

      .header-info {
        display: flex;
        align-items: center;
        gap: 2rem;
      }

      .data-status {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .status-indicator {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        position: relative;
      }

      .status-indicator.success {
        background: #10b981;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2);
      }

      .status-indicator.loading {
        background: #f59e0b;
        animation: pulse 1.5s ease-in-out infinite;
      }

      .status-indicator.error {
        background: #ef4444;
      }

      .status-text {
        color: white;
      }

      .status-label {
        font-weight: 600;
        margin: 0;
        font-size: 0.9rem;
      }

      .status-time {
        font-size: 0.8rem;
        margin: 0;
        opacity: 0.8;
      }

      /* Main Content */
      .dashboard-main {
        padding: 2rem 0;
      }

      .hero-section,
      .analytics-section {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
      }

      .hero-section {
        margin-bottom: 3rem;
      }

      .analytics-section {
        margin-bottom: 2rem;
      }

      /* KPI Cards */
      .kpi-card {
        background: white;
        border-radius: 1rem;
        padding: 1.75rem;
        height: 100%;
        position: relative;
        overflow: hidden;
        box-shadow:
          0 4px 6px rgba(0, 0, 0, 0.07),
          0 1px 3px rgba(0, 0, 0, 0.06);
        border: 1px solid #e5e7eb;
      }

      .kpi-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #667eea, #764ba2);
      }

      .kpi-icon {
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 0.875rem;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1.25rem;
        font-size: 1.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 6px rgba(102, 126, 234, 0.25);
      }

      .kpi-primary .kpi-icon {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }

      .kpi-success .kpi-icon {
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      }

      .kpi-info .kpi-icon {
        background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      }

      .kpi-content {
        flex: 1;
      }

      .kpi-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 0.5rem;
      }

      .kpi-label {
        font-size: 0.8rem;
        font-weight: 600;
        color: #6b7280;
        margin: 0;
        text-transform: uppercase;
        letter-spacing: 0.075em;
      }

      .kpi-help {
        color: #9ca3af;
        cursor: help;
        font-size: 1rem;
        transition: color 0.3s ease;
      }

      .kpi-help:hover {
        color: #667eea;
      }

      .kpi-value {
        font-size: 2.5rem;
        font-weight: 800;
        color: #1f2937;
        line-height: 1.1;
        margin-bottom: 1rem;
        font-family: 'Inter', sans-serif;
      }

      .kpi-value-capital {
        font-size: 1.75rem;
        line-height: 1.2;
      }

      .kpi-badge {
        margin-bottom: 0.875rem;
      }

      .badge {
        padding: 0.375rem 0.875rem;
        border-radius: 9999px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      .badge-bajo,
      .badge-success {
        background: #d1fae5;
        color: #065f46;
      }

      .badge-moderado {
        background: #fef3c7;
        color: #92400e;
      }

      .badge-alto {
        background: #fee2e2;
        color: #991b1b;
      }

      .badge-info {
        background: #dbeafe;
        color: #1e40af;
      }

      .kpi-description {
        color: #6b7280;
        font-size: 0.875rem;
        margin: 0;
        line-height: 1.4;
      }

      /* Analytics Cards */
      .analytics-card {
        background: white;
        border-radius: 1rem;
        padding: 1.75rem;
        margin-bottom: 2rem;
        box-shadow:
          0 4px 6px rgba(0, 0, 0, 0.07),
          0 1px 3px rgba(0, 0, 0, 0.06);
        border: 1px solid #e5e7eb;
      }

      .card-header {
        margin-bottom: 2rem;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 1rem;
      }

      .section-title {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1f2937;
        margin: 0 0 0.5rem 0;
        display: flex;
        align-items: center;
      }

      .section-subtitle {
        color: #6b7280;
        margin: 0;
        font-size: 0.95rem;
      }

      /* Charts */
      .chart-container-tabs {
        padding: 1.5rem 0;
        min-height: 500px;
      }

      .chart-content-tabs {
        height: 500px;
        width: 100%;
      }

      ::ng-deep .p-tabs {
        .p-tablist {
          background: transparent;
          border: none;
          border-bottom: 2px solid #e5e7eb;
        }

        .p-tab {
          .p-tab-header-action {
            padding: 1rem 1.5rem;
            font-weight: 500;
            color: #6b7280;
            transition: all 0.3s ease;
          }

          &.p-tab-active .p-tab-header-action {
            color: #667eea;
            border-bottom: 2px solid #667eea;
          }

          &:hover:not(.p-tab-active) .p-tab-header-action {
            color: #374151;
          }
        }

        .p-tabpanels {
          padding: 0;
          background: transparent;
        }
      }

      /* Professional Table */
      .table-container {
        border-radius: 1rem;
        overflow: hidden;
        border: 1px solid #e5e7eb;
      }

      ::ng-deep .professional-table {
        .p-datatable-thead > tr > th {
          background: #f8fafc;
          border: none;
          color: #374151;
          font-weight: 600;
          padding: 1rem 1.5rem;
        }

        .p-datatable-tbody > tr {
          transition: all 0.2s ease;
        }

        .p-datatable-tbody > tr:nth-child(even) {
          background: #f9fafb;
        }

        .p-datatable-tbody > tr:hover {
          background: #f3f4f6 !important;
        }

        .p-datatable-tbody > tr > td {
          padding: 1rem 1.5rem;
          border: none;
          color: #374151;
        }
      }

      /* Table Elements */
      .rank-indicator {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        font-weight: 700;
        background: #e5e7eb;
        color: #6b7280;
      }

      .rank-indicator[data-rank='top'] {
        background: linear-gradient(135deg, #f59e0b, #d97706);
        color: white;
      }

      .top-badge {
        background: #fef3c7;
        color: #92400e;
        padding: 0.25rem 0.5rem;
        border-radius: 0.375rem;
        font-size: 0.7rem;
        font-weight: 600;
      }

      .amount-text {
        color: #059669;
      }

      .participation-cell {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .participation-bar {
        flex: 1;
        height: 0.5rem;
        background: #e5e7eb;
        border-radius: 0.25rem;
        overflow: hidden;
      }

      .participation-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        transition: width 0.3s ease;
      }

      .concentration-badge {
        padding: 0.375rem 0.75rem;
        border-radius: 0.5rem;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .concentration-badge[data-level='high'] {
        background: #fee2e2;
        color: #991b1b;
      }

      .concentration-badge[data-level='medium'] {
        background: #fef3c7;
        color: #92400e;
      }

      .concentration-badge[data-level='low'] {
        background: #d1fae5;
        color: #065f46;
      }

      .totals-row {
        background: #f8fafc !important;
        font-weight: 600;
      }

      .totals-row td {
        border-top: 2px solid #e5e7eb !important;
      }

      .hhi-total-badge {
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-size: 0.8rem;
        font-weight: 600;
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 2rem;
      }

      /* Loading & Error States */
      .loading-state,
      .error-state {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 400px;
      }

      .loading-content,
      .error-content {
        text-align: center;
      }

      .loading-title,
      .error-title {
        color: #374151;
        font-size: 1.5rem;
        font-weight: 600;
        margin: 1rem 0 0.5rem 0;
      }

      .loading-text,
      .error-text {
        color: #6b7280;
        margin: 0 0 1.5rem 0;
      }

      .error-icon {
        font-size: 3rem;
        color: #ef4444;
        margin-bottom: 1rem;
      }

      /* Animations */
      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      .animate-fade-in-up {
        animation: fadeInUp 0.6s ease-out;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* Responsive Design */
      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          gap: 1rem;
          text-align: center;
        }

        .header-info {
          flex-direction: column;
          gap: 1rem;
        }

        .brand-title {
          font-size: 2rem;
        }

        .analytics-card {
          padding: 1.5rem;
        }

        .chart-content-tabs {
          height: 300px;
        }

        .kpi-card {
          padding: 1.5rem;
        }
      }

      @media (max-width: 576px) {
        .header-content {
          padding: 0 1rem;
        }

        .dashboard-main {
          padding: 1rem 0;
        }

        .kpi-value {
          font-size: 2rem;
        }

        .brand-title {
          font-size: 1.5rem;
        }

        .chart-content-tabs {
          height: 250px;
        }
      }
    `,
  ],
})
export class HHICalificacionCRComponent implements OnInit {
  private carteraRepository = inject(CARTERA_REPOSITORY_TOKEN) as CarteraRepository;
  private router = inject(Router);

  // Signals
  reporte = signal<HHIAgenciasReporte | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  // Chart options
  pieChartOptions = signal<EChartsOption>({});
  barChartOptions = signal<EChartsOption>({});

  ngOnInit() {
    this.cargarDatos();
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }

  async limpiarCache() {
    this.isLoading.set(true);
    try {
      await this.carteraRepository.clearData();
      console.log('✅ Base de datos limpiada');
      await this.cargarDatos();
    } catch (error) {
      console.error('❌ Error limpiando cache:', error);
      this.error.set('Error limpiando cache');
    } finally {
      this.isLoading.set(false);
    }
  }

  async cargarDatos() {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const datos = await this.carteraRepository.getHHICalificacionCR();
      this.reporte.set(datos);
      this.actualizarGraficos(datos);
    } catch (err) {
      this.error.set('Error cargando datos del reporte');
      console.error('Error:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  private actualizarGraficos(datos: HHIAgenciasReporte) {
    const top10 = datos.agencias.slice(0, 10);
    const otros = datos.agencias.slice(10);
    const sumaOtros = otros.reduce((sum, a) => sum + a.participacion, 0);

    const datosGraficos = [...top10];
    if (otros.length > 0) {
      datosGraficos.push({
        agencia: 'Otros',
        monto: otros.reduce((sum, a) => sum + a.monto, 0),
        participacion: sumaOtros,
        numeroOperaciones: otros.reduce((sum, a) => sum + a.numeroOperaciones, 0),
      });
    }

    // Configurar gráfico de torta
    this.pieChartOptions.set({
      title: {
        text: 'Distribución por Calificación CR',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: function (params: any) {
          return `${params.name}<br/>Participación: ${params.percent}%<br/>Monto: S/. ${params.value.toLocaleString('es-PE')}`;
        },
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: 'HHI_CalificacionCR_Distribucion',
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
      },
      series: [
        {
          name: 'Participación',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          data: datosGraficos.map((item) => ({
            value: item.monto,
            name: item.agencia,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    });

    // Configurar gráfico de barras
    this.barChartOptions.set({
      title: {
        text: 'Ranking por Participación (%)',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: function (params: any) {
          const item = params[0];
          const destino = datosGraficos.find((a) => a.agencia === item.name);
          return `${item.name}<br/>Participación: ${item.value}%<br/>Monto: S/. ${destino?.monto.toLocaleString('es-PE')}<br/>Operaciones: ${destino?.numeroOperaciones.toLocaleString('es-PE')}`;
        },
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: 'HHI_CalificacionCR_Ranking',
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true,
      },
      xAxis: [
        {
          type: 'category',
          data: datosGraficos.map((a) => a.agencia),
          axisTick: {
            alignWithLabel: true,
          },
          axisLabel: {
            rotate: 45,
          },
        },
      ],
      yAxis: [
        {
          type: 'value',
          name: 'Participación %',
        },
      ],
      series: [
        {
          name: 'Participación',
          type: 'bar',
          barWidth: '60%',
          data: datosGraficos.map((a) => a.participacion),
          itemStyle: {
            color: function (params: { dataIndex: number }) {
              const colors = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de'];
              return colors[params.dataIndex % colors.length];
            },
          },
        },
      ],
    });
  }

  getTotalOperaciones(calificaciones: ConcentracionAgencia[]): number {
    return calificaciones.reduce(
      (total, calificacion) => total + calificacion.numeroOperaciones,
      0,
    );
  }
}
