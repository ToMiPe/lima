# MANUAL DEL ADMINISTRADOR
## Sistema MIRAR - Monitoreo de Indicadores y Riesgos para ADRA

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Audiencia:** Administradores IT, DevOps, Personal Técnico  
**Institución:** ADRA (Agencia Adventista de Desarrollo y Recursos Asistenciales)

---

## TABLA DE CONTENIDOS

1. [Introducción](#1-introducción)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Requisitos y Dependencias](#3-requisitos-y-dependencias)
4. [Instalación y Configuración](#4-instalación-y-configuración)
5. [Gestión de Datos](#5-gestión-de-datos)
6. [Configuración Avanzada](#6-configuración-avanzada)
7. [Mantenimiento](#7-mantenimiento)
8. [Troubleshooting](#8-troubleshooting)
9. [Seguridad](#9-seguridad)
10. [Apéndices](#10-apéndices)

---

## 1. INTRODUCCIÓN

### 1.1. Propósito del Manual

Este manual proporciona información técnica completa para administradores del **Sistema MIRAR** (Monitoreo de Indicadores y Riesgos para ADRA). Cubre instalación, configuración, mantenimiento y resolución de problemas.

**Sobre ADRA:**

La Agencia Adventista de Desarrollo y Recursos Asistenciales (ADRA) es la rama humanitaria mundial de la Iglesia Adventista del Séptimo Día, establecida con el propósito de desarrollar económica y socialmente comunidades desfavorecidas. Opera en más de 130 países en cinco actividades principales:

- **Seguridad alimenticia** - Programas de nutrición y agricultura sostenible
- **Desarrollo económico** - Microfinanzas, microcréditos y empoderamiento financiero
- **Primeros auxilios y salud** - Atención médica básica y emergencias
- **Respuesta a desastres** - Ayuda humanitaria en crisis y catástrofes
- **Educación básica** - Acceso a educación de calidad en comunidades vulnerables

**Misión de ADRA:**  
*"ADRA trabaja con la gente en pobreza y sufrimiento para crear un cambio justo y positivo a través de alianzas potenciadoras y acciones responsables."*

**Sistema MIRAR en el contexto de ADRA:**

El Sistema MIRAR es una herramienta tecnológica desarrollada para apoyar las operaciones de microfinanzas de ADRA, permitiendo el monitoreo efectivo de 18 Indicadores de Control Interno (IPC) para gestión de riesgo crediticio. El sistema analiza cartera de créditos, visualiza geográficamente la exposición y facilita la toma de decisiones informadas para proteger tanto a la institución como a los beneficiarios.

### 1.2. Responsabilidades del Administrador

El administrador es responsable de:

- ✅ Instalación y configuración del sistema
- ✅ Actualización periódica de datos (CSV)
- ✅ Mantenimiento de la aplicación
- ✅ Monitoreo de performance
- ✅ Backup de datos
- ✅ Actualización de dependencias
- ✅ Soporte técnico a usuarios
- ✅ Seguridad del sistema

### 1.3. Requisitos Previos

Conocimientos necesarios:
- **Node.js** y npm/yarn
- **Angular** (framework frontend)
- **Git** (control de versiones)
- **Línea de comandos** (terminal/PowerShell)
- **Servidores web** (Apache/NGINX)
- **Conceptos básicos** de CSV y datos tabulares

---

## 2. ARQUITECTURA DEL SISTEMA

### 2.1. Stack Tecnológico

El Sistema MIRAR está construido con tecnologías modernas y de código abierto:

| Componente | Tecnología | Versión | Propósito |
|------------|------------|---------|-----------|
| **Framework** | Angular | 20.x | Frontend SPA |
| **Lenguaje** | TypeScript | 5.7+ | Desarrollo type-safe |
| **UI Library** | PrimeNG | 20.x | Componentes UI |
| **CSS Framework** | Tailwind CSS | 3.x | Estilos utilitarios |
| **Mapas** | MapLibre GL JS | 5.x | Visualización geográfica |
| **Gráficos** | Apache ECharts | 5.x | Gráficos estadísticos |
| **Build Tool** | Vite | 6.x | Bundler rápido |
| **Package Manager** | npm/yarn | Latest | Gestión dependencias |

### 2.2. Estructura de Carpetas

```
mirar/  (repositorio: mirar-ng)
├── src/
│   ├── app/
│   │   ├── core/                    # Servicios core
│   │   │   └── cartera/
│   │   │       ├── models/          # Interfaces de datos
│   │   │       │   ├── reporte-cartera.interface.ts
│   │   │       │   └── hhi-concentration-ranges.ts
│   │   │       └── repositories/    # Acceso a datos
│   │   │           └── csv-cartera.repository.ts
│   │   │
│   │   └── features/
│   │       └── reports/
│   │           ├── pages/
│   │           │   └── ipc-unified/  # Componente principal IPC
│   │           │       ├── ipc-unified.component.ts
│   │           │       ├── ipc-unified.component.html
│   │           │       └── ipc-unified.component.scss
│   │           │
│   │           ├── services/
│   │           │   ├── ipc-config.service.ts  # Config 18 IPCs
│   │           │   └── ipc-data.service.ts    # Lógica de datos
│   │           │
│   │           └── models/
│   │               └── ipc-config.interface.ts
│   │
│   ├── assets/
│   │   └── data/
│   │       └── reporte_cartera.csv  # ⚠️ DATOS PRINCIPALES
│   │
│   └── environments/
│       ├── environment.ts           # Config desarrollo
│       └── environment.prod.ts      # Config producción
│
├── dist/mirar-ng/                   # Build de producción
├── node_modules/                    # Dependencias
├── package.json                     # Manifest del proyecto (nombre: mirar-ng)
├── angular.json                     # Config Angular
├── tsconfig.json                    # Config TypeScript
├── tailwind.config.js               # Config Tailwind
└── vite.config.ts                   # Config Vite
```

### 2.3. Flujo de Datos

```
┌─────────────────┐
│   CSV File      │
│ (assets/data/)  │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│  CSVCarteraRepository           │
│  - Lee y parsea CSV             │
│  - Valida estructura            │
│  - Transforma a interfaces TS   │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  IPCDataService                 │
│  - Aplica filtros de BD         │
│  - Calcula estadísticas         │
│  - Genera GeoJSON               │
└────────┬────────────────────────┘
         │
         ↓
┌─────────────────────────────────┐
│  IPCUnifiedComponent            │
│  - Renderiza mapa               │
│  - Muestra estadísticas         │
└─────────────────────────────────┘
```

### 2.4. Modelos de Datos Principales

#### **ReporteCartera** (Interface principal)

```typescript
export interface ReporteCartera {
  // Identificación
  epsa_codigo: string;
  nombre: string;
  agencia: string;  
  // Geolocalización
  latitud: number;
  longitud: number;  
  // Datos personales
  genero: string;  
  // Información financiera
  monto_colocado: number;
  producto: string;
  zona_geografica: string;
  categoria: string;
  calificacion_cr: string;
  capacidad_pago: number;  
  // IPCs (Indicadores de Control Interno)
  ipc1: number;   // Mora
  ipc2: string;   // Mora por tramos
  ipc3: number;   // Mora proporcional
  ipc4: number;   // Tickets vencidos
  ipc5: number;   // Deuda/Garantía
  ipc6: number;   // Recurrencia mora
  ipc7: number;   // Capacidad pago directa
  ipc8: string;   // Jerarquía de pago
  ipc9: number;   // Concentración ADRA
  ipc10: number;  // Nivel de contagio
  ipc11: number;  // Nivel de retención
  ipc12: number;  // Rechazos
  ipc13: number;  // Liquidez
  ipc14: number;  // Variación ingreso
  ipc15: number;  // Experiencia crediticia
  ipc16: number;  // Variación activo
  ipc17: number;  // Provisión/Mora
  ipc18: number;  // Ahorros/Cartera
}
```

### 2.5. Sistema de 18 Indicadores de Control Interno (IPC)

El sistema está basado en un framework de análisis de riesgo crediticio que organiza 18 indicadores en 3 dimensiones principales:

#### **Modelo Tridimensional de Evaluación de Riesgo**

Este enfoque permite **anticipar el riesgo antes de que se materialice en mora**, diferenciándose de los indicadores tradicionales que solo miden resultados históricos.

**Las 3 Dimensiones:**

1. **INGRESO DEL CLIENTE (9 IPCs)** - Mide lo que el cliente **PUEDE** pagar
2. **VOLUNTAD DE PAGO (5 IPCs)** - Mide lo que el cliente **QUIERE** pagar
3. **GARANTÍA PSICOLÓGICA (7 IPCs)** - Mide si el cliente **SABE CÓMO** y está **COMPROMETIDO** a pagar

**📊 IPCs Multidimensionales:**

Algunos IPCs pertenecen a múltiples dimensiones simultáneamente:
- **IPC4** (Tickets vencidos): INGRESO + VOLUNTAD
- **IPC5** (Deuda/Garantía): INGRESO + GARANTÍA PSICOLÓGICA
- **IPC16** (Variación activo): INGRESO + GARANTÍA PSICOLÓGICA

Estos indicadores multidimensionales ofrecen una visión más completa del perfil de riesgo del cliente.

**Filosofía del Modelo (Dr. Gerardo Mendieta):**

> "Un cliente puede tener ingresos suficientes, pero si su conducta es inestable, su riesgo de incumplimiento sigue siendo alto."

La combinación de las 3 dimensiones permite decisiones más justas y precisas, alineadas con la misión social de ADRA, buscando el balance entre **inclusión financiera** (servir a poblaciones vulnerables) y **sostenibilidad** (proteger la calidad de la cartera).

---

#### **DIMENSIÓN 1: INGRESO DEL CLIENTE (9 IPCs)**
*Evalúa la capacidad económica y estabilidad financiera del cliente/beneficiario de ADRA. **Determina si el cliente PUEDE pagar.***

**Contexto ADRA:** Esta dimensión es crítica para evaluar si los beneficiarios de microcréditos de ADRA tienen la capacidad económica real para cumplir con sus obligaciones sin comprometer su bienestar familiar.

| IPC | Nombre | Tipo | Fórmula/Medida | Interpretación |
|-----|--------|------|----------------|----------------|
| **IPC1** | Mora | Numérico | Días de atraso en pagos | Mayor valor = Mayor riesgo. Primera señal de pérdida de capacidad de pago. |
| **IPC2** | Mora por tramos | Categórico | Clasificación: 0-30, 31-60, 61-90, 91-180, >180 | Severidad de mora. >90 días = mora crítica. |
| **IPC4** | Tickets vencidos | Numérico | Capital mora / Tickets | Relaciona capacidad con flujo económico perdido. **También en VOLUNTAD.** |
| **IPC5** | Deuda vs Garantía | Numérico | Total deuda / Total garantía | Evalúa solvencia y cobertura financiera. **También en GARANTÍA PSICOLÓGICA.** |
| **IPC7** | Capacidad de pago directa | Numérico | Ingreso primario / Tickets | **Invertido**: Mayor ratio = Mejor capacidad. <1 = Insolvencia. |
| **IPC8** | Jerarquía fuente de pago | Categórico | Primario > Secundario > Otros > Garantía | Origen del pago. Garantía = incapacidad real de pago. |
| **IPC9** | Concentración ADRA | Numérico | Deuda ADRA / Pasivo total | % de endeudamiento con la institución. Alto = Riesgo institucional. |
| **IPC13** | Liquidez | Numérico | (Efectivo + ahorros) / Activo total | Mide colchón financiero. Capacidad de liquidez inmediata. |
| **IPC16** | Variación activo | Numérico | Activo t-1 / Activo t | Evalúa crecimiento patrimonial. **También en GARANTÍA PSICOLÓGICA.** |

#### **DIMENSIÓN 2: VOLUNTAD DE PAGO (5 IPCs)**
*Mide el comportamiento y compromiso del beneficiario con sus obligaciones. **Determina si el cliente QUIERE pagar.***

**Contexto ADRA:** La voluntad de pago refleja no solo la capacidad financiera sino el compromiso y responsabilidad del beneficiario. Para ADRA, este factor es fundamental para mantener programas de microcrédito sostenibles que beneficien a más familias.

| IPC | Nombre | Tipo | Fórmula/Medida | Interpretación |
|-----|--------|------|----------------|----------------|
| **IPC3** | Mora proporcional | Numérico | Días mora / Días totales crédito | Intensidad relativa del atraso. Mide deterioro comparativo. |
| **IPC4** | Tickets vencidos | Numérico | Capital mora / Tickets | Mide persistencia del incumplimiento. **También en INGRESO.** |
| **IPC6** | Recurrencia de mora | Numérico | Días mora acum. / Días prom. entre pagos | Patrón histórico de morosidad. Reincidencia alta = Sobreendeudamiento. |
| **IPC10** | Nivel de contagio | Numérico | Créditos sin ADRA / Créditos totales | Cuántas entidades comparten al cliente. Alto = Competencia de pagos. |
| **IPC12** | Rechazos | Numérico | Operaciones rechazadas / Total operaciones | Indica inconsistencias y riesgo moral. |

#### **DIMENSIÓN 3: GARANTÍA PSICOLÓGICA (7 IPCs)**
*Evalúa factores de retención, confianza y estabilidad de la relación beneficiario-ADRA. **Determina si el cliente SABE CÓMO y está COMPROMETIDO a pagar.***

**Contexto ADRA:** La garantía psicológica representa el vínculo de confianza y compromiso a largo plazo entre ADRA y sus beneficiarios. Un vínculo fuerte aumenta la sostenibilidad de los programas y el impacto social positivo en las comunidades atendidas.

| IPC | Nombre | Tipo | Fórmula/Medida | Interpretación |
|-----|--------|------|----------------|----------------|
| **IPC5** | Deuda vs Garantía | Numérico | Total deuda / Total garantía | Confirma respaldo serio y compromiso. **También en INGRESO.** |
| **IPC11** | Nivel de retención | Numérico | Ciclos anteriores / Total ciclos | Permanencia en la institución. Mide permanencia. |
| **IPC14** | Variación ingreso | Numérico | Ingreso t-1 / Ingreso t | Mide madurez financiera. Estabilidad de ingresos en el tiempo. |
| **IPC15** | Experiencia crediticia | Numérico | Años crédito / Años actividad | Indica solidez personal. Madurez en manejo crediticio. |
| **IPC16** | Variación activo | Numérico | Activo t-1 / Activo t | Refleja estabilidad psicológica patrimonial. **También en INGRESO.** |
| **IPC17** | Provisión/Mora | Numérico | Provisiones / Mora total | Análisis de solvencia. Cobertura de riesgo. |
| **IPC18** | Ahorros/Cartera | Numérico | Ahorros / Cartera total | Análisis de solvencia del ahorro. Respaldo interno. |

#### **IPCs Categóricos - Valores Permitidos:**

**IPC2 - Mora por tramos:**
```typescript
'0-30'    → 0-30 días (Verde #16A34A)     - Mora temprana recuperable
'31-60'   → 31-60 días (Naranja #F97316) - Requiere gestión activa
'61-90'   → 61-90 días (Amarillo #EAB308)- Mora significativa
'91-180'  → 91-180 días (Celeste #06B6D4)- Mora crítica
'>180'    → Más de 180 días (Rojo #DC2626) - Baja recuperación
```

**IPC8 - Jerarquía de fuente de pago:**
```typescript
'Primario'   → Ingreso primario (Verde #16A34A)    - Estable y predecible
'Secundario' → Ingreso secundario (Naranja #F97316)- Volatilidad moderada
'Otros'      → Otros ingresos (Amarillo #EAB308)   - Baja predictibilidad
'Garantía'   → Pago con garantía (Rojo #DC2626)    - Incapacidad real
```

### 2.6. Sistema de Rangos de Visualización

El sistema utiliza rangos estandarizados basados en el **Índice HHI (Herfindahl-Hirschman)** para colorear y clasificar todos los IPCs numéricos:

```typescript
// Archivo: src/app/core/cartera/models/hhi-concentration-ranges.ts

export const HHI_CONCENTRATION_RANGES: readonly HHIConcentrationRange[] = [
  {
    from: -Infinity, to: 0,
    colorHex: '#000000', // Negro
    label: '< 0%',
    riskLevel: 'anomalo'  // Valores anómalos/erróneos
  },
  {
    from: 0, to: 20,
    colorHex: '#16A34A', // Verde
    label: '0% - 20%',
    riskLevel: 'bajo'     // Situación saludable
  },
  {
    from: 20.001, to: 40,
    colorHex: '#F97316', // Naranja
    label: '20% - 40%',
    riskLevel: 'moderado' // Requiere monitoreo
  },
  {
    from: 40.001, to: 60,
    colorHex: '#EAB308', // Amarillo
    label: '40% - 60%',
    riskLevel: 'medio-alto' // Atención necesaria
  },
  {
    from: 60.001, to: 80,
    colorHex: '#06B6D4', // Celeste
    label: '60% - 80%',
    riskLevel: 'alto'     // Requiere acción
  },
  {
    from: 80.001, to: 100,
    colorHex: '#DC2626', // Rojo
    label: '80% - 100%',
    riskLevel: 'critico'  // Intervención urgente
  },
  {
    from: 100.001, to: Infinity,
    colorHex: '#000000', // Negro
    label: '> 100%',
    riskLevel: 'anomalo'  // Valores anómalos
  }
];
```

**Interpretación de Niveles de Riesgo:**

| Nivel | Rango | Color | Acción Recomendada |
|-------|-------|-------|-------------------|
| **Anómalo** | <0% o >100% | Negro | Revisar datos - Posible error de carga |
| **Bajo** | 0-20% | Verde | Monitoreo regular - Situación saludable |
| **Moderado** | 20-40% | Naranja | Monitoreo activo - Alerta temprana |
| **Medio-Alto** | 40-60% | Amarillo | Análisis detallado - Medidas preventivas |
| **Alto** | 60-80% | Celeste | Plan de acción inmediato - Riesgo elevado |
| **Crítico** | 80-100% | Rojo | Intervención urgente - Provisión requerida |

### 2.7. Arquitectura de Servicios

El sistema sigue una arquitectura en capas claramente definida:

#### **Capa de Repositorio (Data Access Layer)**

**CSVCarteraRepository** (`src/app/core/cartera/repositories/csv-cartera.repository.ts`)

Responsable de:
- Lectura y parseo del archivo CSV
- Validación de estructura de datos
- Transformación de datos planos a interfaces TypeScript
- Caché en memoria para performance

```typescript
@Injectable({ providedIn: 'root' })
export class CSVCarteraRepository {
  private cachedRecords: ReporteCartera[] | null = null;
  
  async getAllRecords(): Promise<ReporteCartera[]> {
    if (this.cachedRecords) return this.cachedRecords;
    
    const csvText = await this.loadCSV();
    const records = this.parseCSV(csvText);
    this.cachedRecords = records;
    return records;
  }
  
  async getUniqueValues(field: keyof ReporteCartera): Promise<string[]> {
    // Retorna valores únicos de un campo específico
  }
}
```

**Métodos principales:**
- `getAllRecords()` - Retorna todos los registros con caché
- `getUniqueValues(field)` - Valores distintos de un campo
- `reloadData()` - Forzar recarga desde CSV
- `validateRecord(record)` - Validación de integridad

#### **Capa de Servicio (Business Logic Layer)**

**IPCDataService** (`src/app/features/reports/services/ipc-data.service.ts`)

Responsable de:
- Filtrado de datos (3 etapas)
- Cálculo de estadísticas
- Generación de GeoJSON para mapas
- Gestión de estado de filtros

```typescript
@Injectable({ providedIn: 'root' })
export class IPCDataService {
  private _dataFilters = signal<DataFilters>({...});  // Estado de filtros
  
  async getDatosFiltrados(): Promise<ReporteCartera[]> {
    // ETAPA 1: Obtener datos del repositorio
    const records = await this.carteraRepo.getAllRecords();
    
    // ETAPA 2: Aplicar filtros de base de datos
    const filtrados = records.filter(record => {
      if (!this.validarCoordenadas(record)) return false;
      if (!this.validarIPC(record, ipcActual)) return false;
      if (!this.aplicarFiltrosDB(record)) return false;
      return true;
    });
    
    // ETAPA 3: Retornar datos filtrados
    return filtrados;
  }
  
  private aplicarFiltrosDB(record: ReporteCartera): boolean {
    const filtros = this._dataFilters();
    
    // Filtro por sede
    if (filtros.sedes.length > 0) {
      if (!filtros.sedes.includes(record.agencia)) return false;
    }
    
    // Filtro por género
    if (filtros.generos.length > 0) {
      if (!filtros.generos.includes(record.genero)) return false;
    }
    
    // Filtro por rangos de monto
    if (filtros.montosCredito.length > 0) {
      const monto = record.monto_colocado;
      const cumpleRango = filtros.montosCredito.some(rangoId => {
        const rango = RANGOS_MONTO_CREDITO.find(r => r.id === rangoId);
        if (!rango) return false;
        if (rango.max === null) return monto >= rango.min;
        return monto >= rango.min && monto <= rango.max;
      });
      if (!cumpleRango) return false;
    }
    
    // ... más filtros ...
    
    return true;
  }
}
```

**Métodos principales:**
- `getDatosFiltrados()` - Datos con filtros aplicados
- `setDataFilters(filtros)` - Actualizar filtros activos
- `clearDataFilters()` - Limpiar todos los filtros
- `generarGeoJSON(records, ipcConfig)` - Convertir a formato mapa
- `calcularEstadisticas(records, campo)` - Estadísticas descriptivas

**IPCConfigService** (`src/app/features/reports/services/ipc-config.service.ts`)

Responsable de:
- Configuración centralizada de 18 IPCs
- Definición de dimensiones
- Categorías para IPCs categóricos
- Metadatos de interpretación

```typescript
@Injectable({ providedIn: 'root' })
export class IPCConfigService {
  private readonly IPCS_CONFIG: readonly IPCConfig[] = [/* 18 configs */];
  
  getIPCConfig(ipcId: string): IPCConfig | undefined {
    return this.IPCS_CONFIG.find(ipc => ipc.id === ipcId);
  }
  
  getDimensionConfig(dimensionId: IPCDimension): DimensionConfig {
    // Retorna configuración de dimensión con sus IPCs
  }
  
  getAllDimensiones(): DimensionConfig[] {
    return [
      {
        id: 'ingreso',
        nombre: 'Ingreso del Cliente',
        descripcion: 'Evalúa capacidad económica y estabilidad financiera',
        icono: 'pi pi-wallet',
        color: '#3B82F6',
        ipcs: [/* IPC1, IPC2, IPC4, IPC5, IPC7, IPC8, IPC9, IPC13, IPC16 */]
      },
      {
        id: 'voluntad',
        nombre: 'Voluntad de Pago',
        descripcion: 'Mide comportamiento y compromiso con obligaciones',
        icono: 'pi pi-heart',
        color: '#10B981',
        ipcs: [/* IPC3, IPC4, IPC6, IPC10, IPC12 */]
      },
      {
        id: 'garantia',
        nombre: 'Garantía Psicológica',
        descripcion: 'Evalúa retención, confianza y estabilidad',
        icono: 'pi pi-shield',
        color: '#8B5CF6',
        ipcs: [/* IPC5, IPC11, IPC14, IPC15, IPC16, IPC17, IPC18 */]
      }
    ];
  }
}
```

#### **Capa de Presentación (UI Layer)**

**IPCUnifiedComponent** (`src/app/features/reports/pages/ipc-unified/ipc-unified.component.ts`)

Componente principal que orquesta toda la funcionalidad. Usa **Angular Signals** para manejo de estado reactivo.

**Signals principales:**

```typescript
export class IPCUnifiedComponent {
  // Estado de UI
  dimensionActiva = signal<IPCDimension>('ingreso');
  indicadorSeleccionado = signal<IPCConfig | null>(null);
  mostrarDialogFiltros = signal<boolean>(false);
  mostrarDialogDistribucion = signal<boolean>(false);
  
  // Estado de carga
  isLoadingMap = signal<boolean>(true);
  isLoadingData = signal<boolean>(false);
  
  // Filtros disponibles (cargados desde DB)
  sedesDisponibles = signal<{label: string, value: string}[]>([]);
  generosDisponibles = signal<string[]>([]);
  productosDisponibles = signal<{label: string, value: string}[]>([]);
  zonasDisponibles = signal<string[]>([]);
  rangosMonto = signal<{label: string, value: string}[]>([]);
  categoriasDisponibles = signal<{label: string, value: string}[]>([]);
  calificacionesCRDisponibles = signal<{label: string, value: string}[]>([]);
  rangosCapacidadPago = signal<{label: string, value: string}[]>([]);
  
  // Filtros seleccionados (estado del usuario)
  sedesSeleccionadas = signal<string[]>([]);
  generosSeleccionados = signal<string[]>([]);
  productosSeleccionados = signal<string[]>([]);
  zonasSeleccionadas = signal<string[]>([]);
  rangosMontosSeleccionados = signal<string[]>([]);
  categoriasSeleccionadas = signal<string[]>([]);
  calificacionesCRSeleccionadas = signal<string[]>([]);
  rangosCapacidadPagoSeleccionados = signal<string[]>([]);
  
  // Computed signals (valores derivados)
  dimensionInfo = computed(() => {
    const dimensionId = this.dimensionActiva();
    return this.configService.getDimensionConfig(dimensionId);
  });
  
  filtrosBaseDatosActivos = computed(() => {
    let count = 0;
    if (this.sedesSeleccionadas().length > 0) count++;
    if (this.generosSeleccionados().length > 0) count++;
    if (this.rangosMontosSeleccionados().length > 0) count++;
    if (this.productosSeleccionados().length > 0) count++;
    if (this.zonasSeleccionadas().length > 0) count++;
    if (this.categoriasSeleccionadas().length > 0) count++;
    if (this.calificacionesCRSeleccionadas().length > 0) count++;
    if (this.rangosCapacidadPagoSeleccionados().length > 0) count++;
    return count;
  });
  
  impactoFiltros = computed(() => {
    // Calcula total, filtrados, visibles
    return {
      total: this.totalRegistros,
      filtrados: this.registrosFiltrados.length,
      visibles: this.registrosVisibles.length,
      porcentajeFiltrado: (this.registrosFiltrados.length / this.totalRegistros) * 100,
      porcentajeVisible: (this.registrosVisibles.length / this.totalRegistros) * 100
    };
  });
}
```

**Métodos principales:**

```typescript
// Inicialización
async ngOnInit() {
  await this.cargarOpcionesFiltros();
  await this.inicializarMapa();
  await this.cargarDatosIniciales();
}

// Gestión de filtros
async cargarOpcionesFiltros() {
  // Carga valores únicos de cada campo desde el servicio
  this.sedesDisponibles.set(await this.dataService.getUniqueValues('agencia'));
  this.generosDisponibles.set(await this.dataService.getUniqueValues('genero'));
  // ... más campos ...
  
  // Inicializar rangos predefinidos
  this.rangosMonto.set(
    RANGOS_MONTO_CREDITO.map(r => ({ label: r.label, value: r.id }))
  );
  this.rangosCapacidadPago.set(
    RANGOS_CAPACIDAD_PAGO.map(r => ({ label: r.label, value: r.id }))
  );
}

aplicarFiltrosBaseDatos() {
  // Construir objeto de filtros
  const filtros: DataFilters = {
    sedes: this.sedesSeleccionadas(),
    generos: this.generosSeleccionados(),
    montosCredito: this.rangosMontosSeleccionados(),
    productos: this.productosSeleccionados(),
    zonas: this.zonasSeleccionadas(),
    categorias: this.categoriasSeleccionadas(),
    calificacionesCR: this.calificacionesCRSeleccionadas(),
    capacidadesPago: this.rangosCapacidadPagoSeleccionados()
  };
  
  // Enviar al servicio
  this.dataService.setDataFilters(filtros);
  
  // Recargar datos del mapa (SIN resetear zoom)
  await this.actualizarMapaSinZoom();
  
  // Cerrar modal
  this.mostrarDialogFiltros.set(false);
}

// Gestión del mapa
async inicializarMapa() {
  this.mapa = new maplibregl.Map({
    container: 'ipc-map',
    style: environment.mapStyle,
    center: [-75.0, -9.5],  // Centro de Perú
    zoom: 5
  });
  
  this.mapa.on('load', async () => {
    await this.cargarCapasPuntos();
    await this.configurarClustering();
    await this.configurarInteracciones();
    this.isLoadingMap.set(false);
  });
}

async actualizarMapaSinZoom() {
  // Actualizar datos SIN mover el mapa (preservar zoom/posición)
  const geojson = await this.generarGeoJSONActual();
  const source = this.mapa!.getSource('puntos-ipc') as maplibregl.GeoJSONSource;
  source.setData(geojson);
}
```

### 2.8. Patrón de Filtrado en 3 Etapas

El sistema implementa un patrón sofisticado de filtrado en 3 etapas para optimizar performance y claridad:

```
ETAPA 1: FILTROS DE BASE DE DATOS
├─ Aplicados en: IPCDataService.getDatosFiltrados()
├─ Propósito: Reducir dataset inicial
└─ Filtros:
   ├─ Sede (agencia)
   ├─ Género
   ├─ Monto de Crédito (rangos)
   ├─ Producto
   ├─ Zona Geográfica
   ├─ Categoría
   ├─ Calificación CR
   └─ Capacidad de Pago (rangos)

ETAPA 2: VALIDACIÓN DE DATOS
├─ Aplicados en: IPCDataService.getDatosFiltrados()
├─ Propósito: Excluir registros inválidos
└─ Validaciones:
   ├─ Coordenadas válidas (-90 ≤ lat ≤ 90, -180 ≤ lng ≤ 180)
   ├─ IPC seleccionado no nulo ni NaN
   ├─ IPC categórico con valor permitido
   └─ Campos requeridos presentes

ETAPA 3: FILTROS DE VISUALIZACIÓN (RANGOS)
├─ Aplicados en: IPCUnifiedComponent.registrosVisibles
├─ Propósito: Filtrar por rangos de color en UI
└─ Filtros:
   └─ Rangos activos/inactivos (checkboxes en UI)
```

**Ejemplo de flujo completo:**

```typescript
// Dataset inicial: 23,831 registros

// ETAPA 1: Usuario aplica filtros de BD
// - Sede: "Lima Centro"
// - Género: "FEMENINO"
// - Monto: "1,001-5,000"
// Resultado: 5,234 registros

// ETAPA 2: Validación automática
// - Excluye 15 registros con coordenadas inválidas
// - Excluye 3 registros con IPC1 = null
// Resultado: 5,216 registros

// ETAPA 3: Usuario desactiva rangos
// - Desactiva rango "80-100%" (rojo)
// - Desactiva rango ">100%" (negro)
// Resultado: 4,890 registros visibles en mapa
```

Este patrón permite:
- ✅ Performance óptima (filtrado en memoria)
- ✅ Separación de responsabilidades clara
- ✅ Facilidad para debugging
- ✅ UX fluida (zoom preservado entre filtros)

---

## 3. REQUISITOS Y DEPENDENCIAS

### 3.1. Requisitos del Servidor

#### **Mínimos:**
- **CPU:** 2 cores
- **RAM:** 4 GB
- **Disco:** 10 GB libres
- **SO:** Windows Server 2019+, Linux (Ubuntu 20.04+), macOS 11+

#### **Recomendados:**
- **CPU:** 4 cores
- **RAM:** 8 GB
- **Disco:** 20 GB SSD
- **SO:** Ubuntu 22.04 LTS

### 3.2. Software Requerido

#### **Node.js**
```bash
# Versión requerida: 20.x o superior (22.x recomendado)
node --version  # Debe mostrar v20.x.x o v22.x.x
```

**Instalación:**
- Windows: [https://nodejs.org/](https://nodejs.org/)
- Linux (Ubuntu):
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

#### **npm o Yarn**
```bash
# npm viene con Node.js
npm --version  # Debe mostrar 10.x o superior

# O usar Yarn (opcional)
npm install -g yarn
yarn --version
```

#### **Git**
```bash
git --version  # Debe estar instalado
```

**Instalación:**
- Windows: [https://git-scm.com/download/win](https://git-scm.com/download/win)
- Linux: `sudo apt-get install git`

### 3.3. Dependencias Principales del Proyecto

El sistema utiliza las siguientes dependencias críticas (definidas en `package.json`):

#### **Framework y Core:**
```json
{
  "@angular/core": "^20.3.0",           // Framework principal
  "@angular/common": "^20.3.0",         // Módulos comunes
  "@angular/router": "^20.3.0",         // Sistema de rutas
  "@angular/forms": "^20.3.0",          // Manejo de formularios
  "@angular/animations": "^20.3.4",     // Animaciones
  "typescript": "~5.7.0",               // Lenguaje
  "rxjs": "~7.8.0"                      // Programación reactiva
}
```

#### **Componentes UI:**
```json
{
  "primeng": "^20.2.0",                 // Biblioteca de componentes UI
  "primeicons": "^7.0.0",               // Iconos de PrimeNG
  "@primeuix/themes": "^1.2.5",         // Temas de PrimeNG
  "tailwindcss": "^4.x",                // Framework CSS utilitario
  "tailwindcss-primeui": "^0.6.1"       // Integración Tailwind + PrimeNG
}
```

#### **Visualización de Datos:**
```json
{
  "maplibre-gl": "^5.10.0",             // Mapas interactivos
  "@teritorio/maplibre-gl-teritorio-cluster": "^0.1.4", // Clustering de mapas
  "echarts": "^6.0.0",                  // Biblioteca de gráficos
  "echarts-gl": "^2.0.9",               // Extensión 3D para ECharts
  "ngx-echarts": "^21.0.0"              // Wrapper Angular para ECharts
}
```

#### **Utilities:**
```json
{
  "dexie": "^4.2.1",                    // Base de datos IndexedDB
  "jwt-decode": "^4.0.0",               // Decodificación de JWT
  "pdfmake": "^0.2.20",                 // Generación de PDFs
  "dotenv": "^17.2.3"                   // Variables de entorno
}
```

#### **Build Tools:**
```json
{
  "@angular-devkit/build-angular": "^20.x", // Builder de Angular
  "vite": "^6.x"                            // Bundler rápido
}
```

### 3.4. Scripts NPM Disponibles

El proyecto define los siguientes comandos en `package.json`:

```bash
# Desarrollo
npm run start:dev       # Servidor desarrollo con HMR (Hot Module Replacement)
npm run start:prod      # Servidor con configuración de producción

# Build
npm run build           # Build de producción (alias de build:prod)
npm run build:dev       # Build con configuración de desarrollo
npm run build:prod      # Build optimizado para producción
npm run build:deploy    # Build + copia a /var/www/mirar/
npm run watch           # Build con modo watch (reconstruye al cambiar)

# Testing y Calidad
npm run test            # Ejecutar tests unitarios
npm run lint            # Verificar código con ESLint
npm run lint:fix        # Autofix de problemas de linting
npm run format          # Formatear código con Prettier
npm run format:check    # Verificar formato sin modificar
npm run format:lint     # Formatear + lint:fix

# Utilities
npm run envs            # Generar archivos de entorno
npm run fix:line-endings # Normalizar line endings a LF
```

**Comandos más usados:**

```bash
# Desarrollo local
npm run start:dev

# Build para desplegar
npm run build

# Verificar calidad de código
npm run format:lint
```

### 3.5. Configuración de TypeScript

El proyecto usa TypeScript 5.7+ con configuración estricta. Archivos clave:

**tsconfig.json** (Base):
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "DOM"],
    "moduleResolution": "bundler",
    "strict": true,
    "strictNullChecks": true,
    "noImplicitAny": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "experimentalDecorators": true,
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@features/*": ["src/app/features/*"],
      "@shared/*": ["src/app/shared/*"]
    }
  }
}
```

**Path Aliases configurados:**
- `@core/*` → `src/app/core/*`
- `@features/*` → `src/app/features/*`
- `@shared/*` → `src/app/shared/*`

Esto permite imports limpios:
```typescript
// En lugar de:
import { ReporteCartera } from '../../../core/cartera/models/reporte-cartera.interface';

// Usar:
import { ReporteCartera } from '@core/cartera';
```

### 3.6. Navegadores Soportados

- ✅ Google Chrome 120+
- ✅ Microsoft Edge 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ❌ Internet Explorer (NO soportado)

**⚠️ Nota:** El sistema utiliza características modernas de JavaScript (ES2022) y APIs de navegador que requieren versiones recientes. No es compatible con navegadores legacy.

---

## 4. INSTALACIÓN Y CONFIGURACIÓN

### 4.1. Clonar el Repositorio

```bash
# Navegar a la carpeta deseada
cd /ruta/donde/instalar

# Clonar repositorio
git clone https://github.com/ToMiPe/mirar-adra-ng.git

# Entrar al proyecto
cd mirar-adra-ng

# Verificar branch principal
git branch
# Debe mostrar: * main
```

### 4.2. Instalar Dependencias

```bash
# Usando npm
npm install

# O usando Yarn
yarn install
```

**⏱️ Tiempo estimado:** 3-5 minutos (depende de velocidad de internet)

**🔍 Verificación:**
```bash
# Verificar que se creó node_modules/
ls -la node_modules | head -n 20

# Verificar dependencias principales
npm list @angular/core
npm list primeng
npm list maplibre-gl
npm list echarts
```

### 4.3. Configuración de Entornos

#### **Desarrollo** (`src/environments/environment.ts`)

```typescript
export const environment = {
  production: false,
  apiUrl: '', // No se usa API externa actualmente
  csvPath: '/assets/data/reporte_cartera.csv',
  mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  mapBounds: {
    peru: [[-81.4, -18.4], [-68.6, -0.0]]  // Coordenadas de Perú
  }
};
```

#### **Producción** (`src/environments/environment.prod.ts`)

```typescript
export const environment = {
  production: true,
  apiUrl: '', 
  csvPath: '/assets/data/reporte_cartera.csv',
  mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  mapBounds: {
    peru: [[-81.4, -18.4], [-68.6, -0.0]]
  }
};
```

### 4.4. Ejecutar en Desarrollo

```bash
# Modo desarrollo con hot-reload
npm run dev

# O con Yarn
yarn dev
```

**Salida esperada:**
```
VITE v6.x.x  ready in 2345 ms

➜  Local:   http://localhost:4200/
➜  Network: use --host to expose

Angular is running in development mode
```

**🌐 Acceder:** Abrir navegador en `http://localhost:4200`

### 4.5. Build para Producción

```bash
# Build optimizado
npm run build

# O con Yarn
yarn build
```

**⏱️ Tiempo estimado:** 20-40 segundos

**Salida esperada:**
```
✓ building...
✓ built in 15.23s

Output:
  dist/lima/browser/  (3.2 MB)
```

**📂 Archivos generados:**
```
dist/lima/browser/
├── index.html           # HTML principal
├── main-[hash].js       # JavaScript principal
├── styles-[hash].css    # CSS compilado
├── assets/              # Recursos estáticos
│   └── data/
│       └── reporte_cartera.csv
└── [otros chunks]
```

### 4.6. Despliegue en Servidor Web

#### **NGINX (Recomendado)**

**1. Instalar NGINX:**
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install nginx

# Verificar
nginx -v
```

**2. Configurar sitio:**

Crear archivo `/etc/nginx/sites-available/lima`:

```nginx
server {
    listen 80;
    server_name lima.adra.org.pe;  # Cambiar por tu dominio
    
    root /var/www/lima/dist/lima/browser;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cachear assets estáticos
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|woff|woff2|ttf|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Comprimir respuestas
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    gzip_vary on;
}
```

**3. Habilitar sitio:**
```bash
# Crear symlink
sudo ln -s /etc/nginx/sites-available/lima /etc/nginx/sites-enabled/

# Test configuración
sudo nginx -t

# Reiniciar NGINX
sudo systemctl restart nginx
```

**4. Copiar archivos:**
```bash
# Copiar dist/ al servidor
sudo mkdir -p /var/www/lima
sudo cp -r dist/lima/browser/* /var/www/lima/dist/lima/

# Permisos
sudo chown -R www-data:www-data /var/www/lima
sudo chmod -R 755 /var/www/lima
```

#### **Apache (Alternativa)**

**1. Habilitar módulos:**
```bash
sudo a2enmod rewrite
sudo a2enmod deflate
sudo a2enmod expires
```

**2. Configurar VirtualHost** (`/etc/apache2/sites-available/lima.conf`):

```apache
<VirtualHost *:80>
    ServerName lima.adra.org.pe
    DocumentRoot /var/www/lima/dist/lima/browser
    
    <Directory /var/www/lima/dist/lima/browser>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        # SPA routing
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Cacheo
    <FilesMatch "\.(jpg|jpeg|png|gif|css|js|woff|woff2)$">
        Header set Cache-Control "max-age=31536000, public"
    </FilesMatch>
    
    ErrorLog ${APACHE_LOG_DIR}/lima-error.log
    CustomLog ${APACHE_LOG_DIR}/lima-access.log combined
</VirtualHost>
```

**3. Habilitar sitio:**
```bash
sudo a2ensite lima
sudo systemctl restart apache2
```

---

## 5. GESTIÓN DE DATOS

### 5.1. Formato del Archivo CSV

#### **Ubicación:**
```
src/assets/data/reporte_cartera.csv
```

#### **Estructura de Columnas (Orden obligatorio):**

| # | Columna | Tipo | Obligatorio | Ejemplo |
|---|---------|------|-------------|---------|
| 1 | `epsa_codigo` | string | ✅ | "EPSA001" |
| 2 | `nombre` | string | ✅ | "Juan Pérez" |
| 3 | `agencia` | string | ✅ | "Lima Centro" |
| 4 | `genero` | string | ✅ | "MASCULINO" |
| 5 | `latitud` | number | ✅ | -12.046374 |
| 6 | `longitud` | number | ✅ | -77.042793 |
| 7 | `monto_colocado` | number | ✅ | 5000.00 |
| 8 | `producto` | string | ✅ | "GRUPAL NORMAL 28 DIAS" |
| 9 | `zona_geografica` | string | ✅ | "Urbano" |
| 10 | `categoria` | string | ✅ | "A" |
| 11 | `calificacion_cr` | string | ✅ | "Normal" |
| 12 | `capacidad_pago` | number | ✅ | 250.00 |
| 13-30 | `ipc1` ... `ipc18` | number/string | ✅ | Ver tabla IPCs |

#### **Formato de IPCs:**

| IPC | Nombre | Tipo | Ejemplo | Notas |
|-----|--------|------|---------|-------|
| `ipc1` | Mora | number | 15.5 | Días de atraso |
| `ipc2` | Mora por tramos | string | "31-60" | Categórico |
| `ipc3` | Mora proporcional | number | 0.25 | Porcentaje (0-1) |
| `ipc4` | Tickets vencidos | number | 2 | Cantidad |
| `ipc5` | Deuda/Garantía | number | 0.85 | Ratio |
| `ipc6` | Recurrencia mora | number | 0.33 | Porcentaje |
| `ipc7` | Capacidad pago | number | 1.2 | Ratio >1 = capacidad |
| `ipc8` | Jerarquía pago | string | "Primario" | Categórico |
| `ipc9` | Concentración ADRA | number | 0.45 | Porcentaje |
| `ipc10` | Nivel contagio | number | 0.10 | Porcentaje |
| `ipc11` | Nivel retención | number | 0.80 | Porcentaje |
| `ipc12` | Rechazos | number | 0.05 | Porcentaje |
| `ipc13` | Liquidez | number | 0.30 | Porcentaje |
| `ipc14` | Variación ingreso | number | 0.95 | Ratio t-1/t |
| `ipc15` | Experiencia crediticia | number | 0.75 | Ratio años |
| `ipc16` | Variación activo | number | 1.05 | Ratio t-1/t |
| `ipc17` | Provisión/Mora | number | 1.0 | Ratio |
| `ipc18` | Ahorros/Cartera | number | 0.15 | Ratio |

#### **Ejemplo de Registro CSV:**

```csv
epsa_codigo,nombre,agencia,genero,latitud,longitud,monto_colocado,producto,zona_geografica,categoria,calificacion_cr,capacidad_pago,ipc1,ipc2,ipc3,ipc4,ipc5,ipc6,ipc7,ipc8,ipc9,ipc10,ipc11,ipc12,ipc13,ipc14,ipc15,ipc16,ipc17,ipc18
EPSA001,Juan Pérez,Lima Centro,MASCULINO,-12.046374,-77.042793,5000.00,GRUPAL NORMAL 28 DIAS,Urbano,A,Normal,250.00,15.5,31-60,0.25,2,0.85,0.33,1.2,Primario,0.45,0.10,0.05,0.95,0.30,0.95,0.90,1.05,1.0,0.15
```

### 5.2. Validaciones del CSV

El sistema valida automáticamente:

✅ **Estructura:**
- Presencia de todas las columnas obligatorias
- Orden correcto de columnas
- Formato de header

✅ **Datos:**
- `latitud` debe estar entre -90 y 90
- `longitud` debe estar entre -180 y 180
- IPCs numéricos deben ser números válidos
- `ipc2` debe ser uno de: "0-30", "31-60", "61-90", "91-180", ">180"
- `ipc8` debe ser uno de: "Primario", "Secundario", "Otros", "Garantía"

❌ **Errores comunes:**

| Error | Causa | Solución |
|-------|-------|----------|
| "Coordenadas inválidas" | Lat/Long fuera de rango | Verificar valores -90<lat<90, -180<long<180 |
| "IPC2 valor desconocido" | Categoría incorrecta | Usar solo valores permitidos |
| "Formato de número" | Texto en campo numérico | Verificar que sean números |
| "Columnas faltantes" | CSV mal formado | Verificar que tenga 30 columnas |

### 5.3. Actualización de Datos

#### **Proceso Recomendado:**

**1. Preparar nuevo CSV:**
```bash
# Validar formato (script Python ejemplo)
python scripts/validar_csv.py nuevo_reporte.csv
```

**2. Backup del archivo actual:**
```bash
cp src/assets/data/reporte_cartera.csv \
   backups/reporte_cartera_$(date +%Y%m%d_%H%M%S).csv
```

**3. Reemplazar archivo:**
```bash
# Desarrollo
cp nuevo_reporte.csv src/assets/data/reporte_cartera.csv

# Producción (después de build)
cp nuevo_reporte.csv dist/lima/browser/assets/data/reporte_cartera.csv
```

**4. Rebuild (si ya está en producción):**
```bash
npm run build
# Redesplegar dist/ al servidor
```

**5. Verificar en navegador:**
- Abrir aplicación
- Ir a Indicadores de Control Interno
- Verificar que cargue datos
- Revisar estadísticas (Total de registros)

#### **Script de Validación (Python):**

Crear `scripts/validar_csv.py`:

```python
import csv
import sys

COLUMNAS_REQUERIDAS = [
    'epsa_codigo', 'nombre', 'agencia', 'genero', 
    'latitud', 'longitud', 'monto_colocado', 'producto',
    'zona_geografica', 'categoria', 'calificacion_cr', 
    'capacidad_pago',
    'ipc1', 'ipc2', 'ipc3', 'ipc4', 'ipc5', 'ipc6',
    'ipc7', 'ipc8', 'ipc9', 'ipc10', 'ipc11', 'ipc12',
    'ipc13', 'ipc14', 'ipc15', 'ipc16', 'ipc17', 'ipc18'
]

def validar_csv(archivo):
    errores = []
    
    with open(archivo, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        # Validar columnas
        columnas = reader.fieldnames
        for col in COLUMNAS_REQUERIDAS:
            if col not in columnas:
                errores.append(f"❌ Columna faltante: {col}")
        
        # Validar filas
        for i, row in enumerate(reader, start=2):
            # Validar coordenadas
            try:
                lat = float(row['latitud'])
                if not (-90 <= lat <= 90):
                    errores.append(f"❌ Fila {i}: latitud fuera de rango ({lat})")
            except ValueError:
                errores.append(f"❌ Fila {i}: latitud no es número")
            
            try:
                lng = float(row['longitud'])
                if not (-180 <= lng <= 180):
                    errores.append(f"❌ Fila {i}: longitud fuera de rango ({lng})")
            except ValueError:
                errores.append(f"❌ Fila {i}: longitud no es número")
            
            # Validar IPC2
            if row['ipc2'] not in ['0-30', '31-60', '61-90', '91-180', '>180']:
                errores.append(f"❌ Fila {i}: ipc2 valor inválido ({row['ipc2']})")
            
            # Validar IPC8
            if row['ipc8'] not in ['Primario', 'Secundario', 'Otros', 'Garantía']:
                errores.append(f"❌ Fila {i}: ipc8 valor inválido ({row['ipc8']})")
    
    if errores:
        print("\n".join(errores))
        return False
    else:
        print("✅ CSV válido")
        return True

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python validar_csv.py archivo.csv")
        sys.exit(1)
    
    archivo = sys.argv[1]
    if validar_csv(archivo):
        sys.exit(0)
    else:
        sys.exit(1)
```

**Uso:**
```bash
python scripts/validar_csv.py nuevo_reporte.csv
```

### 5.4. Frecuencia de Actualización Recomendada

| Escenario | Frecuencia |
|-----------|------------|
| **Datos transaccionales** | Diaria (automatizada) |
| **Datos analíticos** | Semanal |
| **Datos históricos** | Mensual |
| **Datos de testing** | Según necesidad |

---

## 6. CONFIGURACIÓN AVANZADA

### 6.1. Personalización de Rangos de IPC

Los rangos que definen los colores en el mapa están en:

**Archivo:** `src/app/core/cartera/models/hhi-concentration-ranges.ts`

```typescript
export const HHI_CONCENTRATION_RANGES: HHIConcentrationRange[] = [
  { 
    id: '< 0%', 
    from: -Infinity, 
    to: 0, 
    colorHex: '#000000',  // Negro
    label: '< 0%' 
  },
  { 
    id: '0-20', 
    from: 0, 
    to: 20, 
    colorHex: '#10b981',  // Verde
    label: '0% - 20%' 
  },
  { 
    id: '20-40', 
    from: 20.001, 
    to: 40, 
    colorHex: '#f97316',  // Naranja
    label: '20% - 40%' 
  },
  { 
    id: '40-60', 
    from: 40.001, 
    to: 60, 
    colorHex: '#eab308',  // Amarillo
    label: '40% - 60%' 
  },
  { 
    id: '60-80', 
    from: 60.001, 
    to: 80, 
    colorHex: '#06b6d4',  // Celeste
    label: '60% - 80%' 
  },
  { 
    id: '80-100', 
    from: 80.001, 
    to: 100, 
    colorHex: '#ef4444',  // Rojo
    label: '80% - 100%' 
  },
  { 
    id: '> 100%', 
    from: 100.001, 
    to: Infinity, 
    colorHex: '#000000',  // Negro
    label: '> 100%' 
  }
];
```

**Para modificar:**

1. Cambiar valores `from`/`to`
2. Cambiar colores `colorHex` (formato hexadecimal)
3. Cambiar labels

**Ejemplo - Crear 3 rangos en lugar de 7:**

```typescript
export const HHI_CONCENTRATION_RANGES: HHIConcentrationRange[] = [
  { 
    id: 'bajo', 
    from: 0, 
    to: 33.33, 
    colorHex: '#10b981', 
    label: 'Bajo Riesgo' 
  },
  { 
    id: 'medio', 
    from: 33.34, 
    to: 66.66, 
    colorHex: '#eab308', 
    label: 'Riesgo Medio' 
  },
  { 
    id: 'alto', 
    from: 66.67, 
    to: 100, 
    colorHex: '#ef4444', 
    label: 'Alto Riesgo' 
  }
];
```

**⚠️ Importante:** Después de modificar, ejecutar:
```bash
npm run build
```

### 6.2. Agregar Nuevos Filtros

Para agregar un nuevo filtro (ejemplo: "Estado Civil"):

**1. Actualizar Interface DataFilters:**

`src/app/features/reports/models/ipc-config.interface.ts`:

```typescript
export interface DataFilters {
  sedes: string[];
  generos: string[];
  montosCredito: string[];
  productos: string[];
  zonas: string[];
  categorias: string[];
  calificacionesCR: string[];
  capacidadesPago: string[];
  estadosCiviles: string[];  // ⬅️ NUEVO
}
```

**2. Actualizar ReporteCartera Interface:**

`src/app/core/cartera/models/reporte-cartera.interface.ts`:

```typescript
export interface ReporteCartera {
  // ... campos existentes ...
  estado_civil: string;  // ⬅️ NUEVO
}
```

**3. Actualizar CSV Repository:**

`src/app/core/cartera/repositories/csv-cartera.repository.ts`:

```typescript
private parseRecord(row: any): ReporteCartera {
  return {
    // ... campos existentes ...
    estado_civil: row['estado_civil'] ?? '',  // ⬅️ NUEVO
  };
}
```

**4. Actualizar Servicio:**

`src/app/features/reports/services/ipc-data.service.ts`:

```typescript
async getDatosFiltrados(): Promise<ReporteCartera[]> {
  const records = await this.carteraRepo.getAllRecords();
  const filtros = this._dataFilters();

  return records.filter(record => {
    // ... validaciones existentes ...
    
    // ⬅️ NUEVO: Filtro por estado civil
    if (filtros.estadosCiviles.length > 0) {
      if (!filtros.estadosCiviles.includes(record.estado_civil)) {
        return false;
      }
    }

    return true;
  });
}
```

**5. Actualizar Componente:**

`src/app/features/reports/pages/ipc-unified/ipc-unified.component.ts`:

```typescript
// Signals
estadosCivilesDisponibles = signal<string[]>([]);
estadosCivilesSeleccionados = signal<string[]>([]);

// En cargarOpcionesFiltros()
async cargarOpcionesFiltros() {
  // ... código existente ...
  
  this.estadosCivilesDisponibles.set(
    await this.dataService.getUniqueValues('estado_civil')
  );
}

// En aplicarFiltrosBaseDatos()
aplicarFiltrosBaseDatos() {
  this.dataService.setDataFilters({
    // ... filtros existentes ...
    estadosCiviles: this.estadosCivilesSeleccionados()
  });
}
```

**6. Actualizar Template:**

`src/app/features/reports/pages/ipc-unified/ipc-unified.component.html`:

```html
<!-- En el modal de filtros -->
<div>
  <label class="block text-sm font-semibold text-gray-700 mb-2">
    Estado Civil
  </label>
  <p-multiselect
    [options]="estadosCivilesDisponibles()"
    [(ngModel)]="estadosCivilesSeleccionados"
    placeholder="Todos los estados"
    [showClear]="true"
    styleClass="w-full"
    appendTo="body"
  />
</div>

<!-- En badges de filtros activos -->
@if (estadosCivilesSeleccionados().length > 0) {
  <div class="flex items-start gap-2">
    <span class="text-xs font-semibold text-gray-600 mt-0.5">Estado Civil:</span>
    <div class="flex flex-wrap gap-1">
      @for (estado of estadosCivilesSeleccionados(); track estado) {
        <span class="inline-flex items-center px-2 py-0.5 rounded text-xs bg-lime-100 text-lime-800">
          {{ estado }}
        </span>
      }
    </div>
  </div>
}
```

### 6.3. Personalización del Mapa

#### **Cambiar Estilo Base del Mapa:**

**Archivo:** `src/environments/environment.ts`

```typescript
export const environment = {
  // ... otros configs ...
  
  // Opciones de estilos:
  // 1. Carto Positron (actual - claro)
  mapStyle: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
  
  // 2. Carto Dark Matter (oscuro)
  // mapStyle: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  
  // 3. Carto Voyager (colores)
  // mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
  
  // 4. OpenStreetMap (necesita configuración adicional)
  // mapStyle: 'https://tiles.openfreemap.com/styles/liberty',
};
```

#### **Ajustar Bounds por Defecto:**

**Archivo:** `src/app/features/reports/pages/ipc-unified/ipc-unified.component.ts`

Buscar la línea ~246:

```typescript
// Bounds de Perú (actual)
const peruBounds: [number, number, number, number] = [
  -81.4, -18.4,  // [lng_min, lat_min]
  -68.6, -0.0    // [lng_max, lat_max]
];

// Para enfocar en Lima:
// const limaBounds: [number, number, number, number] = [
//   -77.2, -12.2,
//   -76.8, -11.8
// ];
```

#### **Configurar Clustering:**

**Archivo:** `src/app/features/reports/pages/ipc-unified/ipc-unified.component.ts`

Buscar configuración de `clusterMaxZoom` y `clusterRadius`:

```typescript
// Línea ~283
this.mapa!.addSource('puntos-ipc', {
  type: 'geojson',
  data: geojsonData,
  cluster: true,
  clusterMaxZoom: 14,    // ⬅️ Zoom máximo para clustering
  clusterRadius: 50      // ⬅️ Radio de clustering (px)
});

// Valores recomendados:
// - clusterMaxZoom: 12-16 (mayor = clusters más persistentes)
// - clusterRadius: 30-80 (mayor = clusters más grandes)
```

---

## 7. MANTENIMIENTO

### 7.1. Backup de Datos

#### **Backup Manual:**

```bash
#!/bin/bash
# Script: backup_lima.sh

FECHA=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/lima"

# Crear directorio si no existe
mkdir -p $BACKUP_DIR

# Backup del CSV
cp src/assets/data/reporte_cartera.csv \
   $BACKUP_DIR/reporte_cartera_$FECHA.csv

# Comprimir
tar -czf $BACKUP_DIR/lima_backup_$FECHA.tar.gz \
    src/assets/data/ \
    src/environments/ \
    package.json

# Eliminar backups antiguos (>30 días)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "✅ Backup completado: lima_backup_$FECHA.tar.gz"
```

**Ejecutar:**
```bash
chmod +x backup_lima.sh
./backup_lima.sh
```

#### **Backup Automatizado (Cron):**

```bash
# Editar crontab
crontab -e

# Agregar línea para backup diario a las 2 AM
0 2 * * * /ruta/al/backup_lima.sh >> /var/log/lima_backup.log 2>&1
```

### 7.2. Logs del Sistema

#### **Logs de Desarrollo:**

Durante desarrollo (`npm run dev`), los logs aparecen en:
- **Consola del navegador** (F12 → Console)
- **Terminal** donde ejecutaste `npm run dev`

#### **Logs de Producción:**

**NGINX:**
```bash
# Access log
sudo tail -f /var/log/nginx/access.log

# Error log
sudo tail -f /var/log/nginx/error.log

# Buscar errores específicos
sudo grep "lima.adra.org.pe" /var/log/nginx/error.log | tail -n 50
```

**Apache:**
```bash
# Access log
sudo tail -f /var/log/apache2/lima-access.log

# Error log
sudo tail -f /var/log/apache2/lima-error.log
```

#### **Logs de la Aplicación (Browser Console):**

Los usuarios pueden ver logs en:
1. Abrir DevTools (F12)
2. Tab "Console"
3. Buscar errores en rojo

**Habilitar logs verbose (solo desarrollo):**

`src/app/features/reports/services/ipc-data.service.ts`:

```typescript
private readonly DEBUG = true;  // ⬅️ Cambiar a true

// Agregar logs
if (this.DEBUG) console.log('🔍 Filtros activos:', filtros);
```

### 7.3. Monitoreo de Performance

#### **Métricas Clave:**

| Métrica | Valor Óptimo | Alerta |
|---------|--------------|--------|
| Tiempo de carga inicial | < 3s | > 5s |
| Tiempo de carga de CSV | < 2s | > 4s |
| Renderizado de mapa | < 1s | > 3s |
| Memoria usada (browser) | < 200 MB | > 500 MB |
| Tamaño del bundle | < 3 MB | > 5 MB |

#### **Herramientas de Monitoreo:**

**1. Chrome DevTools Lighthouse:**
```
1. Abrir Chrome
2. F12 → Tab "Lighthouse"
3. Categorías: Performance, Accessibility, Best Practices
4. Click "Analyze page load"
5. Revisar score (objetivo: >90)
```

**2. Webpack Bundle Analyzer (opcional):**

```bash
# Instalar
npm install --save-dev webpack-bundle-analyzer

# Analizar bundle
npm run build -- --stats-json
npx webpack-bundle-analyzer dist/lima/browser/stats.json
```

#### **Optimizaciones Comunes:**

1. **Lazy Loading de módulos:**

`src/app/app.routes.ts`:

```typescript
{
  path: 'reports/ipc',
  loadComponent: () => import('./features/reports/pages/ipc-unified/ipc-unified.component')
    .then(m => m.IPCUnifiedComponent)
}
```

2. **Comprimir imágenes:**
```bash
# Instalar herramienta
npm install -g imagemin-cli

# Comprimir
imagemin src/assets/images/* --out-dir=src/assets/images/compressed
```

3. **Reducir tamaño del CSV:**
- Eliminar columnas no usadas
- Reducir precisión decimal (ej: 12.3456 → 12.35)
- Comprimir con gzip (NGINX lo hace automáticamente)

### 7.4. Actualización de Dependencias

#### **Ver Dependencias Desactualizadas:**

```bash
npm outdated
```

**Salida ejemplo:**
```
Package       Current  Wanted  Latest  Location
@angular/core 20.0.0   20.1.0  21.0.0  node_modules/@angular/core
primeng       20.0.0   20.0.5  20.1.0  node_modules/primeng
```

#### **Actualizar Dependencias:**

**⚠️ IMPORTANTE:** Siempre hacer backup antes de actualizar

```bash
# 1. Backup
git add .
git commit -m "Backup antes de actualizar deps"

# 2. Actualizar minor/patch versions (seguro)
npm update

# 3. Actualizar a latest (puede romper)
npm install @angular/core@latest
npm install primeng@latest

# 4. Verificar que compile
npm run build

# 5. Probar aplicación
npm run dev
```

#### **Estrategia de Actualización:**

| Frecuencia | Tipo | Acción |
|------------|------|--------|
| **Mensual** | Patch (20.0.1 → 20.0.2) | Actualizar automáticamente |
| **Trimestral** | Minor (20.0 → 20.1) | Revisar changelog, probar |
| **Anual** | Major (20.x → 21.x) | Planificar migración |

#### **Dependencias Críticas a Vigilar:**

- `@angular/core` - Framework principal
- `primeng` - Componentes UI
- `maplibre-gl` - Mapas
- `echarts` - Gráficos
- `typescript` - Compilador

---

## 8. TROUBLESHOOTING

### 8.1. Problemas Comunes

#### **Error: "Invalid LngLat latitude value"**

**Síntoma:**
```
Error: Invalid LngLat latitude value: must be between -90 and 90
```

**Causa:** Coordenadas fuera de rango en el CSV

**Solución:**
1. Revisar CSV con script de validación:
   ```bash
   python scripts/validar_csv.py src/assets/data/reporte_cartera.csv
   ```
2. Corregir coordenadas erróneas
3. Recargar aplicación

---

#### **Error: "CSV no carga / Pantalla en blanco"**

**Síntoma:** Aplicación carga pero no muestra datos

**Diagnóstico:**
1. Abrir DevTools (F12) → Console
2. Buscar errores relacionados con CSV

**Posibles causas y soluciones:**

| Error en Console | Causa | Solución |
|------------------|-------|----------|
| "Failed to fetch CSV" | Archivo no encontrado | Verificar ruta en `assets/data/` |
| "CSV parse error" | Formato incorrecto | Validar estructura CSV |
| "Column not found" | Columnas faltantes | Agregar columnas requeridas |

---

#### **Error: "Mapa no renderiza"**

**Síntoma:** Panel del mapa aparece en blanco

**Diagnóstico:**
```bash
# Verificar en Console del navegador
Error: Failed to load map style
```

**Soluciones:**

1. **Verificar conectividad:**
   ```bash
   curl https://basemaps.cartocdn.com/gl/positron-gl-style/style.json
   ```

2. **Verificar CORS (si servidor local):**
   - Abrir Network tab en DevTools
   - Buscar request fallido
   - Si es CORS, configurar headers en servidor

3. **Probar estilo alternativo:**
   ```typescript
   // environment.ts
   mapStyle: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
   ```

---

#### **Error: "Build falla con 'out of memory'"**

**Síntoma:**
```bash
FATAL ERROR: Reached heap limit Allocation failed - JavaScript heap out of memory
```

**Solución:**
```bash
# Aumentar memoria de Node.js
export NODE_OPTIONS="--max-old-space-size=4096"

# Rebuild
npm run build
```

---

#### **Error: "Filtros no funcionan"**

**Síntoma:** Seleccionar filtros no actualiza mapa

**Diagnóstico:**
1. Abrir Console
2. Verificar si hay logs `🔍 Filtros activos`
3. Verificar que haya datos en esos filtros

**Soluciones:**
1. Verificar que `dataService.setDataFilters()` se llame
2. Verificar que los valores en CSV coincidan con opciones de filtro
3. Limpiar caché del navegador (Ctrl+Shift+Del)

---

### 8.2. Logs de Error Detallados

Para debugging avanzado, habilitar logs detallados:

**Archivo:** `src/app/features/reports/services/ipc-data.service.ts`

Descomentar todas las líneas de `console.log`:

```typescript
async getDatosFiltrados(): Promise<ReporteCartera[]> {
  const records = await this.carteraRepo.getAllRecords();
  const filtros = this._dataFilters();
  
  console.log('🔍 Filtros activos:', filtros);  // ⬅️ Habilitar
  console.log('📊 Total registros:', records.length);  // ⬅️ Habilitar
  
  const filtrados = records.filter(record => {
    // ... lógica de filtrado ...
  });
  
  console.log('📊 Filtrado:', records.length, '→', filtrados.length);  // ⬅️ Habilitar
  
  return filtrados;
}
```

Rebuild y revisar Console.

---

### 8.3. Herramientas de Debugging

#### **1. Angular DevTools (Chrome Extension):**

Instalar: [Angular DevTools](https://chrome.google.com/webstore/detail/angular-devtools/ienfalfjdbdpebioblfackkekamfmbnh)

**Uso:**
1. Instalar extensión
2. Abrir DevTools (F12)
3. Tab "Angular"
4. Ver árbol de componentes, signals, dependencias

#### **2. Redux DevTools (para state management - si se usa):**

No aplicable actualmente (no usa Redux).

#### **3. Comandos útiles en Console:**

```javascript
// Ver todos los records cargados
window.localStorage.getItem('mirar-debug-records')

// Forzar recarga de datos
location.reload(true)

// Ver signals activos (Angular 20)
ng.getComponent($0)  // Después de seleccionar elemento en Elements tab
```

---

### 8.4. Contacto de Soporte

Para problemas no resueltos, contactar:

**Equipo de Desarrollo:**
- Email: dev@adra.org.pe
- Repositorio: https://github.com/ToMiPe/lima/issues

**Información a incluir en reporte:**

1. **Descripción del problema**
2. **Pasos para reproducir**
3. **Logs de Console** (copiar/pegar)
4. **Screenshot** si aplica
5. **Navegador y versión**
6. **Fecha/hora del incidente**
7. **Archivos relevantes** (CSV si el problema es con datos)

---

## 9. SEGURIDAD

### 9.1. Control de Acceso

#### **Autenticación (Recomendación):**

Actualmente la aplicación **NO tiene autenticación** (es pública).

**Para agregar autenticación:**

1. **Usar Azure AD / OAuth2:**

`src/app/core/auth/auth.guard.ts`:

```typescript
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
```

2. **Aplicar guard en rutas:**

`src/app/app.routes.ts`:

```typescript
{
  path: 'reports',
  canActivate: [authGuard],
  loadChildren: () => import('./features/reports/reports.routes')
}
```

#### **Autorización por Roles:**

Si necesitas roles (Admin, Analista, Visualizador):

```typescript
export const roleGuard = (allowedRoles: string[]) => {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);
    
    const userRole = authService.getUserRole();
    
    if (allowedRoles.includes(userRole)) {
      return true;
    }
    
    router.navigate(['/unauthorized']);
    return false;
  };
};

// Uso:
{
  path: 'admin/config',
  canActivate: [roleGuard(['Admin'])]
}
```

### 9.2. Protección de Datos Sensibles

#### **No incluir datos sensibles en repositorio:**

`.gitignore`:

```
# Datos sensibles
src/assets/data/reporte_cartera.csv
.env
.env.local
```

#### **Variables de entorno para producción:**

Usar variables de entorno en lugar de hardcodear:

```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiUrl: process.env['API_URL'],
  mapStyle: process.env['MAP_STYLE_URL']
};
```

### 9.3. HTTPS y Certificados SSL

#### **Configurar HTTPS en NGINX:**

```nginx
server {
    listen 443 ssl http2;
    server_name lima.adra.org.pe;
    
    ssl_certificate /etc/ssl/certs/lima_adra.crt;
    ssl_certificate_key /etc/ssl/private/lima_adra.key;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # ... resto de config ...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name lima.adra.org.pe;
    return 301 https://$server_name$request_uri;
}
```

#### **Obtener certificado Let's Encrypt (gratis):**

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d lima.adra.org.pe
```

### 9.4. Content Security Policy (CSP)

Agregar headers de seguridad en NGINX:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://basemaps.cartocdn.com;" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

---

## 10. APÉNDICES

### 10.1. Estructura del Código (Resumen)

```
src/app/
├── core/                           # Lógica de negocio core
│   └── cartera/
│       ├── models/                 # Modelos de datos
│       └── repositories/           # Acceso a datos
│
├── features/                       # Funcionalidades por módulo
│   └── reports/
│       ├── pages/                  # Páginas/vistas
│       ├── services/               # Lógica de negocio
│       └── models/                 # Modelos específicos
│
└── shared/                         # Componentes compartidos
```

### 10.2. Comandos Rápidos

```bash
# Desarrollo
npm run dev                 # Servidor de desarrollo

# Build
npm run build               # Build de producción
npm run build:watch         # Build con watch mode

# Testing (si se configura)
npm run test                # Ejecutar tests
npm run test:coverage       # Con cobertura

# Linting
npm run lint                # Verificar código
npm run lint:fix            # Autofix de errores

# Actualizar deps
npm outdated                # Ver deps desactualizadas
npm update                  # Actualizar minor/patch
npm audit                   # Verificar vulnerabilidades
npm audit fix               # Fixear vulnerabilidades
```

### 10.3. Changelog de Versiones

| Versión | Fecha | Cambios Principales |
|---------|-------|---------------------|
| **1.0.0** | Enero 2026 | - Sistema IPC con 18 indicadores<br>- 3 dimensiones (Ingreso, Voluntad, Garantía)<br>- Filtros avanzados (8 tipos)<br>- Modal de distribución de datos<br>- Visualización geográfica con MapLibre |

### 10.4. Referencias Técnicas

- **Angular Docs:** https://angular.dev/
- **PrimeNG Docs:** https://primeng.org/
- **MapLibre GL JS:** https://maplibre.org/maplibre-gl-js/docs/
- **ECharts:** https://echarts.apache.org/en/index.html
- **Tailwind CSS:** https://tailwindcss.com/docs
- **TypeScript:** https://www.typescriptlang.org/docs/

---

## FIN DEL MANUAL

**Versión:** 1.0  
**Última actualización:** Enero 2026  
**Mantenido por:** Equipo de Desarrollo ADRA

Para sugerencias o correcciones a este manual:  
📧 dev@adra.org.pe  
🔗 https://github.com/ToMiPe/lima
