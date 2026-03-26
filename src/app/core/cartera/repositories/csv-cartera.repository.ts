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
          console.log(' Forzando recarga para incluir columnas IPC...');
          await this.db.cartera.clear();
        }
        console.log(' Cargando CSV desde assets...');
        await this.loadCsvToDatabase();
      } else {
        console.log(` Datos encontrados: ${count} registros`);
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

      console.log(` ${records.length} registros cargados exitosamente`);
    } catch (error) {
      console.error(' Error cargando CSV a BD:', error);
      throw error;
    }
  }

  private parseCsvData(csvText: string): CarteraRecord[] {
    const lines = csvText.split('\n');
    const records: CarteraRecord[] = [];

    // Función auxiliar para parsear números en formato PE: coma miles, punto decimal.
    const parseLatinNumber = (value: string): number => {
      if (!value || value.trim() === '') return 0;
      // Ejemplo: "1,540.25" => "1540.25"
      const cleaned = value.replace(/,/g, '');
      return parseFloat(cleaned) || 0;
    };

    const parseLatinInteger = (value: string): number => {
      if (!value || value.trim() === '') return 0;
      const cleaned = value.replace(/,/g, '').trim();
      const parsed = parseInt(cleaned, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    };

    console.log(' Parseando CSV - Total líneas:', lines.length);
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
          console.log(` Agencia vacía en línea ${i}:`, values.slice(0, 10));
        }
      }

      try {
        // Parse de valores numéricos base (una sola vez)
        const deuda_total = parseLatinNumber(values[39]);
        const saldo_capital = parseLatinNumber(values[40]);
        const dias_atraso = parseLatinInteger(values[51]);
        const mora_1_8 = parseLatinNumber(values[53]);
        const mora_9_30 = parseLatinNumber(values[54]);
        const mora_31_60 = parseLatinNumber(values[55]);
        const mora_61_90 = parseLatinNumber(values[56]);
        const mora_91_120 = parseLatinNumber(values[57]);
        const mora_120_mas = parseLatinNumber(values[58]);
        const dias_credito = parseLatinInteger(values[105]);
        const total_ahorros = parseLatinNumber(values[106]);
        const ingreso_principal = parseLatinNumber(values[109]);
        const ingreso_fijo_anterior = parseLatinNumber(values[110]);
        const pasivo_total_pasivo = parseLatinNumber(values[112]);
        const pasivo_total_riesgos = parseLatinNumber(values[113]);
        const efectivo_caja = parseLatinNumber(values[116]);
        const activo_total = parseLatinNumber(values[117]);
        const activo_anterior_balance = parseLatinNumber(values[118]);
        const años_experiencia_actividad = parseLatinInteger(values[122]);
        const ahorro_programado = parseLatinNumber(values[123]);
        const ahorro_voluntario = parseLatinNumber(values[124]);
        const total_ahorro = parseLatinNumber(values[125]);
        const saldo_ahorro_mes_anterior = parseLatinNumber(values[126]);
        const capacidad_pago = parseLatinNumber(values[88]);
        const monto_colocado = parseLatinNumber(values[33]);
        const ciclo_banca = parseLatinInteger(values[6]) || 1; // Evita división por 0
        const ciclo_cliente = parseLatinInteger(values[11]);
        const provision = parseLatinNumber(values[65]);
        const int_devengado = parseLatinNumber(values[59]);
        const interes_percibido = parseLatinNumber(values[62]);

        // Cálculo de IPCs usando valores previamente parseados
        // IPC2: Suma de mora 31+ días
        const ipc2 = mora_31_60 + mora_61_90 + mora_91_120 + mora_120_mas;

        // IPC3: Mora proporcional (evita división por 0)
        const ipc3 = dias_credito > 0 ? dias_atraso / dias_credito : 0;

        // IPC4: Capital en mora (saldo_capital)
        const ipc4 = saldo_capital;

        // IPC5: Garantía vs Deuda (evita división por 0)
        const ipc5 = deuda_total > 0 ? (efectivo_caja + total_ahorros) / deuda_total : 0;

        // IPC6: Sin fórmula (valor fijo)
        const ipc6 = 0;

        // IPC7: Ingreso principal / Capacidad de pago (evita división por 0)
        const ipc7 = capacidad_pago > 0 ? ingreso_principal / capacidad_pago : 0;

        // IPC8: Suma de ingresos y garantía
        const ipc8 = ingreso_principal + ingreso_fijo_anterior + total_ahorros;

        // IPC9: Monto colocado / Total pasivos (evita división por 0)
        const ipc9 = (pasivo_total_pasivo + pasivo_total_riesgos) > 0
          ? monto_colocado / (pasivo_total_pasivo + pasivo_total_riesgos)
          : 0;

        // IPC10: Sin fórmula
        const ipc10 = undefined;

        // IPC11: (ciclo_cliente - 1) / ciclo_banca (evita división por 0)
        const ipc11 = ciclo_banca > 0 ? (ciclo_cliente - 1) / ciclo_banca : 0;

        // IPC12: Sin fórmula
        const ipc12 = undefined;

        // IPC13: (efectivo_caja + total_ahorros) / activo_total (evita división por 0)
        const ipc13 = activo_total > 0 ? (efectivo_caja + total_ahorros) / activo_total : 0;

        // IPC14: ingreso_fijo_anterior / ingreso_principal (evita división por 0)
        const ipc14 = ingreso_principal > 0 ? ingreso_fijo_anterior / ingreso_principal : 0;

        // IPC15: años_experiencia_actividad (numerador es string, lo saltamos como número por ahora)
        const ipc15 = años_experiencia_actividad;

        // IPC16: activo_anterior_balance / activo_total (evita división por 0)
        const ipc16 = activo_total > 0 ? activo_anterior_balance / activo_total : 0;

        // IPC17: provision / saldo_capital (evita división por 0)
        const ipc17 = saldo_capital > 0 ? provision / saldo_capital : 0;

        // IPC18: provision / suma_moras (evita división por 0)
        const suma_moras = mora_1_8 + mora_9_30 + mora_31_60 + mora_61_90 + mora_91_120 + mora_120_mas;
        const ipc18 = suma_moras > 0 ? provision / suma_moras : 0;

        // IPC19: total_ahorros / saldo_capital (evita división por 0)
        const ipc19 = saldo_capital > 0 ? total_ahorros / saldo_capital : 0;

        // IPC20: deuda_total / capacidad_pago (evita división por 0)
        const ipc20 = capacidad_pago > 0 ? deuda_total / capacidad_pago : 0;

        // IPC21: ahorro_programado / ahorro_voluntario (evita división por 0)
        const ipc21 = ahorro_voluntario > 0 ? ahorro_programado / ahorro_voluntario : 0;

        // IPC22: Sin fórmula
        const ipc22 = undefined;

        // IPC23: int_devengado / interes_percibido (evita división por 0)
        const ipc23 = interes_percibido > 0 ? int_devengado / interes_percibido : 0;

        // IPC24: saldo_ahorro_mes_anterior - total_ahorro
        const ipc24 = saldo_ahorro_mes_anterior - total_ahorro;

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
          plazo: parseLatinInteger(values[29]),
          fecha_desembolso: values[30] || '',
          fecha_cuota_1: values[31] || '',
          fecha_fin_cronograma: values[32] || '',
          monto_colocado: monto_colocado,
          interes: parseLatinNumber(values[34]),
          igv_interes: parseLatinNumber(values[35]),
          fondo_cobertura: parseLatinNumber(values[36]),
          igv_fondo_cob: parseLatinNumber(values[37]),
          ajuste_mig: parseLatinNumber(values[38]),
          deuda_total: deuda_total,
          saldo_capital: saldo_capital,
          saldo_interes: parseLatinNumber(values[41]),
          saldo_igv_interes: parseLatinNumber(values[42]),
          saldo_fondo_cobertura: parseLatinNumber(values[43]),
          saldo_igv_fondo_cob: parseLatinNumber(values[44]),
          saldo_ajuste_mig: parseLatinNumber(values[45]),
          saldo_total: parseLatinNumber(values[46]),
          capital_largo_plazo: parseLatinNumber(values[47]),
          negociacion: values[48] || '',
          tipo_solicitud: values[49] || '',
          fecha_ultimo_vencimiento: values[50] || '',
          dias_atraso: dias_atraso,
          capital_mora: parseLatinNumber(values[52]),
          mora_1_8: mora_1_8,
          mora_9_30: mora_9_30,
          mora_31_60: mora_31_60,
          mora_61_90: mora_61_90,
          mora_91_120: mora_91_120,
          mora_120_mas: mora_120_mas,
          int_devengado: int_devengado,
          int_dev_no_pagado: parseLatinNumber(values[60]),
          saldo_int_dev: parseLatinNumber(values[61]),
          interes_percibido: interes_percibido,
          situacion: values[63] || '',
          clasificacion: values[64] || '',
          provision: provision,
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
          edad: parseLatinInteger(values[82]),
          genero: values[83] || '',
          sector_economico: values[84] || '',
          actividad_economica: values[85] || '',
          calificacion_cr: values[86] || '',
          categoria: values[87] || '',
          capacidad_pago: capacidad_pago,
          numero_cuenta: values[89] || '',
          entidad_financiera: values[90] || '',
          nombre_colegio: values[91] || '',
          nro_alumno: values[92] || '',
          latitud: parseFloat(values[97]) || 0,
          longitud: parseFloat(values[98]) || 0,
          dias_credito: dias_credito,
          total_ahorros: total_ahorros,
          efectivo_caja: efectivo_caja,
          ingreso_principal: ingreso_principal,
          ingreso_fijo_anterior: ingreso_fijo_anterior,
          pasivo_total_pasivo: pasivo_total_pasivo,
          pasivo_total_riesgos: pasivo_total_riesgos,
          activo_total: activo_total,
          activo_anterior_balance: activo_anterior_balance,
          fecha_creacion_cliente: values[120] || '',
          años_experiencia_actividad: años_experiencia_actividad,
          ahorro_programado: ahorro_programado,
          ahorro_voluntario: ahorro_voluntario,
          total_ahorro: total_ahorro,
          saldo_ahorro_mes_anterior: saldo_ahorro_mes_anterior,

          // Indicadores de Control Interno (IPC) - 18 indicadores
          // DIMENSIÓN INGRESO - IPC1 subdivido en 6 tramos de mora
          ipc1_1: mora_1_8,
          ipc1_2: mora_9_30,
          ipc1_3: mora_31_60,
          ipc1_4: mora_61_90,
          ipc1_5: mora_91_120,
          ipc1_6: mora_120_mas,
          // IPC2: Suma de mora 31+ días (pre-calculado)
          ipc2: ipc2,
          // IPC3: Mora proporcional (pre-calculado con protección /0)
          ipc3: ipc3,
          // IPC4: Saldo capital / Días atraso (pre-calculado con protección /0)
          ipc4: ipc4,
          // IPC7: Ingreso principal / Capacidad de pago (pre-calculado con protección /0)
          ipc7: ipc7,
          // IPC8: Suma de ingresos y garantía (pre-calculado)
          ipc8: ipc8,
          // IPC9: Monto colocado / Total pasivos (pre-calculado con protección /0)
          ipc9: ipc9,
          // IPC10: Sin fórmula
          ipc10: ipc10,
          // IPC11: (ciclo_cliente - 1) / ciclo_banca (pre-calculado con protección /0)
          ipc11: ipc11,
          // IPC12: Sin fórmula
          ipc12: ipc12,
          // IPC13: (efectivo_caja + total_ahorros) / activo_total (pre-calculado con protección /0)
          ipc13: ipc13,

          // DIMENSIÓN VOLUNTAD
          ipc3_voluntad: undefined, // Mora proporcional - compartido - PENDIENTE FÓRMULA
          ipc4_voluntad: undefined, // Ratio Capital/Días Atraso - compartido (ahora calculado)
          // IPC6: Sin fórmula (valor fijo 0)
          ipc6: ipc6,

          // DIMENSIÓN GARANTÍA PSICOLÓGICA
          // IPC5: Garantía vs Deuda (pre-calculado con protección /0)
          ipc5: ipc5,
          // IPC14: ingreso_fijo_anterior / ingreso_principal (pre-calculado con protección /0)
          ipc14: ipc14,
          // IPC15: años_experiencia_actividad
          ipc15: ipc15,
          // IPC16: activo_anterior_balance / activo_total (pre-calculado con protección /0)
          ipc16: ipc16,
          // IPC17: provision / saldo_capital (pre-calculado con protección /0)
          ipc17: ipc17,
          // IPC18: provision / suma_moras (pre-calculado con protección /0)
          ipc18: ipc18,
          // IPC19: total_ahorros / saldo_capital (pre-calculado con protección /0)
          ipc19: ipc19,
          // IPC20: deuda_total / capacidad_pago (pre-calculado con protección /0)
          ipc20: ipc20,
          // IPC21: ahorro_programado / ahorro_voluntario (pre-calculado con protección /0)
          ipc21: ipc21,
          // IPC22: Sin fórmula
          ipc22: ipc22,
          // IPC23: int_devengado / interes_percibido (pre-calculado con protección /0)
          ipc23: ipc23,
          // IPC24: saldo_ahorro_mes_anterior - total_ahorro (pre-calculado)
          ipc24: ipc24,
        };

        records.push(record);
        registrosParseados++;
      } catch (error) {
        console.warn(` Error parseando línea ${i}:`, error);
        continue;
      }
    }

    console.log(` Parseados: ${registrosParseados} registros`);
    console.log(` Agencias vacías detectadas: ${agenciasVacias}`);

    // Debug: Verificar que las columnas IPC se cargaron correctamente
    const registrosConIPC = records.filter(
      (r) => r.ipc1_1 !== undefined || r.ipc2 !== undefined || r.ipc3 !== undefined,
    );
    const registrosConCoordenadas = records.filter((r) => r.latitud !== 0 && r.longitud !== 0);
    console.log(` Registros con valores IPC: ${registrosConIPC.length}`);
    console.log(`Registros con coordenadas: ${registrosConCoordenadas.length}`);

    // Mostrar muestra de los primeros 3 registros con IPC
    console.log('Muestra de registros con IPC:');
    registrosConIPC.slice(0, 3).forEach((r, i) => {
      console.log(
        `  ${i + 1}. Cliente: ${r.cliente}, IPC1_1: ${r.ipc1_1}, IPC2: ${r.ipc2}, Coords: [${r.latitud}, ${r.longitud}]`,
      );
    });

    return records;
  }
}
