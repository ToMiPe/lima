import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportType } from '../models';

/**
 * Componente para mostrar una card de reporte disponible - Usa Tailwind CSS
 */
@Component({
  selector: 'app-report-card',
  imports: [CommonModule],
  template: `
    <div
      class="bg-white rounded-xl p-5 cursor-pointer transition-all duration-300 border border-gray-200 hover:border-gray-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col group"
      (click)="onSelect()"
    >
      <div class="flex items-start gap-3 pb-4 border-b border-gray-100 mb-4">
        <div
          class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
          [style.background]="report().color + '20'"
        >
          <span class="text-2xl" [style.color]="report().color">{{ report().icon }}</span>
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-gray-700 mb-1 leading-tight">
            {{ report().title }}
          </h4>
          @if (report().recordCount) {
            <span class="text-xs text-gray-500 font-medium">
              {{ report().recordCount | number: '1.0-0' : 'es-PE' }} registros
            </span>
          }
        </div>
        <button
          class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-2 rounded-lg hover:bg-gray-50"
          [style.color]="report().color"
        >
          <svg
            class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div class="flex-1 flex flex-col gap-3">
        <p class="text-sm text-gray-600 leading-relaxed flex-1">{{ report().description }}</p>
        @if (report().lastUpdate) {
          <div
            class="flex items-center gap-2 text-xs text-gray-400 pt-3 border-t border-gray-50"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Actualizado {{ getRelativeTime(report().lastUpdate!) }}</span>
          </div>
        }
      </div>
    </div>
  `,
})
export class ReportCardComponent {
  report = input.required<ReportType>();
  selectReport = output<ReportType>();

  onSelect(): void {
    this.selectReport.emit(this.report());
  }

  getRelativeTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'hoy';
    if (diffDays === 1) return 'ayer';
    if (diffDays < 7) return `hace ${diffDays} días`;
    if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`;
    return `hace ${Math.floor(diffDays / 30)} meses`;
  }
}
