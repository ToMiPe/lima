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
  selector: 'app-hhi-agencias',
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
  templateUrl: './hhi-agencias.component.html',
  styleUrls: ['./hhi-agencias.component.scss'],
})
export class HHIAgenciasComponent implements OnInit {
  private carteraRepository = inject(CARTERA_REPOSITORY_TOKEN) as CarteraRepository;
  private router = inject(Router);

  // Signals
  reporte = signal<HHIAgenciasReporte | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);
  activeChart = signal<'pie' | 'bar'>('pie');

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
      // Limpiar la base de datos IndexedDB
      await this.carteraRepository.clearData();

      // Recargar datos
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
      const datos = await this.carteraRepository.getHHIAgencias();
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
    // Top 10 para gráficos
    const top10 = datos.agencias.slice(0, 10);
    const otros = datos.agencias.slice(10);
    const sumaOtros = otros.reduce((sum, a) => sum + a.participacion, 0);

    // Datos para gráficos
    const datosGraficos = [...top10];
    if (otros.length > 0) {
      datosGraficos.push({
        agencia: 'Otros',
        monto: otros.reduce((sum, a) => sum + a.monto, 0),
        participacion: sumaOtros,
        numeroOperaciones: otros.reduce((sum, a) => sum + a.numeroOperaciones, 0),
      });
    }

    // Pie Chart
    this.pieChartOptions.set({
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          const value = this.formatPeruvianCurrency(params.value);
          return `${params.seriesName}<br/>${params.name}: ${value} (${params.percent}%)`;
        },
      },
      legend: {
        orient: 'vertical',
        left: 'left',
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: 'HHI_Agencias_Distribucion',
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      series: [
        {
          name: 'Distribución',
          type: 'pie',
          radius: '50%',
          data: datosGraficos.map((a) => ({
            value: a.monto,
            name: a.agencia,
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

    // Bar Chart
    this.barChartOptions.set({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        formatter: (params: any) => {
          const data = params[0];
          return `${data.name}<br/>Participación: ${this.formatPeruvianNumber(data.value, 2)}%`;
        },
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: 'HHI_Agencias_Ranking',
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

  getTotalOperaciones(agencias: ConcentracionAgencia[]): number {
    return agencias.reduce((total, agencia) => total + agencia.numeroOperaciones, 0);
  }

  // Helper para formatear números al estilo peruano
  private formatPeruvianNumber(value: number, decimals = 0): string {
    return value.toLocaleString('es-PE', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  }

  // Helper para formatear moneda peruana
  private formatPeruvianCurrency(value: number): string {
    return 'S/. ' + this.formatPeruvianNumber(value, 2);
  }
}
