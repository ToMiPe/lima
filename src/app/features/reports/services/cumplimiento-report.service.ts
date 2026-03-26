import { Injectable, inject, signal } from '@angular/core';
import { CARTERA_REPOSITORY_TOKEN, ReporteCartera } from '@core/cartera';
import {
  PuntoCumplimiento,
  FiltrosCumplimiento,
  ReporteSummary,
  ClasificacionRiesgo,
  DescripcionRiesgo,
  RangosClasificacion,
  RANGOS_DEFAULT,
  LIMITES_PERU,
  RazonExclusion,
  RegistroExcluido,
  CumplimientoFeatureCollection,
} from '../models/cumplimiento-report.model';

/**
 * Servicio para procesar y transformar datos de cartera
 * en reportes de cumplimiento georreferenciados
 */
@Injectable({
  providedIn: 'root',
})
export class CumplimientoReportService {
  private readonly repository = inject(CARTERA_REPOSITORY_TOKEN);

  // Signals para estado reactivo
  private readonly datosOriginales = signal<ReporteCartera[]>([]);
  private readonly puntosProcesados = signal<PuntoCumplimiento[]>([]);
  private readonly registrosExcluidos = signal<RegistroExcluido[]>([]);
  private readonly isLoading = signal(false);
  private readonly error = signal<string | null>(null);

  // Getters públicos de signals
  readonly loading = this.isLoading.asReadonly();
  readonly errorMessage = this.error.asReadonly();
  readonly puntos = this.puntosProcesados.asReadonly();
  readonly excluidos = this.registrosExcluidos.asReadonly();

  /**
   * Inicializa el servicio y carga los datos del repository
   */
  async initialize(): Promise<void> {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      await this.repository.initialize();
    } catch (err) {
      this.error.set('Error al inicializar el repositorio de datos');
      console.error('Error en initialize:', err);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Obtiene todos los puntos de cumplimiento procesados
   * @param filtros Filtros opcionales para aplicar
   * @returns Array de puntos de cumplimiento
   */
  async getPuntosCumplimiento(filtros?: FiltrosCumplimiento): Promise<PuntoCumplimiento[]> {
    try {
      this.isLoading.set(true);
      this.error.set(null);

      // Obtener datos del repository
      let datos: ReporteCartera[];

      if (filtros?.departamento) {
        datos = await this.repository.getByDepartamento(filtros.departamento);
      } else {
        // Obtener estadísticas para cargar todos los datos
        const stats = await this.repository.getEstadisticas();
        // Cargar todos los departamentos - porDepartamento es Record<string, number>
        // Las claves son los nombres de departamentos
        const nombresDepartamentos = Object.keys(stats.porDepartamento || {});

        const promesas = nombresDepartamentos.map((nombreDepartamento) =>
          this.repository.getByDepartamento(nombreDepartamento),
        );
        const resultados = await Promise.all(promesas);
        datos = resultados.flat();
      }

      this.datosOriginales.set(datos);

      // Procesar y transformar los datos
      const puntos = this.procesarDatos(datos);

      // Aplicar filtros adicionales
      const puntosFiltrados = this.aplicarFiltros(puntos, filtros);

      this.puntosProcesados.set(puntosFiltrados);

      return puntosFiltrados;
    } catch (err) {
      this.error.set('Error al obtener datos de cumplimiento');
      console.error('Error en getPuntosCumplimiento:', err);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Obtiene puntos por departamento específico
   */
  async getPuntosByDepartamento(departamento: string): Promise<PuntoCumplimiento[]> {
    return this.getPuntosCumplimiento({ departamento });
  }

  /**
   * Procesa los datos crudos de cartera y los convierte en puntos de cumplimiento
   */
  private procesarDatos(datos: ReporteCartera[]): PuntoCumplimiento[] {
    const puntos: PuntoCumplimiento[] = [];
    const excluidos: RegistroExcluido[] = [];

    for (const registro of datos) {
      // Validar datos requeridos
      const validacion = this.validarRegistro(registro);

      if (!validacion.valido) {
        excluidos.push({
          codCredito: registro.num_credito?.toString() || 'N/A',
          cliente: registro.cliente || 'N/A',
          razon: validacion.razon!,
          detalles: validacion.detalles,
        });
        continue;
      }

      // Calcular porcentaje de cumplimiento
      const porcentaje = this.calcularPorcentaje(registro.monto_colocado, registro.saldo_capital);

      // Clasificar por color
      const { color, clasificacion } = this.clasificarRiesgo(porcentaje);

      // Crear punto de cumplimiento
      const punto: PuntoCumplimiento = {
        id: `${registro.num_credito}-${registro.cod_cliente}`,

        // Geolocalización
        latitud: registro.latitud,
        longitud: registro.longitud,

        // Cálculo
        montoColocado: registro.monto_colocado,
        saldoCapital: registro.saldo_capital,
        porcentajeCumplimiento: porcentaje,

        // Clasificación
        color,
        clasificacion,

        // Crédito
        codCredito: registro.num_credito?.toString() || 'N/A',
        tipoCredito: registro.tipo_credito || 'N/A',
        situacion: registro.situacion || 'N/A',
        diasAtraso: registro.dias_atraso || 0,
        fechaDesembolso: registro.fecha_desembolso || '',
        fechaVencimiento: registro.fecha_fin_cronograma || '',

        // Cliente
        codCliente: Number(registro.cod_cliente) || 0,
        nombreCliente: registro.cliente || 'N/A',
        genero: (registro.genero as 'M' | 'F') || 'M',
        edad: registro.edad,

        // Agencia
        codAgencia: Number(registro.cod_agencia) || 0,
        nombreAgencia: registro.agencia || 'N/A',
        asesor: registro.asesor_servicios || 'N/A',

        // Geográfico
        departamento: registro.departamento || 'N/A',
        provincia: registro.provincia || 'N/A',
        distrito: registro.distrito || 'N/A',
      };

      puntos.push(punto);
    }

    // Actualizar registros excluidos
    this.registrosExcluidos.set(excluidos);

    // Log de auditoría
    if (excluidos.length > 0) {
      console.warn(` ${excluidos.length} registros excluidos del reporte`);
      console.table(
        excluidos.slice(0, 10).map((e) => ({
          Crédito: e.codCredito,
          Cliente: e.cliente,
          Razón: e.razon,
        })),
      );
    }

    return puntos;
  }

  /**
   * Valida que un registro tenga todos los datos necesarios
   */
  private validarRegistro(registro: ReporteCartera): {
    valido: boolean;
    razon?: RazonExclusion;
    detalles?: string;
  } {
    // Validar latitud
    if (registro.latitud === null || registro.latitud === undefined) {
      return { valido: false, razon: RazonExclusion.SIN_LATITUD };
    }

    // Validar longitud
    if (registro.longitud === null || registro.longitud === undefined) {
      return { valido: false, razon: RazonExclusion.SIN_LONGITUD };
    }

    // Validar que no sea 0,0 (ubicación inválida común)
    if (registro.latitud === 0 && registro.longitud === 0) {
      return {
        valido: false,
        razon: RazonExclusion.UBICACION_FUERA_PERU,
        detalles: 'Coordenadas en 0,0',
      };
    }

    // Validar rangos de Perú
    if (!this.esUbicacionValida(registro.latitud, registro.longitud)) {
      return {
        valido: false,
        razon: RazonExclusion.UBICACION_FUERA_PERU,
        detalles: `Lat: ${registro.latitud}, Lng: ${registro.longitud}`,
      };
    }

    // Validar saldo_capital (excluir si es 0 = crédito pagado)
    if (registro.saldo_capital === 0 || registro.saldo_capital === null) {
      return { valido: false, razon: RazonExclusion.SALDO_CERO };
    }

    // Validar monto_colocado
    if (
      registro.monto_colocado === null ||
      registro.monto_colocado === undefined ||
      registro.monto_colocado <= 0
    ) {
      return { valido: false, razon: RazonExclusion.MONTO_INVALIDO };
    }

    // Validar datos críticos
    if (!registro.num_credito || !registro.cod_cliente) {
      return { valido: false, razon: RazonExclusion.DATOS_INCOMPLETOS };
    }

    return { valido: true };
  }

  /**
   * Valida que una ubicación esté dentro de los límites de Perú
   */
  private esUbicacionValida(lat: number, lng: number): boolean {
    return (
      !isNaN(lat) &&
      !isNaN(lng) &&
      lat >= LIMITES_PERU.latitud.min &&
      lat <= LIMITES_PERU.latitud.max &&
      lng >= LIMITES_PERU.longitud.min &&
      lng <= LIMITES_PERU.longitud.max
    );
  }

  /**
   * Calcula el porcentaje de cumplimiento
   * Fórmula: (monto_colocado / saldo_capital) * 100
   *
   * Interpretación:
   * - Mayor % = Mayor proporción de deuda respecto al monto inicial
   * - 100% = Saldo igual al monto colocado (no ha pagado nada)
   * - >100% = Debe más que el monto inicial (intereses/mora)
   */
  private calcularPorcentaje(montoColocado: number, saldoCapital: number): number {
    if (saldoCapital === 0) return 0;
    if (montoColocado === 0) return 0;

    let porcentaje = (montoColocado / saldoCapital) * 100;

    // Cap en 100 si supera (para visualización consistente)
    if (porcentaje > 100) {
      porcentaje = 100;
    }

    // Redondear a 2 decimales
    return Math.round(porcentaje * 100) / 100;
  }

  /**
   * Clasifica el riesgo basado en el porcentaje
   */
  private clasificarRiesgo(
    porcentaje: number,
    rangos: RangosClasificacion = RANGOS_DEFAULT,
  ): { color: ClasificacionRiesgo; clasificacion: DescripcionRiesgo } {
    if (porcentaje >= rangos.rojo.min && porcentaje <= rangos.rojo.max) {
      return { color: 'rojo', clasificacion: 'Alto Riesgo' };
    }

    if (porcentaje >= rangos.naranja.min && porcentaje <= rangos.naranja.max) {
      return { color: 'naranja', clasificacion: 'Riesgo Medio' };
    }

    return { color: 'verde', clasificacion: 'Bajo Riesgo' };
  }

  /**
   * Aplica filtros adicionales a los puntos procesados
   */
  private aplicarFiltros(
    puntos: PuntoCumplimiento[],
    filtros?: FiltrosCumplimiento,
  ): PuntoCumplimiento[] {
    if (!filtros) return puntos;

    return puntos.filter((punto) => {
      // Filtro por colores
      if (filtros.colores && filtros.colores.length > 0) {
        if (!filtros.colores.includes(punto.color)) return false;
      }

      // Filtro por provincia
      if (filtros.provincia && punto.provincia !== filtros.provincia) {
        return false;
      }

      // Filtro por distrito
      if (filtros.distrito && punto.distrito !== filtros.distrito) {
        return false;
      }

      // Filtro por agencias
      if (filtros.agencias && filtros.agencias.length > 0) {
        if (!filtros.agencias.includes(punto.nombreAgencia)) return false;
      }

      // Filtro por tipos de crédito
      if (filtros.tiposCredito && filtros.tiposCredito.length > 0) {
        if (!filtros.tiposCredito.includes(punto.tipoCredito)) return false;
      }

      // Filtro por asesores
      if (filtros.asesores && filtros.asesores.length > 0) {
        if (!filtros.asesores.includes(punto.asesor)) return false;
      }

      // Filtro por monto
      if (filtros.montoMin && punto.montoColocado < filtros.montoMin) {
        return false;
      }
      if (filtros.montoMax && punto.montoColocado > filtros.montoMax) {
        return false;
      }

      // Filtro por porcentaje
      if (filtros.porcentajeMin && punto.porcentajeCumplimiento < filtros.porcentajeMin) {
        return false;
      }
      if (filtros.porcentajeMax && punto.porcentajeCumplimiento > filtros.porcentajeMax) {
        return false;
      }

      // Filtro por situaciones
      if (filtros.situaciones && filtros.situaciones.length > 0) {
        if (!filtros.situaciones.includes(punto.situacion)) return false;
      }

      // Filtro por días de atraso
      if (filtros.diasAtrasoMin && punto.diasAtraso < filtros.diasAtrasoMin) {
        return false;
      }
      if (filtros.diasAtrasoMax && punto.diasAtraso > filtros.diasAtrasoMax) {
        return false;
      }

      // Filtro por género
      if (filtros.genero && punto.genero !== filtros.genero) {
        return false;
      }

      // Filtro por edad
      if (filtros.edadMin && punto.edad && punto.edad < filtros.edadMin) {
        return false;
      }
      if (filtros.edadMax && punto.edad && punto.edad > filtros.edadMax) {
        return false;
      }

      // Filtro por búsqueda de texto
      if (filtros.textoBusqueda) {
        const busqueda = filtros.textoBusqueda.toLowerCase();
        const coincide =
          punto.nombreCliente.toLowerCase().includes(busqueda) ||
          punto.codCredito.toLowerCase().includes(busqueda) ||
          punto.nombreAgencia.toLowerCase().includes(busqueda);

        if (!coincide) return false;
      }

      return true;
    });
  }

  /**
   * Genera un resumen estadístico del reporte
   */
  generarSummary(puntos: PuntoCumplimiento[]): ReporteSummary {
    const totales = {
      verde: puntos.filter((p) => p.color === 'verde').length,
      naranja: puntos.filter((p) => p.color === 'naranja').length,
      rojo: puntos.filter((p) => p.color === 'rojo').length,
    };

    const porcentajes = puntos.map((p) => p.porcentajeCumplimiento).sort((a, b) => a - b);
    const montos = {
      totalColocado: puntos.reduce((sum, p) => sum + p.montoColocado, 0),
      totalSaldoCapital: puntos.reduce((sum, p) => sum + p.saldoCapital, 0),
    };

    const summary: ReporteSummary = {
      totalRegistrosOriginales: this.datosOriginales().length,
      totalRegistrosProcesados: puntos.length,
      totalRegistrosExcluidos: this.registrosExcluidos().length,

      excluidos: this.contarExclusiones(),

      distribucion: totales,

      porcentajes: {
        min: porcentajes[0] || 0,
        max: porcentajes[porcentajes.length - 1] || 0,
        promedio: porcentajes.reduce((sum, p) => sum + p, 0) / porcentajes.length || 0,
        mediana: porcentajes[Math.floor(porcentajes.length / 2)] || 0,
      },

      montos: {
        totalColocado: montos.totalColocado,
        totalSaldoCapital: montos.totalSaldoCapital,
        promedioColocado: montos.totalColocado / puntos.length || 0,
        promedioSaldo: montos.totalSaldoCapital / puntos.length || 0,
      },

      fechaGeneracion: new Date(),
    };

    return summary;
  }

  /**
   * Cuenta las exclusiones por razón
   */
  private contarExclusiones() {
    const excluidos = this.registrosExcluidos();

    return {
      sinUbicacion: excluidos.filter(
        (e) => e.razon === RazonExclusion.SIN_LATITUD || e.razon === RazonExclusion.SIN_LONGITUD,
      ).length,
      ubicacionInvalida: excluidos.filter(
        (e) =>
          e.razon === RazonExclusion.LATITUD_INVALIDA ||
          e.razon === RazonExclusion.LONGITUD_INVALIDA ||
          e.razon === RazonExclusion.UBICACION_FUERA_PERU,
      ).length,
      saldoCero: excluidos.filter((e) => e.razon === RazonExclusion.SALDO_CERO).length,
      datosIncompletos: excluidos.filter((e) => e.razon === RazonExclusion.DATOS_INCOMPLETOS)
        .length,
      fueraDeRangos: excluidos.filter((e) => e.razon === RazonExclusion.MONTO_INVALIDO).length,
    };
  }

  /**
   * Convierte puntos a formato GeoJSON para MapLibre
   */
  toGeoJSON(puntos: PuntoCumplimiento[]): CumplimientoFeatureCollection {
    return {
      type: 'FeatureCollection',
      features: puntos.map((punto) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [punto.longitud, punto.latitud], // [lng, lat] para GeoJSON
        },
        properties: punto,
      })),
    };
  }

  /**
   * Obtiene listas únicas para filtros
   */
  async getOpcionesFiltros() {
    const stats = await this.repository.getEstadisticas();
    const puntos = this.puntosProcesados();

    // Obtener departamentos del stats
    const departamentos = Array.isArray(stats.porDepartamento)
      ? stats.porDepartamento.map((d: { departamento: string }) => d.departamento).sort()
      : [];

    return {
      departamentos,
      agencias: [...new Set(puntos.map((p) => p.nombreAgencia))].sort(),
      tiposCredito: [...new Set(puntos.map((p) => p.tipoCredito))].sort(),
      asesores: [...new Set(puntos.map((p) => p.asesor))].sort(),
      situaciones: [...new Set(puntos.map((p) => p.situacion))].sort(),
    };
  }

  /**
   * Limpia el estado del servicio
   */
  clear(): void {
    this.datosOriginales.set([]);
    this.puntosProcesados.set([]);
    this.registrosExcluidos.set([]);
    this.error.set(null);
  }
}
