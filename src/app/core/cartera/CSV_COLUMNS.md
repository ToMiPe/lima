# Documentación de Columnas — `reporte_cartera.csv`

> **Separador:** punto y coma (`;`)  
> **Encoding:** UTF-8  
> **Total de columnas:** 127 (índices 0–126)  
> **Primera fila:** encabezados (se omite en parseo)  
> **⚠️ IMPORTANTE:** Las posiciones son fijas. Agregar, eliminar o mover columnas rompe el parseo en `csv-cartera.repository.ts`.

## Estado de validación

- **Cobertura por índice en parser:** 127/127 índices del CSV referenciados en `values[n]`.
- **Columnas sin mapear:** ninguna para el esquema vigente.
- **Coherencia de modelo:** `ReporteCartera` está compuesto por datos base del CSV (`ReporteCarteraBase`) + campos IPC calculados (`ReporteCarteraIPC`).

---

## Tabla completa de columnas

| Índice | Nombre en CSV | Campo en modelo | Tipo | Mapeado | Usado en IPC | Notas |
|--------|---------------|-----------------|------|---------|--------------|-------|
| 0 | `cod_agencia` | `cod_agencia` | string | ✅ | No | Código de agencia |
| 1 | `agencia` | `agencia` | string | ✅ | No | Nombre de agencia |
| 2 | `cod_asesor` | `cod_asesor` | string | ✅ | No | Código del asesor |
| 3 | `asesor_servicios` | `asesor_servicios` | string | ✅ | No | Nombre del asesor |
| 4 | `cod_ac` | `cod_ac` | string | ✅ | No | Código de Asociación Comunal |
| 5 | `asociacion_comunal` | `asociacion_comunal` | string | ✅ | No | Nombre de AC |
| 6 | `ciclo_banca` | `ciclo_banca` | int | ✅ | **IPC11** | Divisor: `(ciclo_cliente-1) / ciclo_banca` |
| 7 | `num_operacion` | `num_operacion` | string | ✅ | No | |
| 8 | `cod_cliente` | `cod_cliente` | string | ✅ | No | |
| 9 | `cliente` | `cliente` | string | ✅ | No | Nombre completo del cliente |
| 10 | `tipo_persona` | `tipo_persona` | string | ✅ | No | |
| 11 | `ciclo_cliente` | `ciclo_cliente` | int | ✅ | **IPC11** | Numerador: `(ciclo_cliente-1) / ciclo_banca` |
| 12 | `documento` | `documento` | string | ✅ | No | Número de documento |
| 13 | `tipo_documento` | `tipo_documento` | string | ✅ | No | |
| 14 | `caducidad_dni` | `caducidad_dni` | string | ✅ | No | |
| 15 | `num_credito` | `num_credito` | string | ✅ | No | |
| 16 | `cod_modulo` | `cod_modulo` | string | ✅ | No | |
| 17 | `modulo` | `modulo` | string | ✅ | No | |
| 18 | `programa` | `programa` | string | ✅ | No | |
| 19 | `cod_tipo_credito` | `cod_tipo_credito` | string | ✅ | No | |
| 20 | `tipo_credito` | `tipo_credito` | string | ✅ | No | |
| 21 | `cod_producto` | `cod_producto` | string | ✅ | No | |
| 22 | `producto` | `producto` | string | ✅ | No | |
| 23 | `cod_destino` | `cod_destino` | string | ✅ | No | |
| 24 | `destino_credito` | `destino_credito` | string | ✅ | No | |
| 25 | `tem` | `tem` | number | ✅ | No | Tasa Efectiva Mensual |
| 26 | `tea` | `tea` | number | ✅ | No | Tasa Efectiva Anual |
| 27 | `tasa_fon_cob` | `tasa_fon_cob` | number | ✅ | No | |
| 28 | `tcea` | `tcea` | number | ✅ | No | |
| 29 | `plazo` | `plazo` | int | ✅ | No | Número de cuotas |
| 30 | `fecha_desembolso` | `fecha_desembolso` | string | ✅ | No | Formato DD/MM/YYYY |
| 31 | `fecha_cuota_1` | `fecha_cuota_1` | string | ✅ | No | |
| 32 | `fecha_fin_cronograma` | `fecha_fin_cronograma` | string | ✅ | No | |
| 33 | `monto_colocado` | `monto_colocado` | number | ✅ | **IPC9** | Numerador: `monto_colocado / (pasivo_total_pasivo + pasivo_total_riesgos)` |
| 34 | `interes` | `interes` | number | ✅ | No | |
| 35 | `igv_interes` | `igv_interes` | number | ✅ | No | |
| 36 | `fondo_cobertura` | `fondo_cobertura` | number | ✅ | No | |
| 37 | `igv_fondo_cob` | `igv_fondo_cob` | number | ✅ | No | |
| 38 | `ajuste_mig` | `ajuste_mig` | number | ✅ | No | |
| 39 | `deuda_total` | `deuda_total` | number | ✅ | **IPC5, IPC20** | IPC5: denominador; IPC20: numerador |
| 40 | `saldo_capital` | `saldo_capital` | number | ✅ | **IPC4, IPC17, IPC19** | IPC4: valor directo; IPC17/IPC19: denominador |
| 41 | `saldo_interes` | `saldo_interes` | number | ✅ | No | |
| 42 | `saldo_igv_interes` | `saldo_igv_interes` | number | ✅ | No | |
| 43 | `saldo_fondo_cobertura` | `saldo_fondo_cobertura` | number | ✅ | No | |
| 44 | `saldo_igv_fondo_cob` | `saldo_igv_fondo_cob` | number | ✅ | No | |
| 45 | `saldo_ajuste_mig` | `saldo_ajuste_mig` | number | ✅ | No | |
| 46 | `saldo_total` | `saldo_total` | number | ✅ | No | |
| 47 | `capital_largo_plazo` | `capital_largo_plazo` | number | ✅ | No | |
| 48 | `negociacion` | `negociacion` | string | ✅ | No | |
| 49 | `tipo_solicitud` | `tipo_solicitud` | string | ✅ | No | |
| 50 | `fecha_ultimo_vencimiento` | `fecha_ultimo_vencimiento` | string | ✅ | No | |
| 51 | `dias_atraso` | `dias_atraso` | int | ✅ | **IPC1, IPC3** | IPC3: numerador `dias_atraso / dias_credito` |
| 52 | `capital_mora` | `capital_mora` | number | ✅ | No | |
| 53 | `mora_1_8` | `mora_1_8` | number | ✅ | **IPC1_1, IPC18** | Tramo mora 1–8 días |
| 54 | `mora_9_30` | `mora_9_30` | number | ✅ | **IPC1_2, IPC18** | Tramo mora 9–30 días |
| 55 | `mora_31_60` | `mora_31_60` | number | ✅ | **IPC1_3, IPC2, IPC18** | Tramo mora 31–60 días |
| 56 | `mora_61_90` | `mora_61_90` | number | ✅ | **IPC1_4, IPC2, IPC18** | Tramo mora 61–90 días |
| 57 | `mora_91_120` | `mora_91_120` | number | ✅ | **IPC1_5, IPC2, IPC18** | Tramo mora 91–120 días |
| 58 | `mora_120_mas` | `mora_120_mas` | number | ✅ | **IPC1_6, IPC2, IPC18** | Tramo mora 120+ días |
| 59 | `int_devengado` | `int_devengado` | number | ✅ | **IPC23** | Numerador: `int_devengado / interes_percibido` |
| 60 | `int_dev_no_pagado` | `int_dev_no_pagado` | number | ✅ | No | |
| 61 | `saldo_int_dev` | `saldo_int_dev` | number | ✅ | No | |
| 62 | `interes_percibido` | `interes_percibido` | number | ✅ | **IPC23** | Denominador: `int_devengado / interes_percibido` |
| 63 | `situacion` | `situacion` | string | ✅ | No | |
| 64 | `clasificacion` | `clasificacion` | string | ✅ | No | |
| 65 | `provision` | `provision` | number | ✅ | **IPC17, IPC18** | IPC17: `provision/saldo_capital`; IPC18: `provision/suma_moras` |
| 66 | `fuente_financiamiento` | `fuente_financiamiento` | string | ✅ | No | |
| 67 | `codigo_pago` | `codigo_pago` | string | ✅ | No | |
| 68 | `forma_pago` | `forma_pago` | string | ✅ | No | |
| 69 | `departamento_ac` | `departamento_ac` | string | ✅ | No | Departamento de la AC |
| 70 | `provincia_ac` | `provincia_ac` | string | ✅ | No | |
| 71 | `distrito_ac` | `distrito_ac` | string | ✅ | No | |
| 72 | `localidad_ac` | `localidad_ac` | string | ✅ | No | |
| 73 | `zona_geografica_ac` | `zona_geografica_ac` | string | ✅ | No | |
| 74 | `direccion_cliente` | `direccion_cliente` | string | ✅ | No | |
| 75 | `departamento` | `departamento` | string | ✅ | No | Departamento del cliente |
| 76 | `provincia` | `provincia` | string | ✅ | No | |
| 77 | `distrito` | `distrito` | string | ✅ | No | |
| 78 | `localidad` | `localidad` | string | ✅ | No | |
| 79 | `zona_geografica` | `zona_geografica` | string | ✅ | No | |
| 80 | `celular` | `celular` | string | ✅ | No | |
| 81 | `fecha_nacimiento` | `fecha_nacimiento` | string | ✅ | No | |
| 82 | `edad` | `edad` | int | ✅ | No | |
| 83 | `genero` | `genero` | string | ✅ | No | |
| 84 | `sector_economico` | `sector_economico` | string | ✅ | No | |
| 85 | `actividad_economica` | `actividad_economica` | string | ✅ | No | |
| 86 | `calificacion_cr` | `calificacion_cr` | string | ✅ | No | |
| 87 | `categoria` | `categoria` | string | ✅ | No | |
| 88 | `capacidad_pago` | `capacidad_pago` | number | ✅ | **IPC7, IPC20** | IPC7: `ingreso_principal/capacidad_pago`; IPC20: `deuda_total/capacidad_pago` |
| 89 | `numero_cuenta` | `numero_cuenta` | string | ✅ | No | |
| 90 | `entidad_financiera` | `entidad_financiera` | string | ✅ | No | |
| 91 | `nombre_colegio` | `nombre_colegio` | string | ✅ | No | |
| 92 | `nro_alumno` | `nro_alumno` | string | ✅ | No | |
| 93 | `credito` | `credito` | string | ✅ | No | Mapeado para trazabilidad operativa |
| 94 | `condicion` | `condicion` | string | ✅ | No | Mapeado para trazabilidad operativa |
| 95 | `motivo` | `motivo` | string | ✅ | No | Mapeado para trazabilidad operativa |
| 96 | `tipo_empresa` | `tipo_empresa` | string | ✅ | No | Mapeado para trazabilidad operativa |
| 97 | `latitud` | `latitud` | number | ✅ | No | Coordenada geográfica del cliente |
| 98 | `longitud` | `longitud` | number | ✅ | No | Coordenada geográfica del cliente |
| 99 | `tipo_tenencia` | `tipo_tenencia` | string | ✅ | No | |
| 100 | `estado_civil` | `estado_civil` | string | ✅ | No | |
| 101 | `grado_instruccion` | `grado_instruccion` | string | ✅ | No | |
| 102 | `filiacion_religiosa` | `filiacion_religiosa` | string | ✅ | No | |
| 103 | `mms_vigente` | `mms_vigente` | string | ✅ | No | |
| 104 | `generacion` | `generacion` | string | ✅ | No | |
| 105 | `dias_credito` | `dias_credito` | int | ✅ | **IPC3** | Denominador: `dias_atraso / dias_credito` |
| 106 | `tot_garantia` | `tot_garantia` | number | ✅ | **IPC5, IPC8, IPC13** | Campo alineado con el nombre del CSV. IPC5: `(efectivo_caja+tot_garantia)/deuda_total`; IPC8: sum ingresos+garantía; IPC13 |
| 107 | `dias_mora_acumulados_pagos_anteriores` | `dias_mora_acumulados_pagos_anteriores` | int | ✅ | No | Campo mapeado para analitica adicional |
| 108 | `num_dias_promedio_entre_pago_28_30` | `num_dias_promedio_entre_pago_28_30` | number | ✅ | No | Campo mapeado para analitica adicional |
| 109 | `ingreso_principal` | `ingreso_principal` | number | ✅ | **IPC7, IPC8, IPC9, IPC14** | Usado en múltiples IPCs |
| 110 | `ingreso_fijo_anterior` | `ingreso_fijo_anterior` | number | ✅ | **IPC8, IPC14** | IPC14: `ingreso_fijo_anterior/ingreso_principal` |
| 111 | `ingreso_secundario_variables` | `ingreso_secundario_variables` | number | ✅ | No | |
| 112 | `pasivo_total_pasivo` | `pasivo_total_pasivo` | number | ✅ | **IPC9** | Denominador parcial: `pasivo_total_pasivo + pasivo_total_riesgos` |
| 113 | `pasivo_total_riesgos` | `pasivo_total_riesgos` | number | ✅ | **IPC9** | Denominador parcial: `pasivo_total_pasivo + pasivo_total_riesgos` |
| 114 | `num_creditos_sin_adra` | `num_creditos_sin_adra` | int | ✅ | No | |
| 115 | `num_creditos_con_adra` | `num_creditos_con_adra` | int | ✅ | No | |
| 116 | `efectivo_caja` | `efectivo_caja` | number | ✅ | **IPC5, IPC13** | IPC5/IPC13: numerador junto con `tot_garantia` |
| 117 | `activo_total` | `activo_total` | number | ✅ | **IPC13, IPC16** | Denominador en ambos IPCs |
| 118 | `activo_anterior_balance` | `activo_anterior_balance` | number | ✅ | **IPC16** | Numerador: `activo_anterior_balance / activo_total` |
| 119 | `activo_mes_actual` | `activo_mes_actual` | number | ✅ | No | |
| 120 | `fecha_creacion_cliente` | `fecha_creacion_cliente` | string | ✅ | No | |
| 121 | `fecha_primer_desemb_banca` | `fecha_primer_desemb_banca` | string | ✅ | No | |
| 122 | `años_experiencia_actividad` | `años_experiencia_actividad` | int | ✅ | **IPC15** | Valor directo |
| 123 | `ahorro_programado` | `ahorro_programado` | number | ✅ | **IPC21** | Numerador: `ahorro_programado / ahorro_voluntario` |
| 124 | `ahorro_voluntario` | `ahorro_voluntario` | number | ✅ | **IPC21** | Denominador: `ahorro_programado / ahorro_voluntario` |
| 125 | `total_ahorro` | `total_ahorro` | number | ✅ | **IPC24** | IPC24: `saldo_ahorro_mes_anterior - total_ahorro` |
| 126 | `saldo_ahorro_mes_anterior` | `saldo_ahorro_mes_anterior` | number | ✅ | **IPC24** | Minuendo: `saldo_ahorro_mes_anterior - total_ahorro` |

---

## Columnas usadas en los IPCs — resumen por indicador

| IPC | Nombre | Fórmula | Columnas CSV (índice) |
|-----|--------|---------|----------------------|
| **IPC1_1** | Mora 1–8 días | `mora_1_8` | 53 |
| **IPC1_2** | Mora 9–30 días | `mora_9_30` | 54 |
| **IPC1_3** | Mora 31–60 días | `mora_31_60` | 55 |
| **IPC1_4** | Mora 61–90 días | `mora_61_90` | 56 |
| **IPC1_5** | Mora 91–120 días | `mora_91_120` | 57 |
| **IPC1_6** | Mora 120+ días | `mora_120_mas` | 58 |
| **IPC2** | Mora grave (31+) | `mora_31_60 + mora_61_90 + mora_91_120 + mora_120_mas` | 55, 56, 57, 58 |
| **IPC3** | Mora proporcional | `dias_atraso / dias_credito` | 51, 105 |
| **IPC4** | Capital en mora | `saldo_capital` | 40 |
| **IPC5** | Garantía vs Deuda | `(efectivo_caja + tot_garantia) / deuda_total` | 116, 106, 39 |
| **IPC6** | Sin fórmula | `0` (valor fijo) | — |
| **IPC7** | Capacidad de pago | `ingreso_principal / capacidad_pago` | 109, 88 |
| **IPC8** | Ingresos + garantía | `ingreso_principal + ingreso_fijo_anterior + tot_garantia` | 109, 110, 106 |
| **IPC9** | Endeudamiento | `monto_colocado / (pasivo_total_pasivo + pasivo_total_riesgos)` | 33, 112, 113 |
| **IPC10** | Sin fórmula | `undefined` | — |
| **IPC11** | Fidelidad | `(ciclo_cliente - 1) / ciclo_banca` | 11, 6 |
| **IPC12** | Sin fórmula | `undefined` | — |
| **IPC13** | Liquidez | `(efectivo_caja + tot_garantia) / activo_total` | 116, 106, 117 |
| **IPC14** | Estabilidad ingreso | `ingreso_fijo_anterior / ingreso_principal` | 110, 109 |
| **IPC15** | Experiencia | `años_experiencia_actividad` | 122 |
| **IPC16** | Evolución activos | `activo_anterior_balance / activo_total` | 118, 117 |
| **IPC17** | Provisión/Capital | `provision / saldo_capital` | 65, 40 |
| **IPC18** | Provisión/Moras | `provision / (mora_1_8 + mora_9_30 + ... + mora_120_mas)` | 65, 53–58 |
| **IPC19** | Ahorro/Capital | `tot_garantia / saldo_capital` | 106, 40 |
| **IPC20** | Deuda/Capacidad | `deuda_total / capacidad_pago` | 39, 88 |
| **IPC21** | Ahorro programado | `ahorro_programado / ahorro_voluntario` | 123, 124 |
| **IPC22** | Sin fórmula | `undefined` | — |
| **IPC23** | Interés devengado | `int_devengado / interes_percibido` | 59, 62 |
| **IPC24** | Variación ahorro | `saldo_ahorro_mes_anterior - total_ahorro` | 126, 125 |

---

## Columnas NO mapeadas en el repositorio

Actualmente no hay columnas sin mapear para el esquema CSV vigente.

---

## Discrepancias de nombre CSV ↔ modelo

No hay discrepancias de nombre para el esquema CSV vigente.

---

## Reglas de formato de valores numéricos

El parser usa `parseLatinNumber()` que espera formato peruano/latinoamericano:
- **Miles:** coma (`,`) — ej: `1,540.25`
- **Decimal:** punto (`.`) — ej: `1540.25` o `1,540.25`
- La coma de miles se elimina antes del `parseFloat`
- Valores vacíos o nulos → `0`

