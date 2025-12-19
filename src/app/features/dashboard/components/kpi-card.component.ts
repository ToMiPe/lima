import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { KPI } from '../models';

/**
 * Componente para mostrar un indicador clave (KPI)
 * Reutilizable en múltiples vistas - Usa Tailwind CSS
 */
@Component({
  selector: 'app-kpi-card',
  imports: [CommonModule],
  template: `
    <div
      class="relative bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-100 hover:border-gray-200"
    >
      <!-- Barra de color lateral -->
      <div
        class="absolute top-0 left-0 h-full w-1 transition-all duration-300 group-hover:w-2"
        [class]="{
          'bg-[#00843D]': kpi().color === 'green',
          'bg-[#005EB8]': kpi().color === 'blue',
          'bg-[#FDB913]': kpi().color === 'yellow',
          'bg-red-500': kpi().color === 'red'
        }"
      ></div>

      <div class="flex justify-between items-start mb-4 pl-2">
        <span class="text-4xl">{{ kpi().icon }}</span>
        @if (kpi().trend) {
          <span
            class="text-sm font-semibold px-2.5 py-1 rounded-lg"
            [class]="{
              'bg-green-100 text-green-700': kpi().trend!.direction === 'up',
              'bg-red-100 text-red-700': kpi().trend!.direction === 'down'
            }"
          >
            {{ kpi().trend!.direction === 'up' ? '↑' : '↓' }}
            {{ kpi().trend!.value }}%
          </span>
        }
      </div>

      <div class="pl-2">
        <div class="text-3xl font-bold text-gray-800 mb-2">
          @if (kpi().format === 'currency') {
            {{ formatCurrency(kpi().value) }}
          } @else if (kpi().format === 'percentage') {
            {{ kpi().value }}%
          } @else {
            {{ formatNumber(kpi().value) }}
          }
        </div>
        <div class="text-sm text-gray-600 uppercase tracking-wide font-medium">
          {{ kpi().title }}
        </div>
      </div>
    </div>
  `,
})
export class KpiCardComponent {
  kpi = input.required<KPI>();

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
