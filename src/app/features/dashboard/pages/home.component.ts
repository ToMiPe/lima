import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { DashboardService } from '../services/dashboard.service';
import { KpiCardComponent } from '../components/kpi-card.component';
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
    RouterModule,
    KpiCardComponent,
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
    // Navegar al reporte de mapa por departamento
    this.router.navigate(['/reports/map', event.departmentName]);
  }

  onReportSelect(report: ReportType): void {
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
