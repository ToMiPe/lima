import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportType } from '../models';

/**
 * Componente para mostrar una card de reporte disponible
 */
@Component({
  selector: 'app-report-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="report-card" (click)="onSelect()">
      <div class="card-header">
        <div class="flex align-items-center gap-2 mb-3">
          <div class="icon-wrapper" [style.background]="report.color + '20'">
            <span class="report-icon" [style.color]="report.color">{{ report.icon }}</span>
          </div>
          <div class="flex-1">
            <h4 class="card-title">{{ report.title }}</h4>
            @if (report.recordCount) {
              <span class="record-count">{{ report.recordCount | number: '1.0-0' : 'es-PE' }} registros</span>
            }
          </div>
          <button class="nav-button" [style.color]="report.color">
            <i class="pi pi-arrow-right"></i>
          </button>
        </div>
      </div>

      <div class="card-body">
        <p class="card-description">{{ report.description }}</p>
        @if (report.lastUpdate) {
          <div class="card-meta">
            <i class="pi pi-clock" style="font-size: 0.75rem"></i>
            <span>Actualizado {{ getRelativeTime(report.lastUpdate) }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .report-card {
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

      .report-icon {
        font-size: 1.5rem;
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
        line-height: 1.5;
        margin: 0;
        flex: 1;
      }

      .card-meta {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.75rem;
        color: #adb5bd;
        padding-top: 0.5rem;
        border-top: 1px solid #f1f3f5;
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

      .flex-1 {
        flex: 1;
        min-width: 0;
      }

      @media (max-width: 768px) {
        .report-card {
          padding: 1.25rem;
        }

        .icon-wrapper {
          width: 40px;
          height: 40px;
        }

        .report-icon {
          font-size: 1.25rem;
        }
      }
    `,
  ],
})
export class ReportCardComponent {
  @Input({ required: true }) report!: ReportType;
  @Output() selectReport = new EventEmitter<ReportType>();

  onSelect(): void {
    this.selectReport.emit(this.report);
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
