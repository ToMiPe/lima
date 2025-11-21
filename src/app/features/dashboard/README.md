# 📊 Módulo Dashboard - Sistema MIRAR para ADRA

## Descripción

Módulo principal del sistema MIRAR que proporciona una vista general interactiva con:
- **Mapa de Perú** como elemento visual central
- **KPIs principales** (Beneficiarios, Montos, Departamentos, etc.)
- **Cards de reportes** para navegar a diferentes análisis
- **Diseño responsivo** con colores institucionales de ADRA

## Estructura del Módulo

```
src/app/features/dashboard/
├── pages/
│   └── home.component.ts           # Página principal del dashboard
├── components/
│   ├── kpi-card.component.ts       # Componente reutilizable de KPI
│   ├── report-card.component.ts    # Card de reporte clickeable
│   └── peru-map-svg.component.ts   # Mapa interactivo de Perú
├── services/
│   └── dashboard.service.ts        # Lógica de negocio
├── models/
│   ├── dashboard.interface.ts      # Interfaces TypeScript
│   └── index.ts                    # Barrel export
└── dashboard.routes.ts             # Configuración de rutas
```

## Características Implementadas

### ✅ Colores ADRA
- Verde primario: `#00843D`
- Azul secundario: `#005EB8`
- Amarillo acento: `#FDB913`
- Gradientes y sombras profesionales

### ✅ Componentes

#### 1. **KPI Card** (`kpi-card.component.ts`)
- Muestra indicadores clave de rendimiento
- Soporta formato: número, moneda, porcentaje
- Indicador de tendencia opcional (↑ / ↓)
- Colores personalizables
- Animación hover

#### 2. **Report Card** (`report-card.component.ts`)
- Card clickeable para navegar a reportes
- Muestra: icono, título, descripción
- Badge con cantidad de registros
- Fecha de última actualización
- Colores por categoría

#### 3. **Mapa de Perú SVG** (`peru-map-svg.component.ts`)
- Tooltip interactivo al hacer hover
- Click para filtrar por departamento
- Colores según intensidad de datos
- Responsive
- **Nota:** Actualmente muestra chips por departamento. Próxima versión incluirá SVG real del mapa.

#### 4. **Home Component** (`home.component.ts`)
- Orquesta todos los componentes
- Header con logo y acciones
- Sección hero con mapa + KPIs
- Grid de reportes disponibles
- Footer con información

### ✅ Servicio Dashboard

**Responsabilidades:**
- Calcular KPIs desde el Repository
- Generar estadísticas por departamento
- Proveer lista de reportes disponibles
- Filtrado por departamento

**Signals Reactivos:**
```typescript
kpis = signal<KPI[]>([]);
departmentStats = signal<DepartmentStats[]>([]);
availableReports = signal<ReportType[]>([]);
isLoading = signal(false);
```

### ✅ Integración

**Flujo de Datos:**
```
HomeComponent 
  → DashboardService 
    → DATA_REPOSITORY_TOKEN 
      → DexieDataRepository 
        → IndexedDB
```

**No se modificó:**
- ❌ Módulo `maps/` (sigue funcionando independiente)
- ❌ Repository Pattern (se reutiliza sin cambios)
- ❌ Dexie database (sin modificaciones)

## Rutas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | `HomeComponent` | Dashboard principal |
| `/maps` | `SimpleTestComponent` | Vista geográfica detallada |

## Uso

### Cargar el Dashboard

```typescript
// El dashboard se carga automáticamente al entrar a la app
// src/app.routes.ts ya está configurado
```

### Navegar a Reportes

```typescript
// Click en card de reporte navega automáticamente
onReportSelect(report: ReportType) {
  this.router.navigate([report.route]);
}
```

### Click en Departamento

```typescript
// Evento emitido al hacer click en el mapa
onDepartmentClick(event: MapClickEvent) {
  console.log(event.departmentName); // "Lima"
  console.log(event.stats); // { count: 1234, percentage: 25, ... }
}
```

## Próximas Mejoras

### 🔜 Fase 2
- [ ] SVG real del mapa de Perú con paths por departamento
- [ ] Animaciones de entrada (fade-in, slide-up)
- [ ] Skeleton loaders mientras carga
- [ ] Modo oscuro

### 🔜 Fase 3
- [ ] Filtros globales persistentes
- [ ] Comparador de departamentos
- [ ] Exportar dashboard a PDF
- [ ] Favoritos del usuario

### 🔜 Fase 4
- [ ] Gráficos con ECharts
- [ ] Reportes financieros
- [ ] Reportes sociales
- [ ] Tablas dinámicas con PrimeNG

## Dependencias

**Nuevas:**
- Ninguna (usa solo Angular core + PrimeIcons)

**Futuras (para gráficos y exportación):**
```bash
npm install echarts ngx-echarts
npm install pdfmake @types/pdfmake
npm install exceljs
```

## Testing

```bash
# Compilar
npm run build

# Servir en desarrollo
npm start

# Navegar a http://localhost:4200
```

## Diseño UX/UI

**Inspiración:** Looker, Metabase, Tableau  
**Patrón:** F-Pattern (lectura natural)  
**Responsive:** Mobile-first  
**Accesibilidad:** A11y en progreso

## Colores Institucionales ADRA

Ver: `src/app/shared/constants/adra-colors.constant.ts`  
Ver: `src/assets/styles/_adra-theme.scss`

---

**Desarrollado para:** Adventist Development and Relief Agency (ADRA)  
**Sistema:** MIRAR - Monitoreo e Información Regional con Análisis de Recursos
