import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { KpiCardComponent } from '../components/kpi-card.component';
import { ReportCardComponent } from '../components/report-card.component';
import { PeruMapSvgComponent } from '../components/peru-map-svg.component';
import { HHIWidgetComponent } from '@features/reports';
import { MapClickEvent, ReportType } from '../models';

interface IPCReport {
  id: string;
  numero: number;
  title: string;
  description: string;
  color: string;
}

/**
 * Componente principal del Dashboard
 * Vista inicial del sistema MIRAR para ADRA
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    KpiCardComponent,
    ReportCardComponent,
    PeruMapSvgComponent,
    HHIWidgetComponent,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  protected readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  protected readonly ipcReports: IPCReport[] = [
    {
      id: 'ipc1',
      numero: 1,
      title: 'IPC1',
      description: 'Concentración por Agencias',
      color: '#00843D',
    },
    {
      id: 'ipc2',
      numero: 2,
      title: 'IPC2',
      description: 'Concentración por Tipo de Crédito',
      color: '#005EB8',
    },
    {
      id: 'ipc3',
      numero: 3,
      title: 'IPC3',
      description: 'Concentración por Destino',
      color: '#FDB913',
    },
    {
      id: 'ipc4',
      numero: 4,
      title: 'IPC4',
      description: 'Concentración por Zona',
      color: '#E63946',
    },
    {
      id: 'ipc5',
      numero: 5,
      title: 'IPC5',
      description: 'Concentración por Sector',
      color: '#9333EA',
    },
  ];

  ngOnInit(): void {
    this.dashboardService.initialize();
  }

  onDepartmentClick(event: MapClickEvent): void {
    console.log('📍 Departamento seleccionado:', event);
    // Navegar al reporte de mapa por departamento
    this.router.navigate(['/reports/map', event.departmentName]);
  }

  onReportSelect(report: ReportType): void {
    console.log('📊 Reporte seleccionado:', report);
    this.router.navigate([report.route]);
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
}
