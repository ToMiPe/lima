import { Component, OnInit, OnDestroy, signal, computed, effect, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { TabsModule } from 'primeng/tabs';
import { SelectModule } from 'primeng/select';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { FloatLabelModule } from 'primeng/floatlabel';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';

// ECharts
import { NgxEchartsModule } from 'ngx-echarts';
import type { EChartsOption } from 'echarts';

// MapLibre
import maplibregl, { Map as MapLibreMap, NavigationControl, Popup } from 'maplibre-gl';

// Servicios y modelos
import { IPCConfigService } from '../../services/ipc-config.service';
import { IPCDataService, IPCEstadisticas } from '../../services/ipc-data.service';
import {
  IPCDimension,
  IPCConfig,
  DataFilters,
  RANGOS_MONTO_CREDITO,
  RANGOS_CAPACIDAD_PAGO,
} from '../../models/ipc-config.interface';
import { ReporteCartera } from '@core/cartera/models/reporte-cartera.interface';
import {
  HHI_CONCENTRATION_RANGES,
  HHIConcentrationRange,
} from '@core/cartera/models/hhi-concentration-ranges';

/**
 * Interfaz para filas de la tabla de datos
 */
interface TablaDataRow {
  cliente: string;
  cod_cliente: string;
  documento: string;
  agencia: string;
  genero: string;
  producto: string;
  plazo: number;
  saldo_capital: number;
  dias_atraso: number;
  valorIPC: number | string | null;
  rangoLabel: string;
  colorHex: string;
  latitud?: number;
  longitud?: number;
  tieneUbicacion: boolean;
  registroCompleto?: ReporteCartera; // Para tooltip con datos de fórmula
}

/**
 * Componente unificado para visualización de 18 IPCs
 * Navegación: Dimensión (tabs) → Indicador (dropdown) → Mapa
 */
@Component({
  selector: 'app-ipc-unified',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TabsModule,
    SelectModule,
    CheckboxModule,
    ProgressSpinnerModule,
    TooltipModule,
    NgxEchartsModule,
    MultiSelectModule,
    SliderModule,
    FloatLabelModule,
    DialogModule,
    ButtonModule,
    TableModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
  ],
  templateUrl: './ipc-unified.component.html',
  styleUrls: ['./ipc-unified.component.scss'],
})
export class IPCUnifiedComponent implements OnInit, OnDestroy {
  private configService = inject(IPCConfigService);
  private dataService = inject(IPCDataService);

  // Referencia a la tabla para búsqueda
  @ViewChild('dt') dataTable?: Table;

  // Mapa
  private map?: MapLibreMap;
  private popup?: Popup;
  private mapListenersAdded = false;

  // Estado reactivo
  dimensionesMenu = signal<{ id: IPCDimension; label: string; icon: string }[]>([]);
  dimensionActiva = signal<IPCDimension>('ingreso');
  indicadoresDisponibles = computed(() => {
    return [...this.configService.getIPCsByDimension(this.dimensionActiva())];
  });

  indicadorSeleccionado = signal<IPCConfig | null>(null);
  estadisticas = signal<IPCEstadisticas | null>(null);
  isLoadingData = this.dataService.isLoading;
  isLoadingMap = signal(false);

  // UI State
  mostrarInterpretacion = signal(false);
  mostrarEstadisticas = signal(true); // Panel derecho expandido por defecto
  mostrarFiltrosBaseDatos = signal(false); // Filtros de BD colapsados por defecto
  mostrarDialogFiltros = signal(false); // Modal de filtros
  mostrarDialogDistribucion = signal(false); // Modal de distribución de datos
  mostrarDialogDetalleRango = signal(false); // Modal de detalle de rango específico
  rangoSeleccionadoDetalle = signal<{ id: string; label: string; colorHex: string } | null>(null); // Rango seleccionado para ver detalle
  tabDistribucionActiva: string | number | undefined = 'genero'; // Tab activo en modal de distribución
  mostrarMapa = signal(true); // Control de visibilidad del mapa (colapsable)
  mapaInicializado = signal(false); // Lazy loading del mapa
  tabGraficosActiva = signal<string | number | undefined>('distribucion'); // Tab activo en panel de gráficos (reactivo)
  datosTablaCache = signal<TablaDataRow[]>([]); // Cache de datos transformados para la tabla
  filaSeleccionada = signal<{ cliente: string; documento: string } | null>(null); // Fila seleccionada (sincronización mapa ↔ tabla)
  datosRangoSeleccionado = computed<TablaDataRow[]>(() => {
    const rango = this.rangoSeleccionadoDetalle();
    const todosLosDatos = this.datosTablaCache();

    if (!rango || todosLosDatos.length === 0) {
      return [];
    }

    // Filtrar solo los registros del rango seleccionado
    return todosLosDatos.filter((d) => d.rangoLabel === rango.label);
  });

  // Filtros de rangos (controles de visualización)
  filtrosActivos = signal<Set<string>>(new Set());
  rangosDisponibles = computed(() => {
    const config = this.indicadorSeleccionado();

    if (!config) return [];

    // IPCs categóricos
    if (config.tipo === 'categorico' && config.categorias) {
      return config.categorias.map((cat) => ({
        id: cat.valor,
        label: cat.label,
        color: cat.color,
        colorHex: cat.colorHex,
      }));
    }

    // IPCs numéricos
    const rangos = config.rangosCustom || HHI_CONCENTRATION_RANGES;
    return rangos.map((rango: HHIConcentrationRange) => ({
      id: `${rango.from}-${rango.to}`,
      label: rango.label,
      color: rango.color,
      colorHex: rango.colorHex,
    }));
  });

  // Información de dimensión activa
  dimensionInfo = computed(() => {
    return this.configService.getDimensionConfig(this.dimensionActiva());
  });

  // Contador de registros filtrados (signal en vez de computed porque necesita async)
  registrosFiltrados = signal<{ filtrados: number; total: number }>({ filtrados: 0, total: 0 });

  // Datos para tabla (computed)
  datosTabla = computed<TablaDataRow[] | null>(() => {
    const cache = this.datosTablaCache();
    const isLoading = this.isLoadingData();

    if (isLoading || cache.length === 0) {
      return null;
    }

    return cache;
  });

  // Filtros de base de datos
  sedesDisponibles = signal<{ label: string; value: string }[]>([]);
  generosDisponibles = signal<string[]>([]);
  productosDisponibles = signal<{ label: string; value: string }[]>([]);
  zonasDisponibles = signal<string[]>([]);
  rangosMonto = signal<{ label: string; value: string }[]>([]);
  categoriasDisponibles = signal<{ label: string; value: string }[]>([]);
  calificacionesCRDisponibles = signal<{ label: string; value: string }[]>([]);
  rangosCapacidadPago = signal<{ label: string; value: string }[]>([]);

  // Valores seleccionados para filtros
  sedesSeleccionadas = signal<string[]>([]);
  generosSeleccionados = signal<string[]>([]);
  productosSeleccionados = signal<string[]>([]);
  zonasSeleccionadas = signal<string[]>([]);
  rangosMontosSeleccionados = signal<string[]>([]);
  categoriasSeleccionadas = signal<string[]>([]);
  calificacionesCRSeleccionadas = signal<string[]>([]);
  rangosCapacidadPagoSeleccionados = signal<string[]>([]);

  // Contador de filtros activos
  filtrosBaseDatosActivos = computed(() => {
    let count = 0;
    if (this.sedesSeleccionadas().length > 0) count++;
    if (this.generosSeleccionados().length > 0) count++;
    if (this.productosSeleccionados().length > 0) count++;
    if (this.zonasSeleccionadas().length > 0) count++;
    if (this.rangosMontosSeleccionados().length > 0) count++;
    if (this.categoriasSeleccionadas().length > 0) count++;
    if (this.calificacionesCRSeleccionadas().length > 0) count++;
    if (this.rangosCapacidadPagoSeleccionados().length > 0) count++;
    return count;
  });

  // Estadísticas de impacto de filtros
  impactoFiltros = computed(() => {
    const conteo = this.registrosFiltrados();
    const stats = this.estadisticas();

    const totalOriginal = conteo.total;
    const conFiltrosBD = conteo.filtrados;
    const visibleEnMapa = stats?.total || 0;

    const porcentajeFiltrosBD = totalOriginal > 0 ? (conFiltrosBD / totalOriginal) * 100 : 100;
    const porcentajeVisible = totalOriginal > 0 ? (visibleEnMapa / totalOriginal) * 100 : 100;

    return {
      totalOriginal,
      conFiltrosBD,
      visibleEnMapa,
      porcentajeFiltrosBD,
      porcentajeVisible,
      reduccionBD: totalOriginal - conFiltrosBD,
      reduccionVisible: totalOriginal - visibleEnMapa,
    };
  });

  // Distribución de datos por categoría (para modal de distribución)
  _datosParaDistribucion = signal<ReporteCartera[]>([]);
  cargandoDistribucion = signal<boolean>(false);

  distribucionGeneros = computed(() => {
    const datosFiltrados = this._datosParaDistribucion();
    console.log('Calculando distribución géneros, registros:', datosFiltrados.length);
    if (datosFiltrados.length === 0) return [];

    const distribucion = new Map<string, number>();
    datosFiltrados.forEach((d: ReporteCartera) => {
      const genero = d.genero || 'No especificado';
      distribucion.set(genero, (distribucion.get(genero) || 0) + 1);
    });

    const resultado = Array.from(distribucion.entries())
      .map(([categoria, cantidad]) => ({
        categoria,
        cantidad,
        porcentaje: (cantidad / datosFiltrados.length) * 100,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);

    console.log('Distribución géneros calculada:', resultado);
    return resultado;
  });

  distribucionSedes = computed(() => {
    const datosFiltrados = this._datosParaDistribucion();
    if (datosFiltrados.length === 0) return [];

    const distribucion = new Map<string, number>();
    datosFiltrados.forEach((d: ReporteCartera) => {
      const sede = d.agencia || 'No especificado';
      distribucion.set(sede, (distribucion.get(sede) || 0) + 1);
    });

    return Array.from(distribucion.entries())
      .map(([categoria, cantidad]) => ({
        categoria,
        cantidad,
        porcentaje: (cantidad / datosFiltrados.length) * 100,
      }))
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 15); // Top 15 sedes
  });

  distribucionProductos = computed(() => {
    const datosFiltrados = this._datosParaDistribucion();
    if (datosFiltrados.length === 0) return [];

    const distribucion = new Map<string, number>();
    datosFiltrados.forEach((d: ReporteCartera) => {
      const producto = d.producto || 'No especificado';
      distribucion.set(producto, (distribucion.get(producto) || 0) + 1);
    });

    return Array.from(distribucion.entries())
      .map(([categoria, cantidad]) => ({
        categoria,
        cantidad,
        porcentaje: (cantidad / datosFiltrados.length) * 100,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  });

  distribucionZonas = computed(() => {
    const datosFiltrados = this._datosParaDistribucion();
    if (datosFiltrados.length === 0) return [];

    const distribucion = new Map<string, number>();
    datosFiltrados.forEach((d: ReporteCartera) => {
      const zona = d.zona_geografica || 'No especificado';
      distribucion.set(zona, (distribucion.get(zona) || 0) + 1);
    });

    return Array.from(distribucion.entries())
      .map(([categoria, cantidad]) => ({
        categoria,
        cantidad,
        porcentaje: (cantidad / datosFiltrados.length) * 100,
      }))
      .sort((a, b) => b.cantidad - a.cantidad);
  });

  distribucionMontos = computed(() => {
    const datosFiltrados = this._datosParaDistribucion();
    if (datosFiltrados.length === 0) return [];

    // Crear rangos de montos
    const montos = datosFiltrados
      .map((d: ReporteCartera) => d.monto_colocado)
      .filter((m: number) => m > 0);
    if (montos.length === 0) return [];

    const min = Math.min(...montos);
    const max = Math.max(...montos);
    const numRangos = 10;
    const tamañoRango = (max - min) / numRangos;

    const rangos = Array.from({ length: numRangos }, (_, i) => {
      const rangoMin = min + i * tamañoRango;
      const rangoMax = i === numRangos - 1 ? max : rangoMin + tamañoRango;
      return {
        min: rangoMin,
        max: rangoMax,
        label: `${rangoMin.toLocaleString('es-PE', { maximumFractionDigits: 0 })} - ${rangoMax.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`,
        cantidad: 0,
      };
    });

    datosFiltrados.forEach((d: ReporteCartera) => {
      const monto = d.monto_colocado;
      const rangoIndex = Math.min(Math.floor((monto - min) / tamañoRango), numRangos - 1);
      rangos[rangoIndex].cantidad++;
    });

    return rangos.map((r) => ({
      categoria: r.label,
      cantidad: r.cantidad,
      porcentaje: (r.cantidad / datosFiltrados.length) * 100,
    }));
  });

  // Opciones ECharts para modal de distribución
  chartOptionsGeneros = computed<EChartsOption>(() => {
    const data = this.distribucionGeneros();
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: 'IPC_Distribucion_Generos',
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.categoria),
      },
      yAxis: {
        type: 'value',
        name: 'Cantidad',
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.cantidad),
          itemStyle: { color: '#8b5cf6' },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
          },
        },
      ],
    };
  });

  chartOptionsSedes = computed<EChartsOption>(() => {
    const data = this.distribucionSedes();
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: 'IPC_Distribucion_Sedes',
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      xAxis: {
        type: 'value',
        name: 'Cantidad',
      },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.categoria),
        axisLabel: {
          interval: 0,
          rotate: 0,
        },
      },
      grid: {
        left: '30%',
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.cantidad),
          itemStyle: { color: '#3b82f6' },
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
          },
        },
      ],
    };
  });

  chartOptionsProductos = computed<EChartsOption>(() => {
    const data = this.distribucionProductos();
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: 'IPC_Distribucion_Productos',
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.categoria),
        axisLabel: {
          interval: 0,
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Cantidad',
      },
      grid: {
        bottom: '25%',
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.cantidad),
          itemStyle: { color: '#10b981' },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
          },
        },
      ],
    };
  });

  chartOptionsZonas = computed<EChartsOption>(() => {
    const data = this.distribucionZonas();
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: 'IPC_Distribucion_Zonas',
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.categoria),
      },
      yAxis: {
        type: 'value',
        name: 'Cantidad',
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.cantidad),
          itemStyle: { color: '#f59e0b' },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
          },
        },
      ],
    };
  });

  chartOptionsMontos = computed<EChartsOption>(() => {
    const data = this.distribucionMontos();
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: 'IPC_Distribucion_Montos',
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.categoria),
        axisLabel: {
          interval: 0,
          rotate: 45,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Cantidad',
      },
      grid: {
        bottom: '30%',
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.cantidad),
          itemStyle: { color: '#ef4444' },
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
          },
        },
      ],
    };
  });

  // Opciones de gráfica de torta
  chartOptions = computed<EChartsOption>(() => {
    const stats = this.estadisticas();
    const rangos = this.rangosDisponibles();

    if (!stats || rangos.length === 0) {
      return {};
    }

    const data = rangos.map((rango) => ({
      name: rango.label,
      value: stats.distribucion.get(rango.id) || 0,
      itemStyle: { color: rango.colorHex },
    }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
        appendToBody: true,
        position: 'top',
        z: 99999,
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: `IPC_${this.indicadorSeleccionado()?.codigo || 'Grafico'}_Distribucion`,
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      legend: {
        show: false,
      },
      series: [
        {
          name: 'Distribución',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{d}%',
            fontSize: 11,
            fontWeight: 'bold',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: true,
            length: 8,
            length2: 8,
          },
          data,
        },
      ],
    };
  });

  constructor() {
    // Efecto: actualizar mapa cuando cambia indicador o filtros
    effect(() => {
      const indicador = this.indicadorSeleccionado();
      // Observar cambios en los filtros del servicio
      this.dataService.rangosFiltrados();

      if (indicador && this.map) {
        this.actualizarMapa();
      }
    });

    // Efecto: actualizar contador de registros filtrados
    effect(() => {
      const stats = this.estadisticas();
      const config = this.indicadorSeleccionado();
      const filtros = this.filtrosActivos();

      if (!stats) {
        this.registrosFiltrados.set({ filtrados: 0, total: 0 });
        return;
      }

      if (!config) {
        this.registrosFiltrados.set({ filtrados: 0, total: stats.total });
        return;
      }

      // Obtener total real (sin filtros de rango)
      this.dataService.getTotalRecords().then((totalReal) => {
        if (filtros.size === 0) {
          this.registrosFiltrados.set({ filtrados: totalReal, total: totalReal });
        } else {
          // Total filtrado viene de stats.total, total real sin filtros
          this.registrosFiltrados.set({ filtrados: stats.total, total: totalReal });
        }
      });
    });

    // Efecto: cargar datos para distribución cuando se abre el modal
    effect(() => {
      const mostrarModal = this.mostrarDialogDistribucion();

      if (mostrarModal) {
        console.log('Cargando datos para distribución...');
        this.cargandoDistribucion.set(true);
        this.dataService
          .getTodosDatosFiltrados()
          .then((datos) => {
            console.log('Datos cargados para distribución:', datos.length, 'registros');
            this._datosParaDistribucion.set(datos);
            this.cargandoDistribucion.set(false);
          })
          .catch((error) => {
            console.error('Error cargando datos para distribución:', error);
            this.cargandoDistribucion.set(false);
          });
      } else {
        // Limpiar datos cuando se cierra el modal
        this._datosParaDistribucion.set([]);
      }
    });

    // Efecto: cargar datos para tabla cuando se activa el tab de datos
    effect(() => {
      const tabActiva = this.tabGraficosActiva();
      const config = this.indicadorSeleccionado();

      if (tabActiva === 'datos' && config) {
        console.log('🔄 Cargando datos para tabla...');
        this.cargarDatosTabla();
      }
    });

    // Efecto: recargar tabla cuando cambian filtros de base de datos
    effect(() => {
      const tabActiva = this.tabGraficosActiva();
      const config = this.indicadorSeleccionado();

      // Observar todos los filtros de base de datos
      this.sedesSeleccionadas();
      this.generosSeleccionados();
      this.productosSeleccionados();
      this.zonasSeleccionadas();
      this.rangosMontosSeleccionados();
      this.categoriasSeleccionadas();
      this.calificacionesCRSeleccionadas();
      this.rangosCapacidadPagoSeleccionados();

      // Si la tabla está activa, recargar
      if (tabActiva === 'datos' && config) {
        console.log('🔄 Filtros cambiaron, recargando tabla...');
        this.cargarDatosTabla();
      }
    });
  }

  ngOnInit(): void {
    this.inicializarDimensiones();
    this.cargarOpcionesFiltros();

    // Lazy loading: inicializar mapa solo si está visible
    setTimeout(() => {
      if (this.mostrarMapa()) {
        this.inicializarMapaSiNecesario();
      }
    }, 500);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  /**
   * Inicializar menú de dimensiones
   */
  private inicializarDimensiones(): void {
    const dimensiones = this.configService.getAllDimensions();

    const menu = dimensiones.map((dim) => ({
      id: dim.id,
      label: dim.nombre,
      icon: dim.icono,
    }));

    this.dimensionesMenu.set(menu);

    // Seleccionar primera dimensión y primer indicador
    if (dimensiones.length > 0) {
      const primeraDimension = dimensiones[0];
      this.dimensionActiva.set(primeraDimension.id);

      const ipcs = this.configService.getIPCsByDimension(primeraDimension.id);
      if (ipcs.length > 0) {
        this.indicadorSeleccionado.set(ipcs[0]);
        this.dataService.setIPC(ipcs[0].campo);
      }
    }
  }

  /**
   * Inicializar mapa MapLibre con clustering
   */
  private async inicializarMapa(): Promise<void> {
    this.isLoadingMap.set(true);

    try {
      this.map = new maplibregl.Map({
        container: 'ipc-map',
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [-74.5, -9.19],
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
      });

      // Navegación
      this.map.addControl(new NavigationControl(), 'top-right');

      // Popup para tooltips
      this.popup = new Popup({
        closeButton: false,
        closeOnClick: false,
      });

      // Esperar a que cargue el mapa
      await new Promise<void>((resolve) => {
        this.map!.on('load', () => resolve());
      });

      // Centrar en Perú solo en la carga inicial
      // Bounds aproximados de Perú: NO [-81.4, -0.04], SE [-68.7, -18.4]
      const peruBounds = new maplibregl.LngLatBounds(
        [-81.4, -18.4], // Southwest
        [-68.7, -0.04], // Northeast
      );
      this.map.fitBounds(peruBounds, { padding: 50 });

      // Cargar datos iniciales
      await this.actualizarMapa();
    } catch (error) {
      console.error('Error inicializando mapa:', error);
    } finally {
      this.isLoadingMap.set(false);
    }
  }

  /**
   * Actualizar datos del mapa
   */
  private async actualizarMapa(): Promise<void> {
    if (!this.map) return;

    this.isLoadingMap.set(true);

    try {
      const geojson = await this.dataService.generarGeoJSON();
      const stats = await this.dataService.calcularEstadisticas();

      this.estadisticas.set(stats);

      // Si el source ya existe, solo actualizar los datos
      const source = this.map.getSource('ipc-source') as maplibregl.GeoJSONSource;
      if (source) {
        source.setData(geojson);
      } else {
        // Agregar source con clustering
        this.map.addSource('ipc-source', {
          type: 'geojson',
          data: geojson,
          cluster: true,
          clusterMaxZoom: 14,
          clusterRadius: 50,
        });

        // Layer para clusters
        this.map.addLayer({
          id: 'clusters',
          type: 'circle',
          source: 'ipc-source',
          filter: ['has', 'point_count'],
          paint: {
            'circle-color': '#3b82f6',
            'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
          },
        });

        // Layer para texto del cluster
        this.map.addLayer({
          id: 'cluster-count',
          type: 'symbol',
          source: 'ipc-source',
          filter: ['has', 'point_count'],
          layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-size': 14,
          },
          paint: {
            'text-color': '#ffffff',
          },
        });

        // Layer para puntos individuales con colores dinámicos
        this.map.addLayer({
          id: 'unclustered-point',
          type: 'circle',
          source: 'ipc-source',
          filter: ['!', ['has', 'point_count']],
          paint: {
            'circle-color': ['get', 'ipc_color_hex'],
            'circle-radius': 8,
            'circle-stroke-width': 2,
            'circle-stroke-color': '#fff',
          },
        });
      }

      // Agregar event listeners solo una vez
      if (!this.mapListenersAdded) {
        this.mapListenersAdded = true;

        // Click en clusters para expandir
        this.map.on('click', 'clusters', (e) => {
          const features = this.map!.queryRenderedFeatures(e.point, {
            layers: ['clusters'],
          });
          const clusterId = features[0].properties?.['cluster_id'];
          const source = this.map!.getSource('ipc-source') as maplibregl.GeoJSONSource;
          source
            .getClusterExpansionZoom(clusterId)
            .then((zoom: number) => {
              this.map!.easeTo({
                center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
                zoom: zoom,
              });
            })
            .catch(() => {
              // Ignore cluster expansion errors
            });
        });

        // Hover en puntos individuales
        this.map.on('mouseenter', 'unclustered-point', (e) => {
          if (!this.popup || !e.features || e.features.length === 0) return;

          this.map!.getCanvas().style.cursor = 'pointer';

          const feature = e.features[0];
          const props = feature.properties as Record<string, unknown>;
          const config = this.indicadorSeleccionado();
          const coordinates = (feature.geometry as GeoJSON.Point).coordinates.slice() as [
            number,
            number,
          ];

          const html = `
            <div class="font-bold">${props['nombre']}</div>
            <div class="text-sm">Agencia: ${props['agencia']}</div>
            <div class="text-sm mt-1">
              <strong>${config?.titulo}:</strong>
              ${this.formatearValorIPC(props['ipc_valor'] as number | string | null)}
            </div>
            <div class="text-sm text-gray-600">${props['ipc_label']}</div>
            ${props['dias_atraso'] ? `<div class="text-sm">Días atraso: ${props['dias_atraso']}</div>` : ''}
          `;

          this.popup!.setLngLat(coordinates).setHTML(html).addTo(this.map!);
        });

        this.map.on('mouseleave', 'unclustered-point', () => {
          this.map!.getCanvas().style.cursor = '';
          if (this.popup) {
            this.popup.remove();
          }
        });

        // Click en puntos individuales para seleccionar en tabla
        this.map.on('click', 'unclustered-point', (e) => {
          if (!e.features || e.features.length === 0) return;

          const feature = e.features[0];
          const props = feature.properties as Record<string, unknown>;

          // Marcar como seleccionado
          this.filaSeleccionada.set({
            cliente: props['nombre'] as string,
            documento: props['documento'] as string,
          });

          // Si la tabla está visible, hacer scroll a la fila
          if (this.tabGraficosActiva() === 'datos') {
            console.log('📍 Punto seleccionado en mapa:', props['nombre']);
          }
        });
      }

      // No aplicar fitBounds aquí para preservar el zoom del usuario
    } catch (error) {
      console.error('Error actualizando mapa:', error);
    } finally {
      this.isLoadingMap.set(false);
    }
  }

  /**
   * Cambiar dimensión activa
   */
  cambiarDimension(dimension: IPCDimension): void {
    this.dimensionActiva.set(dimension);
    this.dataService.setDimension(dimension);

    // Auto-seleccionar primer indicador de la dimensión
    const ipcs = this.configService.getIPCsByDimension(dimension);
    if (ipcs.length > 0) {
      this.indicadorSeleccionado.set(ipcs[0]);
      this.dataService.setIPC(ipcs[0].campo);
    }

    // Limpiar filtros y selección
    this.filtrosActivos.set(new Set());
    this.filaSeleccionada.set(null);
    this.dataService.clearFiltros();
  }

  /**
   * Cambiar indicador seleccionado
   */
  onIndicadorChange(event: { value: IPCConfig }): void {
    const config = event.value;
    this.indicadorSeleccionado.set(config);
    this.dataService.setIPC(config.campo);

    // Limpiar filtros y selección
    this.filtrosActivos.set(new Set());
    this.filaSeleccionada.set(null);
    this.dataService.clearFiltros();
  }

  /**
   * Toggle filtro por rango
   */
  toggleFiltro(rangoId: string): void {
    this.dataService.toggleRangoFiltro(rangoId);
    this.filtrosActivos.set(this.dataService.rangosFiltrados());
  }

  /**
   * Verificar si filtro está activo
   */
  isFiltroActivo(rangoId: string): boolean {
    return this.filtrosActivos().has(rangoId);
  }

  /**
   * Limpiar todos los filtros
   */
  limpiarFiltros(): void {
    this.dataService.clearFiltros();
    this.filtrosActivos.set(new Set());
  }

  /**
   * Seleccionar todos los filtros disponibles
   */
  seleccionarTodosFiltros(): void {
    const rangos = this.rangosDisponibles();
    const todosFiltros = new Set(rangos.map((r) => r.id));
    this.dataService.setFiltros(todosFiltros);
    this.filtrosActivos.set(todosFiltros);
  }

  /**
   * Deseleccionar todos los filtros
   */
  deseleccionarTodosFiltros(): void {
    this.limpiarFiltros();
  }

  /**
   * Formatear valor IPC para presentación
   */
  formatearValorIPC(valor: number | string | null): string {
    const config = this.indicadorSeleccionado();
    if (!config) return 'N/A';

    return this.dataService.formatearValor(valor, config);
  }

  /**
   * Formatear número con locale peruano
   * En Perú: separador de miles = coma (,), separador decimal = punto (.)
   */
  formatearNumero(valor: number, decimales = 2): string {
    return valor.toLocaleString('es-PE', {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales,
      useGrouping: true, // Asegurar separador de miles
    });
  }

  /**
   * Obtener interpretación según el nivel de riesgo
   */
  obtenerInterpretacion(nivel: 'bajo' | 'moderado' | 'alto'): string {
    const config = this.indicadorSeleccionado();
    if (!config) return '';

    return config.interpretacion[nivel];
  }

  /**
   * Obtener clase CSS para badge de riesgo
   */
  obtenerClaseRiesgo(stats: IPCEstadisticas): string {
    const config = this.indicadorSeleccionado();
    if (!config || config.tipo === 'categorico') return 'bg-gray-500';

    const valorMedia = stats.media;
    const rangos = config.rangosCustom || HHI_CONCENTRATION_RANGES;
    const rango = rangos.find(
      (r: HHIConcentrationRange) => valorMedia >= r.from && valorMedia <= r.to,
    );

    if (!rango) return 'bg-gray-500';

    // Mapear colores a clases Tailwind
    const colorMap: Record<string, string> = {
      'green-600': 'bg-green-600',
      'orange-500': 'bg-orange-500',
      'yellow-500': 'bg-yellow-500',
      'cyan-500': 'bg-cyan-500',
      'red-600': 'bg-red-600',
      'gray-900': 'bg-gray-900',
    };

    return colorMap[rango.color] || 'bg-gray-500';
  }

  /**
   * Obtener cantidad de registros en un rango específico
   */
  obtenerCantidadEnRango(rangoId: string): number {
    const stats = this.estadisticas();
    if (!stats) return 0;

    return stats.distribucion.get(rangoId) || 0;
  }

  /**
   * Cargar opciones disponibles para los filtros
   */
  private async cargarOpcionesFiltros(): Promise<void> {
    try {
      // Cargar sedes
      const sedes = await this.dataService.getUniqueValues('agencia');
      this.sedesDisponibles.set(sedes.map((s) => ({ label: s, value: s })));

      // Cargar géneros
      const generos = await this.dataService.getUniqueValues('genero');
      this.generosDisponibles.set(generos);

      // Cargar productos
      const productos = await this.dataService.getUniqueValues('producto');
      this.productosDisponibles.set(productos.map((p) => ({ label: p, value: p })));

      // Cargar zonas
      const zonas = await this.dataService.getUniqueValues('zona_geografica');
      this.zonasDisponibles.set(zonas);

      // Inicializar rangos de monto fijos
      this.rangosMonto.set(RANGOS_MONTO_CREDITO.map((r) => ({ label: r.label, value: r.id })));

      // Cargar categorías
      const categorias = await this.dataService.getUniqueValues('categoria');
      this.categoriasDisponibles.set(categorias.map((c) => ({ label: c, value: c })));

      // Cargar calificaciones CR
      const calificacionesCR = await this.dataService.getUniqueValues('calificacion_cr');
      this.calificacionesCRDisponibles.set(calificacionesCR.map((c) => ({ label: c, value: c })));

      // Inicializar rangos de capacidad de pago fijos
      this.rangosCapacidadPago.set(
        RANGOS_CAPACIDAD_PAGO.map((r) => ({ label: r.label, value: r.id })),
      );
    } catch (error) {
      console.error('Error cargando opciones de filtros:', error);
    }
  }

  /**
   * Aplicar filtros de base de datos
   */
  aplicarFiltrosBaseDatos(): void {
    const filters: DataFilters = {
      sedes: this.sedesSeleccionadas(),
      generos: this.generosSeleccionados(),
      montosCredito: this.rangosMontosSeleccionados(),
      productos: this.productosSeleccionados(),
      zonas: this.zonasSeleccionadas(),
      categorias: this.categoriasSeleccionadas(),
      calificacionesCR: this.calificacionesCRSeleccionadas(),
      capacidadesPago: this.rangosCapacidadPagoSeleccionados(),
    };

    this.dataService.setDataFilters(filters);
    this.actualizarMapa();

    // Recargar tabla si está activa
    if (this.tabGraficosActiva() === 'datos') {
      this.cargarDatosTabla();
    }
  }

  /**
   * Limpiar todos los filtros de base de datos
   */
  limpiarFiltrosBaseDatos(): void {
    this.sedesSeleccionadas.set([]);
    this.generosSeleccionados.set([]);
    this.productosSeleccionados.set([]);
    this.zonasSeleccionadas.set([]);
    this.rangosMontosSeleccionados.set([]);
    this.categoriasSeleccionadas.set([]);
    this.calificacionesCRSeleccionadas.set([]);
    this.rangosCapacidadPagoSeleccionados.set([]);

    this.dataService.clearDataFilters();
    this.filaSeleccionada.set(null); // Limpiar selección de fila
    this.actualizarMapa();

    // Recargar tabla si está activa
    if (this.tabGraficosActiva() === 'datos') {
      this.cargarDatosTabla();
    }
  }

  /**
   * Helper para verificar si una fila está seleccionada
   */
  esFilaSeleccionada(cliente: string, documento: string): boolean {
    const seleccionada = this.filaSeleccionada();
    return !!seleccionada && seleccionada.cliente === cliente && seleccionada.documento === documento;
  }

  obtenerLabelRangoMonto(rangoId: string): string {
    const rango = this.rangosMonto().find((r) => r.value === rangoId);
    return rango?.label || rangoId;
  }

  obtenerLabelRangoCapacidad(rangoId: string): string {
    const rango = this.rangosCapacidadPago().find((r) => r.value === rangoId);
    return rango?.label || rangoId;
  }

  async descargarDatosFiltrados(): Promise<void> {
    try {
      console.log('Descargando datos filtrados...');
      const datos = await this.dataService.getTodosDatosFiltrados();

      if (datos.length === 0) {
        alert('No hay datos para descargar con los filtros actuales.');
        return;
      }

      // Convertir a CSV
      const csv = this.convertirACSV(datos);

      // Agregar BOM UTF-8 para que Excel reconozca el encoding
      const BOM = '\uFEFF';
      const csvConBOM = BOM + csv;

      // Crear blob y descargar
      const blob = new Blob([csvConBOM], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      const fecha = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `IPC_Datos_Filtrados_${fecha}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log(` ${datos.length} registros descargados exitosamente`);
    } catch (error) {
      console.error(' Error al descargar datos:', error);
      alert('Error al descargar los datos. Por favor intente nuevamente.');
    }
  }

  private convertirACSV(datos: ReporteCartera[]): string {
    if (datos.length === 0) return '';

    // Encabezados
    const encabezados = [
      'Agencia',
      'Código Agencia',
      'Asesor Servicios',
      'Cliente',
      'Documento',
      'Tipo Documento',
      'Género',
      'Edad',
      'Departamento',
      'Provincia',
      'Distrito',
      'Zona Geográfica',
      'Tipo Crédito',
      'Producto',
      'Destino Crédito',
      'Monto Colocado',
      'Saldo Total',
      'Plazo',
      'TEA',
      'Fecha Desembolso',
      'Días Atraso',
      'Clasificación',
      'Calificación CR',
      'Categoría',
      'Capacidad Pago',
      'Sector Económico',
      'Actividad Económica',
      'Situación',
      'Latitud',
      'Longitud',
    ];

    // Filas
    const filas = datos.map((d) => [
      this.escaparCSV(d.agencia),
      this.escaparCSV(d.cod_agencia),
      this.escaparCSV(d.asesor_servicios),
      this.escaparCSV(d.cliente),
      this.escaparCSV(d.documento),
      this.escaparCSV(d.tipo_documento),
      this.escaparCSV(d.genero),
      d.edad || '',
      this.escaparCSV(d.departamento),
      this.escaparCSV(d.provincia),
      this.escaparCSV(d.distrito),
      this.escaparCSV(d.zona_geografica),
      this.escaparCSV(d.tipo_credito),
      this.escaparCSV(d.producto),
      this.escaparCSV(d.destino_credito),
      d.monto_colocado || '',
      d.saldo_total || '',
      d.plazo || '',
      d.tea || '',
      this.escaparCSV(d.fecha_desembolso),
      d.dias_atraso || '',
      this.escaparCSV(d.clasificacion),
      this.escaparCSV(d.calificacion_cr),
      this.escaparCSV(d.categoria),
      d.capacidad_pago || '',
      this.escaparCSV(d.sector_economico),
      this.escaparCSV(d.actividad_economica),
      this.escaparCSV(d.situacion),
      d.latitud || '',
      d.longitud || '',
    ]);

    // Combinar con punto y coma (;) para compatibilidad con Excel en español
    const csvContent = [encabezados.join(';'), ...filas.map((fila) => fila.join(';'))].join('\n');

    return csvContent;
  }

  /**
   * Genera el contenido HTML del tooltip con los datos de la fórmula del IPC
   */
  generarTooltipFormulaIPC(row: TablaDataRow): string {
    const registro = row.registroCompleto;
    if (!registro) return 'Sin datos disponibles';

    const config = this.indicadorSeleccionado();
    if (!config) return '';

    const ipcId = config.id;
    const formatNum = (n: number | string | undefined, decimales = 2) => {
      if (n === undefined || n === null) return 'N/A';
      const num = typeof n === 'string' ? parseFloat(n) : n;
      return isNaN(num) ? 'N/A' : num.toLocaleString('es-PE', { minimumFractionDigits: decimales, maximumFractionDigits: decimales });
    };

    // Mapear cada IPC a su fórmula y datos
    switch (ipcId) {
      case 'ipc1_1':
        return `<div class="text-sm"><strong>Mora 1-8 días</strong><br/>Valor directo del CSV<br/><br/><strong>Monto:</strong> S/ ${formatNum(registro.mora_1_8)}</div>`;

      case 'ipc1_2':
        return `<div class="text-sm"><strong>Mora 9-30 días</strong><br/>Valor directo del CSV<br/><br/><strong>Monto:</strong> S/ ${formatNum(registro.mora_9_30)}</div>`;

      case 'ipc1_3':
        return `<div class="text-sm"><strong>Mora 31-60 días</strong><br/>Valor directo del CSV<br/><br/><strong>Monto:</strong> S/ ${formatNum(registro.mora_31_60)}</div>`;

      case 'ipc1_4':
        return `<div class="text-sm"><strong>Mora 61-90 días</strong><br/>Valor directo del CSV<br/><br/><strong>Monto:</strong> S/ ${formatNum(registro.mora_61_90)}</div>`;

      case 'ipc1_5':
        return `<div class="text-sm"><strong>Mora 91-120 días</strong><br/>Valor directo del CSV<br/><br/><strong>Monto:</strong> S/ ${formatNum(registro.mora_91_120)}</div>`;

      case 'ipc1_6':
        return `<div class="text-sm"><strong>Mora 120+ días</strong><br/>Valor directo del CSV<br/><br/><strong>Monto:</strong> S/ ${formatNum(registro.mora_120_mas)}</div>`;

      case 'ipc2':
        return `<div class="text-sm"><strong>Suma de mora 31+ días</strong><br/><em>mora_31_60 + mora_61_90 + mora_91_120 + mora_120_mas</em><br/><br/>• Mora 31-60 días: S/ ${formatNum(registro.mora_31_60)}<br/>• Mora 61-90 días: S/ ${formatNum(registro.mora_61_90)}<br/>• Mora 91-120 días: S/ ${formatNum(registro.mora_91_120)}<br/>• Mora 120+ días: S/ ${formatNum(registro.mora_120_mas)}<br/><br/><strong>Resultado:</strong> S/ ${formatNum(registro.ipc2)}</div>`;

      case 'ipc3':
        return `<div class="text-sm"><strong>Mora proporcional</strong><br/><em>días_atraso / días_crédito</em><br/><br/>• Días atraso: ${formatNum(registro.dias_atraso, 0)}<br/>• Días crédito: ${formatNum(registro.dias_credito, 0)}<br/><br/><strong>Resultado:</strong> ${formatNum((registro.ipc3 || 0) * 100)}%</div>`;

      case 'ipc4':
        return `<div class="text-sm"><strong>Capital en mora</strong><br/>Valor directo del saldo de capital<br/><br/><strong>Saldo capital:</strong> S/ ${formatNum(registro.saldo_capital)}</div>`;

      case 'ipc5':
        return `<div class="text-sm"><strong>Deuda vs Ahorros</strong><br/><em>(efectivo_caja + total_ahorros) / deuda_total</em><br/><br/>• Efectivo caja: S/ ${formatNum(registro.efectivo_caja)}<br/>• Total ahorros: S/ ${formatNum(registro.total_ahorros)}<br/>• Deuda total: S/ ${formatNum(registro.deuda_total)}<br/><br/><strong>Resultado:</strong> ${formatNum(registro.ipc5)}</div>`;

      case 'ipc6':
        return `<div class="text-sm"><strong>Recurrencia de mora</strong><br/>Sin fórmula (valor fijo)</div>`;

      case 'ipc7':
        return `<div class="text-sm"><strong>Capacidad de pago directa</strong><br/><em>ingreso_principal / capacidad_pago</em><br/><br/>• Ingreso principal: S/ ${formatNum(registro.ingreso_principal)}<br/>• Capacidad pago: S/ ${formatNum(registro.capacidad_pago)}<br/><br/><strong>Resultado:</strong> ${formatNum(registro.ipc7)}</div>`;

      case 'ipc8':
        return `<div class="text-sm"><strong>Jerarquía de fuente de pago</strong><br/><em>ingreso_principal + ingreso_fijo_anterior + total_ahorros</em><br/><br/>• Ingreso principal: S/ ${formatNum(registro.ingreso_principal)}<br/>• Ingreso fijo anterior: S/ ${formatNum(registro.ingreso_fijo_anterior)}<br/>• Total ahorros: S/ ${formatNum(registro.total_ahorros)}<br/><br/><strong>Resultado:</strong> S/ ${formatNum(registro.ipc8)}</div>`;

      case 'ipc9':
        const totalPasivos = (registro.pasivo_total_pasivo || 0) + (registro.pasivo_total_riesgos || 0);
        return `<div class="text-sm"><strong>Apalancamiento crédito</strong><br/><em>monto_colocado / (pasivo_total_pasivo + pasivo_total_riesgos)</em><br/><br/>• Monto colocado: S/ ${formatNum(registro.monto_colocado)}<br/>• Pasivo total pasivo: S/ ${formatNum(registro.pasivo_total_pasivo)}<br/>• Pasivo total riesgos: S/ ${formatNum(registro.pasivo_total_riesgos)}<br/>• <strong>Total pasivos:</strong> S/ ${formatNum(totalPasivos)}<br/><br/><strong>Resultado:</strong> ${formatNum(registro.ipc9)}</div>`;

      case 'ipc10':
        return `<div class="text-sm"><strong>IPC10</strong><br/>Sin fórmula definida</div>`;

      case 'ipc11':
        return `<div class="text-sm"><strong>Madurez relativa del cliente</strong><br/><em>(ciclo_cliente - 1) / ciclo_banca</em><br/><br/>• Ciclo cliente: ${formatNum(registro.ciclo_cliente, 0)}<br/>• Ciclo banca: ${formatNum(registro.ciclo_banca, 0)}<br/><br/><strong>Resultado:</strong> ${formatNum(registro.ipc11)}</div>`;

      case 'ipc12':
        return `<div class="text-sm"><strong>IPC12</strong><br/>Sin fórmula definida</div>`;

      case 'ipc13':
        return `<div class="text-sm"><strong>Liquidez respaldada</strong><br/><em>(efectivo_caja + total_ahorros) / activo_total</em><br/><br/>• Efectivo caja: S/ ${formatNum(registro.efectivo_caja)}<br/>• Total ahorros: S/ ${formatNum(registro.total_ahorros)}<br/>• Activo total: S/ ${formatNum(registro.activo_total)}<br/><br/><strong>Resultado:</strong> ${formatNum(registro.ipc13)}</div>`;

      case 'ipc14':
        return `<div class="text-sm"><strong>Estabilidad de ingresos</strong><br/><em>ingreso_fijo_anterior / ingreso_principal</em><br/><br/>• Ingreso fijo anterior: S/ ${formatNum(registro.ingreso_fijo_anterior)}<br/>• Ingreso principal: S/ ${formatNum(registro.ingreso_principal)}<br/><br/><strong>Resultado:</strong> ${formatNum(registro.ipc14)}</div>`;

      case 'ipc15':
        return `<div class="text-sm"><strong>Experiencia en actividad</strong><br/>Valor directo del CSV<br/><br/><strong>Años experiencia:</strong> ${formatNum(registro.años_experiencia_actividad, 0)}</div>`;

      case 'ipc16':
        return `<div class="text-sm"><strong>Estabilidad patrimonial</strong><br/><em>activo_anterior_balance / activo_total</em><br/><br/>• Activo anterior: S/ ${formatNum(registro.activo_anterior_balance)}<br/>• Activo total: S/ ${formatNum(registro.activo_total)}<br/><br/><strong>Resultado:</strong> ${formatNum(registro.ipc16)}</div>`;

      case 'ipc17':
        return `<div class="text-sm"><strong>Cobertura de provisión directa</strong><br/><em>provisión / saldo_capital</em><br/><br/>• Provisión: S/ ${formatNum(registro.provision)}<br/>• Saldo capital: S/ ${formatNum(registro.saldo_capital)}<br/><br/><strong>Resultado:</strong> ${formatNum(registro.ipc17)}</div>`;

      case 'ipc18':
        const sumaMoras = (registro.mora_1_8 || 0) + (registro.mora_9_30 || 0) + (registro.mora_31_60 || 0) +
          (registro.mora_61_90 || 0) + (registro.mora_91_120 || 0) + (registro.mora_120_mas || 0);
        return `<div class="text-sm"><strong>Cobertura de provisión indirecta</strong><br/><em>provisión / suma_moras</em><br/><br/>• Provisión: S/ ${formatNum(registro.provision)}<br/>• Suma moras: S/ ${formatNum(sumaMoras)}<br/><br/><strong>Resultado:</strong> ${formatNum(registro.ipc18)}</div>`;

      case 'ipc19':
        return `<div class="text-sm"><strong>Cobertura de ahorros</strong><br/><em>total_ahorros / saldo_capital</em><br/><br/>• Total ahorros: S/ ${formatNum(registro.total_ahorros)}<br/>• Saldo capital: S/ ${formatNum(registro.saldo_capital)}<br/><br/><strong>Resultado:</strong> ${formatNum(registro.ipc19)}</div>`;

      case 'ipc20':
        return `<div class="text-sm"><strong>Presión sobre capacidad de pago</strong><br/><em>deuda_total / capacidad_pago</em><br/><br/>• Deuda total: S/ ${formatNum(registro.deuda_total)}<br/>• Capacidad pago: S/ ${formatNum(registro.capacidad_pago)}<br/><br/><strong>Resultado:</strong> ${formatNum(registro.ipc20)}</div>`;

      case 'ipc21':
        return `<div class="text-sm"><strong>Disciplina de ahorro</strong><br/><em>ahorro_programado / ahorro_voluntario</em><br/><br/>• Ahorro programado: S/ ${formatNum(registro.ahorro_programado)}<br/>• Ahorro voluntario: S/ ${formatNum(registro.ahorro_voluntario)}<br/><br/><strong>Resultado:</strong> ${formatNum(registro.ipc21)}</div>`;

      case 'ipc22':
        return `<div class="text-sm"><strong>IPC22</strong><br/>Sin fórmula definida</div>`;

      case 'ipc23':
        return `<div class="text-sm"><strong>Sostenibilidad financiera</strong><br/><em>int_devengado / interés_percibido</em><br/><br/>• Interés devengado: S/ ${formatNum(registro.int_devengado)}<br/>• Interés percibido: S/ ${formatNum(registro.interes_percibido)}<br/><br/><strong>Resultado:</strong> ${formatNum(registro.ipc23)}</div>`;

      case 'ipc24':
        return `<div class="text-sm"><strong>Variación de ahorro</strong><br/><em>saldo_ahorro_mes_anterior - total_ahorro</em><br/><br/>• Saldo mes anterior: S/ ${formatNum(registro.saldo_ahorro_mes_anterior)}<br/>• Total ahorro: S/ ${formatNum(registro.total_ahorro)}<br/><br/><strong>Resultado:</strong> S/ ${formatNum(registro.ipc24)}</div>`;

      default:
        return 'Fórmula no disponible';
    }
  }

  private escaparCSV(valor: string | undefined | null): string {
    if (!valor) return '';

    // Si contiene punto y coma, comillas o salto de línea, envolver en comillas
    if (valor.includes(';') || valor.includes('"') || valor.includes('\n')) {
      return `"${valor.replace(/"/g, '""')}"`;
    }

    return valor;
  }

  /**
   * Cargar datos transformados para la tabla
   */
  private async cargarDatosTabla(): Promise<void> {
    try {
      const config = this.indicadorSeleccionado();
      if (!config) return;

      const datos = await this.dataService.getDatosFiltrados();
      console.log(`📊 Transformando ${datos.length} registros para tabla...`);

      const rangos = config.rangosCustom || HHI_CONCENTRATION_RANGES;

      const datosTransformados: TablaDataRow[] = datos.map((row) => {
        const valorIPC = this.obtenerValorIPC(row, config.campo);
        const rango = this.getRangoParaValor(valorIPC, config, rangos);

        // Verificar si tiene ubicación válida
        const latitud = row.latitud || 0;
        const longitud = row.longitud || 0;
        const tieneUbicacion = latitud !== 0 && longitud !== 0 && !isNaN(latitud) && !isNaN(longitud);

        return {
          cliente: row.cliente || 'N/A',
          cod_cliente: row.cod_cliente || 'N/A',
          documento: row.documento || 'N/A',
          agencia: row.agencia || 'N/A',
          genero: row.genero || 'N/A',
          producto: row.producto || 'N/A',
          plazo: row.plazo || 0,
          saldo_capital: row.saldo_capital || 0,
          dias_atraso: row.dias_atraso || 0,
          valorIPC: valorIPC,
          rangoLabel: rango.label,
          colorHex: rango.colorHex,
          latitud: latitud,
          longitud: longitud,
          tieneUbicacion: tieneUbicacion,
          registroCompleto: row, // Incluir registro completo para tooltip
        };
      });

      this.datosTablaCache.set(datosTransformados);
      console.log(`✅ ${datosTransformados.length} filas cargadas en tabla`);
    } catch (error) {
      console.error('❌ Error cargando datos para tabla:', error);
      this.datosTablaCache.set([]);
    }
  }

  /**
   * Manejar click en segmentos del gráfico (drill-down)
   */
  onChartClick(event: any): void {
    try {
      const rangoLabel = event.name; // e.g., "0.01 - 100 S/"
      console.log('📊 Click en gráfico:', rangoLabel);

      // Obtener configuración actual y rangos
      const config = this.indicadorSeleccionado();
      if (!config) return;

      const rangos = config.rangosCustom || HHI_CONCENTRATION_RANGES;

      // Buscar el rango por label
      const rango = rangos.find((r) => r.label === rangoLabel);
      if (!rango) {
        console.warn('⚠️ No se encontró rango para:', rangoLabel);
        return;
      }

      // Cargar datos de tabla si no están disponibles
      if (this.datosTablaCache().length === 0) {
        console.log('📥 Cargando datos de tabla para drill-down...');
        this.cargarDatosTabla().then(() => {
          // Configurar rango seleccionado y abrir modal
          this.rangoSeleccionadoDetalle.set({
            id: `${rango.from}-${rango.to}`,
            label: rango.label,
            colorHex: rango.colorHex,
          });
          this.mostrarDialogDetalleRango.set(true);
        });
      } else {
        // Datos ya disponibles, abrir modal inmediatamente
        this.rangoSeleccionadoDetalle.set({
          id: `${rango.from}-${rango.to}`,
          label: rango.label,
          colorHex: rango.colorHex,
        });
        this.mostrarDialogDetalleRango.set(true);
      }
    } catch (error) {
      console.error('❌ Error manejando click en gráfico:', error);
    }
  }

  /**
   * Navegar mapa a un registro específico
   */
  navegarARegistro(registro: TablaDataRow): void {
    try {
      console.log('🗺️ Navegando a registro:', registro.cliente);

      if (!this.map) {
        console.warn('⚠️ Mapa no inicializado');
        return;
      }

      // Verificar si el registro tiene coordenadas
      if (!registro.latitud || !registro.longitud || registro.latitud === 0 || registro.longitud === 0) {
        console.warn('⚠️ Registro sin coordenadas válidas');
        return;
      }

      console.log(`📍 Coordenadas: [${registro.longitud}, ${registro.latitud}]`);

      // Marcar como seleccionado
      this.filaSeleccionada.set({
        cliente: registro.cliente,
        documento: registro.documento,
      });

      // Cerrar modal si está abierto
      this.mostrarDialogDetalleRango.set(false);

      // Mostrar mapa si está oculto
      this.mostrarMapa.set(true);

      // Volar a las coordenadas
      this.map!.flyTo({
        center: [registro.longitud, registro.latitud],
        zoom: 16,
        duration: 2000,
      });

      // Agregar marcador temporal
      this.agregarMarcadorTemporal(registro.longitud, registro.latitud, registro.cliente);
    } catch (error) {
      console.error('❌ Error navegando a registro:', error);
    }
  }

  /**
   * Marcador temporal para resaltar en el mapa
   */
  private marcadorTemporal?: maplibregl.Marker;

  /**
   * Agregar marcador temporal pulsante en el mapa
   */
  private agregarMarcadorTemporal(lng: number, lat: number, nombre: string): void {
    try {
      // Remover marcador anterior si existe
      if (this.marcadorTemporal) {
        this.marcadorTemporal.remove();
      }

      // Crear elemento HTML para el marcador
      const el = document.createElement('div');
      el.className = 'marker-pulse';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.backgroundColor = '#3b82f6';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 0 10px rgba(59, 130, 246, 0.5)';

      // Crear popup
      const popup = new Popup({ offset: 25 }).setHTML(`
        <div class="font-semibold">${nombre}</div>
        <div class="text-xs text-gray-600">Click para más detalles</div>
      `);

      // Crear y agregar marcador
      this.marcadorTemporal = new maplibregl.Marker(el)
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(this.map!);

      // Mostrar popup automáticamente
      this.marcadorTemporal.togglePopup();

      // Remover automáticamente después de 10 segundos
      setTimeout(() => {
        if (this.marcadorTemporal) {
          this.marcadorTemporal.remove();
          this.marcadorTemporal = undefined;
        }
      }, 10000);

      console.log('✅ Marcador temporal agregado');
    } catch (error) {
      console.error('❌ Error agregando marcador temporal:', error);
    }
  }

  /**
   * Obtener valor IPC de un registro
   */
  private obtenerValorIPC(row: ReporteCartera, campo: string): number | string | null {
    const valor = (row as unknown as Record<string, unknown>)[campo];

    if (valor === undefined || valor === null) {
      return null;
    }

    if (typeof valor === 'number') {
      return valor;
    }

    if (typeof valor === 'string') {
      return valor;
    }

    return null;
  }

  /**
   * Obtener el rango correspondiente a un valor IPC
   */
  private getRangoParaValor(
    valor: number | string | null,
    config: IPCConfig,
    rangos: readonly HHIConcentrationRange[],
  ): HHIConcentrationRange {
    // Para IPCs categóricos, buscar por categoría
    if (config.tipo === 'categorico' && typeof valor === 'string' && config.categorias) {
      const cat = config.categorias.find((c) => c.valor === valor);
      if (cat) {
        return {
          from: 0,
          to: 0,
          color: cat.color,
          colorHex: cat.colorHex,
          label: cat.label,
          riskLevel: 'bajo',
        };
      }
    }

    // Para IPCs numéricos
    if (config.tipo === 'numerico' && typeof valor === 'number' && !isNaN(valor)) {
      const rango = rangos.find((r) => valor > r.from && valor <= r.to);
      if (rango) return rango;
    }

    // Default: primer rango o anómalo
    return rangos[0] || HHI_CONCENTRATION_RANGES[0];
  }

  /**
   * Toggle visibilidad del mapa (colapsar/expandir)
   */
  toggleMapa(): void {
    this.mostrarMapa.update((v) => !v);

    // Si se está mostrando el mapa y no ha sido inicializado, inicializarlo
    if (this.mostrarMapa() && !this.mapaInicializado()) {
      setTimeout(() => this.inicializarMapaSiNecesario(), 100);
    }

    // Si el mapa ya existe y se está mostrando, resize para ajustar canvas
    if (this.map && this.mostrarMapa()) {
      setTimeout(() => this.map?.resize(), 300);
    }
  }

  /**
   * Inicializar mapa solo cuando es necesario (lazy loading)
   */
  async inicializarMapaSiNecesario(): Promise<void> {
    if (this.mapaInicializado() || !this.mostrarMapa()) return;

    this.mapaInicializado.set(true);
    await this.inicializarMapa();
  }

  // ============================================
  // GRÁFICOS ADICIONALES PARA PANEL CENTRAL
  // ============================================

  /**
   * Gráfico de barras horizontales con detalle de rangos
   */
  chartBarrasDetalle = computed<EChartsOption>(() => {
    const stats = this.estadisticas();
    const rangos = this.rangosDisponibles();

    if (!stats || rangos.length === 0) return {};

    const data = rangos.map((rango) => ({
      name: rango.label,
      value: stats.distribucion.get(rango.id) || 0,
      itemStyle: { color: rango.colorHex },
    }));

    return {
      title: {
        text: 'Distribución por Rangos',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: '{b}: {c} registros',
      },
      grid: {
        left: '25%',
        right: '10%',
        top: '15%',
        bottom: '10%',
      },
      xAxis: {
        type: 'value',
        name: 'Cantidad',
        nameTextStyle: { fontSize: 12 },
      },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.name),
        axisLabel: {
          fontSize: 11,
          interval: 0,
        },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => ({
            value: d.value,
            itemStyle: d.itemStyle,
          })),
          label: {
            show: true,
            position: 'right',
            formatter: '{c}',
            fontSize: 11,
          },
          barMaxWidth: 30,
        },
      ],
    };
  });

  /**
   * Gráfico de línea de tendencia acumulada
   */
  chartLinea = computed<EChartsOption>(() => {
    const stats = this.estadisticas();
    const rangos = this.rangosDisponibles();

    if (!stats || rangos.length === 0) return {};

    // Calcular acumulados
    let acumulado = 0;
    const dataAcumulada = rangos.map((rango) => {
      acumulado += stats.distribucion.get(rango.id) || 0;
      return {
        name: rango.label,
        value: acumulado,
      };
    });

    return {
      title: {
        text: 'Distribución Acumulada',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'axis',
        formatter: '{b}: {c} registros acumulados',
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: `IPC_${this.indicadorSeleccionado()?.codigo || 'Grafico'}_Acumulado`,
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      grid: {
        left: '10%',
        right: '10%',
        top: '15%',
        bottom: '15%',
      },
      xAxis: {
        type: 'category',
        data: dataAcumulada.map((d) => d.name),
        axisLabel: {
          fontSize: 10,
          rotate: 45,
          interval: 0,
        },
      },
      yAxis: {
        type: 'value',
        name: 'Acumulado',
        nameTextStyle: { fontSize: 12 },
      },
      series: [
        {
          type: 'line',
          data: dataAcumulada.map((d) => d.value),
          smooth: true,
          areaStyle: {
            color: 'rgba(59, 130, 246, 0.2)',
          },
          lineStyle: {
            color: '#3b82f6',
            width: 3,
          },
          itemStyle: {
            color: '#3b82f6',
          },
          label: {
            show: true,
            position: 'top',
            fontSize: 10,
          },
        },
      ],
    };
  });

  /**
   * Gráfico de área apilada para comparación
   */
  chartAreaComparativa = computed<EChartsOption>(() => {
    const stats = this.estadisticas();
    const rangos = this.rangosDisponibles();

    if (!stats || rangos.length === 0) return {};

    // Calcular porcentajes
    const total = stats.total;
    const data = rangos.map((rango) => {
      const cantidad = stats.distribucion.get(rango.id) || 0;
      return {
        name: rango.label,
        value: total > 0 ? Number(((cantidad / total) * 100).toFixed(2)) : 0,
        color: rango.colorHex,
      };
    });

    return {
      title: {
        text: 'Distribución Porcentual',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%',
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: `IPC_${this.indicadorSeleccionado()?.codigo || 'Grafico'}_Porcentual`,
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      legend: {
        bottom: 10,
        type: 'scroll',
        textStyle: { fontSize: 10 },
      },
      series: [
        {
          type: 'pie',
          radius: ['30%', '60%'],
          center: ['50%', '45%'],
          data: data.map((d) => ({
            name: d.name,
            value: d.value,
            itemStyle: { color: d.color },
          })),
          label: {
            show: true,
            formatter: '{d}%',
            fontSize: 11,
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    };
  });

  /**
   * Gráfico de estadísticas resumidas (min, max, avg)
   */
  chartEstadisticasResumen = computed<EChartsOption>(() => {
    const stats = this.estadisticas();

    if (!stats) return {};

    return {
      title: {
        text: 'Resumen Estadístico',
        left: 'center',
        textStyle: { fontSize: 14, fontWeight: 'bold' },
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
      },
      toolbox: {
        show: true,
        feature: {
          saveAsImage: {
            show: true,
            title: 'Descargar imagen',
            name: `IPC_${this.indicadorSeleccionado()?.codigo || 'Grafico'}_Estadisticas`,
            pixelRatio: 2,
          },
        },
        right: 20,
        top: 10,
      },
      grid: {
        left: '15%',
        right: '10%',
        top: '15%',
        bottom: '10%',
      },
      xAxis: {
        type: 'category',
        data: ['Mínimo', 'Promedio', 'Mediana', 'Máximo'],
      },
      yAxis: {
        type: 'value',
        name: 'Valor',
      },
      series: [
        {
          type: 'bar',
          data: [
            { value: stats.minimo, itemStyle: { color: '#10b981' } },
            { value: stats.media, itemStyle: { color: '#3b82f6' } },
            { value: stats.mediana, itemStyle: { color: '#f59e0b' } },
            { value: stats.maximo, itemStyle: { color: '#ef4444' } },
          ],
          label: {
            show: true,
            position: 'top',
            formatter: '{c}',
            fontSize: 11,
          },
        },
      ],
    };
  });
}
