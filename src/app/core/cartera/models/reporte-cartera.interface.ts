/**
 * Interfaz para el modelo de Reporte de Cartera
 * Representa los datos del archivo CSV de reporte de cartera
 */
export interface ReporteCartera {
  cod_agencia: string;
  agencia: string;
  cod_asesor: string;
  asesor_servicios: string;
  cod_ac: string;
  asociacion_comunal: string;
  ciclo_banca: string;
  num_operacion: string;
  cod_cliente: string;
  cliente: string;
  tipo_persona: string;
  ciclo_cliente: string;
  documento: string;
  tipo_documento: string;
  caducidad_dni: string;
  num_credito: string;
  cod_modulo: string;
  modulo: string;
  programa: string;
  cod_tipo_credito: string;
  tipo_credito: string;
  cod_producto: string;
  producto: string;
  cod_destino: string;
  destino_credito: string;
  tem: number;
  tea: number;
  tasa_fon_cob: number;
  tcea: number;
  plazo: number;
  fecha_desembolso: string;
  fecha_cuota_1: string;
  fecha_fin_cronograma: string;
  monto_colocado: number;
  interes: number;
  igv_interes: number;
  fondo_cobertura: number;
  igv_fondo_cob: number;
  ajuste_mig: number;
  deuda_total: number;
  saldo_capital: number;
  saldo_interes: number;
  saldo_igv_interes: number;
  saldo_fondo_cobertura: number;
  saldo_igv_fondo_cob: number;
  saldo_ajuste_mig: number;
  saldo_total: number;
  capital_largo_plazo: number;
  negociacion: string;
  tipo_solicitud: string;
  fecha_ultimo_vencimiento: string;
  dias_atraso: number;
  capital_mora: number;
  mora_1_8: number;
  mora_9_30: number;
  mora_31_60: number;
  mora_61_90: number;
  mora_91_120: number;
  mora_120_mas: number;
  int_devengado: number;
  int_dev_no_pagado: number;
  saldo_int_dev: number;
  interes_percibido: number;
  situacion: string;
  clasificacion: string;
  provision: number;
  fuente_financiamiento: string;
  codigo_pago: string;
  forma_pago: string;
  departamento_ac: string;
  provincia_ac: string;
  distrito_ac: string;
  localidad_ac: string;
  zona_geografica_ac: string;
  direccion_cliente: string;
  departamento: string;
  provincia: string;
  distrito: string;
  localidad: string;
  zona_geografica: string;
  celular: string;
  fecha_nacimiento: string;
  edad: number;
  genero: string;
  sector_economico: string;
  actividad_economica: string;
  calificacion_cr: string;
  categoria: string;
  capacidad_pago: number;
  numero_cuenta: string;
  entidad_financiera: string;
  nombre_colegio: string;
  nro_alumno: string;
  latitud: number;
  longitud: number;

  // Indicadores de Control Interno (IPC) - 18 indicadores según documento oficial
  // Dimensión INGRESO (9 IPCs)
  ipc1?: number;  // Mora (días promedio)
  ipc2?: string;  // Mora por tramos (categórico: "0-30", "31-60", "61-90", "91-180", ">180")
  ipc3?: number;  // Mora proporcional (%)
  ipc4?: number;  // Tickets vencidos (número de pagos)
  ipc7?: number;  // Capacidad de pago (ratio)
  ipc8?: string;  // Jerarquía de pago (categórico: "Primario", "Secundario", "Otros", "Garantía")
  ipc9?: number;  // Concentración ADRA (%)
  ipc13?: number; // Liquidez (%)

  // Dimensión VOLUNTAD (5 IPCs)
  ipc3_voluntad?: number; // Mora proporcional (%) - compartido
  ipc4_voluntad?: number; // Tickets vencidos - compartido
  ipc6?: number;  // Recurrencia de mora (ratio)
  ipc10?: number; // Nivel de contagio (%)
  ipc12?: number; // Rechazos (%)

  // Dimensión GARANTÍA PSICOLÓGICA (7 IPCs)
  ipc5?: number;  // Deuda vs Garantía (ratio)
  ipc11?: number; // Nivel de retención (%)
  ipc14?: number; // Variación de ingreso (ratio)
  ipc15?: number; // Experiencia crediticia (ratio)
  ipc16?: number; // Variación de activo (ratio)
  ipc17?: number; // Cobertura de provisión (%)
  ipc18?: number; // Respaldo de ahorros (%)
}
