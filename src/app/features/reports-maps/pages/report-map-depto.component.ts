import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  computed,
  inject,
  effect,
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
} from 'maplibre-gl';
import { TeritorioCluster } from '@teritorio/maplibre-gl-teritorio-cluster';
import { CARTERA_REPOSITORY_TOKEN, ReporteCartera } from '@core/cartera';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { DrawerModule } from 'primeng/drawer';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';

interface ClienteAgrupado {
  cod_cliente: string;
  cliente: string;
  latitud: number;
  longitud: number;
  creditos: ReporteCartera[]; // Todos los créditos del cliente
  totalCreditos: number;
  montoTotal: number;
  departamento?: string;
  agencias: string[]; // Puede tener créditos en múltiples agencias
  asesores: string[]; // Puede tener múltiples asesores
}

interface MarkerData {
  marker: Marker;
  data: ClienteAgrupado; // Ahora el marcador representa un cliente, no un crédito
}

interface FilterOptions {
  agencias: string[];
  asesores: string[];
  estados: string[];
  tiposCredito: string[];
  montoMin: number;
  montoMax: number;
}

interface ActiveFilters {
  agencia?: string;
  asesor?: string;
  estado?: string;
  tipoCredito?: string;
  montoRange: [number, number];
  searchText?: string;
}

@Component({
  selector: 'app-report-map-depto',
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
  ],
  templateUrl: './report-map-depto.component.html',
  styleUrls: ['./report-map-depto.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportMapDeptoComponent implements OnInit, OnDestroy {
  private repository = inject(CARTERA_REPOSITORY_TOKEN);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  @ViewChild('mapContainer') mapContainerRef!: ElementRef;

  // Signals
  departmentName = signal<string>('');
  isLoading = signal<boolean>(true);
  allData = signal<ReporteCartera[]>([]); // Todos los créditos individuales
  groupedClients = signal<ClienteAgrupado[]>([]); // Clientes agrupados para el mapa
  filteredClients = signal<ClienteAgrupado[]>([]); // Clientes filtrados
  totalClients = computed(() => this.groupedClients().length);
  filteredCount = computed(() => this.filteredClients().length);
  totalAmount = computed(() =>
    this.allData().reduce((sum, item) => sum + (item.monto_colocado || 0), 0),
  );

  // UI States
  showFilters = signal<boolean>(false);
  showSearch = signal<boolean>(false);
  showClientList = signal<boolean>(false);
  clusteringEnabled = signal<boolean>(false); // Desactivado temporalmente
  showClientDrawer = signal<boolean>(false);
  selectedCliente = signal<ClienteAgrupado | null>(null);
  searchText = '';
  searchResults = signal<ReporteCartera[]>([]);

  // Filters
  activeFilters: ActiveFilters = { montoRange: [0, 0] };
  filterOptions = signal<FilterOptions>({
    agencias: [],
    asesores: [],
    estados: [],
    tiposCredito: [],
    montoMin: 0,
    montoMax: 0,
  });

  hasActiveFilters = computed(
    () =>
      !!this.activeFilters.agencia ||
      !!this.activeFilters.asesor ||
      !!this.activeFilters.estado ||
      !!this.activeFilters.tipoCredito ||
      (this.activeFilters.montoRange &&
        (this.activeFilters.montoRange[0] > 0 ||
          this.activeFilters.montoRange[1] < this.filterOptions().montoMax)),
  );

  // MapLibre
  private map?: MapLibreMap;
  private markers: MarkerData[] = [];
  private bounds?: LngLatBounds;
  private clusterLayer?: TeritorioCluster;
  private clientesMap = new Map<string, ClienteAgrupado>(); // Para lookup rápido

  constructor() {
    // Effect DESACTIVADO temporalmente - los marcadores se crean solo al cargar el mapa
    // effect(() => {
    //   const clientes = this.filteredClients();
    //   console.log(`🔄 Effect: filteredClients cambió a ${clientes.length} clientes`);
    //   if (this.map && !this.isLoading()) {
    //     // Solo actualizar marcadores (Teritorio desactivado)
    //     this.updateMarkers();
    //     console.log(`✅ Marcadores actualizados: ${clientes.length} clientes`);
    //   }
    // });
  }

  ngOnInit(): void {
    // Obtener nombre del departamento de la ruta
    this.route.params.subscribe((params) => {
      const deptName = params['department'];
      if (deptName) {
        console.log('🔍 Parámetro de ruta recibido:', deptName);
        // Normalizar el nombre del departamento (capitalizar primera letra)
        const normalizedName = this.normalizeDepartmentName(deptName);
        console.log('📍 Nombre normalizado:', normalizedName);
        this.departmentName.set(normalizedName);
        this.loadDepartmentData(normalizedName);
      }
    });
  }

  ngOnDestroy(): void {
    this.cleanupMarkers();
    this.map?.remove();
  }

  private async loadDepartmentData(department: string): Promise<void> {
    this.isLoading.set(true);

    try {
      console.log(`🔍 Buscando datos para: "${department}"`);
      const data = await this.repository.getByDepartamento(department);

      console.log(`📊 Datos recibidos:`, {
        total: data?.length || 0,
        primero: data && data.length > 0 ? data[0] : null,
      });

      if (data && data.length > 0) {
        // Filtrar registros con coordenadas válidas
        const validData = data.filter(
          (item) =>
            item.latitud &&
            item.longitud &&
            !isNaN(item.latitud) &&
            !isNaN(item.longitud) &&
            item.latitud !== 0 &&
            item.longitud !== 0,
        );

        console.log(`📍 ${department}:`, {
          total: data.length,
          conCoordenadas: validData.length,
          sinCoordenadas: data.length - validData.length,
        });

        if (validData.length === 0) {
          console.warn('⚠️ No hay registros con coordenadas válidas');
          this.isLoading.set(false);
          return;
        }

        this.allData.set(validData);

        // Agrupar créditos por cliente
        const clientesAgrupados = this.groupClientCredits(validData);
        this.groupedClients.set(clientesAgrupados);
        this.filteredClients.set(clientesAgrupados);

        // Calcular opciones de filtros desde los clientes agrupados
        this.calculateFilterOptions(clientesAgrupados); // Inicializar mapa
        await this.initMap(validData);
      } else {
        console.warn(`⚠️ No se encontraron datos para el departamento: "${department}"`);
      }
    } catch (error) {
      console.error('❌ Error cargando datos del departamento:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  private calculateFilterOptions(clientes: ClienteAgrupado[]): void {
    const agencias = new Set<string>();
    const asesores = new Set<string>();
    const estados = new Set<string>();
    const tiposCredito = new Set<string>();
    let montoMin = Infinity;
    let montoMax = -Infinity;

    clientes.forEach((cliente) => {
      // Agregar todas las agencias del cliente
      cliente.agencias.forEach((agencia) => agencias.add(agencia));

      // Agregar todos los asesores del cliente
      cliente.asesores.forEach((asesor) => asesores.add(asesor));

      // Agregar estados y tipos de crédito de todos los créditos del cliente
      cliente.creditos.forEach((credito) => {
        if (credito.situacion) estados.add(credito.situacion);
        if (credito['tipo_credito']) tiposCredito.add(credito['tipo_credito'] as string);
      });

      // Usar el monto total del cliente
      const monto = cliente.montoTotal;
      if (monto < montoMin) montoMin = monto;
      if (monto > montoMax) montoMax = monto;
    });

    console.log('📊 Opciones de filtros calculadas:', {
      agencias: agencias.size,
      asesores: asesores.size,
      estados: estados.size,
      tiposCredito: tiposCredito.size,
      montoRange: [montoMin, montoMax],
    });
    console.log('📋 Primeras agencias:', Array.from(agencias).slice(0, 5));
    console.log('📋 Primeros asesores:', Array.from(asesores).slice(0, 5));

    this.filterOptions.set({
      agencias: Array.from(agencias).sort(),
      asesores: Array.from(asesores).sort(),
      estados: Array.from(estados).sort(),
      tiposCredito: Array.from(tiposCredito).sort(),
      montoMin: montoMin === Infinity ? 0 : montoMin,
      montoMax: montoMax === -Infinity ? 0 : montoMax,
    });
    this.activeFilters.montoRange = [
      montoMin === Infinity ? 0 : montoMin,
      montoMax === -Infinity ? 0 : montoMax,
    ];
  }

  private async initMap(data: ReporteCartera[]): Promise<void> {
    console.log('🗺️ Inicializando mapa con', data.length, 'registros');

    // Esperar a que el DOM esté listo
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verificar que el contenedor existe
    const container = document.getElementById('detail-map');
    if (!container) {
      console.error('❌ No se encontró el contenedor del mapa');
      return;
    }

    // Calcular bounds del departamento
    this.bounds = new LngLatBounds();
    data.forEach((item) => {
      if (item.longitud && item.latitud) {
        this.bounds!.extend([item.longitud, item.latitud]);
      }
    });

    console.log('📐 Bounds calculados:', this.bounds.toArray());

    // Crear mapa
    try {
      this.map = new MapLibreMap({
        container: 'detail-map',
        style: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        bounds: this.bounds,
        fitBoundsOptions: {
          padding: 50,
        },
      });

      console.log('✅ Mapa creado');

      this.map.on('load', () => {
        console.log('✅ Mapa cargado completamente');
        // Agregar controles - zoom en la izquierda inferior
        this.map!.addControl(new NavigationControl(), 'bottom-left');
        this.map!.addControl(new ScaleControl(), 'bottom-left');

        // Crear marcadores nativos directamente (sin GeoJSON, sin Teritorio)
        console.log('🎯 Creando marcadores nativos...');
        this.updateMarkers();
        console.log('✅ Mapa inicializado con marcadores nativos');
      });

      this.map.on('error', (e) => {
        console.error('❌ Error en el mapa:', e);
      });
    } catch (error) {
      console.error('❌ Error creando el mapa:', error);
    }
  }

  private updateMarkers(): void {
    console.log('🎯 updateMarkers() iniciado');

    // Limpiar marcadores existentes
    this.cleanupMarkers();

    // No crear marcadores si clustering está activo
    if (this.clusteringEnabled()) {
      console.log('⚠️ Clustering activo, no se crean marcadores');
      return;
    }

    const clientes = this.filteredClients();
    console.log(`📍 Creando ${clientes.length} marcadores`);

    // Mostrar coordenadas de los primeros 10 para ver si están superpuestas
    console.log('📋 Primeras 10 coordenadas (DETALLE):');
    clientes.slice(0, 10).forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.cliente}:`);
      console.log(`     longitud: ${c.longitud} (tipo: ${typeof c.longitud})`);
      console.log(`     latitud: ${c.latitud} (tipo: ${typeof c.latitud})`);
      console.log(`     array: [${c.longitud}, ${c.latitud}]`);
    });

    // Crear nuevos marcadores
    let creados = 0;
    clientes.forEach((cliente) => {
      if (!cliente.longitud || !cliente.latitud) {
        console.warn('⚠️ Cliente sin coordenadas:', cliente.cod_cliente);
        return;
      }

      // Color según situación predominante
      const situacion = this.getSituacionPredominante(cliente.creditos);
      const color = this.getMarkerColor(situacion);

      // Crear elemento personalizado del marcador
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.style.cssText = `
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${color};
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.5);
        cursor: pointer;
        position: relative;
        z-index: 1000;
        display: block !important;
        visibility: visible !important;
      `;

      // Agregar data-cliente-id para selección
      if (cliente.cod_cliente) {
        el.setAttribute('data-cliente-id', cliente.cod_cliente);
      }

      // Event listener para abrir drawer
      el.addEventListener('click', () => {
        console.log('👆 Click en marcador:', cliente.cod_cliente);
        // NO llamar a highlightMarker para evitar que desaparezca
        this.openClientDrawer(cliente);
      });

      // Crear marcador sin popup con anchor en el centro
      const marker = new Marker({
        element: el,
        anchor: 'center',
      })
        .setLngLat([cliente.longitud, cliente.latitud])
        .addTo(this.map!);

      this.markers.push({ marker, data: cliente });
      creados++;
    });

    console.log(`✅ Marcadores creados: ${creados} de ${clientes.length}`);
  }

  private createPopup(cliente: ClienteAgrupado): Popup {
    // Generar lista de créditos individuales
    const creditosHTML = cliente.creditos
      .map(
        (credito, index) => `
      <div class="credito-item">
        <div class="credito-header">
          <span class="credito-numero">Crédito #${index + 1}${credito.num_credito ? ` - ${credito.num_credito}` : ''}</span>
          <span class="credito-situacion credito-${credito.situacion?.toLowerCase() || 'desconocido'}">${credito.situacion || 'N/A'}</span>
        </div>
        <div class="credito-details">
          ${credito.tipo_credito ? `<div class="credito-field"><i class="pi pi-tag"></i> <strong>${credito.tipo_credito}</strong></div>` : ''}
          ${credito.agencia ? `<div class="credito-field"><i class="pi pi-building"></i> ${credito.agencia}</div>` : ''}
          ${credito.asesor_servicios ? `<div class="credito-field"><i class="pi pi-user"></i> ${credito.asesor_servicios}</div>` : ''}
          ${credito.distrito ? `<div class="credito-field"><i class="pi pi-map-marker"></i> ${credito.distrito}, ${credito.provincia || ''}</div>` : ''}
          ${credito.sector_economico ? `<div class="credito-field"><i class="pi pi-briefcase"></i> ${credito.sector_economico}</div>` : ''}
          ${credito.actividad_economica ? `<div class="credito-field"><i class="pi pi-chart-line"></i> ${credito.actividad_economica}</div>` : ''}
          <div class="credito-monto">${this.formatCurrency(credito.monto_colocado || 0)}</div>
        </div>
      </div>
    `,
      )
      .join('');

    const popupContent = `
      <div class="popup-client-name">${cliente.cliente}</div>
      ${cliente.cod_cliente ? `<div class="popup-field"><span class="popup-field-label">Código:</span> <span class="popup-field-value">${cliente.cod_cliente}</span></div>` : ''}
      ${cliente.agencias.length > 0 ? `<div class="popup-field"><span class="popup-field-label">Agencia${cliente.agencias.length > 1 ? 's' : ''}:</span> <span class="popup-field-value">${cliente.agencias.join(', ')}</span></div>` : ''}
      ${cliente.asesores.length > 0 ? `<div class="popup-field"><span class="popup-field-label">Asesor${cliente.asesores.length > 1 ? 'es' : ''}:</span> <span class="popup-field-value">${cliente.asesores.join(', ')}</span></div>` : ''}
      <div class="popup-summary">
        <div class="summary-item">
          <span class="summary-label">Total Créditos:</span>
          <span class="summary-value">${cliente.totalCreditos}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Monto Total:</span>
          <span class="summary-value">${this.formatCurrency(cliente.montoTotal)}</span>
        </div>
      </div>
      <div class="creditos-separator">Detalle de Créditos</div>
      <div class="creditos-list">
        ${creditosHTML}
      </div>
    `;

    return new Popup({
      closeButton: true,
      offset: 15,
      maxWidth: '400px',
      className: 'custom-popup',
    }).setHTML(popupContent);
  }

  private cleanupMarkers(): void {
    this.markers.forEach(({ marker }) => marker.remove());
    this.markers = [];
  }

  private clientesToGeoJSON(clientes: ClienteAgrupado[]): GeoJSON.FeatureCollection {
    // Actualizar el mapa de clientes para lookup
    this.clientesMap.clear();
    clientes.forEach((cliente) => {
      this.clientesMap.set(cliente.cod_cliente, cliente);
    });

    const clientesConCoordenadas = clientes.filter(
      (cliente) => cliente.longitud && cliente.latitud,
    );

    console.log(
      `📍 GeoJSON: ${clientes.length} clientes recibidos, ${clientesConCoordenadas.length} con coordenadas válidas`,
    );

    const features = clientesConCoordenadas.map((cliente, index) => {
      // Calcular situación predominante para este cliente
      const situacion = this.getSituacionPredominante(cliente.creditos);

      // Usar cod_cliente como ID único (Teritorio puede tener problemas con IDs numéricos)
      const featureId = cliente.cod_cliente || `feature-${index}`;

      return {
        type: 'Feature' as const,
        id: featureId, // ID único basado en cod_cliente
        geometry: {
          type: 'Point' as const,
          coordinates: [cliente.longitud, cliente.latitud],
        },
        properties: {
          id: featureId, // ID en properties también
          cod_cliente: cliente.cod_cliente || '',
          cliente: cliente.cliente || '',
          totalCreditos: cliente.totalCreditos || 0,
          montoTotal: cliente.montoTotal || 0,
          situacion: situacion,
        },
      };
    });

    console.log(`✅ GeoJSON generado: ${features.length} features`);

    return {
      type: 'FeatureCollection',
      features: features,
    };
  }

  private setupClusterLayer(): void {
    if (!this.map) return;

    // Función para renderizar clusters
    const clusterRender = (element: HTMLElement, props: any) => {
      const count = props.point_count || 0;
      const clusterId = props.cluster_id;

      element.innerHTML = count.toLocaleString();
      element.style.setProperty('background-color', '#3b82f6');
      element.style.setProperty('border-radius', '50%');
      element.style.setProperty('border', '3px solid white');
      element.style.setProperty('box-shadow', '0 2px 8px rgba(0,0,0,0.3)');
      element.style.setProperty('justify-content', 'center');
      element.style.setProperty('align-items', 'center');
      element.style.setProperty('display', 'flex');
      element.style.setProperty('color', 'white');
      element.style.setProperty('font-weight', '700');
      element.style.setProperty('font-size', '14px');
      element.style.setProperty('cursor', 'pointer');

      // Tamaño dinámico según cantidad
      const size = count < 10 ? 40 : count < 100 ? 50 : 60;
      element.style.setProperty('width', `${size}px`);
      element.style.setProperty('height', `${size}px`);

      // Hacer zoom al cluster cuando se hace clic
      element.addEventListener('click', () => {
        if (!this.map || !clusterId) return;

        const source = this.map.getSource('clientes-source') as any;
        if (!source || !source.getClusterExpansionZoom) return;

        source.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
          if (err || !props.coordinates) return;

          this.map!.easeTo({
            center: props.coordinates,
            zoom: zoom + 0.5,
            duration: 500,
          });
        });
      });
    };

    // Función para renderizar marcadores individuales
    // Firma correcta: (element: HTMLDivElement, markerSize: number, feature?: GeoJSONFeature) => void
    const markerRender = (element: HTMLElement, markerSize: number, feature: any) => {
      console.log('🔵 markerRender ejecutado:', { markerSize, feature: feature?.properties });

      const codCliente = feature?.properties?.cod_cliente;
      const totalCreditos = feature?.properties?.totalCreditos || 1;

      // Obtener situación desde properties (ya calculada en GeoJSON)
      const situacion = feature?.properties?.situacion || 'DESCONOCIDO';
      const color = this.getMarkerColor(situacion);

      console.log(`🎨 Marcador ${codCliente}: situación=${situacion}, color=${color}`);

      // Agregar clase base para animaciones
      element.classList.add('custom-marker');
      if (codCliente) {
        element.setAttribute('data-cliente-id', codCliente);
      }

      // Estilo base del marcador
      element.style.setProperty('background-color', color);
      element.style.setProperty('border-radius', '50%');
      element.style.setProperty('border', '2px solid white');
      element.style.setProperty('box-shadow', '0 2px 4px rgba(0,0,0,0.3)');
      element.style.setProperty('cursor', 'pointer');
      element.style.setProperty('display', 'flex');
      element.style.setProperty('align-items', 'center');
      element.style.setProperty('justify-content', 'center');
      element.style.setProperty('color', 'white');
      element.style.setProperty('font-size', '10px');
      element.style.setProperty('font-weight', '700');
      element.style.setProperty('transition', 'all 0.3s ease');

      // Tamaño según cantidad de créditos
      const size = totalCreditos > 1 ? 20 : 12;
      element.style.setProperty('width', `${size}px`);
      element.style.setProperty('height', `${size}px`);

      // Mostrar número de créditos si tiene más de uno
      if (totalCreditos > 1) {
        element.textContent = totalCreditos.toString();
      }
    }; // Crear layer de Teritorio
    this.clusterLayer = new TeritorioCluster('teritorio-cluster-layer', 'clientes-source', {
      clusterRender,
      markerRender,
      clusterMaxZoom: 14, // Sincronizado con el source
      clusterMinZoom: 0,
      markerSize: 12,
      unfoldedClusterMaxLeaves: 50, // Mostrar más puntos al expandir
    });

    console.log('🔧 Teritorio configurado: clusterMaxZoom=14, unfoldedLeaves=50');

    // Agregar layer al mapa
    this.map.addLayer(this.clusterLayer as any);

    // Event listener para clicks en features (marcadores individuales)
    this.clusterLayer.addEventListener('feature-click', (event: any) => {
      const feature = event.detail.selectedFeature;
      console.log('✅ Feature clicked:', feature);

      if (!feature || !feature.properties) {
        console.warn('⚠️ Feature sin properties');
        return;
      }

      const codCliente = feature.properties.cod_cliente;
      if (!codCliente) {
        console.warn('⚠️ Feature sin cod_cliente:', feature.properties);
        return;
      }

      // Buscar datos del cliente en el mapa
      const clienteData = this.clientesMap.get(codCliente);
      if (clienteData) {
        console.log('📋 Mostrando drawer para:', clienteData.cliente);
        // Aplicar efecto de selección al marcador
        this.highlightMarker(codCliente);
        // Abrir drawer
        this.openClientDrawer(clienteData);
      } else {
        console.error('❌ Cliente no encontrado en clientesMap:', codCliente);
        console.log('🔍 Clientes disponibles:', Array.from(this.clientesMap.keys()).slice(0, 5));
      }
    });

    console.log('✅ Cluster layer configurado');
  }

  /**
   * Agrupa múltiples créditos del mismo cliente
   * Cada cliente puede tener varios créditos históricos
   */
  private groupClientCredits(data: ReporteCartera[]): ClienteAgrupado[] {
    const clientesMap = new Map<string, ClienteAgrupado>();

    data.forEach((credito, index) => {
      // Debug: mostrar primer crédito para ver campos disponibles
      if (index === 0) {
        console.log('🔍 Primer crédito - campos disponibles:', {
          agencia: credito.agencia,
          asesor_servicios: credito.asesor_servicios,
          tipo_credito: credito['tipo_credito'],
          cliente: credito.cliente,
          monto: credito.monto_colocado,
        });
      }

      const key = `${credito.cod_cliente}-${credito.cliente}`;

      if (!clientesMap.has(key)) {
        // Primer crédito de este cliente
        clientesMap.set(key, {
          cod_cliente: credito.cod_cliente || '',
          cliente: credito.cliente,
          latitud: credito.latitud,
          longitud: credito.longitud,
          departamento: credito.departamento,
          creditos: [credito],
          totalCreditos: 1,
          montoTotal: credito.monto_colocado || 0,
          agencias: credito.agencia ? [credito.agencia] : [],
          asesores: credito.asesor_servicios ? [credito.asesor_servicios] : [],
        });
      } else {
        // Cliente ya existe, agregar crédito
        const cliente = clientesMap.get(key)!;
        cliente.creditos.push(credito);
        cliente.totalCreditos++;
        cliente.montoTotal += credito.monto_colocado || 0;

        // Agregar agencia si no existe
        if (credito.agencia && !cliente.agencias.includes(credito.agencia)) {
          cliente.agencias.push(credito.agencia);
        }

        // Agregar asesor si no existe
        if (credito.asesor_servicios && !cliente.asesores.includes(credito.asesor_servicios)) {
          cliente.asesores.push(credito.asesor_servicios);
        }
      }
    });

    const result = Array.from(clientesMap.values());
    console.log(
      `👥 Clientes agrupados: ${result.length} clientes únicos de ${data.length} créditos`,
    );

    // Debug: mostrar ejemplo de cliente agrupado
    if (result.length > 0) {
      console.log('📋 Ejemplo de cliente agrupado:', {
        nombre: result[0].cliente,
        totalCreditos: result[0].totalCreditos,
        agencias: result[0].agencias,
        asesores: result[0].asesores,
        montoTotal: result[0].montoTotal,
      });
    }

    return result;
  }

  /**
   * Determina la situación predominante entre múltiples créditos del cliente
   */
  /**
   * Obtiene la situación predominante de múltiples créditos
   * Prioriza: JUDICIAL > VENCIDO > CASTIGADO > VIGENTE
   */
  private getSituacionPredominante(creditos: ReporteCartera[]): string {
    if (creditos.length === 0) return 'DESCONOCIDO';
    if (creditos.length === 1) return creditos[0].situacion || 'DESCONOCIDO';

    // Prioridad de situaciones (las más críticas primero)
    const prioridades: Record<string, number> = {
      JUDICIAL: 4,
      VENCIDO: 3,
      CASTIGADO: 2,
      VIGENTE: 1,
      DESCONOCIDO: 0,
    };

    let situacionPrioritaria = 'DESCONOCIDO';
    let maxPrioridad = 0;

    creditos.forEach((credito) => {
      const situacion = (credito.situacion || 'DESCONOCIDO').toUpperCase();
      // Buscar la clave que coincida parcialmente
      for (const [key, prioridad] of Object.entries(prioridades)) {
        if (situacion.includes(key) && prioridad > maxPrioridad) {
          maxPrioridad = prioridad;
          situacionPrioritaria = key;
        }
      }
    });

    return situacionPrioritaria;
  }

  private getMarkerColor(situacion: string): string {
    const situacionUpper = situacion.toUpperCase();
    if (situacionUpper.includes('VIGENTE')) return '#10b981'; // Verde
    if (situacionUpper.includes('VENCIDO')) return '#f59e0b'; // Amarillo
    if (situacionUpper.includes('JUDICIAL')) return '#ef4444'; // Rojo
    if (situacionUpper.includes('CASTIGADO')) return '#6b7280'; // Gris
    return '#00843d'; // Verde ADRA por defecto
  }

  // Métodos de UI
  toggleFilters(): void {
    this.showFilters.update((v) => !v);
    if (this.showFilters()) {
      this.showSearch.set(false);
      this.showClientList.set(false);
    }
  }

  toggleSearch(): void {
    this.showSearch.update((v) => !v);
    if (this.showSearch()) {
      this.showFilters.set(false);
      this.showClientList.set(false);
    }
  }

  toggleClientList(): void {
    this.showClientList.update((v) => !v);
    if (this.showClientList()) {
      this.showFilters.set(false);
      this.showSearch.set(false);
    }
  }

  getSituacionClass(situacion: string | undefined): string {
    if (!situacion) return 'situacion-desconocido';
    const situacionUpper = situacion.toUpperCase();
    if (situacionUpper.includes('VIGENTE')) return 'situacion-vigente';
    if (situacionUpper.includes('VENCIDO')) return 'situacion-vencido';
    if (situacionUpper.includes('JUDICIAL')) return 'situacion-judicial';
    if (situacionUpper.includes('CASTIGADO')) return 'situacion-castigado';
    return 'situacion-desconocido';
  }

  getSituacionSeverity(situacion: string | undefined): 'success' | 'warn' | 'danger' | 'secondary' {
    if (!situacion) return 'secondary';
    const situacionUpper = situacion.toUpperCase();
    if (situacionUpper.includes('VIGENTE')) return 'success';
    if (situacionUpper.includes('VENCIDO')) return 'warn';
    if (situacionUpper.includes('JUDICIAL')) return 'danger';
    if (situacionUpper.includes('CASTIGADO')) return 'secondary';
    return 'secondary';
  }

  openClientDrawer(cliente: ClienteAgrupado): void {
    // Forzar cierre y reapertura para que siempre responda al click
    this.showClientDrawer.set(false);

    // Pequeño delay para permitir que el drawer se cierre completamente
    setTimeout(() => {
      this.selectedCliente.set(cliente);
      this.showClientDrawer.set(true);
    }, 50);
  }

  highlightMarker(codCliente: string): void {
    // Remover selección anterior
    const previousSelected = document.querySelectorAll('.custom-marker.selected');
    previousSelected.forEach((marker) => marker.classList.remove('selected'));

    // Agregar selección al nuevo marcador
    const marker = document.querySelector(`[data-cliente-id="${codCliente}"]`);
    if (marker) {
      marker.classList.add('selected');
    }
  }

  centerOnSelectedClient(): void {
    const cliente = this.selectedCliente();
    if (cliente && cliente.longitud && cliente.latitud && this.map) {
      this.map.flyTo({
        center: [cliente.longitud, cliente.latitud],
        zoom: 16,
        duration: 1500,
      });
    }
  }

  toggleClustering(): void {
    this.clusteringEnabled.update((v) => !v);
    const enabled = this.clusteringEnabled();
    console.log('Clustering:', enabled ? 'activado' : 'desactivado');

    if (!this.map || !this.clusterLayer) return;

    // Mostrar/ocultar el layer de clustering
    if (enabled) {
      this.map.setLayoutProperty('teritorio-cluster-layer', 'visibility', 'visible');
      // Ocultar marcadores individuales
      this.cleanupMarkers();
    } else {
      this.map.setLayoutProperty('teritorio-cluster-layer', 'visibility', 'none');
      // Mostrar marcadores individuales
      this.updateMarkers();
    }
  }

  applyFilters(): void {
    let filtered = [...this.groupedClients()];

    if (this.activeFilters.estado) {
      filtered = filtered.filter((cliente) =>
        cliente.creditos.some(
          (c) => c.situacion?.toUpperCase() === this.activeFilters.estado?.toUpperCase(),
        ),
      );
    }

    if (this.activeFilters.agencia) {
      filtered = filtered.filter((cliente) =>
        cliente.agencias.includes(this.activeFilters.agencia!),
      );
    }

    if (this.activeFilters.asesor) {
      filtered = filtered.filter((cliente) =>
        cliente.asesores.includes(this.activeFilters.asesor!),
      );
    }

    if (this.activeFilters.tipoCredito) {
      filtered = filtered.filter((cliente) =>
        cliente.creditos.some((c) => c['tipo_credito'] === this.activeFilters.tipoCredito),
      );
    }

    if (this.activeFilters.montoRange) {
      const [min, max] = this.activeFilters.montoRange;
      filtered = filtered.filter((cliente) => {
        return cliente.montoTotal >= min && cliente.montoTotal <= max;
      });
    }

    console.log(`🔍 Filtros aplicados: ${filtered.length} clientes`);
    this.filteredClients.set(filtered);
  }

  clearFilters(): void {
    this.activeFilters = {
      montoRange: [this.filterOptions().montoMin, this.filterOptions().montoMax],
    };
    this.filteredClients.set([...this.groupedClients()]);
  }

  removeFilter(filterType: string): void {
    switch (filterType) {
      case 'agencia':
        this.activeFilters.agencia = undefined;
        break;
      case 'asesor':
        this.activeFilters.asesor = undefined;
        break;
      case 'estado':
        this.activeFilters.estado = undefined;
        break;
      case 'tipoCredito':
        this.activeFilters.tipoCredito = undefined;
        break;
      case 'montoRange':
        this.activeFilters.montoRange = [
          this.filterOptions().montoMin,
          this.filterOptions().montoMax,
        ];
        break;
    }
    this.applyFilters();
  }

  onSearchChange(event: Event): void {
    const query = (event.target as HTMLInputElement).value.toLowerCase();

    if (query.length < 2) {
      this.searchResults.set([]);
      return;
    }

    // Buscar en clientes agrupados y devolver sus créditos individuales
    const clientesEncontrados = this.groupedClients().filter(
      (cliente) =>
        cliente.cliente?.toLowerCase().includes(query) ||
        cliente.cod_cliente?.toLowerCase().includes(query),
    );

    // Expandir los créditos de los clientes encontrados
    const creditosEncontrados: ReporteCartera[] = [];
    clientesEncontrados.forEach((cliente) => {
      creditosEncontrados.push(...cliente.creditos);
    });

    this.searchResults.set(creditosEncontrados.slice(0, 20)); // Máximo 20 resultados
  }

  focusOnClient(credito: ReporteCartera): void {
    if (credito.longitud && credito.latitud && this.map) {
      this.map.flyTo({
        center: [credito.longitud, credito.latitud],
        zoom: 16,
        duration: 2000,
      });

      // Buscar el cliente agrupado y abrir drawer
      const clienteData = this.clientesMap.get(credito.cod_cliente || '');
      if (clienteData) {
        this.highlightMarker(clienteData.cod_cliente);
        this.openClientDrawer(clienteData);
      }
    }
  }

  focusOnClientAgrupado(cliente: ClienteAgrupado): void {
    if (cliente.longitud && cliente.latitud && this.map) {
      this.map.flyTo({
        center: [cliente.longitud, cliente.latitud],
        zoom: 16,
        duration: 2000,
      });

      // Aplicar highlight y abrir drawer
      this.highlightMarker(cliente.cod_cliente);
      this.openClientDrawer(cliente);
    }
  }

  resetView(): void {
    if (this.map && this.bounds) {
      this.map.fitBounds(this.bounds, { padding: 50, duration: 1000 });
    }
  }

  exportToExcel(): void {
    // TODO: Implementar exportación con ExcelJS
    console.log('Exportar a Excel:', this.filteredClients());
    alert('Funcionalidad de exportación en desarrollo');
  }

  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Normaliza el nombre del departamento para que coincida con los datos del CSV
   * - Convierte a mayúsculas
   * - Remueve tildes/acentos
   */
  private normalizeDepartmentName(name: string): string {
    // Convertir a mayúsculas y remover tildes
    return name
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  formatCurrency(value: number): string {
    const parts = value.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return `S/. ${integerPart}.${parts[1]}`;
  }

  formatInteger(value: number): string {
    return Math.round(value)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  formatNumber(value: number): string {
    const parts = value.toFixed(2).split('.');
    const integerPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${integerPart},${parts[1]}`;
  }
}
