import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

interface HHIReport {
  id: string;
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-hhi-navigation',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonModule, TooltipModule],
  template: `
    <div class="hhi-navigation">
      <div class="nav-header">
        <p-button
          icon="pi pi-home"
          label="Dashboard"
          class="p-button-text p-button-sm"
          routerLink="/dashboard"
          pTooltip="Volver al Dashboard"
        />
        <span class="nav-divider">|</span>
        <span class="nav-label">Análisis HHI</span>
      </div>

      <div class="nav-tabs">
        @for (report of reports; track report.id) {
          <button
            pButton
            [icon]="report.icon"
            [label]="report.label"
            class="p-button-text p-button-sm nav-tab"
            [class.active]="report.id === activeReport"
            [routerLink]="report.route"
            routerLinkActive="active"
          ></button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .hhi-navigation {
        background: white;
        border-bottom: 1px solid #e5e7eb;
        padding: 0.75rem 1.5rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 1rem;
        position: sticky;
        top: 0;
        z-index: 100;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
      }

      .nav-header {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .nav-divider {
        color: #d1d5db;
        font-weight: 300;
      }

      .nav-label {
        font-weight: 600;
        color: #6b7280;
        font-size: 0.875rem;
      }

      .nav-tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
      }

      .nav-tab {
        border-radius: 6px;
        transition: all 0.2s;

        &:hover {
          background: #f3f4f6;
        }

        &.active {
          background: #eff6ff;
          color: #2563eb;
          font-weight: 600;

          ::ng-deep .p-button-icon {
            color: #2563eb;
          }
        }
      }

      @media (max-width: 768px) {
        .hhi-navigation {
          flex-direction: column;
          align-items: flex-start;
        }

        .nav-tabs {
          width: 100%;
          justify-content: flex-start;
        }

        .nav-tab {
          flex: 1;
          min-width: 120px;
        }
      }
    `,
  ],
})
export class HHINavigationComponent {
  @Input() activeReport = '';

  reports: HHIReport[] = [
    { id: 'agencias', label: 'Agencias', icon: 'pi pi-building', route: '/reports/hhi-agencias' },
    {
      id: 'tipo-credito',
      label: 'Tipo Crédito',
      icon: 'pi pi-tags',
      route: '/reports/hhi-tipo-credito',
    },
    {
      id: 'destino-credito',
      label: 'Destino',
      icon: 'pi pi-compass',
      route: '/reports/hhi-destino-credito',
    },
    { id: 'plazo', label: 'Cuotas', icon: 'pi pi-calendar', route: '/reports/hhi-plazo' },
    {
      id: 'zona-geografica',
      label: 'Zona',
      icon: 'pi pi-map-marker',
      route: '/reports/hhi-zona-geografica',
    },
    {
      id: 'sector-economico',
      label: 'Sector',
      icon: 'pi pi-briefcase',
      route: '/reports/hhi-sector-economico',
    },
    {
      id: 'calificacion-cr',
      label: 'Calificación',
      icon: 'pi pi-star',
      route: '/reports/hhi-calificacion-cr',
    },
  ];
}
