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
  dias_credito: number;
  total_ahorros: number;
  efectivo_caja: number;
  ingreso_principal: number;
  ingreso_fijo_anterior: number;
  pasivo_total_pasivo: number;
  pasivo_total_riesgos: number;
  activo_total: number;
  activo_anterior_balance: number;
  fecha_creacion_cliente: string;
  años_experiencia_actividad: number;
  ahorro_programado: number;
  ahorro_voluntario: number;
  total_ahorro: number;
  saldo_ahorro_mes_anterior: number;

  // Indicadores de Control Interno (IPC) - 18 indicadores según documento oficial
  // Dimensión INGRESO (9 IPCs)
  ipc1_1?: number; // Mora 1-8 días
  ipc1_2?: number; // Mora 9-30 días
  ipc1_3?: number; // Mora 31-60 días
  ipc1_4?: number; // Mora 61-90 días
  ipc1_5?: number; // Mora 91-120 días
  ipc1_6?: number; // Mora 120+ días
  ipc2?: number;   // Suma de mora 31+ días (mora_31_60 + mora_61_90 + mora_91_120 + mora_120_mas)
  ipc3?: number;   // Mora proporcional (dias_atraso / dias_credito)
  ipc4?: number;   // Capital en mora (saldo_capital)
  ipc7?: number;   // Ingreso principal / Capacidad de pago
  ipc8?: number;   // Suma de ingresos y ahorros (ingreso_principal + ingreso_fijo_anterior + total_ahorros)
  ipc9?: number;   // Monto colocado / Total pasivos (pasivo_total_pasivo + pasivo_total_riesgos)
  ipc10?: number;  // Sin fórmula
  ipc11?: number;  // (ciclo_cliente-1) / ciclo_banca
  ipc12?: number;  // Sin fórmula
  ipc13?: number;  // (efectivo_caja + total_ahorros) / activo_total

  // Dimensión VOLUNTAD (5 IPCs)
  ipc3_voluntad?: number; // Mora proporcional (%) - compartido
  ipc4_voluntad?: number; // Capital en mora - compartido
  ipc6?: number;  // Sin fórmula (valor fijo: 0)

  // Dimensión GARANTÍA PSICOLÓGICA (7 IPCs)
  ipc5?: number;   // Deuda vs Garantía (ratio)
  ipc14?: number;  // ingreso_fijo_anterior / ingreso_principal
  ipc15?: number;  // años_experiencia_actividad
  ipc16?: number;  // activo_anterior_balance / activo_total
  ipc17?: number;  // provision / saldo_capital
  ipc18?: number;  // provision / suma_moras
  ipc19?: number;  // total_ahorros / saldo_capital
  ipc20?: number;  // deuda_total / capacidad_pago
  ipc21?: number;  // ahorro_programado / ahorro_voluntario
  ipc22?: number;  // Sin fórmula
  ipc23?: number;  // int_devengado / interes_percibido
  ipc24?: number;  // saldo_ahorro_mes_anterior - total_ahorro
}
