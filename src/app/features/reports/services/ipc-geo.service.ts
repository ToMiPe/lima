import { Injectable, inject, signal, computed } from '@angular/core';
import { CARTERA_REPOSITORY_TOKEN } from '@core/cartera';
import { getHHIColorHex, HHIConcentrationRange, HHI_CONCENTRATION_RANGES } from '@core/cartera';

export interface GeoPoint {
  id: string;
  lat: number;
  lng: number;
  value: number;
  color: string;
  label: string;
  cliente: string;
  agencia: string;
  monto: number;
  rango: HHIConcentrationRange;
}

export interface IPCMapData {
  points: GeoPoint[];
  totalPoints: number;
  pointsByRange: Map<string, number>;
  statistics: {
    min: number;
    max: number;
    avg: number;
    withCoordinates: number;
    withoutCoordinates: number;
  };
}

type IPCField = 'ipc1' | 'ipc2' | 'ipc3' | 'ipc4' | 'ipc5';

/**
 * Servicio para gestionar datos georreferenciados de reportes IPC
 */
@Injectable({
  providedIn: 'root',
})
export class IPCGeoService {
  private readonly repository = inject(CARTERA_REPOSITORY_TOKEN);

  // Estado de filtros activos
  private _activeRanges = signal<Set<string>>(
    new Set(HHI_CONCENTRATION_RANGES.map((r) => r.label)),
  );
  readonly activeRanges = this._activeRanges.asReadonly();

  // Datos cargados por cada IPC
  private _ipc1Data = signal<IPCMapData | null>(null);
  private _ipc2Data = signal<IPCMapData | null>(null);
  private _ipc3Data = signal<IPCMapData | null>(null);
  private _ipc4Data = signal<IPCMapData | null>(null);
  private _ipc5Data = signal<IPCMapData | null>(null);

  readonly ipc1Data = this._ipc1Data.asReadonly();
  readonly ipc2Data = this._ipc2Data.asReadonly();
  readonly ipc3Data = this._ipc3Data.asReadonly();
  readonly ipc4Data = this._ipc4Data.asReadonly();
  readonly ipc5Data = this._ipc5Data.asReadonly();

  // Puntos filtrados según rangos activos
  readonly filteredIPC1Points = computed(() =>
    this.filterByActiveRanges(this._ipc1Data()?.points || []),
  );
  readonly filteredIPC2Points = computed(() =>
    this.filterByActiveRanges(this._ipc2Data()?.points || []),
  );
  readonly filteredIPC3Points = computed(() =>
    this.filterByActiveRanges(this._ipc3Data()?.points || []),
  );
  readonly filteredIPC4Points = computed(() =>
    this.filterByActiveRanges(this._ipc4Data()?.points || []),
  );
  readonly filteredIPC5Points = computed(() =>
    this.filterByActiveRanges(this._ipc5Data()?.points || []),
  );

  /**
   * Carga los datos de un IPC específico desde el repositorio
   */
  async loadIPCData(ipcNumber: 1 | 2 | 3 | 4 | 5): Promise<void> {
    const field: IPCField = `ipc${ipcNumber}` as IPCField;
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
        r[field] !== undefined &&
        r[field] !== null &&
        !isNaN(r[field]!),
    );

    const withoutCoordinates = records.length - validRecords.length;

    // Convertir a GeoPoints
    const points: GeoPoint[] = validRecords.map((record, index) => {
      const value = record[field]!;
      const range = this.getRange(value);

      return {
        id: `${field}-${record.cod_cliente}-${index}`,
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

    // Calcular estadísticas
    const values = points.map((p) => p.value);
    const statistics = {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      withCoordinates: validRecords.length,
      withoutCoordinates,
    };

    // Contar puntos por rango
    const pointsByRange = new Map<string, number>();
    HHI_CONCENTRATION_RANGES.forEach((range) => {
      const count = points.filter((p) => p.rango.label === range.label).length;
      pointsByRange.set(range.label, count);
    });

    const mapData: IPCMapData = {
      points,
      totalPoints: points.length,
      pointsByRange,
      statistics,
    };

    // Actualizar signal correspondiente
    switch (ipcNumber) {
      case 1:
        this._ipc1Data.set(mapData);
        break;
      case 2:
        this._ipc2Data.set(mapData);
        break;
      case 3:
        this._ipc3Data.set(mapData);
        break;
      case 4:
        this._ipc4Data.set(mapData);
        break;
      case 5:
        this._ipc5Data.set(mapData);
        break;
    }
  }

  /**
   * Activa o desactiva un rango de filtro
   */
  toggleRange(rangeLabel: string): void {
    const current = new Set(this._activeRanges());

    if (current.has(rangeLabel)) {
      current.delete(rangeLabel);
    } else {
      current.add(rangeLabel);
    }

    this._activeRanges.set(current);
  }

  /**
   * Activa todos los rangos
   */
  activateAllRanges(): void {
    this._activeRanges.set(new Set(HHI_CONCENTRATION_RANGES.map((r) => r.label)));
  }

  /**
   * Desactiva todos los rangos
   */
  deactivateAllRanges(): void {
    this._activeRanges.set(new Set());
  }

  /**
   * Activa solo un rango específico
   */
  activateOnlyRange(rangeLabel: string): void {
    this._activeRanges.set(new Set([rangeLabel]));
  }

  /**
   * Verifica si un rango está activo
   */
  isRangeActive(rangeLabel: string): boolean {
    return this._activeRanges().has(rangeLabel);
  }

  /**
   * Obtiene el rango HHI para un valor dado
   */
  private getRange(value: number): HHIConcentrationRange {
    return (
      HHI_CONCENTRATION_RANGES.find((r) => value > r.from && value <= r.to) ||
      HHI_CONCENTRATION_RANGES[0]
    );
  }

  /**
   * Filtra puntos según rangos activos
   */
  private filterByActiveRanges(points: GeoPoint[]): GeoPoint[] {
    const active = this._activeRanges();
    return points.filter((p) => active.has(p.rango.label));
  }

  /**
   * Resetea todos los filtros
   */
  resetFilters(): void {
    this.activateAllRanges();
  }
}
