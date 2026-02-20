import { Component, OnInit, OnDestroy, signal, computed, effect, inject } from '@angular/core';
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
  ],
  templateUrl: './ipc-unified.component.html',
  styleUrls: ['./ipc-unified.component.scss'],
})
export class IPCUnifiedComponent implements OnInit, OnDestroy {
  private configService = inject(IPCConfigService);
  private dataService = inject(IPCDataService);

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
  tabDistribucionActiva: string | number | undefined = 'genero'; // Tab activo en modal de distribución

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
    console.log('🔢 Calculando distribución géneros, registros:', datosFiltrados.length);
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

    console.log('✅ Distribución géneros calculada:', resultado);
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
        console.log('🔄 Cargando datos para distribución...');
        this.cargandoDistribucion.set(true);
        this.dataService
          .getTodosDatosFiltrados()
          .then((datos) => {
            console.log('✅ Datos cargados para distribución:', datos.length, 'registros');
            this._datosParaDistribucion.set(datos);
            this.cargandoDistribucion.set(false);
          })
          .catch((error) => {
            console.error('❌ Error cargando datos para distribución:', error);
            this.cargandoDistribucion.set(false);
          });
      } else {
        // Limpiar datos cuando se cierra el modal
        this._datosParaDistribucion.set([]);
      }
    });
  }

  ngOnInit(): void {
    this.inicializarDimensiones();
    this.inicializarMapa();
    this.cargarOpcionesFiltros();
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

    // Limpiar filtros
    this.filtrosActivos.set(new Set());
    this.dataService.clearFiltros();
  }

  /**
   * Cambiar indicador seleccionado
   */
  onIndicadorChange(event: { value: IPCConfig }): void {
    const config = event.value;
    this.indicadorSeleccionado.set(config);
    this.dataService.setIPC(config.campo);

    // Limpiar filtros
    this.filtrosActivos.set(new Set());
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
    this.actualizarMapa();
  }

  /**
   * Obtener label de un rango de monto por su ID
   */
  obtenerLabelRangoMonto(rangoId: string): string {
    const rango = this.rangosMonto().find((r) => r.value === rangoId);
    return rango?.label || rangoId;
  }

  /**
   * Helper para obtener el label de un rango de capacidad de pago por su id
   */
  obtenerLabelRangoCapacidad(rangoId: string): string {
    const rango = this.rangosCapacidadPago().find((r) => r.value === rangoId);
    return rango?.label || rangoId;
  }

  /**
   * Descargar datos filtrados como CSV
   */
  async descargarDatosFiltrados(): Promise<void> {
    try {
      console.log('📥 Descargando datos filtrados...');
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

      console.log(`✅ ${datos.length} registros descargados exitosamente`);
    } catch (error) {
      console.error('❌ Error al descargar datos:', error);
      alert('Error al descargar los datos. Por favor intente nuevamente.');
    }
  }

  /**
   * Convertir array de ReporteCartera a CSV
   */
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

    // Combinar
    const csvContent = [encabezados.join(','), ...filas.map((fila) => fila.join(','))].join('\n');

    return csvContent;
  }

  /**
   * Escapar valores para CSV
   */
  private escaparCSV(valor: string | undefined | null): string {
    if (!valor) return '';

    // Si contiene coma, comillas o salto de línea, envolver en comillas
    if (valor.includes(',') || valor.includes('"') || valor.includes('\n')) {
      return `"${valor.replace(/"/g, '""')}"`;
    }

    return valor;
  }
}
