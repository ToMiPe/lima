import { Injectable, inject, signal, computed } from '@angular/core';
import { CsvCarteraRepository } from '@core/cartera/repositories/csv-cartera.repository';
import { ReporteCartera } from '@core/cartera/models/reporte-cartera.interface';
import { IPCConfigService } from './ipc-config.service';
import {
  IPCDimension,
  IPCCampo,
  IPCConfig,
  DataFilters,
  RANGOS_MONTO_CREDITO,
  RANGOS_CAPACIDAD_PAGO,
} from '../models/ipc-config.interface';
import {
  HHI_CONCENTRATION_RANGES,
  HHIConcentrationRange,
} from '@core/cartera/models/hhi-concentration-ranges';

/**
 * Estadísticas para un IPC específico
 */
export interface IPCEstadisticas {
  total: number;
  media: number;
  mediana: number;
  minimo: number;
  maximo: number;
  distribucion: Map<string, number>; // Para categóricos o rangos
}

/**
 * Feature GeoJSON para visualización en mapa
 */
export interface IPCGeoFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [longitud, latitud]
  };
  properties: {
    epsa_codigo: string;
    nombre: string;
    agencia: string;
    saldo_capital: number;
    ipc_valor: number | string | null;
    ipc_color: string;
    ipc_color_hex: string;
    ipc_label: string;
    ipc_categoria?: string;
    dias_atraso?: number;
    clasificacion?: string;
  };
}

/**
 * Servicio para gestión de datos IPC
 * Filtra, transforma y prepara datos para visualización
 */
@Injectable({
  providedIn: 'root',
})
export class IPCDataService {
  private carteraRepo = inject(CsvCarteraRepository);
  private configService = inject(IPCConfigService);

  // Estado reactivo
  private _dimensionActiva = signal<IPCDimension>('ingreso');
  private _ipcActivo = signal<IPCCampo>('ipc1_1');
  private _rangosFiltrados = signal<Set<string>>(new Set());
  private _dataFilters = signal<DataFilters | null>(null);
  private _isLoading = signal(false);

  // Datos computados
  dimensionActiva = this._dimensionActiva.asReadonly();
  ipcActivo = this._ipcActivo.asReadonly();
  rangosFiltrados = this._rangosFiltrados.asReadonly();
  dataFilters = this._dataFilters.asReadonly();
  isLoading = this._isLoading.asReadonly();

  // Configuración activa computada
  configActiva = computed(() => {
    const ipcId = this.ipcIdFromCampo(this._ipcActivo());
    return this.configService.getIPCConfig(ipcId);
  });

  /**
   * Cambiar dimensión activa
   */
  setDimension(dimension: IPCDimension): void {
    this._dimensionActiva.set(dimension);

    // Auto-seleccionar el primer IPC de la dimensión
    const ipcsEnDimension = this.configService.getIPCsByDimension(dimension);
    if (ipcsEnDimension.length > 0) {
      this._ipcActivo.set(ipcsEnDimension[0].campo);
      this._rangosFiltrados.set(new Set());
    }
  }

  /**
   * Cambiar IPC activo
   */
  setIPC(campo: IPCCampo): void {
    this._ipcActivo.set(campo);
    this._rangosFiltrados.set(new Set());
  }

  /**
   * Alternar filtro por rango
   */
  toggleRangoFiltro(rangoId: string): void {
    const filtros = new Set(this._rangosFiltrados());

    if (filtros.has(rangoId)) {
      filtros.delete(rangoId);
    } else {
      filtros.add(rangoId);
    }

    this._rangosFiltrados.set(filtros);
  }

  /**
   * Limpiar todos los filtros de rangos
   */
  clearFiltros(): void {
    this._rangosFiltrados.set(new Set());
  }

  /**
   * Establecer múltiples filtros de rangos a la vez
   */
  setFiltros(filtros: Set<string>): void {
    this._rangosFiltrados.set(new Set(filtros));
  }

  /**
   * Establecer filtros de base de datos
   */
  setDataFilters(filters: DataFilters | null): void {
    this._dataFilters.set(filters);
  }

  /**
   * Limpiar filtros de base de datos
   */
  clearDataFilters(): void {
    this._dataFilters.set(null);
  }

  /**
   * Obtener valores únicos de un campo para los filtros
   */
  async getUniqueValues(field: keyof ReporteCartera): Promise<string[]> {
    const datos = await this.carteraRepo.getAllRecords();
    const valores = new Set<string>();

    datos.forEach((record: ReporteCartera) => {
      const valor = record[field];
      if (valor !== null && valor !== undefined && valor !== '') {
        valores.add(String(valor));
      }
    });

    return Array.from(valores).sort();
  }

  /**
   * Obtener rango de montos [min, max]
   */
  async getMontoRange(): Promise<[number, number]> {
    const datos = await this.carteraRepo.getAllRecords();
    const montos = datos
      .map((r: ReporteCartera) => r.monto_colocado)
      .filter((m: number) => typeof m === 'number' && !isNaN(m) && m > 0);

    if (montos.length === 0) return [0, 0];

    return [Math.min(...montos), Math.max(...montos)];
  }

  /**
   * Obtener datos filtrados según IPC y rangos activos
   */
  async getDatosFiltrados(): Promise<ReporteCartera[]> {
    this._isLoading.set(true);

    try {
      let todosLosDatos = await this.carteraRepo.getAllRecords();
      const campo = this._ipcActivo();
      const config = this.configActiva();

      if (!config) {
        return [];
      }

      // PASO 1: Aplicar filtros de base de datos (ANTES de calcular IPCs)
      const dataFilters = this._dataFilters();
      if (dataFilters) {
        todosLosDatos = todosLosDatos.filter((record) => {
          // Filtro por sedes
          if (dataFilters.sedes.length > 0) {
            if (!dataFilters.sedes.includes(record.agencia)) {
              return false;
            }
          }

          // Filtro por géneros
          if (dataFilters.generos.length > 0) {
            if (!dataFilters.generos.includes(record.genero)) {
              return false;
            }
          }

          // Filtro por rangos de monto de crédito
          if (dataFilters.montosCredito.length > 0) {
            const monto = record.monto_colocado;
            const cumpleRango = dataFilters.montosCredito.some((rangoId) => {
              // Buscar el rango correspondiente
              const rango = RANGOS_MONTO_CREDITO.find((r) => r.id === rangoId);
              if (!rango) return false;

              // Verificar si el monto está en el rango
              if (rango.max === null) {
                // Último rango (30,001+)
                return monto >= rango.min;
              } else {
                return monto >= rango.min && monto <= rango.max;
              }
            });

            if (!cumpleRango) {
              return false;
            }
          }

          // Filtro por productos
          if (dataFilters.productos.length > 0) {
            if (!dataFilters.productos.includes(record.producto)) {
              return false;
            }
          }

          // Filtro por zonas
          if (dataFilters.zonas.length > 0) {
            if (!dataFilters.zonas.includes(record.zona_geografica)) {
              return false;
            }
          }

          // Filtro por categorías
          if (dataFilters.categorias.length > 0) {
            if (!dataFilters.categorias.includes(record.categoria)) {
              return false;
            }
          }

          // Filtro por calificación CR
          if (dataFilters.calificacionesCR.length > 0) {
            if (!dataFilters.calificacionesCR.includes(record.calificacion_cr)) {
              return false;
            }
          }

          // Filtro por rangos de capacidad de pago
          if (dataFilters.capacidadesPago.length > 0) {
            const capacidad = record.capacidad_pago;
            const cumpleRango = dataFilters.capacidadesPago.some((rangoId) => {
              // Buscar el rango correspondiente
              const rango = RANGOS_CAPACIDAD_PAGO.find((r) => r.id === rangoId);
              if (!rango) return false;

              // Verificar si la capacidad está en el rango
              if (rango.max === null) {
                // Último rango (Más de 10,000)
                return capacidad >= rango.min;
              } else {
                return capacidad >= rango.min && capacidad <= rango.max;
              }
            });

            if (!cumpleRango) {
              return false;
            }
          }

          return true;
        });
      }

      // PASO 2: Filtrar registros con coordenadas y valor IPC presente
      let datosFiltrados = todosLosDatos.filter((record) => {
        const tieneCoords = record.latitud !== 0 && record.longitud !== 0;
        const valorIPC = this.extraerValorIPC(record, campo);
        const tieneValor = valorIPC !== null && valorIPC !== undefined && valorIPC !== '';

        return tieneCoords && tieneValor;
      });

      // PASO 3: Aplicar filtros por rango si están activos
      const filtros = this._rangosFiltrados();

      if (filtros.size > 0) {
        datosFiltrados = datosFiltrados.filter((record) => {
          const valorIPC = this.extraerValorIPC(record, campo);
          const rangoId = this.obtenerRangoId(valorIPC, config);
          return filtros.has(rangoId);
        });
      }

      return datosFiltrados;
    } finally {
      this._isLoading.set(false);
    }
  }

  /**
   * Generar GeoJSON para visualización en mapa
   */
  async generarGeoJSON(): Promise<GeoJSON.FeatureCollection<GeoJSON.Point>> {
    const datos = await this.getDatosFiltrados();
    const campo = this._ipcActivo();
    const config = this.configActiva();

    if (!config) {
      return {
        type: 'FeatureCollection',
        features: [],
      };
    }

    const features: IPCGeoFeature[] = datos.map((record) => {
      const valorIPC = this.extraerValorIPC(record, campo);
      const { color, colorHex, label, categoria } = this.obtenerEstiloIPC(valorIPC, config);

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [record.longitud, record.latitud],
        },
        properties: {
          epsa_codigo: record.cod_cliente || '',
          nombre: record.cliente || '',
          agencia: record.agencia || '',
          saldo_capital: record.saldo_capital || 0,
          ipc_valor: valorIPC,
          ipc_color: color,
          ipc_color_hex: colorHex,
          ipc_label: label,
          ipc_categoria: categoria,
          dias_atraso: record.dias_atraso,
          clasificacion: record.clasificacion,
        },
      };
    });

    return {
      type: 'FeatureCollection',
      features: features,
    } as GeoJSON.FeatureCollection<GeoJSON.Point>;
  }

  /**
   * Obtener total de registros sin aplicar filtros de rango
   * (solo filtros de coordenadas válidas y valor IPC presente)
   */
  async getTotalRecords(): Promise<number> {
    const campo = this._ipcActivo();
    const config = this.configActiva();

    if (!campo || !config) return 0;

    try {
      const todosLosDatos = await this.carteraRepo.getAllRecords();

      // Filtrar solo por coordenadas y valor IPC presente (SIN filtros de rango)
      const datosValidos = todosLosDatos.filter((record) => {
        const tieneCoords = record.latitud !== 0 && record.longitud !== 0;
        const valorIPC = this.extraerValorIPC(record, campo);
        const tieneValor = valorIPC !== null && valorIPC !== undefined && valorIPC !== '';

        return tieneCoords && tieneValor;
      });

      return datosValidos.length;
    } catch (error) {
      console.error('Error obteniendo total de registros:', error);
      return 0;
    }
  }

  /**
   * Calcular estadísticas del IPC activo
   */
  async calcularEstadisticas(): Promise<IPCEstadisticas> {
    const datos = await this.getDatosFiltrados();
    const campo = this._ipcActivo();
    const config = this.configActiva();

    if (!config || datos.length === 0) {
      return {
        total: 0,
        media: 0,
        mediana: 0,
        minimo: 0,
        maximo: 0,
        distribucion: new Map(),
      };
    }

    // Para IPCs categóricos
    if (config.tipo === 'categorico') {
      const distribucion = new Map<string, number>();

      datos.forEach((record) => {
        const valor = this.extraerValorIPC(record, campo) as string;
        distribucion.set(valor, (distribucion.get(valor) || 0) + 1);
      });

      return {
        total: datos.length,
        media: 0,
        mediana: 0,
        minimo: 0,
        maximo: 0,
        distribucion,
      };
    }

    // Para IPCs numéricos - calcular distribución por rangos
    const distribucion = new Map<string, number>();
    datos.forEach((record) => {
      const valorIPC = this.extraerValorIPC(record, campo);
      const rangoId = this.obtenerRangoId(valorIPC, config);
      distribucion.set(rangoId, (distribucion.get(rangoId) || 0) + 1);
    });

    // Para IPCs numéricos - calcular estadísticas descriptivas
    const valores = datos
      .map((record) => this.extraerValorIPC(record, campo) as number)
      .filter((v) => typeof v === 'number' && !isNaN(v))
      .sort((a, b) => a - b);

    if (valores.length === 0) {
      return {
        total: 0,
        media: 0,
        mediana: 0,
        minimo: 0,
        maximo: 0,
        distribucion,
      };
    }

    const media = valores.reduce((sum, v) => sum + v, 0) / valores.length;
    const mediana = valores[Math.floor(valores.length / 2)];
    const minimo = valores[0];
    const maximo = valores[valores.length - 1];

    return {
      total: datos.length,
      media,
      mediana,
      minimo,
      maximo,
      distribucion,
    };
  }

  /**
   * Extraer valor IPC de un registro
   */
  private extraerValorIPC(record: ReporteCartera, campo: IPCCampo): number | string | null {
    const valor = record[campo];

    if (valor === undefined || valor === null) {
      return null;
    }

    return valor;
  }

  /**
   * Obtener estilo (color, label) para un valor IPC
   */
  private obtenerEstiloIPC(
    valor: number | string | null,
    config: IPCConfig,
  ): { color: string; colorHex: string; label: string; categoria?: string } {
    if (valor === null || valor === undefined) {
      return {
        color: 'gray-500',
        colorHex: '#6B7280',
        label: 'Sin datos',
      };
    }

    // IPCs categóricos
    if (config.tipo === 'categorico' && config.categorias) {
      const categoria = config.categorias.find((c) => c.valor === valor);

      if (categoria) {
        return {
          color: categoria.color,
          colorHex: categoria.colorHex,
          label: categoria.label,
          categoria: categoria.valor,
        };
      }
    }

    // IPCs numéricos
    if (typeof valor === 'number') {
      const rangos = config.rangosCustom || HHI_CONCENTRATION_RANGES;
      const rango = rangos.find((r: HHIConcentrationRange) => valor >= r.from && valor <= r.to);

      if (rango) {
        return {
          color: rango.color,
          colorHex: rango.colorHex,
          label: rango.label,
        };
      }
    }

    // Fallback
    return {
      color: 'gray-500',
      colorHex: '#6B7280',
      label: 'Indefinido',
    };
  }

  /**
   * Obtener ID del rango para un valor
   */
  private obtenerRangoId(valor: number | string | null, config: IPCConfig): string {
    if (valor === null || valor === undefined) {
      return 'sin-datos';
    }

    // IPCs categóricos
    if (config.tipo === 'categorico') {
      return String(valor);
    }

    // IPCs numéricos
    if (typeof valor === 'number') {
      const rangos = config.rangosCustom || HHI_CONCENTRATION_RANGES;
      const rango = rangos.find((r: HHIConcentrationRange) => valor >= r.from && valor <= r.to);

      if (rango) {
        const id = `${rango.from}-${rango.to}`;
        return id;
      }
    }

    return 'indefinido';
  }

  /**
   * Convertir campo IPC a ID de configuración
   */
  private ipcIdFromCampo(campo: IPCCampo): string {
    // Extraer número del campo (e.g., "ipc1" -> "ipc1")
    return campo;
  }

  /**
   * Formatear valor IPC para presentación
   */
  formatearValor(valor: number | string | null, config: IPCConfig): string {
    if (valor === null || valor === undefined) {
      return 'N/A';
    }

    // Valores categóricos
    if (config.tipo === 'categorico') {
      return String(valor);
    }

    // Valores numéricos
    if (typeof valor === 'number') {
      const formatted = valor.toLocaleString('es-PE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      // Agregar unidad si existe
      if (config.unidad) {
        return `${formatted} ${config.unidad}`;
      }

      return formatted;
    }

    return String(valor);
  }

  /**
   * Obtener todos los datos filtrados (incluyendo registros sin coordenadas)
   * Útil para estadísticas y distribuciones
   */
  async getTodosDatosFiltrados(): Promise<ReporteCartera[]> {
    this._isLoading.set(true);

    try {
      let todosLosDatos = await this.carteraRepo.getAllRecords();
      const campo = this._ipcActivo();
      const config = this.configActiva();

      if (!config) {
        return [];
      }

      // PASO 1: Aplicar filtros de base de datos (ANTES de calcular IPCs)
      const dataFilters = this._dataFilters();
      if (dataFilters) {
        todosLosDatos = todosLosDatos.filter((record) => {
          // Filtro por sedes
          if (dataFilters.sedes.length > 0) {
            if (!dataFilters.sedes.includes(record.agencia)) {
              return false;
            }
          }

          // Filtro por géneros
          if (dataFilters.generos.length > 0) {
            if (!dataFilters.generos.includes(record.genero)) {
              return false;
            }
          }

          // Filtro por rangos de monto de crédito
          if (dataFilters.montosCredito.length > 0) {
            const monto = record.monto_colocado;
            const cumpleRango = dataFilters.montosCredito.some((rangoId) => {
              const rango = RANGOS_MONTO_CREDITO.find((r) => r.id === rangoId);
              if (!rango) return false;

              if (rango.max === null) {
                return monto >= rango.min;
              } else {
                return monto >= rango.min && monto <= rango.max;
              }
            });

            if (!cumpleRango) {
              return false;
            }
          }

          // Filtro por productos
          if (dataFilters.productos.length > 0) {
            if (!dataFilters.productos.includes(record.producto)) {
              return false;
            }
          }

          // Filtro por zonas
          if (dataFilters.zonas.length > 0) {
            if (!dataFilters.zonas.includes(record.zona_geografica)) {
              return false;
            }
          }

          // Filtro por categorías
          if (dataFilters.categorias.length > 0) {
            if (!dataFilters.categorias.includes(record.categoria)) {
              return false;
            }
          }

          // Filtro por calificación CR
          if (dataFilters.calificacionesCR.length > 0) {
            if (!dataFilters.calificacionesCR.includes(record.calificacion_cr)) {
              return false;
            }
          }

          // Filtro por rangos de capacidad de pago
          if (dataFilters.capacidadesPago.length > 0) {
            const capacidad = record.capacidad_pago;
            const cumpleRango = dataFilters.capacidadesPago.some((rangoId) => {
              const rango = RANGOS_CAPACIDAD_PAGO.find((r) => r.id === rangoId);
              if (!rango) return false;

              if (rango.max === null) {
                return capacidad >= rango.min;
              } else {
                return capacidad >= rango.min && capacidad <= rango.max;
              }
            });

            if (!cumpleRango) {
              return false;
            }
          }

          return true;
        });
      }

      // PASO 2: Filtrar registros con valor IPC presente (SIN filtrar por coordenadas)
      let datosFiltrados = todosLosDatos.filter((record) => {
        const valorIPC = this.extraerValorIPC(record, campo);
        const tieneValor = valorIPC !== null && valorIPC !== undefined && valorIPC !== '';
        return tieneValor;
      });

      // PASO 3: Aplicar filtros por rango si están activos
      const filtros = this._rangosFiltrados();

      if (filtros.size > 0) {
        datosFiltrados = datosFiltrados.filter((record) => {
          const valorIPC = this.extraerValorIPC(record, campo);
          const rangoId = this.obtenerRangoId(valorIPC, config);
          return filtros.has(rangoId);
        });
      }

      return datosFiltrados;
    } finally {
      this._isLoading.set(false);
    }
  }
}
