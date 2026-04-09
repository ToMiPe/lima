import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
  ViewChild,
  ElementRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  Map as MapLibreMap,
  Marker,
  Popup,
  LngLatBounds,
  NavigationControl,
  ScaleControl,
  MapLayerMouseEvent,
  GeoJSONSource,
} from 'maplibre-gl';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { MultiSelectModule } from 'primeng/multiselect';
import { SliderModule } from 'primeng/slider';
import { CheckboxModule } from 'primeng/checkbox';

// Services y modelos
import { CumplimientoReportService } from '../../services/cumplimiento-report.service';
import {
  PuntoCumplimiento,
  FiltrosCumplimiento,
  ReporteSummary,
  ClasificacionRiesgo,
  COLORES_CLASIFICACION,
  CLUSTER_CONFIG_DEFAULT,
} from '../../models/cumplimiento-report.model';

/**
 * Componente de Mapa de Cumplimiento Georreferenciado
 * Visualiza créditos en un mapa con colores según nivel de riesgo
 */
@Component({
  selector: 'app-cumplimiento-map',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ProgressSpinnerModule,
    TooltipModule,
    InputTextModule,
    DrawerModule,
    DividerModule,
    TagModule,
    MultiSelectModule,
    SliderModule,
    CheckboxModule,
  ],
  templateUrl: './cumplimiento-map.component.html',
  styleUrls: ['./cumplimiento-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CumplimientoMapComponent implements OnInit, OnDestroy {
  private readonly cumplimientoService = inject(CumplimientoReportService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  @ViewChild('mapContainer') mapContainerRef!: ElementRef;

  // Signals - Datos
  departamento = signal<string>('');
  allPuntos = signal<PuntoCumplimiento[]>([]);
  filteredPuntos = signal<PuntoCumplimiento[]>([]);
  summary = signal<ReporteSummary | null>(null);
  selectedPunto = signal<PuntoCumplimiento | null>(null);

  // Signals - UI State
  isLoading = signal<boolean>(true);
  showFilters = signal<boolean>(false);
  showSummary = signal<boolean>(false);
  showPuntoDrawer = signal<boolean>(false);
  clusteringEnabled = signal<boolean>(true);
  searchText = signal<string>('');

  // Computed
  totalPuntos = computed(() => this.allPuntos().length);
  filteredCount = computed(() => this.filteredPuntos().length);
  puntosVerdes = computed(() => this.filteredPuntos().filter((p) => p.color === 'verde').length);
  puntosNaranjas = computed(
    () => this.filteredPuntos().filter((p) => p.color === 'naranja').length,
  );
  puntosRojos = computed(() => this.filteredPuntos().filter((p) => p.color === 'rojo').length);
  hasActiveFilters = computed(() => this.tieneFiltrosActivos());

  // Filtros
  filtros: FiltrosCumplimiento = {};
  opcionesFiltros = signal<{
    agencias: string[];
    tiposCredito: string[];
    asesores: string[];
    situaciones: string[];
  }>({
    agencias: [],
    tiposCredito: [],
    asesores: [],
    situaciones: [],
  });

  // Colores checkbox
  coloresSeleccionados: ClasificacionRiesgo[] = ['verde', 'naranja', 'rojo'];

  // Mapa
  private map?: MapLibreMap;
  private markers = new Map<string, Marker>();
  private clusterSource?: GeoJSONSource;
  private bounds?: LngLatBounds;

  // Colores públicos para template
  readonly COLORES = COLORES_CLASIFICACION;

  ngOnInit(): void {
    this.inicializar();
  }

  ngOnDestroy(): void {
    this.limpiarMapa();
  }

  /**
   * Inicializa el componente y carga los datos
   */
  private async inicializar(): Promise<void> {
    try {
      this.isLoading.set(true);

      // Obtener departamento de la ruta
      const dept = this.route.snapshot.paramMap.get('departamento');
      if (dept) {
        this.departamento.set(dept.toUpperCase());
      }

      // Inicializar servicio
      await this.cumplimientoService.initialize();

      // Cargar datos
      await this.cargarDatos();

      // Inicializar mapa después de cargar datos
      setTimeout(() => this.inicializarMapa(), 100);
    } catch (error) {
      console.error(' Error al inicializar componente:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Carga los datos del servicio
   */
  private async cargarDatos(): Promise<void> {
    try {
      const dept = this.departamento();

      // Obtener puntos de cumplimiento
      const puntos = dept
        ? await this.cumplimientoService.getPuntosByDepartamento(dept)
        : await this.cumplimientoService.getPuntosCumplimiento();

      this.allPuntos.set(puntos);
      this.filteredPuntos.set(puntos);

      // Generar summary
      const summary = this.cumplimientoService.generarSummary(puntos);
      this.summary.set(summary);

      // Cargar opciones de filtros
      const opciones = await this.cumplimientoService.getOpcionesFiltros();
      this.opcionesFiltros.set(opciones);
    } catch (error) {
      console.error(' Error al cargar datos:', error);
    }
  }

  /**
   * Inicializa el mapa MapLibre
   */
  private inicializarMapa(): void {
    if (!this.mapContainerRef?.nativeElement) {
      console.error(' Contenedor del mapa no disponible');
      return;
    }

    try {
      // Crear mapa
      this.map = new MapLibreMap({
        container: this.mapContainerRef.nativeElement,
        style:
          'https://api.maptiler.com/maps/streets/style.json?key=get_your_own_OpIi9ZULNHzrESv6T2vL',
        center: [-75.015152, -9.189967], // Centro de Perú
        zoom: 5,
        attributionControl: false,
      });

      // Agregar controles
      this.map.addControl(new NavigationControl(), 'top-right');
      this.map.addControl(new ScaleControl(), 'bottom-left');

      // Evento cuando el mapa está listo
      this.map.on('load', () => {
        this.renderizarPuntos();
      });
    } catch (error) {
      console.error(' Error al inicializar mapa:', error);
    }
  }

  /**
   * Renderiza los puntos en el mapa
   */
  private renderizarPuntos(): void {
    if (!this.map) return;

    const puntos = this.filteredPuntos();

    if (puntos.length === 0) {
      console.warn(' No hay puntos para renderizar');
      return;
    }

    // Limpiar marcadores anteriores
    this.limpiarMarcadores();

    if (this.clusteringEnabled()) {
      this.renderizarConClustering(puntos);
    } else {
      this.renderizarSinClustering(puntos);
    }

    // Ajustar vista al bounds
    this.ajustarVista(puntos);
  }

  /**
   * Renderiza puntos con clustering usando Teritorio
   */
  private renderizarConClustering(puntos: PuntoCumplimiento[]): void {
    if (!this.map) return;

    // Convertir a GeoJSON
    const geojson = this.cumplimientoService.toGeoJSON(puntos);

    // Crear source si no existe
    if (!this.map.getSource('cumplimiento-source')) {
      this.map.addSource('cumplimiento-source', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: CLUSTER_CONFIG_DEFAULT.maxZoom,
        clusterRadius: CLUSTER_CONFIG_DEFAULT.radius,
      });

      // Layer para clusters
      this.map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'cumplimiento-source',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': [
            'step',
            ['get', 'point_count'],
            COLORES_CLASIFICACION.verde,
            10,
            COLORES_CLASIFICACION.naranja,
            30,
            COLORES_CLASIFICACION.rojo,
          ],
          'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 30, 40],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Layer para texto del cluster
      this.map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'cumplimiento-source',
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

      // Layer para puntos individuales
      this.map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'cumplimiento-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': [
            'match',
            ['get', 'color'],
            'verde',
            COLORES_CLASIFICACION.verde,
            'naranja',
            COLORES_CLASIFICACION.naranja,
            'rojo',
            COLORES_CLASIFICACION.rojo,
            COLORES_CLASIFICACION.gris,
          ],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Click en cluster para zoom
      this.map.on('click', 'clusters', async (e: MapLayerMouseEvent) => {
        const features = this.map!.queryRenderedFeatures(e.point, {
          layers: ['clusters'],
        });

        if (features.length === 0) return;

        const clusterId = features[0].properties['cluster_id'];
        const source = this.map!.getSource('cumplimiento-source') as GeoJSONSource;
        const geometry = features[0].geometry as GeoJSON.Point;

        try {
          const zoom = await source.getClusterExpansionZoom(clusterId);
          this.map!.easeTo({
            center: geometry.coordinates as [number, number],
            zoom: zoom,
          });
        } catch (err) {
          console.error('Error al expandir cluster:', err);
        }
      });

      // Click en punto individual
      this.map.on('click', 'unclustered-point', (e: MapLayerMouseEvent) => {
        if (e.features && e.features.length > 0) {
          const properties = e.features[0].properties;
          const punto = this.encontrarPunto(properties['id']);

          if (punto) {
            this.mostrarDetallePunto(punto);
          }
        }
      });

      // Cambiar cursor en hover
      this.map.on('mouseenter', 'clusters', () => {
        this.map!.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'clusters', () => {
        this.map!.getCanvas().style.cursor = '';
      });
      this.map.on('mouseenter', 'unclustered-point', () => {
        this.map!.getCanvas().style.cursor = 'pointer';
      });
      this.map.on('mouseleave', 'unclustered-point', () => {
        this.map!.getCanvas().style.cursor = '';
      });
    } else {
      // Actualizar source existente
      const source = this.map.getSource('cumplimiento-source') as GeoJSONSource;
      source.setData(geojson);
    }
  }

  /**
   * Renderiza puntos sin clustering (marcadores individuales)
   */
  private renderizarSinClustering(puntos: PuntoCumplimiento[]): void {
    if (!this.map) return;

    puntos.forEach((punto) => {
      const marker = this.crearMarcador(punto);
      this.markers.set(punto.id, marker);
    });
  }

  /**
   * Crea un marcador individual
   */
  private crearMarcador(punto: PuntoCumplimiento): Marker {
    // Crear elemento HTML del marcador
    const el = document.createElement('div');
    el.className = 'marker-cumplimiento';
    el.style.backgroundColor = COLORES_CLASIFICACION[punto.color];
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.cursor = 'pointer';
    el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

    // Crear popup
    const popup = new Popup({ offset: 25 }).setHTML(this.generarContenidoPopup(punto));

    // Crear y agregar marcador al mapa
    const marker = new Marker({ element: el })
      .setLngLat([punto.longitud, punto.latitud])
      .setPopup(popup)
      .addTo(this.map!);

    // Click en marcador
    el.addEventListener('click', () => {
      this.mostrarDetallePunto(punto);
    });

    return marker;
  }

  /**
   * Genera HTML para el popup de un punto
   */
  private generarContenidoPopup(punto: PuntoCumplimiento): string {
    return `
      <div class="popup-cumplimiento">
        <h4>${punto.nombreCliente}</h4>
        <p class="credito">Crédito: ${punto.codCredito}</p>
        <div class="porcentaje ${punto.color}">
          ${punto.porcentajeCumplimiento.toFixed(1)}%
        </div>
        <p class="clasificacion">${punto.clasificacion}</p>
        <p class="monto">Monto: S/ ${punto.montoColocado.toLocaleString('es-PE')}</p>
        <p class="agencia">${punto.nombreAgencia}</p>
      </div>
    `;
  }

  /**
   * Ajusta la vista del mapa a los puntos
   */
  private ajustarVista(puntos: PuntoCumplimiento[]): void {
    if (!this.map || puntos.length === 0) return;

    const bounds = new LngLatBounds();
    puntos.forEach((p) => bounds.extend([p.longitud, p.latitud]));

    this.map.fitBounds(bounds, {
      padding: 50,
      maxZoom: 12,
    });
  }

  /**
   * Aplica los filtros actuales
   */
  aplicarFiltros(): void {
    const puntos = this.allPuntos();

    // Actualizar filtros de colores
    this.filtros.colores = this.coloresSeleccionados;

    // Filtrar localmente
    const filtrados = puntos.filter((p) => {
      // Filtro por color
      if (!this.coloresSeleccionados.includes(p.color)) {
        return false;
      }

      // Filtro por búsqueda
      const busqueda = this.searchText().toLowerCase();
      if (busqueda) {
        const coincide =
          p.nombreCliente.toLowerCase().includes(busqueda) ||
          p.codCredito.toLowerCase().includes(busqueda) ||
          p.nombreAgencia.toLowerCase().includes(busqueda);
        if (!coincide) return false;
      }

      // Otros filtros del objeto filtros
      if (this.filtros.agencias && this.filtros.agencias.length > 0) {
        if (!this.filtros.agencias.includes(p.nombreAgencia)) return false;
      }

      if (this.filtros.tiposCredito && this.filtros.tiposCredito.length > 0) {
        if (!this.filtros.tiposCredito.includes(p.tipoCredito)) return false;
      }

      if (this.filtros.situaciones && this.filtros.situaciones.length > 0) {
        if (!this.filtros.situaciones.includes(p.situacion)) return false;
      }

      return true;
    });

    this.filteredPuntos.set(filtrados);
    this.renderizarPuntos();
  }

  /**
   * Limpia todos los filtros
   */
  limpiarFiltros(): void {
    this.filtros = {};
    this.coloresSeleccionados = ['verde', 'naranja', 'rojo'];
    this.searchText.set('');
    this.filteredPuntos.set(this.allPuntos());
    this.renderizarPuntos();
  }

  /**
   * Verifica si hay filtros activos
   */
  private tieneFiltrosActivos(): boolean {
    return (
      this.coloresSeleccionados.length < 3 ||
      !!this.searchText() ||
      (this.filtros.agencias?.length ?? 0) > 0 ||
      (this.filtros.tiposCredito?.length ?? 0) > 0 ||
      (this.filtros.situaciones?.length ?? 0) > 0
    );
  }

  /**
   * Toggle de clustering
   */
  toggleClustering(): void {
    this.clusteringEnabled.set(!this.clusteringEnabled());
    this.renderizarPuntos();
  }

  /**
   * Muestra el detalle de un punto
   */
  mostrarDetallePunto(punto: PuntoCumplimiento): void {
    this.selectedPunto.set(punto);
    this.showPuntoDrawer.set(true);
  }

  /**
   * Busca un punto por ID
   */
  private encontrarPunto(id: string): PuntoCumplimiento | undefined {
    return this.filteredPuntos().find((p) => p.id === id);
  }

  /**
   * Navega de regreso
   */
  volver(): void {
    this.router.navigate(['/dashboard']);
  }

  /**
   * Limpia los marcadores del mapa
   */
  private limpiarMarcadores(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();
  }

  /**
   * Limpia el mapa completamente
   */
  private limpiarMapa(): void {
    this.limpiarMarcadores();
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  /**
   * Exporta los datos filtrados
   */
  exportarDatos(): void {
  }
}
