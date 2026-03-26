import { Injectable } from '@angular/core';
import type {
  IPCConfig,
  DimensionConfig,
  IPCDimension,
  IPCCategoria,
} from '../models/ipc-config.interface';
import { RANGOS_MORA_MONTO_AS_HHI, RANGOS_VOLUNTAD_PAGO } from '@core/cartera';

/**
 * Servicio que centraliza la configuración de los 24 Indicadores de Control Interno (IPC)
 * Basado en documento oficial "EXPLIC ipc.txt"
 * IPC1 subdividido en 6 tramos + IPC2-IPC24
 */
@Injectable({
  providedIn: 'root',
})
export class IPCConfigService {
  /**
   * Categorías para IPC2 - Mora por tramos
   */
  private readonly IPC2_CATEGORIAS: readonly IPCCategoria[] = [
    {
      valor: '0-30',
      label: '0-30 días',
      color: 'text-green-600',
      colorHex: '#16A34A',
      riskLevel: 'bajo',
    },
    {
      valor: '31-60',
      label: '31-60 días',
      color: 'text-orange-500',
      colorHex: '#F97316',
      riskLevel: 'moderado',
    },
    {
      valor: '61-90',
      label: '61-90 días',
      color: 'text-yellow-500',
      colorHex: '#EAB308',
      riskLevel: 'medio-alto',
    },
    {
      valor: '91-180',
      label: '91-180 días',
      color: 'text-cyan-500',
      colorHex: '#06B6D4',
      riskLevel: 'alto',
    },
    {
      valor: '>180',
      label: 'Más de 180 días',
      color: 'text-red-600',
      colorHex: '#DC2626',
      riskLevel: 'critico',
    },
  ];

  /**
   * Categorías para IPC8 - Jerarquía de fuente de pago
   */
  private readonly IPC8_CATEGORIAS: readonly IPCCategoria[] = [
    {
      valor: 'Primario',
      label: 'Ingreso Primario',
      color: 'text-green-600',
      colorHex: '#16A34A',
      riskLevel: 'bajo',
    },
    {
      valor: 'Secundario',
      label: 'Ingreso Secundario',
      color: 'text-orange-500',
      colorHex: '#F97316',
      riskLevel: 'moderado',
    },
    {
      valor: 'Otros',
      label: 'Otros Ingresos',
      color: 'text-yellow-500',
      colorHex: '#EAB308',
      riskLevel: 'medio-alto',
    },
    {
      valor: 'Garantía',
      label: 'Garantía',
      color: 'text-red-600',
      colorHex: '#DC2626',
      riskLevel: 'critico',
    },
  ];

  /**
   * Configuración de los 24 IPCs según documento oficial
   * IPC1 subdividido en 6 tramos (1.1 a 1.6) + IPC2 a IPC24
   */
  private readonly IPCS_CONFIG: readonly IPCConfig[] = [
    // IPC1 - Mora por tramos (subdividido en 6 tramos)
    {
      id: 'ipc1_1',
      codigo: 'IPC1.1',
      titulo: 'Mora 1-8 días',
      descripcion: 'Monto en mora entre 1 y 8 días. Primer nivel de atraso en pagos.',
      dimensiones: ['ingreso'],
      tipo: 'numerico',
      campo: 'ipc1_1',
      unidad: 'S/',
      colorPrimario: '#3B82F6',
      rangosCustom: RANGOS_MORA_MONTO_AS_HHI,
      interpretacion: {
        bajo: 'Mora mínima - Bajo riesgo',
        moderado: 'Atraso inicial - Requiere monitoreo',
        alto: 'Mora temprana elevada - Riesgo emergente',
      },
    },
    {
      id: 'ipc1_2',
      codigo: 'IPC1.2',
      titulo: 'Mora 9-30 días',
      descripcion: 'Monto en mora entre 9 y 30 días. Atraso moderado que requiere atención.',
      dimensiones: ['ingreso'],
      tipo: 'numerico',
      campo: 'ipc1_2',
      unidad: 'S/',
      colorPrimario: '#10B981',
      rangosCustom: RANGOS_MORA_MONTO_AS_HHI,
      interpretacion: {
        bajo: 'Mora controlada - Seguimiento normal',
        moderado: 'Atraso moderado - Requiere gestión',
        alto: 'Mora elevada - Riesgo importante',
      },
    },
    {
      id: 'ipc1_3',
      codigo: 'IPC1.3',
      titulo: 'Mora 31-60 días',
      descripcion: 'Monto en mora entre 31 y 60 días. Cartera en riesgo.',
      dimensiones: ['ingreso'],
      tipo: 'numerico',
      campo: 'ipc1_3',
      unidad: 'S/',
      colorPrimario: '#F59E0B',
      rangosCustom: RANGOS_MORA_MONTO_AS_HHI,
      interpretacion: {
        bajo: 'Mora temprana - Recuperable',
        moderado: 'Cartera en riesgo - Acción requerida',
        alto: 'Mora crítica - Alto riesgo de pérdida',
      },
    },
    {
      id: 'ipc1_4',
      codigo: 'IPC1.4',
      titulo: 'Mora 61-90 días',
      descripcion: 'Monto en mora entre 61 y 90 días. Cartera deteriorada.',
      dimensiones: ['ingreso'],
      tipo: 'numerico',
      campo: 'ipc1_4',
      unidad: 'S/',
      colorPrimario: '#EF4444',
      rangosCustom: RANGOS_MORA_MONTO_AS_HHI,
      interpretacion: {
        bajo: 'Deterioro controlado',
        moderado: 'Cartera deteriorada - Gestión intensiva',
        alto: 'Mora severa - Provisionamiento alto',
      },
    },
    {
      id: 'ipc1_5',
      codigo: 'IPC1.5',
      titulo: 'Mora 91-120 días',
      descripcion: 'Monto en mora entre 91 y 120 días. Cartera de muy alto riesgo.',
      dimensiones: ['ingreso'],
      tipo: 'numerico',
      campo: 'ipc1_5',
      unidad: 'S/',
      colorPrimario: '#DC2626',
      rangosCustom: RANGOS_MORA_MONTO_AS_HHI,
      interpretacion: {
        bajo: 'Mora grave - Baja recuperabilidad',
        moderado: 'Cartera castigable - Pérdida probable',
        alto: 'Mora crítica - Castigo inminente',
      },
    },
    {
      id: 'ipc1_6',
      codigo: 'IPC1.6',
      titulo: 'Mora +120 días',
      descripcion: 'Monto en mora mayor a 120 días. Cartera castigable.',
      dimensiones: ['ingreso'],
      tipo: 'numerico',
      campo: 'ipc1_6',
      unidad: 'S/',
      colorPrimario: '#991B1B',
      rangosCustom: RANGOS_MORA_MONTO_AS_HHI,
      interpretacion: {
        bajo: 'Mora irrecuperable',
        moderado: 'Cartera perdida - Provisión 100%',
        alto: 'Castigo requerido - Sin valor',
      },
    },

    // IPC2 - Suma de mora 31+ días
    {
      id: 'ipc2',
      codigo: 'IPC2',
      titulo: 'Mora 31+ días',
      descripcion: 'Suma de montos en mora desde 31 días en adelante (mora crítica).',
      dimensiones: ['ingreso'],
      tipo: 'numerico',
      campo: 'ipc2',
      unidad: 'S/',
      colorPrimario: '#8B5CF6',
      rangosCustom: RANGOS_MORA_MONTO_AS_HHI,
      interpretacion: {
        bajo: 'Mora crítica baja - Recuperable',
        moderado: 'Mora significativa - Requiere gestión activa',
        alto: 'Mora crítica alta - Baja recuperación',
      },
    },

    // IPC3 - Mora proporcional
    {
      id: 'ipc3',
      codigo: 'IPC3',
      titulo: 'Mora proporcional',
      descripcion: 'Días en mora / días totales del crédito. Mide intensidad relativa del atraso.',
      dimensiones: ['voluntad'],
      tipo: 'numerico',
      campo: 'ipc3',
      unidad: '%',
      colorPrimario: '#10B981',
      rangosCustom: RANGOS_VOLUNTAD_PAGO,
      interpretacion: {
        bajo: 'Mora baja respecto al plazo - Deterioro controlado',
        moderado: 'Mora moderada - Disciplina financiera débil',
        alto: 'Mora alta - Ruptura de flujo de caja',
      },
    },

    // IPC4 - Ratio Capital/Días Atraso
    {
      id: 'ipc4',
      codigo: 'IPC4',
      titulo: 'Ratio Capital/Días Atraso',
      descripcion:
        'Saldo capital / Días atraso. Mide la magnitud del saldo pendiente por día de mora.',
      dimensiones: ['ingreso', 'voluntad'],
      tipo: 'numerico',
      campo: 'ipc4',
      unidad: 'S//día',
      colorPrimario: '#F59E0B',
      interpretacion: {
        bajo: 'Bajo saldo por día - Capacidad de recuperación',
        moderado: 'Ratio moderado - Seguimiento necesario',
        alto: 'Alto saldo por día - Dificultad de recuperación',
      },
    },

    // IPC5 - Deuda vs Garantía
    {
      id: 'ipc5',
      codigo: 'IPC5',
      titulo: 'Deuda vs Garantía',
      descripcion: 'Total deuda / Total garantía. Evalúa cobertura del crédito mediante garantías.',
      dimensiones: ['ingreso', 'garantia'],
      tipo: 'numerico',
      campo: 'ipc5',
      unidad: 'ratio',
      colorPrimario: '#EF4444',
      interpretacion: {
        bajo: 'Garantías suficientes - Pérdida esperada baja',
        moderado: 'Cobertura moderada - Exposición controlada',
        alto: 'Subgarantizado - Alta exposición patrimonial',
      },
    },

    // IPC6 - Recurrencia de mora
    {
      id: 'ipc6',
      codigo: 'IPC6',
      titulo: 'Recurrencia de mora',
      descripcion:
        'Días de mora acumulados / días promedio entre pago y pago. Mide patrón histórico de morosidad.',
      dimensiones: ['voluntad'],
      tipo: 'numerico',
      campo: 'ipc6',
      unidad: 'ratio',
      colorPrimario: '#EC4899',
      rangosCustom: RANGOS_VOLUNTAD_PAGO,
      interpretacion: {
        bajo: 'Historial limpio - Baja probabilidad de deterioro',
        moderado: 'Mora recurrente - Fragilidad estructural',
        alto: 'Reincidencia alta - Sobreendeudamiento probable',
      },
    },

    // IPC7 - Capacidad de pago directa
    {
      id: 'ipc7',
      codigo: 'IPC7',
      titulo: 'Capacidad de pago directa',
      descripcion:
        'Ingreso primario / Tickets. Mide solvencia directa del cliente para cubrir su obligación.',
      dimensiones: ['ingreso'],
      tipo: 'numerico',
      campo: 'ipc7',
      unidad: 'ratio',
      colorPrimario: '#14B8A6',
      interpretacion: {
        bajo: 'Ingreso insuficiente - Depende de fuentes alternativas',
        moderado: 'Capacidad ajustada - Riesgo de liquidez',
        alto: 'Solvencia directa adecuada - Sostenibilidad del crédito',
      },
      invertido: true, // Mayor valor = mejor
    },

    // IPC8 - Jerarquía de fuente de pago
    {
      id: 'ipc8',
      codigo: 'IPC8',
      titulo: 'Jerarquía de fuente de pago',
      descripcion:
        'Clasifica origen del pago: Primario > Secundario > Otros > Garantía. Evalúa estabilidad.',
      dimensiones: ['ingreso'],
      tipo: 'categorico',
      campo: 'ipc8',
      unidad: 'categoría',
      colorPrimario: '#8B5CF6',
      categorias: this.IPC8_CATEGORIAS,
      interpretacion: {
        bajo: 'Ingreso primario - Estable y predecible',
        moderado: 'Ingreso secundario - Volatilidad moderada',
        alto: 'Garantías - Incapacidad de pago real',
      },
    },

    // IPC9 - Concentración ADRA
    {
      id: 'ipc9',
      codigo: 'IPC9',
      titulo: 'Concentración ADRA',
      descripcion:
        'Deuda con ADRA / Pasivo total del cliente. Mide proporción del endeudamiento con la entidad.',
      dimensiones: ['ingreso'],
      tipo: 'numerico',
      campo: 'ipc9',
      unidad: '%',
      colorPrimario: '#6366F1',
      interpretacion: {
        bajo: 'Bajo % ADRA - Exposición externa significativa',
        moderado: 'Concentración moderada - Equilibrio razonable',
        alto: 'Alta concentración - Riesgo institucional elevado',
      },
    },

    // IPC10 - Nivel de contagio
    {
      id: 'ipc10',
      codigo: 'IPC10',
      titulo: 'Nivel de contagio',
      descripcion:
        'Créditos sin ADRA / Créditos totales. Mide cuántas entidades financieras comparten al cliente.',
      dimensiones: ['voluntad'],
      tipo: 'numerico',
      campo: 'ipc10',
      unidad: '%',
      colorPrimario: '#F97316',
      rangosCustom: RANGOS_VOLUNTAD_PAGO,
      interpretacion: {
        bajo: 'Pocos créditos externos - Fidelidad alta',
        moderado: 'Múltiples entidades - Riesgo de contagio',
        alto: 'Sobreendeudamiento - Competencia de pagos',
      },
    },

    // IPC11 - Nivel de retención
    {
      id: 'ipc11',
      codigo: 'IPC11',
      titulo: 'Nivel de retención',
      descripcion:
        'Ciclos anteriores / total ciclos. Mide permanencia del cliente en la institución.',
      dimensiones: ['garantia'],
      tipo: 'numerico',
      campo: 'ipc11',
      unidad: '%',
      colorPrimario: '#06B6D4',
      interpretacion: {
        bajo: 'Cliente nuevo - Incertidumbre alta',
        moderado: 'Retención moderada - Historial verificable',
        alto: 'Alta permanencia - Compromiso institucional',
      },
      invertido: true, // Mayor retención = mejor
    },

    // IPC12 - Rechazos
    {
      id: 'ipc12',
      codigo: 'IPC12',
      titulo: 'Rechazos',
      descripcion:
        'Operaciones rechazadas / operaciones totales. Detecta inconsistencias y riesgo moral.',
      dimensiones: ['voluntad'],
      tipo: 'numerico',
      campo: 'ipc12',
      unidad: '%',
      colorPrimario: '#DC2626',
      rangosCustom: RANGOS_VOLUNTAD_PAGO,
      interpretacion: {
        bajo: 'Sin rechazos - Comportamiento confiable',
        moderado: 'Rechazos ocasionales - Alerta documental',
        alto: 'Múltiples rechazos - Riesgo moral elevado',
      },
    },

    // IPC13 - Liquidez del cliente
    {
      id: 'ipc13',
      codigo: 'IPC13',
      titulo: 'Liquidez del cliente',
      descripcion: '(Efectivo + ahorros) / activo total. Evalúa capacidad de liquidez inmediata.',
      dimensiones: ['ingreso'],
      tipo: 'numerico',
      campo: 'ipc13',
      unidad: '%',
      colorPrimario: '#10B981',
      interpretacion: {
        bajo: 'Baja liquidez - Vulnerabilidad ante shocks',
        moderado: 'Liquidez moderada - Colchón financiero básico',
        alto: 'Alta liquidez - Resiliencia financiera',
      },
      invertido: true, // Mayor liquidez = mejor
    },

    // IPC14 - Variación del ingreso
    {
      id: 'ipc14',
      codigo: 'IPC14',
      titulo: 'Variación del ingreso',
      descripcion:
        'Ingreso t-1 / Ingreso t. Mide evolución del ingreso: <1 crecimiento, =1 estable, >1 deterioro.',
      dimensiones: ['garantia'],
      tipo: 'numerico',
      campo: 'ipc14',
      unidad: 'ratio',
      colorPrimario: '#8B5CF6',
      interpretacion: {
        bajo: 'Ingreso en crecimiento - Capacidad creciente',
        moderado: 'Ingreso estable - Sin cambios significativos',
        alto: 'Ingreso en caída - Deterioro de capacidad',
      },
      invertido: true, // <1 = mejor (crecimiento)
    },

    // IPC15 - Experiencia crediticia
    {
      id: 'ipc15',
      codigo: 'IPC15',
      titulo: 'Experiencia crediticia',
      descripcion:
        'Años desde el primer crédito / años de experiencia en la actividad. Mide madurez financiera.',
      dimensiones: ['garantia'],
      tipo: 'numerico',
      campo: 'ipc15',
      unidad: 'ratio',
      colorPrimario: '#F59E0B',
      interpretacion: {
        bajo: 'Cliente inexperto - Riesgo técnico-operativo',
        moderado: 'Experiencia moderada - Aprendizaje en curso',
        alto: 'Profesionalización financiera - Bajo riesgo técnico',
      },
      invertido: true, // Mayor experiencia = mejor
    },

    // IPC16 - Variación del activo
    {
      id: 'ipc16',
      codigo: 'IPC16',
      titulo: 'Variación del activo',
      descripcion:
        'Activo t-1 / Activo t. Mide crecimiento o deterioro patrimonial: <1 crecimiento, >1 deterioro.',
      dimensiones: ['ingreso', 'garantia'],
      tipo: 'numerico',
      campo: 'ipc16',
      unidad: 'ratio',
      colorPrimario: '#EC4899',
      interpretacion: {
        bajo: 'Activo en crecimiento - Estabilidad económica',
        moderado: 'Activo estable - Sin cambios patrimoniales',
        alto: 'Activo en caída - Riesgo operativo',
      },
      invertido: true, // <1 = mejor (crecimiento)
    },

    // IPC17 - Cobertura de provisión
    {
      id: 'ipc17',
      codigo: 'IPC17',
      titulo: 'Cobertura de provisión',
      descripcion:
        'Provisión de cartera / Saldo de cartera en mora. Mide nivel de cobertura del riesgo.',
      dimensiones: ['garantia'],
      tipo: 'numerico',
      campo: 'ipc17',
      unidad: '%',
      colorPrimario: '#3B82F6',
      interpretacion: {
        bajo: 'Subprovisión - Vulnerabilidad patrimonial',
        moderado: 'Cobertura moderada - Gestión aceptable',
        alto: 'Provisión adecuada - Solidez institucional',
      },
      invertido: true, // Mayor cobertura = mejor
    },

    // IPC18 - Respaldo de ahorros
    {
      id: 'ipc18',
      codigo: 'IPC18',
      titulo: 'Respaldo de ahorros',
      descripcion: 'Ahorros individuales / Saldo de cartera. Mide respaldo interno del portafolio.',
      dimensiones: ['garantia'],
      tipo: 'numerico',
      campo: 'ipc18',
      unidad: '%',
      colorPrimario: '#14B8A6',
      interpretacion: {
        bajo: 'Bajo respaldo - Dependencia de fondeo externo',
        moderado: 'Respaldo moderado - Base de fondeo propia',
        alto: 'Alto respaldo - Compromiso y estabilidad',
      },
      invertido: true, // Mayor ahorro = mejor
    },

    // IPC19 - Cobertura de garantía
    {
      id: 'ipc19',
      codigo: 'IPC19',
      titulo: 'Cobertura de garantía',
      descripcion: 'Total garantía / Saldo capital. Mide el respaldo patrimonial del crédito.',
      dimensiones: ['garantia'],
      tipo: 'numerico',
      campo: 'ipc19',
      unidad: 'ratio',
      colorPrimario: '#8B5CF6',
      interpretacion: {
        bajo: 'Garantía insuficiente - Alto riesgo de pérdida',
        moderado: 'Cobertura parcial - Riesgo moderado',
        alto: 'Sobregarantizado - Protección completa',
      },
      invertido: true,
    },

    // IPC20 - Presión de deuda
    {
      id: 'ipc20',
      codigo: 'IPC20',
      titulo: 'Presión de deuda',
      descripcion: 'Deuda total / Capacidad de pago. Mide el nivel de endeudamiento vs capacidad.',
      dimensiones: ['ingreso'],
      tipo: 'numerico',
      campo: 'ipc20',
      unidad: 'ratio',
      colorPrimario: '#F97316',
      interpretacion: {
        bajo: 'Bajo endeudamiento - Capacidad holgada',
        moderado: 'Endeudamiento equilibrado',
        alto: 'Sobreendeudamiento - Riesgo de default',
      },
    },

    // IPC21 - Disciplina de ahorro
    {
      id: 'ipc21',
      codigo: 'IPC21',
      titulo: 'Disciplina de ahorro',
      descripcion: 'Ahorro programado / Ahorro voluntario. Mide compromiso con el ahorro.',
      dimensiones: ['voluntad', 'garantia'],
      tipo: 'numerico',
      campo: 'ipc21',
      unidad: 'ratio',
      colorPrimario: '#06B6D4',
      interpretacion: {
        bajo: 'Bajo compromiso de ahorro',
        moderado: 'Ahorro equilibrado',
        alto: 'Alta disciplina financiera',
      },
      invertido: true,
    },

    // IPC22 - Indicador reservado
    {
      id: 'ipc22',
      codigo: 'IPC22',
      titulo: 'IPC22 (Sin fórmula)',
      descripcion: 'Indicador reservado para uso futuro.',
      dimensiones: ['ingreso'],
      tipo: 'numerico',
      campo: 'ipc22',
      unidad: 'valor',
      colorPrimario: '#94A3B8',
      interpretacion: {
        bajo: 'Sin definición',
        moderado: 'Sin definición',
        alto: 'Sin definición',
      },
    },

    // IPC23 - Rendimiento de intereses
    {
      id: 'ipc23',
      codigo: 'IPC23',
      titulo: 'Rendimiento de intereses',
      descripcion:
        'Interés devengado / Interés percibido. Mide eficiencia en cobranza de intereses.',
      dimensiones: ['ingreso', 'voluntad'],
      tipo: 'numerico',
      campo: 'ipc23',
      unidad: 'ratio',
      colorPrimario: '#A855F7',
      interpretacion: {
        bajo: 'Baja cobranza - Ingresos limitados',
        moderado: 'Cobranza moderada',
        alto: 'Alta eficiencia en cobranza',
      },
      invertido: true,
    },

    // IPC24 - Variación de ahorro
    {
      id: 'ipc24',
      codigo: 'IPC24',
      titulo: 'Variación de ahorro',
      descripcion: 'Saldo ahorro mes anterior - Total ahorro actual. Mide tendencia de ahorro.',
      dimensiones: ['garantia'],
      tipo: 'numerico',
      campo: 'ipc24',
      unidad: 'S/',
      colorPrimario: '#EC4899',
      interpretacion: {
        bajo: 'Ahorro estable o en crecimiento',
        moderado: 'Variación moderada',
        alto: 'Descapitalización - Retiro de ahorros',
      },
    },
  ];

  /**
   * Configuración de las 3 dimensiones de análisis
   */
  private readonly DIMENSIONES_CONFIG: readonly DimensionConfig[] = [
    {
      id: 'ingreso',
      nombre: 'Ingreso del Cliente',
      descripcion:
        'Evalúan capacidad económica, liquidez, solvencia, respaldo financiero y estructura patrimonial.',
      icono: 'pi pi-dollar',
      color: '#3B82F6',
      ipcs: this.IPCS_CONFIG.filter((ipc) => ipc.dimensiones.includes('ingreso')),
    },
    {
      id: 'voluntad',
      nombre: 'Voluntad de Pago',
      descripcion:
        'Miden conducta, disciplina, historial de pago, riesgo moral y compromiso de cumplimiento.',
      icono: 'pi pi-check-circle',
      color: '#10B981',
      ipcs: this.IPCS_CONFIG.filter((ipc) => ipc.dimensiones.includes('voluntad')),
    },
    {
      id: 'garantia',
      nombre: 'Garantía Psicológica',
      descripcion:
        'Observan estabilidad personal/profesional, madurez financiera y consistencia del comportamiento.',
      icono: 'pi pi-shield',
      color: '#F59E0B',
      ipcs: this.IPCS_CONFIG.filter((ipc) => ipc.dimensiones.includes('garantia')),
    },
  ];

  /**
   * Obtiene la configuración de un IPC por su ID
   */
  getIPCConfig(ipcId: string): IPCConfig | undefined {
    return this.IPCS_CONFIG.find((ipc) => ipc.id === ipcId);
  }

  /**
   * Obtiene todos los IPCs configurados
   */
  getAllIPCs(): readonly IPCConfig[] {
    return this.IPCS_CONFIG;
  }

  /**
   * Obtiene los IPCs de una dimensión específica
   */
  getIPCsByDimension(dimension: IPCDimension): readonly IPCConfig[] {
    return this.IPCS_CONFIG.filter((ipc) => ipc.dimensiones.includes(dimension));
  }

  /**
   * Obtiene la configuración de una dimensión
   */
  getDimensionConfig(dimensionId: IPCDimension): DimensionConfig | undefined {
    return this.DIMENSIONES_CONFIG.find((dim) => dim.id === dimensionId);
  }

  /**
   * Obtiene todas las dimensiones configuradas
   */
  getAllDimensions(): readonly DimensionConfig[] {
    return this.DIMENSIONES_CONFIG;
  }

  /**
   * Obtiene las categorías de un IPC categórico
   */
  getCategorias(ipcId: string): readonly IPCCategoria[] | undefined {
    const ipc = this.getIPCConfig(ipcId);
    return ipc?.categorias;
  }
}
