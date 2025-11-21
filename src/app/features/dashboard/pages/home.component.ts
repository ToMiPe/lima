import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { KpiCardComponent } from '../components/kpi-card.component';
import { ReportCardComponent } from '../components/report-card.component';
import { PeruMapSvgComponent } from '../components/peru-map-svg.component';
import { HHIWidgetComponent } from '@features/reports';
import { MapClickEvent, ReportType } from '../models';

/**
 * Componente principal del Dashboard
 * Vista inicial del sistema MIRAR para ADRA
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
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
