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
  selector: 'app-hhi-sector-economico',
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
  templateUrl: './hhi-sector-economico.component.html',
  styleUrls: ['./hhi-sector-economico.component.scss'],
})
export class HHISectorEconomicoComponent implements OnInit {
  private carteraRepository = inject(CARTERA_REPOSITORY_TOKEN) as CarteraRepository;
  private router = inject(Router);

  // Signals
  reporte = signal<HHIAgenciasReporte | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

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
      await this.carteraRepository.clearData();
      console.log('✅ Base de datos limpiada');
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
      const datos = await this.carteraRepository.getHHISectorEconomico();
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
    const top10 = datos.agencias.slice(0, 10);
    const otros = datos.agencias.slice(10);
    const sumaOtros = otros.reduce((sum, a) => sum + a.participacion, 0);

    const datosGraficos = [...top10];
    if (otros.length > 0) {
      datosGraficos.push({
        agencia: 'Otros',
        monto: otros.reduce((sum, a) => sum + a.monto, 0),
        participacion: sumaOtros,
        numeroOperaciones: otros.reduce((sum, a) => sum + a.numeroOperaciones, 0),
      });
    }

    // Configurar gráfico de torta
    this.pieChartOptions.set({
      title: {
        text: 'Distribución por Sector Económico',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: function (params: any) {
          return `${params.name}<br/>Participación: ${params.percent}%<br/>Monto: S/. ${params.value.toLocaleString('es-PE')}`;
        },
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: 'HHI_SectorEconomico_Distribucion',
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
      },
      series: [
        {
          name: 'Participación',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          data: datosGraficos.map((item) => ({
            value: item.monto,
            name: item.agencia,
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

    // Configurar gráfico de barras
    this.barChartOptions.set({
      title: {
        text: 'Ranking por Participación (%)',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        formatter: function (params: any) {
          const item = params[0];
          const destino = datosGraficos.find((a) => a.agencia === item.name);
          return `${item.name}<br/>Participación: ${item.value}%<br/>Monto: S/. ${destino?.monto.toLocaleString('es-PE')}<br/>Operaciones: ${destino?.numeroOperaciones.toLocaleString('es-PE')}`;
        },
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: 'HHI_SectorEconomico_Ranking',
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

  getTotalOperaciones(sectores: ConcentracionAgencia[]): number {
    return sectores.reduce((total, sector) => total + sector.numeroOperaciones, 0);
  }
}
