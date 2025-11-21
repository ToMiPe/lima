import { Injectable } from '@angular/core';
import type { ReporteCartera } from '../models/reporte-cartera.interface';
import type {
  ConcentracionAgencia,
  HHIAgenciasReporte,
  HHIConfiguracion,
} from '../models/hhi-agencias.interface';
import type {
  HHIItem,
  HHIReporte,
  ConcentracionTipoCredito,
  HHITipoCreditoReporte,
} from '../models/hhi.interface';

/**
 * Servicio para calcular el Índice HHI (Herfindahl-Hirschman Index)
 * Evalúa la concentración de riesgo en diferentes dimensiones de la cartera
 */
@Injectable({
  providedIn: 'root',
})
export class HHICalculatorService {
  private readonly configuracion: HHIConfiguracion = {
    umbralBajo: 1500,
    umbralModerado: 2500,
  };

  /**
   * Calcula el reporte HHI de concentración por agencias
   * Agrupa por agencia y suma saldo_capital
   */
  calcularHHIAgencias(datos: ReporteCartera[]): HHIAgenciasReporte {
    // 1. Agrupar por agencia y sumar saldo_capital
    const agrupacionAgencias = this.agruparPorAgencia(datos);

    // 2. Calcular participaciones y crear array de concentración
    const totalCartera = agrupacionAgencias.reduce((total, item) => total + item.monto, 0);

    const agenciasConParticipacion: ConcentracionAgencia[] = agrupacionAgencias.map((item) => ({
      ...item,
      participacion: (item.monto / totalCartera) * 100,
    }));

    // 3. Calcular HHI
    const hhi = this.calcularIndiceHHI(agenciasConParticipacion);

    // 4. Determinar nivel de riesgo
    const nivelRiesgo = this.determinarNivelRiesgo(hhi);

    return {
      hhi,
      nivelRiesgo,
      interpretacion: this.obtenerInterpretacion(nivelRiesgo),
      totalCartera,
      fechaCalculo: new Date(),
      agencias: agenciasConParticipacion.sort((a, b) => b.monto - a.monto),
    };
  }

  /**
   * Agrupa los datos por agencia y suma los montos
   */
  private agruparPorAgencia(datos: ReporteCartera[]): ConcentracionAgencia[] {
    const agrupacion = new Map<string, ConcentracionAgencia>();

    datos.forEach((registro) => {
      // Normalizar agencia: si está vacía, nula o solo espacios, agrupar como "SIN AGENCIA"
      let agencia = registro.agencia?.trim() || '';

      if (!agencia || agencia === '' || agencia === 'null' || agencia === 'undefined') {
        agencia = 'SIN AGENCIA';
      }

      const monto = registro.saldo_capital;

      if (agrupacion.has(agencia)) {
        const existente = agrupacion.get(agencia)!;
        existente.monto += monto;
        existente.numeroOperaciones += 1;
      } else {
        agrupacion.set(agencia, {
          agencia,
          monto,
          numeroOperaciones: 1,
          participacion: 0, // Se calcula después
        });
      }
    });

    return Array.from(agrupacion.values());
  }

  /**
   * Agrupa los datos por tipo de crédito y suma los montos
   */
  private agruparPorTipoCredito(datos: ReporteCartera[]): ConcentracionAgencia[] {
    const agrupacion = new Map<string, ConcentracionAgencia>();

    datos.forEach((registro) => {
      // Normalizar tipo de crédito: si está vacío, agrupar como "SIN TIPO"
      let tipoCredito = registro.tipo_credito?.trim() || '';

      if (
        !tipoCredito ||
        tipoCredito === '' ||
        tipoCredito === 'null' ||
        tipoCredito === 'undefined'
      ) {
        tipoCredito = 'SIN TIPO';
      }

      const monto = registro.saldo_capital;

      if (agrupacion.has(tipoCredito)) {
        const existente = agrupacion.get(tipoCredito)!;
        existente.monto += monto;
        existente.numeroOperaciones += 1;
      } else {
        agrupacion.set(tipoCredito, {
          agencia: tipoCredito, // Reutilizamos el campo agencia para el tipo de crédito
          monto,
          numeroOperaciones: 1,
          participacion: 0, // Se calcula después
        });
      }
    });

    return Array.from(agrupacion.values());
  }

  /**
   * Calcula el índice HHI usando la fórmula: Σ(participación²)
   */
  private calcularIndiceHHI(agencias: ConcentracionAgencia[]): number {
    return agencias.reduce((hhi, agencia) => {
      return hhi + agencia.participacion * agencia.participacion;
    }, 0);
  }

  /**
   * Determina el nivel de riesgo basado en el HHI
   */
  private determinarNivelRiesgo(hhi: number): 'bajo' | 'moderado' | 'alto' {
    if (hhi < this.configuracion.umbralBajo) {
      return 'bajo';
    } else if (hhi < this.configuracion.umbralModerado) {
      return 'moderado';
    } else {
      return 'alto';
    }
  }

  /**
   * Obtiene la interpretación textual del nivel de riesgo
   */
  private obtenerInterpretacion(nivel: 'bajo' | 'moderado' | 'alto'): string {
    switch (nivel) {
      case 'bajo':
        return 'Mercado poco concentrado - Riesgo bajo';
      case 'moderado':
        return 'Concentración moderada - Riesgo controlado';
      case 'alto':
        return 'Mercado altamente concentrado - Riesgo alto';
    }
  }

  /**
   * Obtiene la configuración de umbrales HHI
   */
  getConfiguracion(): HHIConfiguracion {
    return { ...this.configuracion };
  }

  /**
   * Calcula el reporte HHI genérico por cualquier campo
   * @param datos Array de registros de cartera
   * @param campo Campo por el cual agrupar (ej: 'tipo_credito', 'producto', etc.)
   * @param nombreSinValor Nombre para registros sin valor (ej: 'SIN TIPO', 'SIN PRODUCTO')
   */
  calcularHHIGenerico(
    datos: ReporteCartera[],
    campo: keyof ReporteCartera,
    nombreSinValor: string,
  ): HHIAgenciasReporte {
    // 1. Agrupar por el campo especificado
    const agrupacion = this.agruparPorCampo(datos, campo, nombreSinValor);

    // 2. Calcular participaciones y crear array de concentración
    const totalCartera = agrupacion.reduce((total, item) => total + item.monto, 0);

    const itemsConParticipacion: ConcentracionAgencia[] = agrupacion.map((item) => ({
      ...item,
      participacion: (item.monto / totalCartera) * 100,
    }));

    // 3. Calcular HHI
    const hhi = this.calcularIndiceHHI(itemsConParticipacion);

    // 4. Determinar nivel de riesgo
    const nivelRiesgo = this.determinarNivelRiesgo(hhi);

    return {
      hhi,
      nivelRiesgo,
      interpretacion: this.obtenerInterpretacion(nivelRiesgo),
      totalCartera,
      fechaCalculo: new Date(),
      agencias: itemsConParticipacion.sort((a, b) => b.monto - a.monto),
    };
  }

  /**
   * Agrupa los datos por cualquier campo y suma los montos
   */
  private agruparPorCampo(
    datos: ReporteCartera[],
    campo: keyof ReporteCartera,
    nombreSinValor: string,
  ): ConcentracionAgencia[] {
    const agrupacion = new Map<string, ConcentracionAgencia>();

    datos.forEach((registro) => {
      // Obtener valor del campo y normalizarlo
      let valor = String(registro[campo] || '').trim();

      if (!valor || valor === '' || valor === 'null' || valor === 'undefined') {
        valor = nombreSinValor;
      }

      const monto = registro.saldo_capital;

      if (agrupacion.has(valor)) {
        const existente = agrupacion.get(valor)!;
        existente.monto += monto;
        existente.numeroOperaciones += 1;
      } else {
        agrupacion.set(valor, {
          agencia: valor, // Reutilizamos el campo agencia para cualquier categoría
          monto,
          numeroOperaciones: 1,
          participacion: 0, // Se calcula después
        });
      }
    });

    return Array.from(agrupacion.values());
  }

  /**
   * Calcula el reporte HHI de concentración por tipo de crédito
   */
  calcularHHITipoCredito(datos: ReporteCartera[]): HHIAgenciasReporte {
    return this.calcularHHIGenerico(datos, 'tipo_credito', 'SIN TIPO CRÉDITO');
  }

  /**
   * Calcula el reporte HHI de concentración por destino de crédito
   */
  calcularHHIDestinoCredito(datos: ReporteCartera[]): HHIAgenciasReporte {
    return this.calcularHHIGenerico(datos, 'destino_credito', 'SIN DESTINO');
  }

  /**
   * Calcula el reporte HHI de concentración por número de cuotas (plazo)
   */
  calcularHHIPlazo(datos: ReporteCartera[]): HHIAgenciasReporte {
    return this.calcularHHIGenerico(datos, 'plazo', 'SIN PLAZO');
  }

  /**
   * Calcula el reporte HHI de concentración por zona geográfica
   */
  calcularHHIZonaGeografica(datos: ReporteCartera[]): HHIAgenciasReporte {
    return this.calcularHHIGenerico(datos, 'zona_geografica_ac', 'SIN ZONA');
  }

  /**
   * Calcula el reporte HHI de concentración por sector económico
   */
  calcularHHISectorEconomico(datos: ReporteCartera[]): HHIAgenciasReporte {
    return this.calcularHHIGenerico(datos, 'sector_economico', 'SIN SECTOR');
  }

  /**
   * Calcula el reporte HHI de concentración por calificación en Central de Riesgos
   */
  calcularHHICalificacionCR(datos: ReporteCartera[]): HHIAgenciasReporte {
    return this.calcularHHIGenerico(datos, 'calificacion_cr', 'SIN CALIFICACIÓN');
  }

  /**
   * Ejemplo: Cálculo HHI por departamento usando el método tipado
   * Para uso futuro cuando se implementen nuevos reportes
   */
  calcularHHIDepartamento(datos: ReporteCartera[]): HHIReporte<ConcentracionTipoCredito> {
    return this.calcularHHIGenericoTipado(
      datos,
      'departamento',
      'SIN DEPARTAMENTO',
      (agrupacion): ConcentracionTipoCredito => ({
        nombre: agrupacion.agencia, // Campo genérico
        tipoCredito: agrupacion.agencia, // Campo específico
        monto: agrupacion.monto,
        numeroOperaciones: agrupacion.numeroOperaciones,
        participacion: agrupacion.participacion,
      })
    );
  }

  /**
   * Método genérico mejorado que retorna un reporte tipado
   * Para uso futuro con nuevas interfaces tipadas
   *
   * @example Crear reporte HHI por departamento:
   * ```typescript
   * const reporteDepartamento = this.calcularHHIGenericoTipado(
   *   datos,
   *   'departamento',
   *   'SIN DEPARTAMENTO',
   *   (agrupacion): ConcentracionDepartamento => ({
   *     nombre: agrupacion.agencia,
   *     departamento: agrupacion.agencia,
   *     monto: agrupacion.monto,
   *     numeroOperaciones: agrupacion.numeroOperaciones,
   *     participacion: agrupacion.participacion,
   *   })
   * );
   * ```
   *
   * @param datos Array de registros de cartera
   * @param campo Campo por el cual agrupar
   * @param valorDefault Valor para registros sin campo
   * @param mapperFn Función para transformar a tipo específico
   */
  private calcularHHIGenericoTipado<T extends HHIItem>(
    datos: ReporteCartera[],
    campo: keyof ReporteCartera,
    valorDefault: string,
    mapperFn: (agrupacion: ConcentracionAgencia) => T
  ): HHIReporte<T> {
    // 1. Agrupar datos usando el método existente
    const agrupacionBase = this.calcularHHIGenerico(datos, campo, valorDefault);

    // 2. Mapear a tipo específico
    const items: T[] = agrupacionBase.agencias.map(mapperFn);

    // 3. Retornar reporte tipado
    return {
      hhi: agrupacionBase.hhi,
      nivelRiesgo: agrupacionBase.nivelRiesgo,
      interpretacion: agrupacionBase.interpretacion,
      totalCartera: agrupacionBase.totalCartera,
      fechaCalculo: agrupacionBase.fechaCalculo,
      items,
    };
  }
}
