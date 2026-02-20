import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Dexie, { Table } from 'dexie';
import { ReporteCartera } from '../models/reporte-cartera.interface';
import { CarteraRepository, EstadisticasCartera } from './cartera-repository.interface';
import { HHIAgenciasReporte } from '../models/hhi-agencias.interface';
import { HHICalculatorService } from '../services/hhi-calculator.service';

// Extendemos la interfaz ReporteCartera para agregar el ID de Dexie
export interface CarteraRecord extends ReporteCartera {
  id?: number;
}

// Base de datos Dexie
export class CarteraDatabase extends Dexie {
  cartera!: Table<CarteraRecord, number>;

  constructor() {
    super('CarteraDatabase');
    this.version(2).stores({
      cartera:
        '++id, cod_agencia, agencia, departamento, provincia, distrito, genero, situacion, clasificacion, monto_colocado, latitud, longitud, ipc1, ipc2, ipc3, ipc4, ipc5, ipc6, ipc7, ipc8, ipc9, ipc10, ipc11, ipc12, ipc13, ipc14, ipc15, ipc16, ipc17, ipc18',
    });
  }
}

/**
 * Implementación CSV/LocalDB del Repository Pattern
 * Carga datos desde CSV y los almacena en IndexedDB local
 */
@Injectable({
  providedIn: 'root',
})
export class CsvCarteraRepository implements CarteraRepository {
  private db = new CarteraDatabase();
  private http = inject(HttpClient);
  private hhiCalculator = inject(HHICalculatorService);

  private _isLoading = signal(false);
  private _lastUpdate = signal<Date | null>(null);

  // Implementación de la interfaz CarteraRepository

  async initialize(): Promise<void> {
    this._isLoading.set(true);

    try {
      const count = await this.db.cartera.count();

      // TEMPORAL: Forzar recarga para incluir columnas IPC
      const forceReload = true;

      if (count === 0 || forceReload) {
        if (forceReload && count > 0) {
          console.log('🔄 Forzando recarga para incluir columnas IPC...');
          await this.db.cartera.clear();
        }
        console.log('📥 Cargando CSV desde assets...');
        await this.loadCsvToDatabase();
      } else {
        console.log(`✅ Datos encontrados: ${count} registros`);
      }

      this._lastUpdate.set(new Date());
    } finally {
      this._isLoading.set(false);
    }
  }

  async count(): Promise<number> {
    return await this.db.cartera.count();
  }

  async getEstadisticas(): Promise<EstadisticasCartera> {
    const records = await this.db.cartera.toArray();

    const stats: EstadisticasCartera = {
      total: records.length,
      totalMonto: records.reduce((sum, r) => sum + (r.monto_colocado || 0), 0),
      totalSaldo: records.reduce((sum, r) => sum + (r.saldo_total || 0), 0),
      porDepartamento: {},
    };

    records.forEach((record) => {
      const dept = record.departamento;
      if (dept) {
        stats.porDepartamento[dept] = (stats.porDepartamento[dept] || 0) + 1;
      }
    });

    return stats;
  }

  async getByDepartamento(departamento: string): Promise<ReporteCartera[]> {
    return await this.db.cartera.where('departamento').equals(departamento).toArray();
  }

  async getAllRecords(): Promise<ReporteCartera[]> {
    return await this.db.cartera.toArray();
  }

  async getHHIAgencias(): Promise<HHIAgenciasReporte> {
    // Obtener todos los datos de la cartera
    const todosLosDatos = await this.db.cartera.toArray();

    // Calcular HHI usando el servicio especializado
    return this.hhiCalculator.calcularHHIAgencias(todosLosDatos);
  }

  async getHHITipoCredito(): Promise<HHIAgenciasReporte> {
    // Obtener todos los datos de la cartera
    const todosLosDatos = await this.db.cartera.toArray();

    // Calcular HHI por tipo de crédito usando el servicio especializado
    return this.hhiCalculator.calcularHHITipoCredito(todosLosDatos);
  }

  async getHHIDestinoCredito(): Promise<HHIAgenciasReporte> {
    // Obtener todos los datos de la cartera
    const todosLosDatos = await this.db.cartera.toArray();

    // Calcular HHI por destino de crédito usando el servicio especializado
    return this.hhiCalculator.calcularHHIDestinoCredito(todosLosDatos);
  }

  async getHHIPlazo(): Promise<HHIAgenciasReporte> {
    const todosLosDatos = await this.db.cartera.toArray();
    return this.hhiCalculator.calcularHHIPlazo(todosLosDatos);
  }

  async getHHIZonaGeografica(): Promise<HHIAgenciasReporte> {
    const todosLosDatos = await this.db.cartera.toArray();
    return this.hhiCalculator.calcularHHIZonaGeografica(todosLosDatos);
  }

  async getHHISectorEconomico(): Promise<HHIAgenciasReporte> {
    const todosLosDatos = await this.db.cartera.toArray();
    return this.hhiCalculator.calcularHHISectorEconomico(todosLosDatos);
  }

  async getHHICalificacionCR(): Promise<HHIAgenciasReporte> {
    const todosLosDatos = await this.db.cartera.toArray();
    return this.hhiCalculator.calcularHHICalificacionCR(todosLosDatos);
  }

  async clearData(): Promise<void> {
    await this.db.cartera.clear();
  }

  async refreshData(): Promise<void> {
    await this.clearData();
    await this.initialize();
  }

  isLoading(): boolean {
    return this._isLoading();
  }

  getLastUpdate(): Date | null {
    return this._lastUpdate();
  }

  // Implementación específica para CSV
  private async loadCsvToDatabase(): Promise<void> {
    try {
      const csvText = await this.http
        .get('assets/data/reporte_cartera.csv', { responseType: 'text' })
        .toPromise();

      if (!csvText) {
        throw new Error('No se pudo cargar el archivo CSV');
      }

      const records = this.parseCsvData(csvText);

      const batchSize = 1000;
      for (let i = 0; i < records.length; i += batchSize) {
        const batch = records.slice(i, i + batchSize);
        await this.db.cartera.bulkAdd(batch);
      }

      console.log(`✅ ${records.length} registros cargados exitosamente`);
    } catch (error) {
      console.error('❌ Error cargando CSV a BD:', error);
      throw error;
    }
  }

  private parseCsvData(csvText: string): CarteraRecord[] {
    const lines = csvText.split('\n');
    const records: CarteraRecord[] = [];

    // Función auxiliar para parsear números en formato latinoamericano
    const parseLatinNumber = (value: string): number => {
      if (!value || value.trim() === '') return 0;
      // Remover comas como separadores de miles y convertir punto como decimal
      const cleaned = value.replace(/,/g, '');
      return parseFloat(cleaned) || 0;
    };

    console.log('🔍 Parseando CSV - Total líneas:', lines.length);
    let registrosParseados = 0;
    let agenciasVacias = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(';');

      // Debug primeras líneas
      if (i <= 3) {
        console.log(`Línea ${i} - Agencia (values[1]):`, values[1]);
      }

      // Contar agencias vacías
      if (!values[1] || values[1].trim() === '') {
        agenciasVacias++;
        if (agenciasVacias <= 3) {
          console.log(`⚠️ Agencia vacía en línea ${i}:`, values.slice(0, 10));
        }
      }

      try {
        const record: CarteraRecord = {
          cod_agencia: values[0] || '',
          agencia: values[1] || '',
          cod_asesor: values[2] || '',
          asesor_servicios: values[3] || '',
          cod_ac: values[4] || '',
          asociacion_comunal: values[5] || '',
          ciclo_banca: values[6] || '',
          num_operacion: values[7] || '',
          cod_cliente: values[8] || '',
          cliente: values[9] || '',
          tipo_persona: values[10] || '',
          ciclo_cliente: values[11] || '',
          documento: values[12] || '',
          tipo_documento: values[13] || '',
          caducidad_dni: values[14] || '',
          num_credito: values[15] || '',
          cod_modulo: values[16] || '',
          modulo: values[17] || '',
          programa: values[18] || '',
          cod_tipo_credito: values[19] || '',
          tipo_credito: values[20] || '',
          cod_producto: values[21] || '',
          producto: values[22] || '',
          cod_destino: values[23] || '',
          destino_credito: values[24] || '',
          tem: parseLatinNumber(values[25]),
          tea: parseLatinNumber(values[26]),
          tasa_fon_cob: parseLatinNumber(values[27]),
          tcea: parseLatinNumber(values[28]),
          plazo: parseInt(values[29]) || 0,
          fecha_desembolso: values[30] || '',
          fecha_cuota_1: values[31] || '',
          fecha_fin_cronograma: values[32] || '',
          monto_colocado: parseLatinNumber(values[33]),
          interes: parseLatinNumber(values[34]),
          igv_interes: parseLatinNumber(values[35]),
          fondo_cobertura: parseLatinNumber(values[36]),
          igv_fondo_cob: parseLatinNumber(values[37]),
          ajuste_mig: parseLatinNumber(values[38]),
          deuda_total: parseLatinNumber(values[39]),
          saldo_capital: parseLatinNumber(values[40]),
          saldo_interes: parseLatinNumber(values[41]),
          saldo_igv_interes: parseLatinNumber(values[42]),
          saldo_fondo_cobertura: parseLatinNumber(values[43]),
          saldo_igv_fondo_cob: parseLatinNumber(values[44]),
          saldo_ajuste_mig: parseLatinNumber(values[45]),
          saldo_total: parseLatinNumber(values[46]),
          capital_largo_plazo: parseFloat(values[47]?.replace(',', '.')) || 0,
          negociacion: values[48] || '',
          tipo_solicitud: values[49] || '',
          fecha_ultimo_vencimiento: values[50] || '',
          dias_atraso: parseInt(values[51]) || 0,
          capital_mora: parseFloat(values[52]?.replace(',', '.')) || 0,
          mora_1_8: parseFloat(values[53]?.replace(',', '.')) || 0,
          mora_9_30: parseFloat(values[54]?.replace(',', '.')) || 0,
          mora_31_60: parseFloat(values[55]?.replace(',', '.')) || 0,
          mora_61_90: parseFloat(values[56]?.replace(',', '.')) || 0,
          mora_91_120: parseFloat(values[57]?.replace(',', '.')) || 0,
          mora_120_mas: parseFloat(values[58]?.replace(',', '.')) || 0,
          int_devengado: parseFloat(values[59]?.replace(',', '.')) || 0,
          int_dev_no_pagado: parseFloat(values[60]?.replace(',', '.')) || 0,
          saldo_int_dev: parseFloat(values[61]?.replace(',', '.')) || 0,
          interes_percibido: parseFloat(values[62]?.replace(',', '.')) || 0,
          situacion: values[63] || '',
          clasificacion: values[64] || '',
          provision: parseFloat(values[65]?.replace(',', '.')) || 0,
          fuente_financiamiento: values[66] || '',
          codigo_pago: values[67] || '',
          forma_pago: values[68] || '',
          departamento_ac: values[69] || '',
          provincia_ac: values[70] || '',
          distrito_ac: values[71] || '',
          localidad_ac: values[72] || '',
          zona_geografica_ac: values[73] || '',
          direccion_cliente: values[74] || '',
          departamento: values[75] || '',
          provincia: values[76] || '',
          distrito: values[77] || '',
          localidad: values[78] || '',
          zona_geografica: values[79] || '',
          celular: values[80] || '',
          fecha_nacimiento: values[81] || '',
          edad: parseInt(values[82]) || 0,
          genero: values[83] || '',
          sector_economico: values[84] || '',
          actividad_economica: values[85] || '',
          calificacion_cr: values[86] || '',
          categoria: values[87] || '',
          capacidad_pago: parseFloat(values[88]?.replace(',', '.')) || 0,
          numero_cuenta: values[89] || '',
          entidad_financiera: values[90] || '',
          nombre_colegio: values[91] || '',
          nro_alumno: values[92] || '',
          latitud: parseFloat(values[93]) || 0,
          longitud: parseFloat(values[94]) || 0,

          // Indicadores de Control Interno (IPC) - 18 indicadores
          // DIMENSIÓN INGRESO
          ipc1: parseLatinNumber(values[95]),   // Mora (días)
          ipc2: values[96] || '',                // Mora por tramos (categórico)
          ipc3: parseLatinNumber(values[97]),    // Mora proporcional (%)
          ipc4: parseLatinNumber(values[98]),    // Tickets vencidos
          ipc7: parseLatinNumber(values[101]),   // Capacidad de pago
          ipc8: values[102] || '',               // Jerarquía de pago (categórico)
          ipc9: parseLatinNumber(values[103]),   // Concentración ADRA (%)
          ipc13: parseLatinNumber(values[107]),  // Liquidez (%)

          // DIMENSIÓN VOLUNTAD
          ipc3_voluntad: parseLatinNumber(values[97]), // Mora proporcional - compartido
          ipc4_voluntad: parseLatinNumber(values[98]), // Tickets vencidos - compartido
          ipc6: parseLatinNumber(values[100]),   // Recurrencia de mora
          ipc10: parseLatinNumber(values[104]),  // Nivel de contagio (%)
          ipc12: parseLatinNumber(values[106]),  // Rechazos (%)

          // DIMENSIÓN GARANTÍA PSICOLÓGICA
          ipc5: parseLatinNumber(values[99]),    // Deuda vs Garantía
          ipc11: parseLatinNumber(values[105]),  // Nivel de retención (%)
          ipc14: parseLatinNumber(values[108]),  // Variación de ingreso
          ipc15: parseLatinNumber(values[109]),  // Experiencia crediticia
          ipc16: parseLatinNumber(values[110]),  // Variación de activo
          ipc17: parseLatinNumber(values[111]),  // Cobertura de provisión (%)
          ipc18: parseLatinNumber(values[112]),  // Respaldo de ahorros (%)
        };

        records.push(record);
        registrosParseados++;
      } catch (error) {
        console.warn(`⚠️ Error parseando línea ${i}:`, error);
        continue;
      }
    }

    console.log(`✅ Parseados: ${registrosParseados} registros`);
    console.log(`⚠️ Agencias vacías detectadas: ${agenciasVacias}`);

    // Debug: Verificar que las columnas IPC se cargaron correctamente
    const registrosConIPC = records.filter(
      (r) => r.ipc1 !== undefined || r.ipc2 !== undefined || r.ipc3 !== undefined,
    );
    const registrosConCoordenadas = records.filter((r) => r.latitud !== 0 && r.longitud !== 0);
    console.log(`📊 Registros con valores IPC: ${registrosConIPC.length}`);
    console.log(`📍 Registros con coordenadas: ${registrosConCoordenadas.length}`);

    // Mostrar muestra de los primeros 3 registros con IPC
    console.log('📋 Muestra de registros con IPC:');
    registrosConIPC.slice(0, 3).forEach((r, i) => {
      console.log(
        `  ${i + 1}. Cliente: ${r.cliente}, IPC1: ${r.ipc1}, IPC2: ${r.ipc2}, Coords: [${r.latitud}, ${r.longitud}]`,
      );
    });

    return records;
  }
}
