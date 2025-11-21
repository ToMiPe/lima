import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KPI } from '../models';

/**
 * Componente para mostrar un indicador clave (KPI)
 * Reutilizable en múltiples vistas
 */
@Component({
  selector: 'app-kpi-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="kpi-card hover-lift"
      [class.kpi-green]="kpi.color === 'green'"
      [class.kpi-blue]="kpi.color === 'blue'"
      [class.kpi-yellow]="kpi.color === 'yellow'"
      [class.kpi-red]="kpi.color === 'red'"
    >
      <div class="kpi-header">
        <span class="kpi-icon">{{ kpi.icon }}</span>
        @if (kpi.trend) {
          <span
            class="kpi-trend"
            [class.trend-up]="kpi.trend.direction === 'up'"
            [class.trend-down]="kpi.trend.direction === 'down'"
          >
            {{ kpi.trend.direction === 'up' ? '↑' : '↓' }}
            {{ kpi.trend.value }}%
          </span>
        }
      </div>

      <div class="kpi-body">
        <div class="kpi-value">
          @if (kpi.format === 'currency') {
            {{ formatCurrency(kpi.value) }}
          } @else if (kpi.format === 'percentage') {
            {{ kpi.value }}%
          } @else {
            {{ formatNumber(kpi.value) }}
          }
        </div>
        <div class="kpi-title">{{ kpi.title }}</div>
      </div>
    </div>
  `,
  styles: [
    `
      .kpi-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: var(--shadow-md);
        transition: all var(--transition-normal);
        position: relative;
        overflow: hidden;
      }

      .kpi-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 4px;
        height: 100%;
        transition: width var(--transition-fast);
      }

      .kpi-card:hover::before {
        width: 8px;
      }

      .kpi-green::before {
        background: var(--adra-green-primary);
      }
      .kpi-blue::before {
        background: var(--adra-blue-primary);
      }
      .kpi-yellow::before {
        background: var(--adra-yellow-accent);
      }
      .kpi-red::before {
        background: #ef4444;
      }

      .kpi-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .kpi-icon {
        font-size: 2rem;
      }

      .kpi-trend {
        font-size: 0.875rem;
        font-weight: 600;
        padding: 0.25rem 0.5rem;
        border-radius: 6px;
      }

      .trend-up {
        background: #dcfce7;
        color: #166534;
      }

      .trend-down {
        background: #fee2e2;
        color: #991b1b;
      }

      .kpi-body {
        text-align: left;
      }

      .kpi-value {
        font-size: 2rem;
        font-weight: 700;
        color: #111827;
        margin-bottom: 0.5rem;
      }

      .kpi-title {
        font-size: 0.875rem;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }

      @media (max-width: 768px) {
        .kpi-card {
          padding: 1rem;
        }

        .kpi-value {
          font-size: 1.5rem;
        }

        .kpi-icon {
          font-size: 1.5rem;
        }
      }
    `,
  ],
})
export class KpiCardComponent {
  @Input({ required: true }) kpi!: KPI;

  formatNumber(num: number): string {
    return new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
}
