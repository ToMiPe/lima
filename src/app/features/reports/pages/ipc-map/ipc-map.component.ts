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
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Map as MapLibreMap, Marker, Popup, NavigationControl, ScaleControl } from 'maplibre-gl';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';

// Services y modelos
import { IPCGeoService, GeoPoint } from '../../services/ipc-geo.service';
import { HHI_CONCENTRATION_RANGES, getHHIColorHex } from '@core/cartera';
import { CARTERA_REPOSITORY_TOKEN } from '@core/cartera';

interface ConfiguracionIPC {
  numero: number;
  titulo: string;
  descripcion: string;
  colorPrimario: string;
  campo: 'ipc1' | 'ipc2' | 'ipc3' | 'ipc4' | 'ipc5';
}

const CONFIGURACIONES_IPC: Record<number, ConfiguracionIPC> = {
  1: {
    numero: 1,
    titulo: 'IPC1 - Concentración por Agencias',
    descripcion: 'Visualización geográfica de la concentración de cartera por agencias',
    colorPrimario: '#00843D',
    campo: 'ipc1',
  },
  2: {
    numero: 2,
    titulo: 'IPC2 - Concentración por Tipo de Crédito',
    descripcion: 'Visualización geográfica de la concentración de cartera por tipo de crédito',
    colorPrimario: '#005EB8',
    campo: 'ipc2',
  },
  3: {
    numero: 3,
    titulo: 'IPC3 - Concentración por Destino',
    descripcion: 'Visualización geográfica de la concentración de cartera por destino de crédito',
    colorPrimario: '#FDB913',
    campo: 'ipc3',
  },
  4: {
    numero: 4,
    titulo: 'IPC4 - Concentración por Zona',
    descripcion: 'Visualización geográfica de la concentración de cartera por zona geográfica',
    colorPrimario: '#E63946',
    campo: 'ipc4',
  },
  5: {
    numero: 5,
    titulo: 'IPC5 - Concentración por Sector',
    descripcion: 'Visualización geográfica de la concentración de cartera por sector económico',
    colorPrimario: '#9333EA',
    campo: 'ipc5',
  },
};

/**
 * Componente genérico de Mapa IPC
 * Visualiza cualquier IPC (1-5) según parámetro de ruta
 */
@Component({
  selector: 'app-ipc-map',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    ProgressSpinnerModule,
    TooltipModule,
    DrawerModule,
    DividerModule,
    TagModule,
    CheckboxModule,
  ],
  templateUrl: './ipc-map.component.html',
  styleUrls: ['./ipc-map.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IPCMapComponent implements OnInit, OnDestroy {
  private readonly ipcService = inject(IPCGeoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly repository = inject(CARTERA_REPOSITORY_TOKEN);

  @ViewChild('mapContainer') mapContainerRef!: ElementRef;

  // Signals - Configuración
  config = signal<ConfiguracionIPC>(CONFIGURACIONES_IPC[1]);

  // Signals - Datos
  allPuntos = signal<GeoPoint[]>([]);
  selectedPunto = signal<GeoPoint | null>(null);

  // Signals - UI State
  isLoading = signal<boolean>(true);
  showPuntoDrawer = signal<boolean>(false);
  clusteringEnabled = signal<boolean>(true); // Siempre habilitado para eficiencia
  searchTerm = signal<string>('');

  // Rangos HHI activos (checkboxes)
  activeRanges = this.ipcService.activeRanges;

  // Computed - Puntos filtrados por rangos activos
  filteredPuntos = computed(() => {
    const puntos = this.allPuntos();
    const activos = this.activeRanges();
    return puntos.filter((p) => activos.has(p.rango.label));
  });

  // Estadísticas
  totalPuntos = computed(() => this.allPuntos().length);
  filteredCount = computed(() => this.filteredPuntos().length);

  estadisticasPorRango = computed(() => {
    const puntos = this.allPuntos();
    return HHI_CONCENTRATION_RANGES.map((rango) => ({
      ...rango,
      count: puntos.filter((p) => p.rango.label === rango.label).length,
    }));
  });

  // Mapa
  private map?: MapLibreMap;
  private markers = new Map<string, Marker>();
  private popupInstance?: Popup;

  // Rangos públicos para template
  readonly HHI_RANGES = HHI_CONCENTRATION_RANGES;

  // Formatear números con separador de miles peruano
  formatNumber(value: number): string {
    return value.toLocaleString('es-PE');
  }

  constructor() {
    // Efecto para actualizar mapa cuando cambien los filtros o clustering
    effect(() => {
      // Triggear re-render cuando cambien filtros o clustering
      this.filteredPuntos();
      this.clusteringEnabled();

      if (this.map && this.map.loaded()) {
        this.renderMarkers();
      }
    });
  }

  async ngOnInit(): Promise<void> {
    // Obtener número de IPC desde la ruta
    this.route.paramMap.subscribe(async (params) => {
      const numeroIPC = parseInt(params.get('numero') || '1', 10);
      const config = CONFIGURACIONES_IPC[numeroIPC] || CONFIGURACIONES_IPC[1];
      this.config.set(config);

      await this.loadData();
    });
  }

  ngOnDestroy(): void {
    this.clearMarkers();
    if (this.map) {
      this.map.remove();
    }
  }

  private async loadData(): Promise<void> {
    this.isLoading.set(true);

    try {
      const config = this.config();
      const records = await this.repository.getAllRecords();

      // Filtrar solo registros con coordenadas válidas y valor IPC
      const validRecords = records.filter(
        (r) =>
          r.latitud &&
          r.longitud &&
          !isNaN(r.latitud) &&
          !isNaN(r.longitud) &&
          r.latitud !== 0 &&
          r.longitud !== 0 &&
          r[config.campo] !== undefined &&
          r[config.campo] !== null &&
          !isNaN(r[config.campo]!),
      );

      // Convertir a GeoPoints
      const points: GeoPoint[] = validRecords.map((record, index) => {
        const value = record[config.campo]!;
        const range = this.getRange(value);

        return {
          id: `${config.campo}-${record.cod_cliente}-${index}`,
          lat: record.latitud,
          lng: record.longitud,
          value,
          color: getHHIColorHex(value),
          label: `${record.cliente || 'Cliente'}: ${value.toFixed(2)}%`,
          cliente: record.cliente,
          agencia: record.agencia,
          monto: record.saldo_total,
          rango: range,
        };
      });

      this.allPuntos.set(points);

      // Inicializar mapa después de cargar datos
      setTimeout(() => this.initMap(), 100);
    } catch (error) {
      console.error('Error cargando datos IPC:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private getRange(value: number) {
    return (
      HHI_CONCENTRATION_RANGES.find((r) => value > r.from && value <= r.to) ||
      HHI_CONCENTRATION_RANGES[0]
    );
  }

  private initMap(): void {
    if (!this.mapContainerRef?.nativeElement) return;

    // Límites de Perú
    const peruBounds: [number, number, number, number] = [-81.5, -18.5, -68.5, 0];

    this.map = new MapLibreMap({
      container: this.mapContainerRef.nativeElement,
      style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
      bounds: peruBounds,
      fitBoundsOptions: { padding: 50 },
    });

    this.map.addControl(new NavigationControl(), 'top-right');
    this.map.addControl(new ScaleControl(), 'bottom-left');

    this.map.on('load', () => {
      this.renderMarkers();
    });
  }

  private renderMarkers(): void {
    if (!this.map) return;

    this.clearMarkers();
    this.clearLayers();

    const puntos = this.filteredPuntos();

    if (puntos.length === 0) {
      console.warn('⚠️ No hay puntos para renderizar');
      return;
    }

    if (this.clusteringEnabled()) {
      this.renderWithClustering(puntos);
    } else {
      this.renderWithMarkers(puntos);
    }
  }

  private toGeoJSON(puntos: GeoPoint[]) {
    return {
      type: 'FeatureCollection',
      features: puntos.map((p) => ({
        type: 'Feature',
        properties: {
          id: p.id,
          cliente: p.cliente,
          agencia: p.agencia,
          monto: p.monto,
          value: p.value,
          color: p.color,
          label: p.label,
          rangoLabel: p.rango.label,
        },
        geometry: {
          type: 'Point',
          coordinates: [p.lng, p.lat],
        },
      })),
    };
  }

  private renderWithClustering(puntos: GeoPoint[]): void {
    if (!this.map) return;

    const geojson = this.toGeoJSON(puntos);

    // Crear source si no existe
    if (!this.map.getSource('ipc-source')) {
      this.map.addSource('ipc-source', {
        type: 'geojson',
        data: geojson as any,
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
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#00843D',
            100,
            '#FDB913',
            750,
            '#E63946',
          ],
          'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Layer para números de clusters
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

      // Layer para puntos individuales
      this.map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'ipc-source',
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-color': ['get', 'color'],
          'circle-radius': 8,
          'circle-stroke-width': 2,
          'circle-stroke-color': '#fff',
        },
      });

      // Click en cluster para hacer zoom
      this.map.on('click', 'clusters', (e) => {
        const features = this.map!.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        if (features.length === 0) return;

        const clusterId = features[0].properties['cluster_id'];
        const source = this.map!.getSource('ipc-source') as any;

        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err) return;
          this.map!.easeTo({
            center: (features[0].geometry as any).coordinates,
            zoom: zoom,
          });
        });
      });

      // Click en punto individual
      this.map.on('click', 'unclustered-point', (e) => {
        if (!e.features || e.features.length === 0) return;

        const props = e.features[0].properties;
        const punto = puntos.find((p) => p.id === props['id']);

        if (punto) {
          this.selectedPunto.set(punto);
          this.showPuntoDrawer.set(true);
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

      // Popups en hover
      this.map.on('mouseenter', 'unclustered-point', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;

        const html = `
          <div style="font-family: sans-serif; padding: 4px;">
            <strong>${props['cliente']}</strong><br/>
            <span style="color: ${props['color']}; font-weight: bold;">
              Valor: ${Number(props['value']).toFixed(2)}%
            </span><br/>
            <small>Agencia: ${props['agencia']}</small><br/>
            <small>Monto: S/ ${Number(props['monto']).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</small>
          </div>
        `;

        this.popupInstance = new Popup({ offset: 15 })
          .setLngLat((e.features[0].geometry as any).coordinates)
          .setHTML(html)
          .addTo(this.map!);
      });

      this.map.on('mouseleave', 'unclustered-point', () => {
        if (this.popupInstance) {
          this.popupInstance.remove();
          this.popupInstance = undefined;
        }
      });
    } else {
      // Actualizar datos existentes
      const source = this.map.getSource('ipc-source') as any;
      source.setData(geojson);
    }
  }

  private renderWithMarkers(puntos: GeoPoint[]): void {
    if (!this.map) return;

    puntos.forEach((punto) => {
      const el = document.createElement('div');
      el.className = 'marker-ipc';
      el.style.backgroundColor = punto.color;
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
      el.style.cursor = 'pointer';

      const marker = new Marker({ element: el })
        .setLngLat([punto.lng, punto.lat])
        .setPopup(
          new Popup({ offset: 15 }).setHTML(`
          <div style="font-family: sans-serif; padding: 4px;">
            <strong>${punto.cliente}</strong><br/>
            <span style="color: ${punto.color}; font-weight: bold;">${punto.label}</span><br/>
            <small>Agencia: ${punto.agencia}</small><br/>
            <small>Monto: S/ ${punto.monto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</small>
          </div>
        `),
        )
        .addTo(this.map!);

      el.addEventListener('click', () => {
        this.selectedPunto.set(punto);
        this.showPuntoDrawer.set(true);
      });

      this.markers.set(punto.id, marker);
    });
  }

  private clearMarkers(): void {
    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();
  }

  private clearLayers(): void {
    if (!this.map) return;

    // Remover layers si existen
    const layers = ['unclustered-point', 'cluster-count', 'clusters'];
    layers.forEach((layer) => {
      if (this.map!.getLayer(layer)) {
        this.map!.removeLayer(layer);
      }
    });

    // Remover source si existe
    if (this.map.getSource('ipc-source')) {
      this.map.removeSource('ipc-source');
    }

    // Remover popup si existe
    if (this.popupInstance) {
      this.popupInstance.remove();
      this.popupInstance = undefined;
    }
  }

  // Métodos públicos para template
  goBack(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleRange(rangeLabel: string): void {
    this.ipcService.toggleRange(rangeLabel);
  }

  isRangeActive(rangeLabel: string): boolean {
    return this.ipcService.isRangeActive(rangeLabel);
  }

  activateAll(): void {
    this.ipcService.activateAllRanges();
  }

  deactivateAll(): void {
    this.ipcService.deactivateAllRanges();
  }

  toggleClustering(): void {
    this.clusteringEnabled.update((v) => !v);
    if (this.map && this.map.loaded()) {
      this.renderMarkers();
    }
  }

  closePuntoDrawer(): void {
    this.showPuntoDrawer.set(false);
    this.selectedPunto.set(null);
  }
}
