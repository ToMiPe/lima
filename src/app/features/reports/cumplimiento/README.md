# 📊 Módulo de Reporte de Cumplimiento Georreferenciado

## 📝 Descripción

Módulo completo para visualizar y analizar el cumplimiento de créditos en un mapa interactivo. Cada crédito se muestra con un color según su nivel de riesgo basado en el porcentaje de saldo pendiente.

## 🎯 Características

- ✅ **Visualización geográfica** de créditos en mapa interactivo
- ✅ **Clasificación por riesgo** con código de colores
- ✅ **Clustering inteligente** para grandes volúmenes de datos
- ✅ **Filtros avanzados** por agencia, tipo de crédito, situación, etc.
- ✅ **Panel estadístico** con métricas clave
- ✅ **Detalle completo** de cada crédito al hacer click
- ✅ **Búsqueda en tiempo real**
- ✅ **Responsive** y optimizado

## 🗺️ Clasificación de Riesgo

| Color | Clasificación | Rango | Descripción |
|-------|--------------|-------|-------------|
| 🟢 Verde | Bajo Riesgo | ≤ 49% | Cliente con buen avance de pago |
| 🟠 Naranja | Riesgo Medio | 50-75% | Riesgo moderado |
| 🔴 Rojo | Alto Riesgo | ≥ 76% | Alto porcentaje de deuda pendiente |

### Fórmula de Cálculo

```typescript
porcentaje = (monto_colocado / saldo_capital) * 100
```

**Interpretación:**
- **Mayor %** = Mayor proporción de deuda respecto al monto inicial
- **100%** = No ha pagado nada (saldo igual al monto colocado)
- **>100%** = Debe más que el monto inicial (intereses/mora) → Se cap a 100%

## 📁 Estructura del Módulo

```
features/reports/
├── cumplimiento/
│   ├── pages/
│   │   ├── cumplimiento-map.component.ts      ← Componente principal
│   │   ├── cumplimiento-map.component.html    ← Template
│   │   └── cumplimiento-map.component.scss    ← Estilos
│   ├── cumplimiento.routes.ts                 ← Rutas
│   └── README.md                               ← Este archivo
├── services/
│   └── cumplimiento-report.service.ts          ← Lógica de negocio
└── models/
    └── cumplimiento-report.model.ts            ← Interfaces y tipos
```

## 🚀 Uso

### Rutas

```typescript
/reports/cumplimiento              // Todos los departamentos
/reports/cumplimiento/:departamento // Departamento específico
```

### En un Componente

```typescript
import { CumplimientoReportService } from '@features/reports';

export class MiComponente {
  private cumplimientoService = inject(CumplimientoReportService);
  
  async cargarDatos() {
    // Inicializar
    await this.cumplimientoService.initialize();
    
    // Obtener puntos por departamento
    const puntos = await this.cumplimientoService.getPuntosByDepartamento('LIMA');
    
    // Generar resumen
    const summary = this.cumplimientoService.generarSummary(puntos);
    
    console.log('Total puntos:', summary.totalRegistrosProcesados);
    console.log('Rojos:', summary.distribucion.rojo);
  }
}
```

### Aplicar Filtros

```typescript
const filtros: FiltrosCumplimiento = {
  departamento: 'LIMA',
  colores: ['rojo', 'naranja'],  // Solo alto y medio riesgo
  agencias: ['AGENCIA CENTRAL', 'AGENCIA NORTE'],
  montoMin: 5000,
  montoMax: 50000,
  situaciones: ['VIGENTE'],
  textoBusqueda: 'Juan'
};

const puntosFiltrados = await service.getPuntosCumplimiento(filtros);
```

## 🔧 Servicios

### `CumplimientoReportService`

#### Métodos Principales

| Método | Descripción |
|--------|-------------|
| `initialize()` | Inicializa el repositorio de datos |
| `getPuntosCumplimiento(filtros?)` | Obtiene puntos con filtros opcionales |
| `getPuntosByDepartamento(dept)` | Obtiene puntos de un departamento |
| `generarSummary(puntos)` | Genera estadísticas del reporte |
| `toGeoJSON(puntos)` | Convierte a formato GeoJSON |
| `getOpcionesFiltros()` | Obtiene opciones para filtros |

#### Signals Reactivos

```typescript
service.loading()      // Estado de carga
service.errorMessage() // Mensajes de error
service.puntos()       // Puntos procesados
service.excluidos()    // Registros excluidos
```

## 📊 Modelos

### `PuntoCumplimiento`

```typescript
interface PuntoCumplimiento {
  // Identificación
  id: string;
  
  // Geolocalización
  latitud: number;
  longitud: number;
  
  // Cálculo
  montoColocado: number;
  saldoCapital: number;
  porcentajeCumplimiento: number;
  
  // Clasificación
  color: 'verde' | 'naranja' | 'rojo';
  clasificacion: 'Bajo Riesgo' | 'Riesgo Medio' | 'Alto Riesgo';
  
  // Información del crédito
  codCredito: string;
  tipoCredito: string;
  situacion: string;
  diasAtraso: number;
  
  // Información del cliente
  codCliente: number;
  nombreCliente: string;
  genero: 'M' | 'F';
  
  // Información de la agencia
  codAgencia: number;
  nombreAgencia: string;
  asesor: string;
  
  // Información geográfica
  departamento: string;
  provincia: string;
  distrito: string;
}
```

### `ReporteSummary`

Estadísticas agregadas del reporte:
- Total de registros procesados/excluidos
- Distribución por clasificación
- Porcentajes (min, max, promedio, mediana)
- Montos totales y promedios

## 🎨 Componente de Mapa

### Features

- **Mapa interactivo** con MapLibre GL
- **Clustering** configurable (radio: 60px, maxZoom: 14)
- **Popups** informativos al hover
- **Drawer lateral** con detalle completo
- **Filtros avanzados** en panel lateral
- **Panel de estadísticas** en tiempo real
- **Leyenda** de colores
- **Búsqueda** de clientes/créditos

### Controles

| Acción | Descripción |
|--------|-------------|
| Click en punto | Muestra detalle en drawer |
| Click en cluster | Hace zoom en el área |
| Hover en punto | Muestra popup con info rápida |
| Filtros | Panel lateral izquierdo |
| Estadísticas | Panel lateral derecho |
| Búsqueda | Barra superior |

## 🔍 Validaciones y Exclusiones

### Registros Excluidos

El servicio automáticamente excluye registros con:

| Razón | Descripción |
|-------|-------------|
| `SIN_LATITUD` | Latitud nula o indefinida |
| `SIN_LONGITUD` | Longitud nula o indefinida |
| `UBICACION_FUERA_PERU` | Coordenadas fuera de Perú |
| `SALDO_CERO` | Crédito completado (saldo = 0) |
| `MONTO_INVALIDO` | Monto colocado inválido |
| `DATOS_INCOMPLETOS` | Faltan datos críticos |

### Límites Geográficos (Perú)

```typescript
Latitud:  -18.5  a  0.5
Longitud: -82.0  a  -68.0
```

Los registros fuera de estos rangos se excluyen automáticamente.

## 📈 Performance

### Optimizaciones

- ✅ **Clustering** para grandes volúmenes (hasta 50k puntos)
- ✅ **Lazy loading** de componentes
- ✅ **Signals** para reactividad óptima
- ✅ **ChangeDetection OnPush**
- ✅ **GeoJSON** optimizado para MapLibre

### Recomendaciones

- Usar clustering para >1000 puntos
- Filtrar por departamento para datasets grandes
- Implementar paginación en backend para >100k registros

## 🧪 Testing

```typescript
// Mock del servicio
const mockService = jasmine.createSpyObj('CumplimientoReportService', [
  'initialize',
  'getPuntosCumplimiento',
  'generarSummary'
]);

mockService.getPuntosCumplimiento.and.returnValue(Promise.resolve([
  {
    id: '1',
    latitud: -12.0464,
    longitud: -77.0428,
    porcentajeCumplimiento: 85,
    color: 'rojo',
    clasificacion: 'Alto Riesgo',
    // ... otros campos
  }
]));

TestBed.configureTestingModule({
  providers: [
    { provide: CumplimientoReportService, useValue: mockService }
  ]
});
```

## 📚 Documentación Relacionada

- [`DATA_ARCHITECTURE.md`](../../core/cartera/DATA_ARCHITECTURE.md) - Arquitectura de datos general
- [MapLibre GL JS Docs](https://maplibre.org/maplibre-gl-js-docs/api/) - API del mapa
- [Teritorio Cluster](https://github.com/teritorio/maplibre-gl-teritorio-cluster) - Plugin de clustering

## 🔄 Actualizaciones Futuras

### Roadmap

- [ ] Exportación a CSV/Excel
- [ ] Heatmap adicional al clustering
- [ ] Comparación temporal (tendencias)
- [ ] Alertas automáticas de alto riesgo
- [ ] Integración con sistema de notificaciones
- [ ] Dashboard de métricas específico
- [ ] Reportes programados

## 🐛 Troubleshooting

### Problema: No se muestran puntos en el mapa

**Solución:**
1. Verificar que los datos tengan `latitud` y `longitud` válidos
2. Revisar console para registros excluidos
3. Verificar que las coordenadas estén dentro de Perú

### Problema: Clustering no funciona

**Solución:**
1. Verificar que `clusteringEnabled` esté en `true`
2. Revisar que hay suficientes puntos (min 2)
3. Aumentar el zoom para ver puntos individuales

### Problema: Filtros no aplican

**Solución:**
1. Llamar `aplicarFiltros()` después de cambiar filtros
2. Verificar que los valores de filtro coincidan con los datos
3. Revisar console para errores

## 👥 Contribuciones

Para agregar nuevas funcionalidades:

1. Actualizar modelos en `cumplimiento-report.model.ts`
2. Implementar lógica en `cumplimiento-report.service.ts`
3. Actualizar UI en `cumplimiento-map.component.*`
4. Agregar tests
5. Actualizar este README

---

**Última actualización:** Noviembre 21, 2025  
**Versión:** 1.0.0  
**Autor:** MIRAR Development Team
