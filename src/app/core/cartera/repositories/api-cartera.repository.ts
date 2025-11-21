import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ReporteCartera } from '../models/reporte-cartera.interface';
import { CarteraRepository, EstadisticasCartera } from './cartera-repository.interface';
import { HHIAgenciasReporte } from '../models/hhi-agencias.interface';

/**
 * Implementación API REST del Repository Pattern
 * Consume datos desde una API externa
 */
@Injectable({
  providedIn: 'root',
})
export class ApiCarteraRepository implements CarteraRepository {
  private http = inject(HttpClient);

  // Configuración de la API (podría venir de environment)
  private readonly API_BASE_URL = 'https://api.mirar-adra.com/v1';

  private _isLoading = signal(false);
  private _lastUpdate = signal<Date | null>(null);

  // Implementación de la interfaz CarteraRepository

  async initialize(): Promise<void> {
    this._isLoading.set(true);

    try {
      // Para API, la inicialización podría verificar conectividad
      await this.checkApiHealth();
      this._lastUpdate.set(new Date());
      console.log('✅ API conectada exitosamente');
    } catch (error) {
      console.error('❌ Error conectando con API:', error);
      throw error;
    } finally {
      this._isLoading.set(false);
    }
  }

  async count(): Promise<number> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ count: number }>(`${this.API_BASE_URL}/cartera/count`),
      );
      return response.count;
    } catch (error) {
      console.error('❌ Error obteniendo conteo:', error);
      throw error;
    }
  }

  async getEstadisticas(): Promise<EstadisticasCartera> {
    try {
      const response = await firstValueFrom(
        this.http.get<EstadisticasCartera>(`${this.API_BASE_URL}/cartera/estadisticas`),
      );
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      throw error;
    }
  }

  async getByDepartamento(departamento: string): Promise<ReporteCartera[]> {
    try {
      const response = await firstValueFrom(
        this.http.get<ReporteCartera[]>(
          `${this.API_BASE_URL}/cartera/departamento/${encodeURIComponent(departamento)}`,
        ),
      );
      return response;
    } catch (error) {
      console.error(`❌ Error obteniendo datos del departamento ${departamento}:`, error);
      throw error;
    }
  }

  async getHHIAgencias(): Promise<HHIAgenciasReporte> {
    try {
      const response = await firstValueFrom(
        this.http.get<HHIAgenciasReporte>(`${this.API_BASE_URL}/cartera/hhi/agencias`),
      );
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo HHI de agencias:', error);
      throw error;
    }
  }

  async getHHITipoCredito(): Promise<HHIAgenciasReporte> {
    try {
      const response = await firstValueFrom(
        this.http.get<HHIAgenciasReporte>(`${this.API_BASE_URL}/cartera/hhi/tipo-credito`),
      );
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo HHI de tipo de crédito:', error);
      throw error;
    }
  }

  async getHHIDestinoCredito(): Promise<HHIAgenciasReporte> {
    try {
      const response = await firstValueFrom(
        this.http.get<HHIAgenciasReporte>(`${this.API_BASE_URL}/cartera/hhi/destino-credito`),
      );
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo HHI de destino de crédito:', error);
      throw error;
    }
  }

  async getHHIPlazo(): Promise<HHIAgenciasReporte> {
    try {
      const response = await firstValueFrom(
        this.http.get<HHIAgenciasReporte>(`${this.API_BASE_URL}/cartera/hhi/plazo`),
      );
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo HHI de plazo:', error);
      throw error;
    }
  }

  async getHHIZonaGeografica(): Promise<HHIAgenciasReporte> {
    try {
      const response = await firstValueFrom(
        this.http.get<HHIAgenciasReporte>(`${this.API_BASE_URL}/cartera/hhi/zona-geografica`),
      );
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo HHI de zona geográfica:', error);
      throw error;
    }
  }

  async getHHISectorEconomico(): Promise<HHIAgenciasReporte> {
    try {
      const response = await firstValueFrom(
        this.http.get<HHIAgenciasReporte>(`${this.API_BASE_URL}/cartera/hhi/sector-economico`),
      );
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo HHI de sector económico:', error);
      throw error;
    }
  }

  async getHHICalificacionCR(): Promise<HHIAgenciasReporte> {
    try {
      const response = await firstValueFrom(
        this.http.get<HHIAgenciasReporte>(`${this.API_BASE_URL}/cartera/hhi/calificacion-cr`),
      );
      return response;
    } catch (error) {
      console.error('❌ Error obteniendo HHI de calificación CR:', error);
      throw error;
    }
  }

  async clearData(): Promise<void> {
    // Para API, esto podría hacer un DELETE o limpiar caché local
    console.log('🧹 Limpiando caché local...');
    // Implementación específica de caché si fuera necesario
  }

  async refreshData(): Promise<void> {
    this._isLoading.set(true);
    try {
      // Para API, esto podría invalidar caché o recargar datos
      await this.clearData();
      this._lastUpdate.set(new Date());
      console.log('🔄 Datos actualizados desde API');
    } finally {
      this._isLoading.set(false);
    }
  }

  isLoading(): boolean {
    return this._isLoading();
  }

  getLastUpdate(): Date | null {
    return this._lastUpdate();
  }

  // Métodos específicos para API

  private async checkApiHealth(): Promise<void> {
    try {
      await firstValueFrom(this.http.get(`${this.API_BASE_URL}/health`));
    } catch {
      throw new Error('API no disponible');
    }
  }
}
