# 📚 Arquitectura de Datos - Sistema MIRAR

## 📖 Índice

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Patrón de Diseño: Repository Pattern](#patrón-de-diseño-repository-pattern)
3. [Cómo Obtener Datos](#cómo-obtener-datos)
4. [Implementaciones Disponibles](#implementaciones-disponibles)
5. [Modelo de Datos](#modelo-de-datos)
6. [Cambiar entre Fuentes de Datos](#cambiar-entre-fuentes-de-datos)
7. [Crear Nuevos Métodos](#crear-nuevos-métodos)
8. [Ejemplos de Uso](#ejemplos-de-uso)
9. [Buenas Prácticas](#buenas-prácticas)

---

## 📝 Resumen Ejecutivo

El sistema MIRAR implementa el **Repository Pattern** para abstraer el acceso a datos de cartera. Esto permite:

- ✅ **Cambiar fácilmente** entre CSV local y API REST
- ✅ **Testear** componentes sin depender de datos reales
- ✅ **Escalar** agregando nuevas fuentes (GraphQL, Firebase, etc.)
- ✅ **Mantener** componentes limpios y desacoplados

---

## 🏗️ Patrón de Diseño: Repository Pattern

### ¿Qué es?

El **Repository Pattern** es un patrón de diseño que actúa como intermediario entre la capa de dominio y la capa de acceso a datos. Encapsula la lógica de acceso a datos y proporciona una interfaz uniforme.

### Arquitectura

```
┌─────────────────────────────────────────────────────┐
│           COMPONENTES / SERVICIOS                    │
│  (home.component, dashboard.service, etc.)          │
└────────────────────┬────────────────────────────────┘
                     │ inject(CARTERA_REPOSITORY_TOKEN)
                     ↓
┌─────────────────────────────────────────────────────┐
│          CARTERA REPOSITORY (Interface)              │
│                                                      │
│  - initialize()                                      │
│  - getEstadisticas()                                 │
│  - getByDepartamento(dept)                          │
│  - getHHIAgencias()                                  │
│  - count(), clearData(), etc.                       │
└────────────────────┬────────────────────────────────┘
                     │ Implementaciones
        ┌────────────┴─────────────┐
        ↓                          ↓
┌──────────────────┐      ┌──────────────────┐
│ CSV Repository   │      │  API Repository  │
│                  │      │                  │
│ - IndexedDB      │      │ - HttpClient     │
│ - Dexie          │      │ - REST API       │
│ - Local CSV      │      │ - Backend        │
└──────────────────┘      └──────────────────┘
```

### Ventajas del Patrón

| Ventaja | Descripción |
|---------|-------------|
| **Desacoplamiento** | Los componentes no saben de dónde vienen los datos |
| **Testabilidad** | Fácil crear mocks del repository |
| **Mantenibilidad** | Cambios en fuente de datos no afectan componentes |
| **Flexibilidad** | Cambiar implementación sin tocar código existente |
| **Consistencia** | Todos usan la misma interfaz |

### Archivos Clave

```
src/app/core/cartera/
├── repositories/
│   ├── cartera-repository.interface.ts    ← INTERFAZ (Contrato)
│   ├── csv-cartera.repository.ts          ← Implementación CSV
│   └── api-cartera.repository.ts          ← Implementación API
├── tokens/
│   └── cartera-repository.token.ts        ← Token de inyección
└── models/
    └── reporte-cartera.interface.ts       ← Modelo de datos
```

---

## 🎯 Cómo Obtener Datos

### Paso 1: Inyectar el Repository

En cualquier componente o servicio:

```typescript
import { inject } from '@angular/core';
import { CARTERA_REPOSITORY_TOKEN } from '@core/cartera';

export class MiComponente {
  private readonly repository = inject(CARTERA_REPOSITORY_TOKEN);
  
  // Listo para usar
}
```

### Paso 2: Usar los Métodos Disponibles

```typescript
async cargarDatos() {
  // Inicializar (solo primera vez, o si quieres refrescar)
  await this.repository.initialize();
  
  // Obtener estadísticas generales
  const stats = await this.repository.getEstadisticas();
  console.log('Total beneficiarios:', stats.total);
  console.log('Por departamento:', stats.porDepartamento);
  
  // Obtener datos de un departamento específico
  const datosLima = await this.repository.getByDepartamento('LIMA');
  console.log('Créditos en Lima:', datosLima.length);
  
  // Obtener conteo total
  const total = await this.repository.count();
  
  // Análisis HHI (concentración de mercado)
  const hhiAgencias = await this.repository.getHHIAgencias();
  console.log('HHI:', hhiAgencias.hhi);
  console.log('Distribución:', hhiAgencias.distribucion);
}
```

### Paso 3: Usar Signals para Reactividad (Recomendado)

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { CARTERA_REPOSITORY_TOKEN, ReporteCartera } from '@core/cartera';

@Component({
  selector: 'app-mi-componente',
  standalone: true,
  template: `
    @if (isLoading()) {
      <p>Cargando datos...</p>
    } @else {
      <p>Total de registros: {{ datos().length }}</p>
    }
  `
})
export class MiComponente implements OnInit {
  private repository = inject(CARTERA_REPOSITORY_TOKEN);
  
  datos = signal<ReporteCartera[]>([]);
  isLoading = signal(false);
  error = signal<string | null>(null);
  
  async ngOnInit() {
    await this.cargarDatos();
  }
  
  async cargarDatos() {
    this.isLoading.set(true);
    this.error.set(null);
    
    try {
      const data = await this.repository.getByDepartamento('CUSCO');
      this.datos.set(data);
    } catch (err) {
      this.error.set('Error al cargar datos');
      console.error(err);
    } finally {
      this.isLoading.set(false);
    }
  }
}
```

---

## 🔧 Implementaciones Disponibles

### 1️⃣ CSV Local - `CsvCarteraRepository`

**Ubicación:** `src/app/core/cartera/repositories/csv-cartera.repository.ts`

#### Características
- ✅ Lee datos desde `assets/data/reporte_cartera.csv`
- ✅ Almacena en **IndexedDB** usando **Dexie** para acceso rápido
- ✅ Primera carga: descarga CSV → parsea → guarda localmente
- ✅ Siguientes cargas: lee desde IndexedDB (instantáneo)
- ✅ Funciona **offline** después de la primera carga
- ✅ Ideal para desarrollo y demos

#### Flujo de Datos

```
1. initialize()
   ↓
2. ¿Datos en IndexedDB? 
   ├─ SÍ → Leer de IndexedDB (rápido)
   └─ NO → Descargar CSV → Parsear → Guardar en IndexedDB
   ↓
3. Datos disponibles para consultas
```

#### Métodos de Consulta

```typescript
// Todos los métodos son consultas locales sobre IndexedDB
await repository.count();                      // Cuenta en tabla local
await repository.getEstadisticas();            // Agrega datos locales
await repository.getByDepartamento('LIMA');    // Filtra localmente
await repository.getHHIAgencias();             // Calcula HHI localmente
```

#### Ventajas
- 🚀 Muy rápido después de la primera carga
- 💾 No consume ancho de banda
- 📴 Funciona sin conexión
- 🛠️ Perfecto para desarrollo

#### Desventajas
- ❌ Datos estáticos (no se actualizan automáticamente)
- ❌ Primera carga más lenta (descarga todo el CSV)
- ❌ No escala bien con millones de registros

---

### 2️⃣ API REST - `ApiCarteraRepository`

**Ubicación:** `src/app/core/cartera/repositories/api-cartera.repository.ts`

#### Características
- ✅ Conecta con backend REST API
- ✅ Base URL configurable vía `environment.ts`
- ✅ Usa `HttpClient` de Angular
- ✅ Manejo de errores centralizado
- ✅ Ideal para producción

#### Configuración de Endpoints

**Base URL:** Definida en `src/environments/environment.ts`
```typescript
export const environment = {
  apiUrl: 'https://api.mirar-adra.com/v1'  // Cambiar según ambiente
};
```

#### Endpoints Implementados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `initialize()` | `GET /cartera/initialize` | Inicializa el servicio |
| `count()` | `GET /cartera/count` | Retorna total de registros |
| `getEstadisticas()` | `GET /cartera/estadisticas` | Estadísticas agregadas |
| `getByDepartamento(dept)` | `GET /cartera/departamento/:nombre` | Datos filtrados por departamento |
| `getHHIAgencias()` | `GET /cartera/hhi/agencias` | HHI por agencias |
| `getHHITipoCredito()` | `GET /cartera/hhi/tipo-credito` | HHI por tipo de crédito |
| `getHHIDestinoCredito()` | `GET /cartera/hhi/destino-credito` | HHI por destino |
| `getHHIPlazo()` | `GET /cartera/hhi/plazo` | HHI por plazo |
| `getHHIZonaGeografica()` | `GET /cartera/hhi/zona-geografica` | HHI por zona |
| `getHHISectorEconomico()` | `GET /cartera/hhi/sector-economico` | HHI por sector |
| `refreshData()` | `POST /cartera/refresh` | Fuerza actualización de datos |
| `clearData()` | `DELETE /cartera/clear` | Limpia caché del servidor |

#### Ejemplo de Respuesta API

```json
// GET /cartera/estadisticas
{
  "total": 156789,
  "porDepartamento": [
    {
      "departamento": "LIMA",
      "count": 45678,
      "montoTotal": 125000000,
      "saldoTotal": 98000000
    },
    {
      "departamento": "CUSCO",
      "count": 23456,
      "montoTotal": 67000000,
      "saldoTotal": 54000000
    }
  ],
  "porGenero": {
    "M": 78000,
    "F": 78789
  },
  "totalMontoColocado": 450000000,
  "totalSaldoActual": 380000000
}
```

#### Ventajas
- ✅ Datos siempre actualizados
- ✅ Procesamiento en servidor (más rápido para consultas complejas)
- ✅ Escalable a millones de registros
- ✅ Seguridad centralizada
- ✅ Permite filtros avanzados en servidor

#### Desventajas
- ❌ Requiere conexión a internet
- ❌ Depende de disponibilidad del backend
- ❌ Latencia de red

---

## 📊 Modelo de Datos

### `ReporteCartera` Interface

**Ubicación:** `src/app/core/cartera/models/reporte-cartera.interface.ts`

El modelo principal tiene **102 campos** organizados en categorías:

#### 1. Información Geográfica
```typescript
{
  departamento: string;        // Ej: "LIMA"
  provincia: string;           // Ej: "LIMA"
  distrito: string;            // Ej: "MIRAFLORES"
  latitud: number;            // Ej: -12.1234
  longitud: number;           // Ej: -77.5678
}
```

#### 2. Información del Cliente
```typescript
{
  cod_cliente: number;         // ID único del cliente
  cliente: string;             // Nombre completo
  genero: 'M' | 'F';          // Género
  edad: number;               // Edad en años
}
```

#### 3. Información de Crédito
```typescript
{
  cod_credito: number;         // ID del crédito
  monto_colocado: number;      // Monto inicial del préstamo
  saldo_total: number;         // Saldo actual pendiente
  tipo_credito: string;        // Ej: "INDIVIDUAL", "GRUPAL"
  destino_credito: string;     // Ej: "COMERCIO", "AGRICULTURA"
  clasificacion: string;       // Ej: "NORMAL", "CPP", "DEFICIENTE"
  situacion: string;           // Ej: "VIGENTE", "VENCIDO"
  dias_atraso: number;         // Días de mora
  fecha_desembolso: string;    // ISO date
  fecha_vencimiento: string;   // ISO date
}
```

#### 4. Información de Agencia
```typescript
{
  cod_agencia: number;         // ID de la agencia
  agencia: string;             // Nombre de la agencia
  asesor_servicios: string;    // Nombre del asesor
}
```

#### 5. Información Financiera Adicional
```typescript
{
  tasa_interes: number;        // % anual
  plazo_credito: number;       // En meses
  cuota_mensual: number;       // Monto de la cuota
  saldo_capital: number;
  saldo_interes: number;
  saldo_mora: number;
  // ... y muchos más campos
}
```

### Modelos Complementarios

#### `EstadisticasCartera`
```typescript
interface EstadisticasCartera {
  total: number;
  porDepartamento: DepartamentoStats[];
  porGenero: Record<string, number>;
  totalMontoColocado: number;
  totalSaldoActual: number;
}
```

#### `HHIResult`
```typescript
interface HHIResult {
  hhi: number;                 // Índice Herfindahl-Hirschman (0-10000)
  distribucion: Array<{
    categoria: string;
    count: number;
    porcentaje: number;
    participacion: number;
  }>;
  interpretacion: string;      // "Altamente concentrado" | "Moderado" | "Competitivo"
}
```

---

## 🔄 Cambiar entre Fuentes de Datos

### Configuración Actual

**Ubicación:** `src/app.config.ts`

```typescript
import { ApplicationConfig } from '@angular/core';
import { CARTERA_REPOSITORY_TOKEN } from '@core/cartera';
import { CsvCarteraRepository } from '@core/cartera/repositories/csv-cartera.repository';
// import { ApiCarteraRepository } from '@core/cartera/repositories/api-cartera.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    // Opción 1: Usar CSV Local (ACTIVO)
    { provide: CARTERA_REPOSITORY_TOKEN, useClass: CsvCarteraRepository },
    
    // Opción 2: Usar API REST (Comentado)
    // { provide: CARTERA_REPOSITORY_TOKEN, useClass: ApiCarteraRepository },
    
    // ... otros providers
  ]
};
```

### Cambiar a API REST

**Paso 1:** Actualizar `src/environments/environment.ts`
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.mirar-adra.com/v1'  // URL de tu backend
};
```

**Paso 2:** Modificar `src/app.config.ts`
```typescript
import { ApiCarteraRepository } from '@core/cartera/repositories/api-cartera.repository';

export const appConfig: ApplicationConfig = {
  providers: [
    // Cambiar a API
    { provide: CARTERA_REPOSITORY_TOKEN, useClass: ApiCarteraRepository },
    
    // ... otros providers
  ]
};
```

**¡Eso es todo!** No necesitas cambiar ningún componente. 🎉

### Usar Diferentes Fuentes por Ambiente

```typescript
import { environment } from '@environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: CARTERA_REPOSITORY_TOKEN,
      useClass: environment.production 
        ? ApiCarteraRepository    // Producción: API
        : CsvCarteraRepository    // Desarrollo: CSV
    },
    // ... otros providers
  ]
};
```

---

## ➕ Crear Nuevos Métodos

### Escenario: Necesitas Obtener Datos por Provincia

#### Paso 1: Actualizar la Interfaz

**Archivo:** `src/app/core/cartera/repositories/cartera-repository.interface.ts`

```typescript
export interface CarteraRepository {
  // ... métodos existentes
  
  /**
   * Obtiene todos los reportes de una provincia específica
   * @param departamento Nombre del departamento
   * @param provincia Nombre de la provincia
   * @returns Promise con array de reportes
   */
  getByProvincia(departamento: string, provincia: string): Promise<ReporteCartera[]>;
}
```

#### Paso 2: Implementar en CSV Repository

**Archivo:** `src/app/core/cartera/repositories/csv-cartera.repository.ts`

```typescript
async getByProvincia(departamento: string, provincia: string): Promise<ReporteCartera[]> {
  await this.ensureInitialized();
  
  return await this.db.reportes
    .where('departamento').equalsIgnoreCase(departamento)
    .and(item => item.provincia.toUpperCase() === provincia.toUpperCase())
    .toArray();
}
```

#### Paso 3: Implementar en API Repository

**Archivo:** `src/app/core/cartera/repositories/api-cartera.repository.ts`

```typescript
async getByProvincia(departamento: string, provincia: string): Promise<ReporteCartera[]> {
  const url = `${this.baseUrl}/cartera/provincia/${departamento}/${provincia}`;
  return firstValueFrom(this.http.get<ReporteCartera[]>(url));
}
```

#### Paso 4: Usar en Componentes

```typescript
export class MiComponente {
  private repository = inject(CARTERA_REPOSITORY_TOKEN);
  
  async cargarProvincia() {
    const datos = await this.repository.getByProvincia('LIMA', 'CALLAO');
    console.log('Créditos en Callao:', datos.length);
  }
}
```

### Ejemplo: Método para Datos de Mapas

```typescript
// En la interfaz
interface CarteraRepository {
  /**
   * Obtiene puntos de créditos dentro de un área geográfica
   * @param bounds Límites del mapa (lat/lng min/max)
   * @returns Puntos para visualizar en mapa
   */
  getByBounds(bounds: BoundingBox): Promise<MapPoint[]>;
}

// Implementación CSV
async getByBounds(bounds: BoundingBox): Promise<MapPoint[]> {
  await this.ensureInitialized();
  
  const reportes = await this.db.reportes
    .where('latitud').between(bounds.latMin, bounds.latMax)
    .and(item => 
      item.longitud >= bounds.lngMin && 
      item.longitud <= bounds.lngMax
    )
    .toArray();
  
  return reportes.map(r => ({
    lat: r.latitud,
    lng: r.longitud,
    monto: r.monto_colocado,
    cliente: r.cliente
  }));
}

// Implementación API
async getByBounds(bounds: BoundingBox): Promise<MapPoint[]> {
  const params = new HttpParams()
    .set('latMin', bounds.latMin)
    .set('latMax', bounds.latMax)
    .set('lngMin', bounds.lngMin)
    .set('lngMax', bounds.lngMax);
  
  return firstValueFrom(
    this.http.get<MapPoint[]>(`${this.baseUrl}/cartera/map/bounds`, { params })
  );
}
```

---

## 💡 Ejemplos de Uso

### Ejemplo 1: Dashboard con KPIs

```typescript
import { Component, OnInit, signal } from '@angular/core';
import { CARTERA_REPOSITORY_TOKEN } from '@core/cartera';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="kpi-grid">
      <div class="kpi-card">
        <h3>Total Beneficiarios</h3>
        <p class="kpi-value">{{ totalBeneficiarios() }}</p>
      </div>
      <div class="kpi-card">
        <h3>Monto Total Colocado</h3>
        <p class="kpi-value">{{ montoTotal() | currency:'PEN' }}</p>
      </div>
      <div class="kpi-card">
        <h3>Saldo Actual</h3>
        <p class="kpi-value">{{ saldoTotal() | currency:'PEN' }}</p>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private repository = inject(CARTERA_REPOSITORY_TOKEN);
  
  totalBeneficiarios = signal(0);
  montoTotal = signal(0);
  saldoTotal = signal(0);
  
  async ngOnInit() {
    const stats = await this.repository.getEstadisticas();
    
    this.totalBeneficiarios.set(stats.total);
    this.montoTotal.set(stats.totalMontoColocado);
    this.saldoTotal.set(stats.totalSaldoActual);
  }
}
```

### Ejemplo 2: Filtro por Departamento

```typescript
@Component({
  selector: 'app-department-filter',
  standalone: true,
  template: `
    <select [(ngModel)]="selectedDept" (change)="onDeptChange()">
      <option value="">Todos los departamentos</option>
      <option *ngFor="let dept of departments" [value]="dept">
        {{ dept }}
      </option>
    </select>
    
    <div class="results">
      <p>Créditos encontrados: {{ datos().length }}</p>
      <table>
        <tr *ngFor="let item of datos()">
          <td>{{ item.cliente }}</td>
          <td>{{ item.monto_colocado | currency:'PEN' }}</td>
        </tr>
      </table>
    </div>
  `
})
export class DepartmentFilterComponent {
  private repository = inject(CARTERA_REPOSITORY_TOKEN);
  
  selectedDept = '';
  departments = ['LIMA', 'CUSCO', 'AREQUIPA', 'PUNO', 'CAJAMARCA'];
  datos = signal<ReporteCartera[]>([]);
  
  async onDeptChange() {
    if (this.selectedDept) {
      const data = await this.repository.getByDepartamento(this.selectedDept);
      this.datos.set(data);
    } else {
      this.datos.set([]);
    }
  }
}
```

### Ejemplo 3: Análisis HHI con Visualización

```typescript
@Component({
  selector: 'app-hhi-analysis',
  standalone: true,
  template: `
    <div class="hhi-container">
      <h2>Análisis de Concentración (HHI)</h2>
      
      <div class="hhi-score">
        <span class="label">Índice HHI:</span>
        <span class="value" [class.high]="hhiData()?.hhi > 2500">
          {{ hhiData()?.hhi }}
        </span>
        <span class="interpretation">
          {{ hhiData()?.interpretacion }}
        </span>
      </div>
      
      <div class="distribution-chart">
        <div *ngFor="let item of hhiData()?.distribucion" 
             class="bar-item">
          <span class="name">{{ item.categoria }}</span>
          <div class="bar" 
               [style.width.%]="item.porcentaje">
            {{ item.porcentaje }}%
          </div>
        </div>
      </div>
    </div>
  `
})
export class HHIAnalysisComponent implements OnInit {
  private repository = inject(CARTERA_REPOSITORY_TOKEN);
  
  hhiData = signal<HHIResult | null>(null);
  
  async ngOnInit() {
    const result = await this.repository.getHHIAgencias();
    this.hhiData.set(result);
  }
}
```

### Ejemplo 4: Mapa Interactivo

```typescript
@Component({
  selector: 'app-map-view',
  standalone: true,
  template: `
    <div class="map-container">
      <app-peru-map 
        (departmentClick)="onDeptClick($event)">
      </app-peru-map>
      
      @if (selectedDeptData()) {
        <div class="dept-details">
          <h3>{{ selectedDept }}</h3>
          <p>Total créditos: {{ selectedDeptData().length }}</p>
          <p>Monto total: {{ calcularMontoTotal() | currency:'PEN' }}</p>
        </div>
      }
    </div>
  `
})
export class MapViewComponent {
  private repository = inject(CARTERA_REPOSITORY_TOKEN);
  
  selectedDept = '';
  selectedDeptData = signal<ReporteCartera[]>([]);
  
  async onDeptClick(event: MapClickEvent) {
    this.selectedDept = event.departmentName;
    const data = await this.repository.getByDepartamento(this.selectedDept);
    this.selectedDeptData.set(data);
  }
  
  calcularMontoTotal(): number {
    return this.selectedDeptData().reduce(
      (sum, item) => sum + item.monto_colocado, 
      0
    );
  }
}
```

### Ejemplo 5: Servicio Reutilizable

```typescript
// src/app/features/maps/services/map-data.service.ts

import { Injectable, inject } from '@angular/core';
import { CARTERA_REPOSITORY_TOKEN, ReporteCartera } from '@core/cartera';

@Injectable({
  providedIn: 'root'
})
export class MapDataService {
  private repository = inject(CARTERA_REPOSITORY_TOKEN);
  
  /**
   * Obtiene puntos de mapa agrupados por provincia
   */
  async getMapPointsByProvince(departamento: string) {
    const data = await this.repository.getByDepartamento(departamento);
    
    // Agrupar por provincia
    const grouped = data.reduce((acc, item) => {
      const key = item.provincia;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push({
        lat: item.latitud,
        lng: item.longitud,
        monto: item.monto_colocado,
        cliente: item.cliente
      });
      return acc;
    }, {} as Record<string, any[]>);
    
    return grouped;
  }
  
  /**
   * Calcula densidad de créditos por área
   */
  async calculateDensity(bounds: BoundingBox) {
    // Implementar lógica de densidad
    // Podría requerir un nuevo método en el repository
  }
  
  /**
   * Obtiene top N distritos por monto
   */
  async getTopDistritos(departamento: string, limit: number = 10) {
    const data = await this.repository.getByDepartamento(departamento);
    
    const porDistrito = data.reduce((acc, item) => {
      const key = item.distrito;
      if (!acc[key]) {
        acc[key] = { distrito: key, monto: 0, count: 0 };
      }
      acc[key].monto += item.monto_colocado;
      acc[key].count += 1;
      return acc;
    }, {} as Record<string, any>);
    
    return Object.values(porDistrito)
      .sort((a, b) => b.monto - a.monto)
      .slice(0, limit);
  }
}
```

---

## ✅ Buenas Prácticas

### 1. Siempre Inicializar

```typescript
// ✅ CORRECTO
async ngOnInit() {
  await this.repository.initialize();
  const data = await this.repository.getEstadisticas();
}

// ❌ INCORRECTO (puede fallar si no está inicializado)
async ngOnInit() {
  const data = await this.repository.getEstadisticas();
}
```

### 2. Manejo de Errores

```typescript
// ✅ CORRECTO
async cargarDatos() {
  try {
    const data = await this.repository.getByDepartamento('LIMA');
    this.datos.set(data);
    this.error.set(null);
  } catch (error) {
    console.error('Error cargando datos:', error);
    this.error.set('No se pudieron cargar los datos');
    this.datos.set([]);
  }
}

// ❌ INCORRECTO (sin manejo de errores)
async cargarDatos() {
  const data = await this.repository.getByDepartamento('LIMA');
  this.datos.set(data);
}
```

### 3. Usar Signals para Estado

```typescript
// ✅ CORRECTO (reactivo)
export class MiComponente {
  datos = signal<ReporteCartera[]>([]);
  isLoading = signal(false);
  
  async cargar() {
    this.isLoading.set(true);
    try {
      const data = await this.repository.getEstadisticas();
      this.datos.set(data);
    } finally {
      this.isLoading.set(false);
    }
  }
}

// ❌ EVITAR (no reactivo)
export class MiComponente {
  datos: ReporteCartera[] = [];
  isLoading = false;
}
```

### 4. Nombres de Departamento Consistentes

```typescript
// ✅ CORRECTO
const data = await this.repository.getByDepartamento('LIMA');

// ❌ INCORRECTO (puede no encontrar datos)
const data = await this.repository.getByDepartamento('lima');
const data = await this.repository.getByDepartamento('Lima');
```

**Nota:** Los departamentos están en MAYÚSCULAS en los datos. El repository hace `equalsIgnoreCase` pero es mejor ser consistente.

### 5. No Llamar Initialize Múltiples Veces

```typescript
// ✅ CORRECTO
export class AppComponent implements OnInit {
  private repository = inject(CARTERA_REPOSITORY_TOKEN);
  
  async ngOnInit() {
    await this.repository.initialize(); // Solo una vez al inicio
  }
}

// ❌ INCORRECTO
async cargarDatos1() {
  await this.repository.initialize(); // ❌
  const data = await this.repository.getEstadisticas();
}

async cargarDatos2() {
  await this.repository.initialize(); // ❌ No es necesario
  const data = await this.repository.getByDepartamento('LIMA');
}
```

### 6. Cachear Datos Costosos

```typescript
// ✅ CORRECTO
export class MiServicio {
  private repository = inject(CARTERA_REPOSITORY_TOKEN);
  private estadisticasCache = signal<EstadisticasCartera | null>(null);
  
  async getEstadisticas(forceRefresh = false) {
    if (!this.estadisticasCache() || forceRefresh) {
      const stats = await this.repository.getEstadisticas();
      this.estadisticasCache.set(stats);
    }
    return this.estadisticasCache()!;
  }
}
```

### 7. Typed Injections

```typescript
// ✅ CORRECTO (con tipo explícito)
import { CarteraRepository, CARTERA_REPOSITORY_TOKEN } from '@core/cartera';

export class MiComponente {
  private readonly repository: CarteraRepository = inject(CARTERA_REPOSITORY_TOKEN);
}

// ✅ TAMBIÉN CORRECTO (inferencia automática)
private readonly repository = inject(CARTERA_REPOSITORY_TOKEN);
```

### 8. Cleanup en OnDestroy

```typescript
// ✅ CORRECTO (si tienes subscripciones)
export class MiComponente implements OnInit, OnDestroy {
  private repository = inject(CARTERA_REPOSITORY_TOKEN);
  private destroy$ = new Subject<void>();
  
  ngOnInit() {
    // Si tuvieras observables...
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### 9. Testing con Mocks

```typescript
// tests/mi-componente.spec.ts

import { TestBed } from '@angular/core/testing';
import { CARTERA_REPOSITORY_TOKEN } from '@core/cartera';

describe('MiComponente', () => {
  let mockRepository: jasmine.SpyObj<CarteraRepository>;
  
  beforeEach(() => {
    // Crear mock del repository
    mockRepository = jasmine.createSpyObj('CarteraRepository', [
      'initialize',
      'getEstadisticas',
      'getByDepartamento'
    ]);
    
    // Configurar respuestas mock
    mockRepository.getEstadisticas.and.returnValue(Promise.resolve({
      total: 1000,
      porDepartamento: [],
      porGenero: {},
      totalMontoColocado: 0,
      totalSaldoActual: 0
    }));
    
    TestBed.configureTestingModule({
      providers: [
        { provide: CARTERA_REPOSITORY_TOKEN, useValue: mockRepository }
      ]
    });
  });
  
  it('should load statistics', async () => {
    const component = TestBed.createComponent(MiComponente).componentInstance;
    await component.ngOnInit();
    
    expect(mockRepository.getEstadisticas).toHaveBeenCalled();
    expect(component.total()).toBe(1000);
  });
});
```

### 10. Documentar Métodos Personalizados

```typescript
/**
 * Obtiene los créditos de una provincia específica
 * 
 * @param departamento - Nombre del departamento en MAYÚSCULAS
 * @param provincia - Nombre de la provincia en MAYÚSCULAS
 * @returns Promise con array de reportes de cartera
 * @throws Error si el departamento o provincia no existen
 * 
 * @example
 * ```typescript
 * const datos = await repository.getByProvincia('LIMA', 'CALLAO');
 * console.log(`Total créditos: ${datos.length}`);
 * ```
 */
async getByProvincia(
  departamento: string, 
  provincia: string
): Promise<ReporteCartera[]> {
  // implementación
}
```

---

## 🎓 Resumen

### Para Obtener Datos:
1. **Inyectar** `CARTERA_REPOSITORY_TOKEN`
2. **Inicializar** con `initialize()`
3. **Usar métodos** de la interfaz `CarteraRepository`
4. **Manejar errores** apropiadamente
5. **Usar Signals** para reactividad

### Patrón Repository:
- **Interfaz única** = `CarteraRepository`
- **Múltiples implementaciones** = CSV, API, Mock
- **Cambio transparente** = Solo modificar `app.config.ts`
- **Componentes desacoplados** = No saben de dónde vienen los datos

### Archivos Clave:
- `repositories/cartera-repository.interface.ts` - Contrato
- `repositories/csv-cartera.repository.ts` - Implementación CSV
- `repositories/api-cartera.repository.ts` - Implementación API
- `tokens/cartera-repository.token.ts` - Token de inyección
- `src/app.config.ts` - Configuración activa

---

## 📞 Contacto y Soporte

Para preguntas sobre la arquitectura de datos:
- Revisar este documento primero
- Consultar código en `src/app/core/cartera/`
- Revisar ejemplos en `src/app/features/dashboard/`
- Consultar con el equipo de arquitectura

---

**Última actualización:** Noviembre 21, 2025  
**Versión:** 1.0.0  
**Proyecto:** MIRAR - Sistema de Análisis de Cartera ADRA
