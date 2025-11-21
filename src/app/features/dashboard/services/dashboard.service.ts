import { inject, Injectable, signal } from '@angular/core';
import { KPI, ReportType, DepartmentStats } from '../models';
import { ADRA_COLORS, getMapColorByIntensity } from '@shared/constants';
import { EstadisticasCartera, CARTERA_REPOSITORY_TOKEN, ReporteCartera } from '@core/cartera';

/**
 * Servicio de lógica de negocio para el Dashboard
 * Usa Repository Pattern para acceso desacoplado a datos
 */
@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly repository = inject(CARTERA_REPOSITORY_TOKEN);

  // Signals para estado reactivo
  public kpis = signal<KPI[]>([]);
  public departmentStats = signal<DepartmentStats[]>([]);
  public availableReports = signal<ReportType[]>([]);
  public isLoading = signal(false);
  public isInitialized = signal(false);
  public lastUpdate = signal<Date | null>(null);
  public totalRecords = signal(0);
  public dataVersion = signal('1.0');

  constructor() {
    this.initializeReports();
  }

  /**
   * Inicializa el dashboard
   */
  async initialize(): Promise<void> {
    if (this.isInitialized()) {
      console.log('✅ Dashboard ya inicializado');
      return;
    }

    this.isLoading.set(true);

    try {
      await this.repository.initialize();
      await this.loadStatistics();

      this.isInitialized.set(true);
      this.lastUpdate.set(this.repository.getLastUpdate());
    } catch (error) {
      console.error('❌ Error inicializando dashboard:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Refresca datos
   */
  async refreshData(): Promise<void> {
    this.isLoading.set(true);
    try {
      console.log('🔄 Refrescando datos...');
      await this.repository.refreshData();
      await this.loadStatistics();
      this.lastUpdate.set(this.repository.getLastUpdate());
      console.log('✅ Datos actualizados');
    } catch (error) {
      console.error('❌ Error actualizando datos:', error);
      throw error;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Carga estadísticas desde Repository
   */
  private async loadStatistics(): Promise<void> {
    try {
      const stats = await this.repository.getEstadisticas();
      const count = await this.repository.count();

      this.totalRecords.set(count);
      this.updateKPIs(stats);
      this.updateDepartmentStats(stats);
    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error);
    }
  }

  /**
   * Actualiza los indicadores principales del dashboard
   */
  private updateKPIs(stats: EstadisticasCartera): void {
    const kpis: KPI[] = [
      {
        id: 'beneficiaries',
        title: 'Total Beneficiarios',
        value: stats.total || 0,
        icon: '👥',
        color: 'blue',
        format: 'number',
      },
      {
        id: 'amount',
        title: 'Monto Total',
        value: stats.totalMonto || 0,
        icon: '💰',
        color: 'green',
        format: 'currency',
      },
      {
        id: 'departments',
        title: 'Departamentos',
        value: Object.keys(stats.porDepartamento || {}).length,
        icon: '🗺️',
        color: 'yellow',
        format: 'number',
      },
      {
        id: 'balance',
        title: 'Saldo Total',
        value: stats.totalSaldo || 0,
        icon: '📊',
        color: 'red',
        format: 'currency',
      },
    ];

    this.kpis.set(kpis);
  }

  /**
   * Actualiza estadísticas por departamento para el mapa
   */
  private updateDepartmentStats(stats: EstadisticasCartera): void {
    const porDept = stats.porDepartamento || {};
    const maxCount = Math.max(...Object.values(porDept).map((v) => v || 0));

    console.log('📊 updateDepartmentStats:', {
      total: stats.total,
      departamentos: Object.keys(porDept).length,
      porDept,
    });

    const deptStats: DepartmentStats[] = Object.entries(porDept).map(([name, count]) => {
      const numCount = Number(count) || 0;
      const percentage = stats.total > 0 ? (numCount / stats.total) * 100 : 0;

      return {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        count: numCount,
        totalAmount: 0, // Se podría calcular si tuviéramos el desglose
        percentage,
        color: getMapColorByIntensity(numCount, maxCount),
        value: numCount, // Valor numérico para el mapa
      };
    });

    console.log('📍 Departamentos procesados:', deptStats.length);
    this.departmentStats.set(deptStats);
  }

  /**
   * Inicializa los reportes disponibles
   */
  private initializeReports(): void {
    const reports: ReportType[] = [
      {
        id: 'cumplimiento',
        title: 'Reporte de Cumplimiento',
        description: 'Mapa georreferenciado con clasificación de riesgo por crédito',
        icon: '🎯',
        category: 'geographic',
        route: '/reports/cumplimiento',
        color: '#10B981',
      },
      {
        id: 'geographic',
        title: 'Vista Geográfica',
        description: 'Mapa interactivo con distribución por regiones',
        icon: '🗺️',
        category: 'geographic',
        route: '/maps',
        color: ADRA_COLORS.green.primary,
      },
      {
        id: 'financial',
        title: 'Análisis Financiero',
        description: 'Montos, colocaciones y tendencias',
        icon: '💰',
        category: 'financial',
        route: '/reportes/financiero',
        color: ADRA_COLORS.blue.primary,
      },
      {
        id: 'social',
        title: 'Impacto Social',
        description: 'Demografía, género y actividades económicas',
        icon: '👥',
        category: 'social',
        route: '/reportes/social',
        color: ADRA_COLORS.green.light,
      },
      {
        id: 'temporal',
        title: 'Análisis Temporal',
        description: 'Tendencias y evolución en el tiempo',
        icon: '📈',
        category: 'temporal',
        route: '/reportes/temporal',
        color: ADRA_COLORS.yellow.accent,
      },
    ];

    this.availableReports.set(reports);
  }

  /**
   * Obtiene el estado actual de los datos
   */
  getDataStatus(): string {
    if (this.isLoading()) return 'MIRAR cargando datos...';
    if (!this.isInitialized()) return 'MIRAR inicializando...';
    if (this.totalRecords() === 0) return 'Sin datos disponibles';
    return `${this.totalRecords().toLocaleString('es-PE')} registros cargados`;
  }

  /**
   * Obtiene estadísticas de un departamento específico
   */
  getDepartmentById(departmentId: string): DepartmentStats | undefined {
    return this.departmentStats().find((d) => d.id === departmentId);
  }

  /**
   * Filtra datos por departamento
   */
  async filterByDepartment(departmentName: string): Promise<ReporteCartera[]> {
    return await this.repository.getByDepartamento(departmentName);
  }
}
