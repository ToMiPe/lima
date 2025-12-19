# 📘 MIRAR - Stack de Desarrollo y Funcionalidad

## 🎯 ¿Qué es MIRAR?

**MIRAR** (Monitoreo e Información Regional con Análisis de Recursos) es un sistema web desarrollado para **ADRA** (Adventist Development and Relief Agency) que proporciona análisis avanzados de cartera de créditos con:

- 📊 **Visualización de indicadores** de concentración HHI (Herfindahl-Hirschman Index)
- 🗺️ **Mapas interactivos** de Perú con datos por departamento
- 📈 **Reportes especializados** de cumplimiento y análisis crediticio
- 💼 **Dashboard ejecutivo** con KPIs principales

---

## 🏗️ Stack Tecnológico

### Frontend Framework

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Angular** | 20.3.x | Framework principal SPA |
| **TypeScript** | 5.9.x | Lenguaje de programación |
| **RxJS** | 7.8.x | Programación reactiva |

**Características Angular utilizadas:**
- ✅ **Signals** - Estado reactivo moderno
- ✅ **Standalone Components** - Sin NgModules
- ✅ **Control Flow nativo** (`@if`, `@for`, `@switch`)
- ✅ **Lazy Loading** - Carga diferida de módulos
- ✅ **OnPush Change Detection** - Optimización de rendimiento
- ✅ **inject()** - Inyección de dependencias funcional

### UI Framework & Estilos

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **PrimeNG** | 20.2.x | Biblioteca de componentes UI (sin PrimeFlex) |
| **PrimeIcons** | 7.0.x | Sistema de iconos |
| **@primeuix/themes** | 1.2.x | Sistema de temas |
| **Tailwind CSS** | 4.1.x | Framework de utilidades CSS (reemplaza PrimeFlex) |
| **tailwindcss-primeui** | 0.6.x | Integración PrimeNG 20 + Tailwind |
| **Sass (SCSS)** | Latest | Preprocesador CSS |

**Colores institucionales ADRA:**
- 🟢 Verde primario: `#00843D`
- 🔵 Azul secundario: `#005EB8`
- 🟡 Amarillo acento: `#FDB913`

### Mapas y Visualización

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **MapLibre GL** | 5.10.x | Mapas interactivos WebGL |
| **@teritorio/maplibre-gl-teritorio-cluster** | 0.1.x | Clustering de marcadores |
| **ECharts** | 5.6.x | Gráficos y visualizaciones |
| **echarts-gl** | 2.0.x | Gráficos 3D |
| **ngx-echarts** | 20.0.x | Integración Angular + ECharts |

### Persistencia de Datos

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Dexie.js** | 4.2.x | Wrapper IndexedDB (base de datos local) |
| **IndexedDB** | Native | Base de datos del navegador |

### Utilidades

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **jwt-decode** | 4.0.x | Decodificación de tokens JWT |
| **pdfmake** | 0.2.x | Generación de PDFs |
| **dotenv** | 17.2.x | Variables de entorno |

### DevTools

| Herramienta | Versión | Propósito |
|-------------|---------|-----------|
| **ESLint** | 9.37.x | Linter de código |
| **Prettier** | 3.6.x | Formateador de código |
| **Karma + Jasmine** | Latest | Testing unitario |
| **Angular CLI** | 20.3.x | Herramienta de desarrollo |

---

## 📂 Arquitectura del Proyecto

### Patrón de Diseño Principal

**Repository Pattern** - Abstracción del acceso a datos:

```
Componentes → Services → Repository Interface → Implementaciones (CSV/API)
```

**Ventajas:**
- ✅ Cambiar entre fuentes de datos sin modificar componentes
- ✅ Testeable con mocks
- ✅ Escalable (agregar GraphQL, Firebase, etc.)
- ✅ Desacoplamiento total

### Estructura de Carpetas

```
src/app/
├── core/                          # Funcionalidad central
│   ├── auth/                      # Autenticación y autorización
│   │   ├── guards/               # Guardias de rutas
│   │   ├── interceptors/         # Interceptores HTTP
│   │   └── services/             # Servicios de auth
│   ├── cartera/                   # Módulo de datos de cartera
│   │   ├── repositories/         # Repository Pattern
│   │   ├── services/             # Lógica de negocio
│   │   ├── models/               # Interfaces TypeScript
│   │   └── tokens/               # Tokens de inyección
│   ├── context/                   # Contexto de EPSA
│   └── i18N/                      # Internacionalización
│
├── features/                      # Módulos funcionales
│   ├── auth/                      # Login, registro, recuperación
│   ├── dashboard/                 # Página principal con KPIs
│   ├── reports/                   # Reportes de concentración HHI
│   ├── reports-maps/             # Mapas por departamento
│   └── profile/                   # Perfil de usuario
│
├── layout/                        # Layout de la aplicación
│   ├── component/                # Componentes de layout
│   │   ├── app.menu.ts           # Menú lateral
│   │   ├── app.topbar.ts         # Barra superior
│   │   └── app.sidebar.ts        # Sidebar
│   ├── service/                  # Servicios de layout
│   └── constants/                # Constantes de menú y rutas
│
├── shared/                        # Recursos compartidos
│   ├── components/               # Componentes reutilizables
│   ├── pipes/                    # Pipes personalizados
│   └── constants/                # Constantes globales
│
└── assets/                        # Recursos estáticos
    ├── styles/                   # Estilos SCSS
    ├── layout/                   # Estilos de layout
    ├── icons/                    # Iconos (banderas, mapas)
    ├── images/                   # Imágenes
    ├── fonts/                    # Fuentes
    ├── maps/                     # Datos de mapas
    └── data/                     # Datos CSV
```

---

## 🚀 Funcionalidades Principales

### 1. 📊 Dashboard Principal

**Ruta:** `/`

**Características:**
- **KPIs principales**: Beneficiarios, montos, departamentos
- **Mapa interactivo de Perú**: Filtrado por departamento
- **Cards de reportes**: Navegación rápida
- **Responsive design**: Adaptado a móviles

**Componentes:**
- `kpi-card.component` - Tarjetas de indicadores
- `report-card.component` - Tarjetas de reportes
- `peru-map-svg.component` - Mapa de Perú

### 2. 📈 Reportes de Concentración HHI

**Ruta:** `/reports/*`

El **Índice HHI** (Herfindahl-Hirschman Index) mide la concentración del mercado. Valores:
- **HHI < 1000**: Mercado competitivo
- **1000 ≤ HHI < 1800**: Concentración moderada
- **HHI ≥ 1800**: Alta concentración

**Reportes disponibles:**

| Ruta | Título | Descripción |
|------|--------|-------------|
| `/reports/hhi-agencias` | HHI por Agencias | Concentración por agencia financiera |
| `/reports/hhi-tipo-credito` | HHI por Tipo de Crédito | Análisis por tipo de crédito |
| `/reports/hhi-destino-credito` | HHI por Destino de Crédito | Concentración por destino del crédito |
| `/reports/hhi-plazo` | HHI por Número de Cuotas | Análisis por plazos de pago |
| `/reports/hhi-zona-geografica` | HHI por Zona Geográfica | Concentración geográfica |
| `/reports/hhi-sector-economico` | HHI por Sector Económico | Análisis por sector |
| `/reports/hhi-genero` | HHI por Género | Concentración por género |
| `/reports/hhi-tipo-persona` | HHI por Tipo de Persona | Natural vs Jurídica |
| `/reports/hhi-rangos-monto` | HHI por Rangos de Monto | Concentración por montos |
| `/reports/cumplimiento-indicadores` | Cumplimiento de Indicadores | Métricas de cumplimiento |
| `/reports/comparativo-anual` | Comparativo Anual | Comparación año a año |

### 3. 🗺️ Mapas por Departamento

**Ruta:** `/reports/map/:department`

**Características:**
- Visualización geográfica interactiva
- Clustering de marcadores
- Filtros dinámicos
- Tooltips informativos
- Exportación a PDF

### 4. 🔐 Autenticación

**Características:**
- Login con JWT
- Registro de usuarios
- Recuperación de contraseña
- Guards de protección de rutas
- Interceptores HTTP

---

## 🔧 Scripts Disponibles

### Desarrollo

```bash
# Servidor de desarrollo con HMR
npm run start:dev

# Servidor de producción
npm run start:prod

# Generar variables de entorno
npm run envs
```

### Construcción

```bash
# Build de desarrollo
npm run build:dev

# Build de producción
npm run build:prod

# Build y deploy
npm run build:deploy
```

### Calidad de Código

```bash
# Linting
npm run lint

# Linting con auto-fix
npm run lint:fix

# Formateo con Prettier
npm run format

# Verificar formato
npm run format:check

# Formateo + Linting
npm run format:lint

# Arreglar line endings
npm run fix:line-endings
```

### Testing

```bash
# Pruebas unitarias
npm test
```

---

## 💾 Flujo de Datos

### Arquitectura de Datos

```
┌─────────────────────────────────────────┐
│     COMPONENTES UI (Dashboard, etc.)    │
└───────────────┬─────────────────────────┘
                │ inject(REPOSITORY_TOKEN)
                ↓
┌─────────────────────────────────────────┐
│      CARTERA REPOSITORY (Interface)      │
│  - initialize()                         │
│  - getEstadisticas()                    │
│  - getByDepartamento()                  │
│  - getHHIAgencias()                     │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴────────┐
        ↓                ↓
┌──────────────┐  ┌─────────────┐
│ CSV Repo     │  │  API Repo   │
│ (IndexedDB)  │  │ (HttpClient)│
└──────────────┘  └─────────────┘
```

**Fuente de datos actual:** CSV cargado en IndexedDB vía Dexie

**Fuente futura:** REST API backend

---

## 🎨 Configuración de Prettier

```json
{
  "printWidth": 100,
  "singleQuote": true,
  "endOfLine": "lf",
  "overrides": [
    {
      "files": "*.html",
      "options": {
        "parser": "angular"
      }
    }
  ]
}
```

---

## 📦 Dependencias Críticas

### Producción

```json
{
  "@angular/core": "^20.3.0",
  "primeng": "^20.2.0",
  "maplibre-gl": "^5.10.0",
  "echarts": "^5.6.0",
  "dexie": "^4.2.1",
  "tailwindcss": "^4.1.14"
}
```

### Desarrollo

```json
{
  "@angular/cli": "^20.3.3",
  "typescript": "~5.9.3",
  "eslint": "^9.37.0",
  "prettier": "^3.6.2"
}
```

---

## 🌐 Variables de Entorno

El proyecto usa `dotenv` y el script `set-envs.js` para configurar:

- URLs de API
- Claves de autenticación
- Configuración de mapas
- Parámetros de producción/desarrollo

---

## 📝 Buenas Prácticas Implementadas

### Angular 20+

✅ **Signals** para estado reactivo  
✅ **Standalone components** (sin NgModules)  
✅ **Control flow nativo** (`@if`, `@for`)  
✅ **OnPush Change Detection**  
✅ **inject()** en lugar de constructor injection  
✅ **input()** / **output()** en lugar de decorators  
✅ **computed()** para estado derivado  

### TypeScript

✅ Strict type checking  
✅ Inferencia de tipos  
✅ Evitar `any`, usar `unknown`  

### Estructura

✅ Repository Pattern  
✅ Lazy loading de rutas  
✅ Barrel exports (`index.ts`)  
✅ Separation of concerns  
✅ Single responsibility principle  

### Accesibilidad

✅ Pasa checks de AXE  
✅ Cumple WCAG AA  
✅ Gestión de foco  
✅ Contraste de colores  
✅ Atributos ARIA  

---

## 🎯 Próximos Pasos / Roadmap

- [ ] Integración con API REST backend
- [ ] SVG real del mapa de Perú interactivo
- [ ] Autenticación con refresh tokens
- [ ] Tests E2E con Playwright/Cypress
- [ ] PWA (Progressive Web App)
- [ ] Modo offline completo
- [ ] Exportación avanzada de reportes
- [ ] Dashboard configurable por usuario

---

## 👥 Equipo

**Desarrollado para:** Adventist Development and Relief Agency (ADRA)  
**Sistema:** MIRAR - Monitoreo e Información Regional con Análisis de Recursos  
**Versión:** 1.8.4  
**Framework:** Angular 20.3.x  
**TypeScript:** 5.9.x  

---

## 📚 Recursos Adicionales

### Documentación Interna

- 📖 [DATA_ARCHITECTURE.md](src/app/core/cartera/DATA_ARCHITECTURE.md) - Arquitectura de datos
- 📖 [Dashboard README](src/app/features/dashboard/README.md) - Módulo dashboard
- 📖 [Cumplimiento README](src/app/features/reports/cumplimiento/README.md) - Reportes de cumplimiento

### Enlaces Externos

- [Angular Documentation](https://angular.dev)
- [PrimeNG Components](https://primeng.org)
- [MapLibre GL JS](https://maplibre.org)
- [ECharts Gallery](https://echarts.apache.org/examples/en/index.html)
- [Dexie.js](https://dexie.org)

---

**Última actualización:** Diciembre 2025
