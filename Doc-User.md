# MANUAL DE USUARIO
## Sistema MIRAR - Monitoreo de Indicadores y Riesgos para ADRA

**Versión:** 1.0  
**Fecha:** Enero 2026  
**Audiencia:** Analistas de Riesgo, Ejecutivos, Personal Operativo  
**Institución:** ADRA (Agencia Adventista de Desarrollo y Recursos Asistenciales)

---

## TABLA DE CONTENIDOS

1. [Introducción](#1-introducción)
2. [Primeros Pasos](#2-primeros-pasos)
3. [Navegación por el Sistema](#3-navegación-por-el-sistema)
4. [Uso de Filtros](#4-uso-de-filtros)
5. [Interpretación de Indicadores](#5-interpretación-de-indicadores)
6. [Visualización Geográfica](#6-visualización-geográfica)
7. [Análisis de Distribución](#7-análisis-de-distribución)
8. [Casos de Uso Prácticos](#8-casos-de-uso-prácticos)
9. [Preguntas Frecuentes](#9-preguntas-frecuentes)
10. [Glosario de Términos](#10-glosario-de-términos)

---

## 1. INTRODUCCIÓN

### 1.1. Bienvenida

Bienvenido al **Sistema MIRAR** (Monitoreo de Indicadores y Riesgos para ADRA), una herramienta diseñada específicamente para apoyar la gestión responsable de la cartera de microcréditos de ADRA Perú.

### 1.2. ¿Qué es ADRA?

La **Agencia Adventista de Desarrollo y Recursos Asistenciales (ADRA)** es la rama humanitaria de la Iglesia Adventista del Séptimo Día, presente en más de 130 países. Nuestra misión es:

> *"Trabajar con la gente en pobreza y sufrimiento para crear un cambio justo y positivo a través de alianzas potenciadoras y acciones responsables."*

ADRA trabaja en cinco áreas principales:
- 🌾 **Seguridad alimenticia**
- 💼 **Desarrollo económico** (Microfinanzas y microcréditos)
- 🏥 **Primeros auxilios y salud**
- 🆘 **Respuesta a desastres**
- 📚 **Educación básica**

### 1.3. ¿Qué es el Sistema MIRAR?

MIRAR es una plataforma de análisis de riesgo crediticio que permite:

✅ **Monitorear** 18 indicadores de control interno (IPC) en tiempo real  
✅ **Visualizar geográficamente** la distribución de la cartera de créditos  
✅ **Identificar** clientes y áreas de alto riesgo  
✅ **Filtrar** datos por múltiples criterios (sede, género, monto, producto, etc.)  
✅ **Analizar** patrones de comportamiento crediticio  
✅ **Tomar decisiones informadas** para proteger tanto a la institución como a los beneficiarios

### 1.4. ¿Para Quién es Este Manual?

Este manual está diseñado para:

- 👨‍💼 **Analistas de Riesgo** - Evaluación diaria de cartera
- 👩‍💼 **Ejecutivos y Gerentes** - Toma de decisiones estratégicas
- 📊 **Personal de Operaciones** - Seguimiento de indicadores
- 🎯 **Oficiales de Crédito** - Identificación de clientes de riesgo

**No se requieren conocimientos técnicos avanzados.** El sistema ha sido diseñado para ser intuitivo y fácil de usar.

---

## 2. PRIMEROS PASOS

### 2.1. Requisitos del Sistema

Para usar MIRAR necesitas:

| Requisito | Especificación |
|-----------|----------------|
| **Navegador** | Chrome 90+, Firefox 88+, Edge 90+, Safari 14+ |
| **Conexión a Internet** | Requerida (para cargar mapas) |
| **Pantalla** | Resolución mínima: 1366x768 (recomendado: 1920x1080) |
| **Permisos** | Acceso a la URL del sistema |

### 2.2. Acceso al Sistema

**URL de acceso:**
```
https://mirar.adra.org.pe
```

> 📝 **Nota:** Si tu organización tiene autenticación, necesitarás usuario y contraseña. Contacta al administrador del sistema.

### 2.3. Pantalla de Inicio

Al ingresar al sistema verás:

1. **Barra superior** - Logo de ADRA, navegación principal
2. **Menú lateral** - Acceso a diferentes módulos
3. **Panel principal** - Área de trabajo

**Módulos disponibles:**
- 📊 **Dashboard** - Vista general de estadísticas
- 🗺️ **Indicadores de Control Interno** - Análisis IPC (módulo principal)
- 📈 **Reportes** - Reportes adicionales
- 👤 **Perfil** - Configuración de usuario

### 2.4. Navegación Básica

**Atajos de teclado útiles:**
- `Ctrl + Clic` - Abrir en nueva pestaña
- `F11` - Pantalla completa
- `Ctrl + F` - Buscar en página
- `F5` - Recargar página

---

## 3. NAVEGACIÓN POR EL SISTEMA

### 3.1. Módulo de Indicadores de Control Interno (IPC)

Este es el módulo principal de MIRAR. Para acceder:

1. Clic en el menú lateral
2. Seleccionar **"Reportes"** → **"Indicadores de Control Interno"**

**Interfaz del módulo:**

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo ADRA]    Indicadores de Control Interno       [👤]   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  [ INGRESO ]  [ VOLUNTAD ]  [ GARANTÍA ]             │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────┐  ┌─────────────────────────────────┐  │
│  │  IPC1: Mora     │  │                                  │  │
│  │  IPC2: Tramos   │  │                                  │  │
│  │  IPC7: Capac.   │  │        MAPA DE PERÚ              │  │
│  │  IPC8: Jerarq.  │  │                                  │  │
│  │  IPC9: Concent. │  │      (Visualización              │  │
│  │                 │  │       geográfica)                │  │
│  │  [Filtros DB]   │  │                                  │  │
│  │  [Distribución] │  │                                  │  │
│  └─────────────────┘  └─────────────────────────────────┘  │
│                                                              │
│  Total: 23,831  |  Filtrados: 5,234  |  Visibles: 4,890   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2. Componentes de la Interfaz

#### **A. Selector de Dimensiones (Parte superior)**

Tres pestañas que organizan los 18 indicadores:

| Dimensión | Icono | Color | Descripción |
|-----------|-------|-------|-------------|
| **INGRESO** | 💰 | Azul | Capacidad económica del cliente |
| **VOLUNTAD** | ❤️ | Verde | Compromiso de pago del cliente |
| **GARANTÍA** | 🛡️ | Morado | Retención y confianza |

**Cómo usar:**
1. Haz clic en una dimensión para ver sus indicadores
2. Los indicadores de esa dimensión aparecerán en el panel izquierdo
3. El color de los puntos en el mapa cambiará según la dimensión seleccionada

#### **B. Panel de Indicadores (Izquierda)**

Lista de indicadores disponibles en la dimensión seleccionada.

**Ejemplo - Dimensión INGRESO:**
- **IPC1** - Mora (días de atraso)
- **IPC2** - Mora por tramos (categórico)
- **IPC7** - Capacidad de pago directa
- **IPC8** - Jerarquía de fuente de pago
- **IPC9** - Concentración en ADRA

**Cómo seleccionar un indicador:**
1. Haz clic en el nombre del indicador (ej: "IPC1 - Mora")
2. El mapa se actualizará mostrando ese indicador
3. Los colores cambiarán según los valores del IPC seleccionado

#### **C. Mapa Interactivo (Centro/Derecha)**

Muestra geográficamente la ubicación de los clientes con colores según el nivel de riesgo.

**Elementos del mapa:**
- 🔴 **Puntos rojos** - Alto riesgo (requiere atención urgente)
- 🟡 **Puntos amarillos** - Riesgo medio (monitoreo activo)
- 🟢 **Puntos verdes** - Bajo riesgo (situación saludable)
- 🟠 **Puntos naranjas** - Riesgo moderado
- 🔵 **Puntos celestes** - Riesgo alto
- ⚫ **Puntos negros** - Valores anómalos (revisar datos)

**Controles del mapa:**
- 🖱️ **Arrastrar** - Mover el mapa
- 🔍 **Scroll** - Zoom in/out
- 🔘 **Doble clic** - Zoom en punto específico
- 🎯 **Clic en punto** - Ver detalles del cliente

#### **D. Botones de Acción**

| Botón | Función |
|-------|---------|
| 🔍 **Filtros BD** | Abrir modal de filtros avanzados |
| 📊 **Distribución** | Ver análisis estadístico de datos |
| 🔄 **Refrescar** | Recargar datos del sistema |

#### **E. Barra de Estadísticas (Inferior)**

Muestra el impacto de los filtros aplicados:

```
Total: 23,831  |  Filtrados: 5,234 (22.0%)  |  Visibles: 4,890 (20.5%)
```

- **Total** - Cantidad total de registros en el sistema
- **Filtrados** - Registros que pasaron los filtros de base de datos
- **Visibles** - Registros visibles en el mapa (después de filtros de rango)

---

## 4. USO DE FILTROS

### 4.1. ¿Para Qué Sirven los Filtros?

Los filtros te permiten:
- 🎯 Enfocarte en grupos específicos de clientes
- 📊 Analizar patrones por segmentos
- 🔍 Identificar riesgos en poblaciones específicas
- 💡 Tomar decisiones basadas en datos filtrados

### 4.2. Abrir el Modal de Filtros

1. Busca el botón **"Filtros BD"** en el panel izquierdo
2. Haz clic en el botón
3. Se abrirá una ventana modal con todos los filtros disponibles

### 4.3. Filtros Disponibles

#### **1. Filtro por Sede/Agencia**

Filtra clientes por oficina ADRA.

**Opciones típicas:**
- Lima Centro
- Lima Norte
- Lima Sur
- Callao
- Provincias

**Cómo usar:**
1. Haz clic en el campo "Sede"
2. Selecciona una o varias sedes de la lista
3. Puedes buscar escribiendo el nombre

**Ejemplo de uso:**  
*"Quiero ver solo los clientes de Lima Centro y Lima Norte"*

---

#### **2. Filtro por Género**

Filtra por sexo del cliente.

**Opciones:**
- MASCULINO
- FEMENINO

**Ejemplo de uso:**  
*"Analizar el comportamiento de pago de clientes femeninas"*

---

#### **3. Filtro por Monto de Crédito**

Filtra por rangos de monto colocado.

**Rangos predefinidos:**
- Menos de 500
- 501 - 1,000
- 1,001 - 2,500
- 2,501 - 5,000
- 5,001 - 10,000
- 10,001 - 20,000
- 20,001 - 50,000
- 50,001 - 100,000
- 100,001 - 250,000
- Más de 250,000

**Ejemplo de uso:**  
*"Ver solo microcréditos entre 1,000 y 5,000 soles"*

---

#### **4. Filtro por Producto**

Filtra por tipo de crédito.

**Productos típicos:**
- GRUPAL NORMAL 28 DIAS
- INDIVIDUAL 30 DIAS
- GRUPAL EXPRESS 14 DIAS
- INDIVIDUAL AGRICULTURA
- etc.

**Ejemplo de uso:**  
*"Analizar mora en créditos grupales vs individuales"*

---

#### **5. Filtro por Zona Geográfica**

Filtra por ubicación del cliente.

**Opciones:**
- Urbano
- Rural
- Periurbano

**Ejemplo de uso:**  
*"Comparar tasas de mora entre zonas urbanas y rurales"*

---

#### **6. Filtro por Categoría**

Filtra por clasificación de riesgo del cliente.

**Categorías:**
- A (Mejor calificación)
- B
- C
- D
- E (Peor calificación)

**Ejemplo de uso:**  
*"Identificar clientes categoría D y E para acciones preventivas"*

---

#### **7. Filtro por Calificación CR**

Filtra por calificación crediticia.

**Opciones:**
- Normal
- CPP (Con Problemas Potenciales)
- Deficiente
- Dudoso
- Pérdida

**Ejemplo de uso:**  
*"Ver todos los clientes con calificación Deficiente o peor"*

---

#### **8. Filtro por Capacidad de Pago**

Filtra por rangos de capacidad de pago mensual.

**Rangos predefinidos:**
- Menos de 100
- 100 - 250
- 251 - 500
- 501 - 1,000
- 1,001 - 2,500
- 2,501 - 5,000
- Más de 5,000

**Ejemplo de uso:**  
*"Analizar clientes con capacidad de pago menor a 250 soles"*

---

### 4.4. Aplicar Filtros

**Pasos:**

1. **Seleccionar filtros:**
   - Marca las opciones deseadas en cada filtro
   - Puedes combinar múltiples filtros simultáneamente

2. **Ver impacto:**
   - En la parte superior del modal verás el resumen:
   ```
   De 23,831 registros, 5,234 (22.0%) cumplen con estos filtros
   ```

3. **Aplicar:**
   - Haz clic en el botón **"Aplicar Filtros"** (azul)
   - El modal se cerrará
   - El mapa se actualizará mostrando solo los datos filtrados

4. **Ver filtros activos:**
   - Debajo del mapa verás badges con los filtros aplicados:
   ```
   [Lima Centro] [FEMENINO] [1,001-5,000] [X Limpiar todo]
   ```

### 4.5. Limpiar Filtros

**Para eliminar filtros individuales:**
- Haz clic en la "X" de cada badge

**Para eliminar todos los filtros:**
1. Haz clic en el botón "Limpiar Filtros" dentro del modal
2. O haz clic en "X Limpiar todo" debajo del mapa

---

## 5. INTERPRETACIÓN DE INDICADORES

### 5.1. Sistema de 18 Indicadores (IPC)

Los IPCs están organizados en **3 dimensiones** que evalúan diferentes aspectos del riesgo crediticio:

#### **Modelo Tridimensional de Evaluación de Riesgo**

Este enfoque permite **anticipar el riesgo antes de que se materialice en mora**, diferenciándose de los indicadores tradicionales que solo miden resultados históricos.

**Las 3 Dimensiones:**

1. **INGRESO DEL CLIENTE (9 IPCs)** - Mide lo que el cliente **PUEDE** pagar
   - IPCs: 1, 2, 4, 5, 7, 8, 9, 13, 16

2. **VOLUNTAD DE PAGO (5 IPCs)** - Mide lo que el cliente **QUIERE** pagar
   - IPCs: 3, 4, 6, 10, 12

3. **GARANTÍA PSICOLÓGICA (7 IPCs)** - Mide si el cliente **SABE CÓMO** y está **COMPROMETIDO** a pagar
   - IPCs: 5, 11, 14, 15, 16, 17, 18

> **⚠️ Importante:** Algunos IPCs pertenecen a **múltiples dimensiones** simultáneamente:
> - **IPC4** (Tickets vencidos): INGRESO + VOLUNTAD
> - **IPC5** (Deuda/Garantía): INGRESO + GARANTÍA PSICOLÓGICA
> - **IPC16** (Variación activo): INGRESO + GARANTÍA PSICOLÓGICA
>
> Estos indicadores multidimensionales ofrecen una visión más completa del perfil de riesgo del cliente.

**Filosofía del Modelo:**

- **Un cliente puede tener ingresos suficientes, pero si su conducta es inestable, su riesgo de incumplimiento sigue siendo alto.**
- La combinación de las 3 dimensiones permite decisiones más justas y precisas, alineadas con la misión social de ADRA.
- Se busca el balance entre **inclusión financiera** (servir a poblaciones vulnerables) y **sostenibilidad** (proteger la calidad de la cartera).

---

### 5.2. DIMENSIÓN 1: INGRESO DEL CLIENTE

Evalúa la **capacidad económica**, liquidez, solvencia, respaldo financiero y estructura patrimonial del beneficiario. **Determina si el cliente PUEDE pagar.**

#### **IPC1 - Mora (Días de Atraso)**

**¿Qué mide?**  
Cantidad de días que el cliente tiene de atraso en sus pagos.

**Interpretación:**
- **0 días** 🟢 - Cliente al día (bajo riesgo)
- **1-30 días** 🟡 - Mora temprana (atención requerida)
- **31-60 días** 🟠 - Mora significativa (gestión activa)
- **61-90 días** 🔴 - Mora grave (acción inmediata)
- **>90 días** ⚫ - Mora crítica (alto riesgo de pérdida)

**Ejemplo:**  
*Si un cliente tiene IPC1 = 45 días, significa que lleva mes y medio sin pagar, requiere contacto urgente.*

---

#### **IPC2 - Mora por Tramos**

**¿Qué mide?**  
Clasifica la mora en rangos predefinidos.

**Categorías:**
- `0-30` 🟢 - Mora temprana recuperable
- `31-60` 🟠 - Requiere gestión activa
- `61-90` 🟡 - Mora significativa
- `91-180` 🔵 - Mora crítica
- `>180` 🔴 - Baja probabilidad de recuperación

**Ejemplo:**  
*Un cliente en tramo "91-180" indica mora crónica, evaluar provisiones.*

---

#### **IPC7 - Capacidad de Pago Directa**

**¿Qué mide?**  
Ratio entre ingreso primario del cliente y el monto de las cuotas (tickets).

**Interpretación:**
- **< 0.5** 🔴 - Insolvencia grave (ingreso no cubre ni mitad de cuotas)
- **0.5 - 1.0** 🟠 - Capacidad ajustada (riesgo alto)
- **1.0 - 2.0** 🟡 - Capacidad suficiente (monitoreo)
- **> 2.0** 🟢 - Capacidad holgada (bajo riesgo)

**⚠️ NOTA:** Este indicador está **invertido** - Mayor valor = Mejor situación

**Ejemplo:**  
*IPC7 = 1.5 significa que el ingreso primario del cliente es 50% mayor que sus cuotas, tiene capacidad de pago.*

---

#### **IPC8 - Jerarquía de Fuente de Pago**

**¿Qué mide?**  
De dónde proviene el dinero para pagar el crédito.

**Categorías:**
- **Primario** 🟢 - Ingreso principal estable (salario, negocio)
- **Secundario** 🟡 - Ingreso alternativo (trabajos ocasionales)
- **Otros** 🟠 - Ingresos irregulares (ayuda familiar)
- **Garantía** 🔴 - Pago con garantía (cliente sin capacidad real)

**Ejemplo:**  
*Un cliente que paga con "Garantía" indica que perdió capacidad de pago, alto riesgo de default.*

---

#### **IPC9 - Concentración en ADRA**

**¿Qué mide?**  
Porcentaje de la deuda total del cliente que representa el crédito con ADRA.

**Interpretación:**
- **0-30%** 🟢 - Deuda diversificada (bajo riesgo para ADRA)
- **30-50%** 🟡 - Concentración moderada
- **50-70%** 🟠 - Alta exposición con ADRA
- **70-100%** 🔴 - ADRA es la principal acreedora (riesgo institucional)

**Ejemplo:**  
*IPC9 = 85% significa que el 85% de la deuda del cliente es con ADRA. Si el cliente cae en mora, ADRA es la más afectada.*

---

#### **IPC13 - Liquidez del Cliente**

**¿Qué mide?**  
(Efectivo + ahorros) / activo total. Evalúa capacidad de liquidez inmediata, fundamental para enfrentar contingencias.

**Interpretación:**
- **>50%** 🟢 - Alta liquidez (resiliencia financiera)
- **30-50%** 🟡 - Liquidez moderada (colchón financiero básico)
- **10-30%** 🟠 - Baja liquidez (vulnerabilidad ante shocks)
- **<10%** 🔴 - Muy baja liquidez (riesgo de incumplimiento por falta de colchón financiero)

**⚠️ NOTA:** Este indicador está **invertido** - Mayor valor = Mejor situación

**Ejemplo:**  
*IPC13 = 15% indica baja liquidez, el cliente tiene pocos activos líquidos disponibles para enfrentar contingencias.*

**📊 Dimensión:** Este IPC pertenece a **INGRESO DEL CLIENTE** (capacidad económica).

---

**📋 Resumen Dimensión 1 - INGRESO:**  
Esta dimensión incluye **9 indicadores**: IPC1, IPC2, IPC4, IPC5, IPC7, IPC8, IPC9, IPC13, IPC16.  
*Nota: IPC4, IPC5 e IPC16 también pertenecen a otras dimensiones.*

---

### 5.3. DIMENSIÓN 2: VOLUNTAD DE PAGO

Evalúa **comportamiento**, disciplina, historial de pago, riesgo moral y compromiso de cumplimiento. **Determina si el cliente QUIERE pagar.**

#### **IPC3 - Mora Proporcional**

**¿Qué mide?**  
Porcentaje del tiempo total del crédito que el cliente ha estado en mora.

**Fórmula:**  
```
Días en mora / Días totales del crédito
```

**Interpretación:**
- **0-10%** 🟢 - Cumplimiento alto
- **10-25%** 🟡 - Mora ocasional
- **25-50%** 🟠 - Mora frecuente
- **>50%** 🔴 - Mora crónica (más tiempo en mora que al día)

**Ejemplo:**  
*IPC3 = 40% en un crédito de 180 días significa que ha estado en mora 72 días (casi 2 meses y medio).*

---

#### **IPC4 - Tickets Vencidos**

**¿Qué mide?**  
Cantidad de cuotas (pagos) que el cliente no ha cumplido. Este indicador evalúa tanto la **capacidad de pago** (relaciona capacidad con flujo económico perdido) como la **persistencia del incumplimiento** (voluntad de pago).

**Interpretación:**
- **0** 🟢 - Cumplimiento perfecto
- **1-2** 🟡 - Incumplimiento leve
- **3-5** 🟠 - Falta de disciplina de pago
- **>5** 🔴 - Patrón de incumplimiento grave

**Ejemplo:**  
*IPC4 = 4 tickets vencidos indica que el cliente dejó de pagar 4 cuotas, requiere reestructuración.*

**📊 Dimensión:** Este IPC pertenece a **INGRESO** (capacidad) y **VOLUNTAD** (persistencia).

---

#### **IPC6 - Recurrencia de Mora**

**¿Qué mide?**  
Frecuencia con la que el cliente cae en mora (patrón histórico).

**Interpretación:**
- **0-0.2** 🟢 - Mora esporádica
- **0.2-0.5** 🟡 - Mora recurrente
- **0.5-0.8** 🟠 - Mora sistemática (sobreendeudamiento probable)
- **>0.8** 🔴 - Cliente crónico en mora

**Ejemplo:**  
*IPC6 = 0.7 indica que el cliente cae en mora en 7 de cada 10 periodos de pago, señal de sobreendeudamiento.*

---

#### **IPC10 - Nivel de Contagio**

**¿Qué mide?**  
Proporción de créditos que el cliente tiene con otras instituciones (no ADRA).

**Interpretación:**
- **0-30%** 🟢 - Pocos créditos externos (ADRA es prioridad)
- **30-60%** 🟡 - Diversificación moderada
- **60-80%** 🟠 - Muchas instituciones compitiendo por pago
- **>80%** 🔴 - Sobreendeudamiento (alto riesgo de competencia de pagos)

**Ejemplo:**  
*IPC10 = 75% significa que el 75% de los créditos del cliente son con otras instituciones, ADRA puede ser desprioritizada.*

---

#### **IPC12 - Rechazos**

**¿Qué mide?**  
Operaciones rechazadas / operaciones totales. Detecta inconsistencias y riesgo moral.

**Interpretación:**
- **0-20%** 🟢 - Sin rechazos (comportamiento confiable)
- **20-40%** 🟡 - Rechazos ocasionales (alerta documental)
- **40-60%** 🟠 - Rechazos frecuentes
- **>60%** 🔴 - Múltiples rechazos (alto riesgo moral)

**Ejemplo:**  
*IPC12 = 35% indica que el 35% de las operaciones fueron rechazadas, requiere verificación de documentos y comportamiento.*

---

**📋 Resumen Dimensión 2 - VOLUNTAD:**  
Esta dimensión incluye **5 indicadores**: IPC3, IPC4, IPC6, IPC10, IPC12.  
*Nota: IPC4 también pertenece a INGRESO DEL CLIENTE.*

---

### 5.4. DIMENSIÓN 3: GARANTÍA PSICOLÓGICA

Evalúa **estabilidad emocional/profesional**, madurez empresarial, permanencia y compromiso histórico. **Determina si el cliente SABE CÓMO y está COMPROMETIDO a pagar.**

#### **IPC5 - Deuda vs Garantía**

**¿Qué mide?**  
Ratio entre la deuda total del cliente y el valor de las garantías presentadas. Este indicador evalúa tanto la **solvencia y cobertura financiera** (ingreso) como el **respaldo serio y compromiso** (garantía psicológica).

**Interpretación:**
- **< 0.5** 🟢 - Sobregarantizado (garantía cubre 2x la deuda)
- **0.5 - 0.8** 🟡 - Garantía adecuada
- **0.8 - 1.0** 🟠 - Garantía ajustada (riesgo moderado)
- **> 1.0** 🔴 - Subgarantizado (deuda excede garantía)

**Ejemplo:**  
*IPC5 = 1.3 significa que la deuda es 30% mayor que la garantía, exposición no cubierta.*

**📊 Dimensión:** Este IPC pertenece a **INGRESO** (solvencia) y **GARANTÍA PSICOLÓGICA** (respaldo).

---

#### **IPC11 - Nivel de Retención**

**¿Qué mide?**  
Permanencia del cliente en ADRA (ciclos previos vs total de ciclos).

**Interpretación:**
- **0-0.3** 🔴 - Cliente nuevo (sin historial, alta incertidumbre)
- **0.3-0.6** 🟡 - Cliente reciente (historial limitado)
- **0.6-0.8** 🟢 - Cliente fidelizado
- **>0.8** 🟢 - Cliente antiguo (alta confianza)

**Ejemplo:**  
*IPC11 = 0.8 indica que el cliente ha completado 8 de 10 ciclos posibles con ADRA, alta fidelidad.*

---

#### **IPC14 - Variación del Ingreso**

**¿Qué mide?**  
Ingreso t-1 / Ingreso t. Mide evolución del ingreso en el tiempo.

**Fórmula:** Ingreso periodo anterior / Ingreso periodo actual

**Interpretación:**
- **< 1.0** 🟢 - Ingreso en crecimiento (periodo actual > anterior)
- **= 1.0** 🟡 - Ingreso estable (sin cambios)
- **1.0 - 1.5** 🟠 - Ingreso en caída moderada
- **> 1.5** 🔴 - Ingreso en deterioro significativo

**⚠️ NOTA:** Este indicador está **invertido** - Menor valor = Mejor situación

**Ejemplo:**  
*IPC14 = 1.3 indica que el ingreso anterior era 30% mayor que el actual, hay deterioro de capacidad.*

---

#### **IPC15 - Experiencia Crediticia**

**¿Qué mide?**  
Años desde el primer crédito / años de experiencia en la actividad. Mide madurez financiera.

**Interpretación:**
- **>0.8** 🟢 - Profesionalización financiera (bajo riesgo técnico)
- **0.5-0.8** 🟡 - Experiencia moderada (aprendizaje en curso)
- **0.2-0.5** 🟠 - Experiencia limitada
- **<0.2** 🔴 - Cliente inexperto (riesgo técnico-operativo)

**⚠️ NOTA:** Este indicador está **invertido** - Mayor valor = Mejor situación

**Ejemplo:**  
*IPC15 = 0.6 indica que el cliente lleva 60% de su tiempo de actividad con experiencia crediticia, madurez moderada.*

---

#### **IPC16 - Variación del Activo**

**¿Qué mide?**  
Activo t-1 / Activo t. Mide crecimiento o deterioro patrimonial. Este indicador evalúa tanto el **crecimiento patrimonial** (ingreso) como la **estabilidad psicológica y responsabilidad** (garantía psicológica).

**Interpretación:**
- **> 1.1** 🟢 - Capitalización (activos creciendo)
- **0.9 - 1.1** 🟡 - Patrimonio estable
- **0.7 - 0.9** 🟠 - Descapitalización leve
- **< 0.7** 🔴 - Descapitalización severa

**Ejemplo:**  
*IPC16 = 0.65 indica que el cliente perdió 35% de sus activos, situación financiera deteriorada.*

**📊 Dimensión:** Este IPC pertenece a **INGRESO** (patrimonial) y **GARANTÍA PSICOLÓGICA** (estabilidad).

---

#### **IPC17 - Cobertura de Provisión**

**¿Qué mide?**  
Provisión de cartera / Saldo de cartera en mora. Mide nivel de cobertura del riesgo.

**Interpretación:**
- **> 1.5** 🟢 - Provisión adecuada (solidez institucional)
- **1.0 - 1.5** 🟡 - Cobertura moderada (gestión aceptable)
- **0.5 - 1.0** 🟠 - Subprovisión moderada
- **< 0.5** 🔴 - Subprovisión grave (vulnerabilidad patrimonial)

**⚠️ NOTA:** Este indicador está **invertido** - Mayor valor = Mejor situación

**Ejemplo:**  
*IPC17 = 0.8 indica que las provisiones cubren el 80% de la cartera en mora, cobertura moderada pero insuficiente.*

---

#### **IPC18 - Respaldo de Ahorros**

**¿Qué mide?**  
Ahorros individuales / Saldo de cartera. Mide respaldo interno del portafolio.

**Interpretación:**
- **>30%** 🟢 - Alto respaldo (compromiso y estabilidad)
- **15-30%** 🟡 - Respaldo moderado (base de fondeo propia)
- **5-15%** 🟠 - Bajo respaldo
- **<5%** 🔴 - Muy bajo respaldo (dependencia de fondeo externo)

**⚠️ NOTA:** Este indicador está **invertido** - Mayor valor = Mejor situación

**Ejemplo:**  
*IPC18 = 22% indica que los ahorros del cliente representan el 22% del saldo de cartera, respaldo moderado.*

---

**📋 Resumen Dimensión 3 - GARANTÍA PSICOLÓGICA:**  
Esta dimensión incluye **7 indicadores**: IPC5, IPC11, IPC14, IPC15, IPC16, IPC17, IPC18.  
*Nota: IPC5 e IPC16 también pertenecen a INGRESO DEL CLIENTE.*

---

### 5.5. Sistema de Colores (Semáforo de Riesgo)

Todos los IPCs numéricos utilizan un sistema estandarizado de colores:

| Color | Rango | Nivel de Riesgo | Acción |
|-------|-------|-----------------|--------|
| 🟢 **Verde** | 0-20% | **Bajo** | Monitoreo regular |
| 🟠 **Naranja** | 20-40% | **Moderado** | Monitoreo activo |
| 🟡 **Amarillo** | 40-60% | **Medio-Alto** | Análisis detallado |
| 🔵 **Celeste** | 60-80% | **Alto** | Plan de acción inmediato |
| 🔴 **Rojo** | 80-100% | **Crítico** | Intervención urgente |
| ⚫ **Negro** | <0% o >100% | **Anómalo** | Revisar datos (posible error) |

---

## 6. VISUALIZACIÓN GEOGRÁFICA

### 6.1. Uso del Mapa Interactivo

El mapa te permite visualizar geográficamente la distribución de riesgo de tu cartera.

#### **Controles Básicos**

| Acción | Método |
|--------|--------|
| **Mover mapa** | Arrastra con el mouse (clic izquierdo + arrastrar) |
| **Zoom in** | Scroll hacia arriba o doble clic |
| **Zoom out** | Scroll hacia abajo o Shift + doble clic |
| **Rotar mapa** | Clic derecho + arrastrar (o Ctrl + arrastrar) |
| **Resetear orientación** | Botón de brújula (esquina superior derecha) |

### 6.2. Interpretación de Puntos en el Mapa

#### **Puntos Individuales**

Cuando el zoom está cerca, verás puntos individuales:

- **Tamaño del punto** - Representa el valor del IPC
- **Color del punto** - Indica el nivel de riesgo (ver tabla de colores)
- **Borde del punto** - Punto seleccionado (al hacer clic)

#### **Clusters (Grupos)**

Cuando el zoom está lejos, verás círculos con números:

```
    ┌───────┐
    │  127  │  ← Cantidad de puntos agrupados
    └───────┘
```

- **Número** - Cantidad de clientes en esa zona
- **Tamaño** - Mayor cantidad = círculo más grande
- **Color** - Promedio del riesgo en ese cluster

**Para ver detalles:**
1. Haz clic en el cluster
2. El mapa hará zoom en esa área
3. Los puntos individuales se mostrarán

### 6.3. Información de Cliente Individual

**Para ver detalles de un cliente:**

1. Haz clic en un punto del mapa
2. Aparecerá un popup con información:

```
┌──────────────────────────────┐
│ JUAN PÉREZ GARCÍA            │
├──────────────────────────────┤
│ Sede: Lima Centro            │
│ Producto: GRUPAL NORMAL       │
│ Monto: S/ 5,000              │
│ Género: MASCULINO            │
│                              │
│ IPC1 (Mora): 45 días  🔴     │
│ Nivel: CRÍTICO               │
└──────────────────────────────┘
```

### 6.4. Leyenda del Mapa

En la esquina inferior derecha del mapa encontrarás la leyenda:

```
┌────────────────────────┐
│  LEYENDA               │
├────────────────────────┤
│  🟢  0-20%   Bajo      │
│  🟠  20-40%  Moderado  │
│  🟡  40-60%  Medio     │
│  🔵  60-80%  Alto      │
│  🔴  80-100% Crítico   │
│  ⚫  Anómalo           │
└────────────────────────┘
```

### 6.5. Estrategias de Análisis Geográfico

#### **Identificar Zonas Críticas**

1. Selecciona un indicador de alto riesgo (ej: IPC1 - Mora)
2. Busca concentraciones de puntos rojos en el mapa
3. Anota las áreas geográficas con mayor densidad de riesgo

**Pregunta a responder:**  
*¿Hay zonas específicas donde la mora es sistemáticamente alta?*

---

#### **Comparar Sedes**

1. Sin aplicar filtros, observa el mapa completo
2. Identifica las sedes con mayor concentración de puntos rojos
3. Aplica filtro por sede para análisis detallado

**Pregunta a responder:**  
*¿Qué sede tiene mayor exposición al riesgo?*

---

#### **Analizar Patrones Urbano/Rural**

1. Aplica filtro: Zona = "Urbano"
2. Observa distribución de riesgo
3. Limpia filtro y aplica: Zona = "Rural"
4. Compara ambos mapas

**Pregunta a responder:**  
*¿El comportamiento de pago es diferente entre zonas urbanas y rurales?*

---

## 7. ANÁLISIS DE DISTRIBUCIÓN

### 7.1. Abrir el Modal de Distribución

Para análisis estadístico detallado:

1. Haz clic en el botón **"Distribución"** (panel izquierdo)
2. Se abrirá un modal con 5 pestañas de análisis

### 7.2. Pestaña 1: Distribución por IPC

Muestra gráfico de barras con la distribución del indicador seleccionado.

**Elementos del gráfico:**

- **Eje X** - Rangos de valores del IPC
- **Eje Y** - Cantidad de clientes
- **Colores** - Según nivel de riesgo

**Interpretación:**

```
    📊 Distribución IPC1 - Mora

    Clientes
    5000 ┤        ████
    4000 ┤   ████ ████
    3000 ┤   ████ ████ ████
    2000 ┤   ████ ████ ████
    1000 ┤   ████ ████ ████ ████
       0 └─────────────────────────
           0-30  31-60 61-90 >90  (días)
           🟢    🟠    🟡   🔴
```

**Análisis:**
- **Barra más alta** - Rango con mayor concentración de clientes
- **Barras rojas altas** - Alerta de muchos clientes en riesgo crítico
- **Barras verdes altas** - Mayoría de clientes saludables

### 7.3. Pestaña 2: Distribución por Sede

Gráfico de barras comparando indicadores entre sedes.

**Uso típico:**
1. Selecciona IPC1 (Mora)
2. Abre distribución → Pestaña "Por Sede"
3. Identifica sede con mayor mora promedio

**Ejemplo de visualización:**

```
    Mora Promedio por Sede
    
    60 días ┤           ████
    50 días ┤      ████ ████
    40 días ┤ ████ ████ ████
    30 días ┤ ████ ████ ████ ████
    20 días ┤ ████ ████ ████ ████
    10 días ┤ ████ ████ ████ ████
        0 └──────────────────────────
           LCentro LNorte LSur Callao
```

**Pregunta a responder:**  
*¿Qué sede requiere refuerzo en gestión de cobranza?*

### 7.4. Pestaña 3: Distribución por Género

Compara indicadores entre géneros (Masculino vs Femenino).

**Análisis típico:**
- Mora promedio por género
- Capacidad de pago promedio por género
- Tasa de cumplimiento por género

**Insight esperado:**  
*Identificar si hay diferencias significativas en el comportamiento crediticio por género para ajustar estrategias.*

### 7.5. Pestaña 4: Distribución por Producto

Compara indicadores entre tipos de crédito.

**Productos a comparar:**
- GRUPAL NORMAL vs INDIVIDUAL
- EXPRESS vs NORMAL
- AGRICULTURA vs COMERCIO

**Pregunta a responder:**  
*¿Qué producto tiene mejor performance crediticia?*

### 7.6. Pestaña 5: Estadísticas Generales

Tabla con estadísticas descriptivas del indicador seleccionado:

| Métrica | Valor |
|---------|-------|
| **Total registros** | 23,831 |
| **Mínimo** | 0 |
| **Máximo** | 180 |
| **Promedio** | 25.4 días |
| **Mediana** | 15 días |
| **Desviación estándar** | 32.1 |
| **Percentil 25** | 5 días |
| **Percentil 75** | 35 días |
| **Percentil 90** | 60 días |

**Interpretación:**

- **Promedio vs Mediana** - Si promedio >> mediana, hay valores extremos (outliers)
- **Percentil 90** - El 90% de los clientes tiene valores menores a este
- **Desviación estándar** - Qué tan dispersos están los datos

---

## 8. CASOS DE USO PRÁCTICOS

### 8.1. Caso 1: Identificar Clientes de Alto Riesgo

**Objetivo:** Encontrar clientes con mora crítica para acción inmediata.

**Pasos:**

1. **Seleccionar dimensión:** INGRESO
2. **Seleccionar indicador:** IPC1 - Mora
3. **Aplicar filtros:**
   - Calificación CR: Deficiente, Dudoso, Pérdida
4. **Observar mapa:**
   - Buscar concentración de puntos rojos
5. **Análisis de distribución:**
   - Abrir modal → Ver cantidad de clientes >90 días mora
6. **Acción:**
   - Generar lista de clientes para cobranza especializada

**Resultado esperado:**  
*Identificar ~200 clientes con mora >90 días que representan 15% del riesgo total.*

---

### 8.2. Caso 2: Evaluar Nuevos Productos

**Objetivo:** Comparar performance entre producto existente vs nuevo producto piloto.

**Pasos:**

1. **Primer análisis - Producto existente:**
   - Filtrar: Producto = "GRUPAL NORMAL 28 DIAS"
   - Observar IPC12 (Rechazos)
   - Anotar tasa promedio de rechazos

2. **Segundo análisis - Producto nuevo:**
   - Limpiar filtros
   - Filtrar: Producto = "GRUPAL EXPRESS 14 DIAS"
   - Observar IPC12 (Rechazos)
   - Anotar tasa promedio de rechazos

3. **Comparación:**
   - Abrir modal Distribución → Pestaña "Por Producto"
   - Comparar lado a lado

4. **Decisión:**
   - Si producto nuevo tiene mejor performance → Expandir
   - Si tiene peor performance → Revisar condiciones

---

### 8.3. Caso 3: Análisis de Concentración Geográfica

**Objetivo:** Identificar si hay sobreendeudamiento en zonas específicas.

**Pasos:**

1. **Seleccionar:** IPC10 - Nivel de Contagio (créditos externos)
2. **Observar mapa:**
   - Buscar clusters rojos (alta concentración de créditos externos)
3. **Zoom en zona crítica:**
   - Hacer clic en cluster para desglosar
4. **Aplicar filtro adicional:**
   - Zona = "Urbano" o "Rural" según la zona identificada
5. **Análisis:**
   - Ver distribución por sede en esa zona
6. **Acción:**
   - Establecer políticas de prevención de sobreendeudamiento en esa área

---

### 8.4. Caso 4: Monitoreo de Cartera Femenina

**Objetivo:** Evaluar impacto del programa de empoderamiento femenino.

**Pasos:**

1. **Aplicar filtro:** Género = FEMENINO
2. **Seleccionar dimensión:** VOLUNTAD DE PAGO
3. **Analizar IPC12 (Rechazos):**
   - Ver distribución en el mapa
   - Comparar con promedio general
4. **Análisis complementario:**
   - Ver IPC11 (Retención)
   - Ver IPC15 (Experiencia crediticia)
5. **Comparación con cartera masculina:**
   - Limpiar filtro
   - Aplicar: Género = MASCULINO
   - Comparar métricas

**Insight esperado:**  
*La cartera femenina muestra 15% mejor cumplimiento y 20% mayor retención que la masculina, validando el programa.*

---

### 8.5. Caso 5: Detección de Fraude/Anomalías

**Objetivo:** Identificar registros anómalos que puedan indicar errores o fraude.

**Pasos:**

1. **Buscar puntos negros en el mapa:**
   - Estos indican valores fuera de rango (<0% o >100%)
2. **Click en puntos negros:**
   - Ver detalles del cliente
   - Anotar código del cliente
3. **Análisis de patrones:**
   - ¿Múltiples IPCs anómalos? → Probable error de carga
   - ¿Un solo IPC anómalo? → Investigar transacción específica
4. **Acción:**
   - Reportar al administrador del sistema
   - Validar datos en sistema core
   - Corregir CSV si es necesario

---

## 9. PREGUNTAS FRECUENTES

### 9.1. Uso General

**P: ¿Cada cuánto se actualizan los datos?**  
R: Depende de la configuración de tu organización. Típicamente:
- Datos transaccionales: Diario (automático)
- Datos analíticos: Semanal
- Consulta con tu administrador para confirmar.

**P: ¿Puedo exportar los datos filtrados?**  
R: Actualmente no hay función de exportación en la interfaz. Esta funcionalidad está en desarrollo. Contacta al administrador si necesitas extracciones específicas.

**P: ¿Los filtros se guardan al cerrar sesión?**  
R: No, los filtros son temporales. Al refrescar la página o cerrar sesión, se resetean. Debes aplicarlos nuevamente cada vez.

**P: ¿Puedo ver el historial de un cliente individual?**  
R: En la versión actual, solo ves el estado actual del cliente. El historial temporal está en desarrollo futuro.

---

### 9.2. Filtros

**P: ¿Por qué no aparecen opciones en un filtro?**  
R: Puede deberse a:
- No hay datos que cumplan los filtros previos aplicados
- Error de carga de datos (refresca la página)
- El campo está vacío en todos los registros

**P: ¿Puedo guardar combinaciones de filtros frecuentes?**  
R: Esta funcionalidad está planificada para versiones futuras (Filtros Favoritos). Por ahora debes aplicarlos manualmente.

**P: ¿Los filtros afectan las estadísticas del modal de distribución?**  
R: Sí, todas las visualizaciones y estadísticas respetan los filtros aplicados. Si quieres ver datos globales, limpia todos los filtros primero.

---

### 9.3. Indicadores

**P: ¿Qué IPC es el más importante?**  
R: No hay un IPC único más importante. Depende del objetivo:
- **Para cobranza inmediata:** IPC1 (Mora)
- **Para evaluación de riesgo:** IPC2 (Mora por tramos)
- **Para capacidad de pago:** IPC7
- **Para fidelización:** IPC11 (Retención)

Recomendación: Usa una combinación de IPCs de las 3 dimensiones para evaluación integral.

**P: ¿Por qué algunos clientes tienen valores "null" en IPCs?**  
R: Puede ser porque:
- Cliente nuevo (sin historial suficiente)
- Datos faltantes en el sistema fuente
- Indicador no aplica a ese tipo de crédito

Los registros con "null" no se muestran en el mapa para ese IPC específico.

**P: ¿Qué significa cuando veo muchos puntos negros?**  
R: Puntos negros indican valores **anómalos** (fuera de rango 0-100%). Causas:
- Error en carga de datos
- Valores incorrectos en sistema fuente
- Bug en cálculo del indicador

Reporta al administrador para corrección.

---

### 9.4. Mapa

**P: ¿Por qué el mapa está en blanco?**  
R: Posibles causas:
1. **Sin conexión a internet** - El mapa requiere conexión
2. **Filtros demasiado restrictivos** - No hay datos que mostrar
3. **Error de carga** - Refresca la página (F5)

**P: ¿Puedo cambiar el estilo del mapa (oscuro, claro, etc.)?**  
R: No directamente en la interfaz de usuario. El administrador puede configurar estilos alternativos en la configuración del sistema.

**P: ¿El mapa muestra datos en tiempo real?**  
R: No, el mapa muestra los datos de la última actualización del CSV. Para datos más recientes, solicita al administrador actualizar el archivo.

---

### 9.5. Performance

**P: ¿Por qué la aplicación va lenta?**  
R: Factores que afectan performance:
- **Cantidad de datos:** >20,000 registros puede ralentizar
- **Zoom muy alejado:** Muchos puntos renderizan simultáneamente
- **Navegador antiguo:** Actualiza a versión reciente
- **Múltiples pestañas:** Cierra pestañas no usadas

**Soluciones:**
- Aplica filtros para reducir cantidad de datos
- Haz zoom en áreas específicas
- Usa Chrome o Edge (mejor performance)

---

## 10. GLOSARIO DE TÉRMINOS

### 10.1. Términos Financieros

| Término | Definición |
|---------|------------|
| **Capacidad de Pago** | Habilidad económica del cliente para cumplir con sus obligaciones crediticias |
| **Cartera** | Conjunto total de créditos otorgados por ADRA |
| **Clustering** | Agrupación de puntos geográficos cercanos en el mapa |
| **Cobertura** | Proporción de la deuda que está respaldada por garantías o provisiones |
| **Concentración** | Grado en que la deuda del cliente está enfocada en ADRA vs otras instituciones |
| **Descapitalización** | Reducción del patrimonio (activos) del cliente en el tiempo |
| **Garantía Psicológica** | Compromiso emocional y confianza del cliente hacia ADRA |
| **Jerarquía de Pago** | Orden de prioridad de fuentes de ingreso usadas para pagar créditos |
| **Liquidez** | Disponibilidad de efectivo o activos fácilmente convertibles a efectivo |
| **Mora** | Atraso en el pago de obligaciones crediticias |
| **Provisiones** | Fondos reservados para cubrir posibles pérdidas por incumplimiento |
| **Sobreendeudamiento** | Situación donde el cliente tiene más deudas de las que puede pagar |
| **Ticket** | Cuota individual de pago de un crédito |
| **Voluntariedad** | Disposición del cliente a pagar sin presión de cobranza |

### 10.2. Términos Técnicos

| Término | Definición |
|---------|------------|
| **CSV** | Archivo de datos separados por comas (Comma-Separated Values) |
| **Dashboard** | Panel de control con visualizaciones y métricas clave |
| **Dimensión** | Agrupación temática de indicadores (Ingreso, Voluntad, Garantía) |
| **Filtro** | Criterio para limitar los datos mostrados en el sistema |
| **GeoJSON** | Formato de datos geográficos usado en el mapa |
| **IPC** | Indicador de Control Interno (Internal Performance Control) |
| **Modal** | Ventana emergente sobre la interfaz principal |
| **Percentil** | Valor bajo el cual cae un porcentaje de los datos |
| **Ratio** | Proporción o relación entre dos valores (ej: deuda/garantía) |
| **Zoom** | Nivel de acercamiento en el mapa |

### 10.3. Clasificaciones de Riesgo

| Nivel | Color | Descripción |
|-------|-------|-------------|
| **Anómalo** | ⚫ Negro | Valor fuera de rango, error probable |
| **Bajo** | 🟢 Verde | Situación saludable, bajo riesgo |
| **Moderado** | 🟠 Naranja | Requiere monitoreo, alerta temprana |
| **Medio-Alto** | 🟡 Amarillo | Atención necesaria, riesgo creciente |
| **Alto** | 🔵 Celeste | Requiere acción inmediata |
| **Crítico** | 🔴 Rojo | Intervención urgente, provisión requerida |

---

## ANEXO: WORKFLOWS RECOMENDADOS

### Workflow 1: Análisis Diario de Riesgo (15 minutos)

**Objetivo:** Identificación rápida de alertas diarias

1. **Abrir sistema** → Indicadores de Control Interno
2. **Dimensión INGRESO** → Seleccionar **IPC1 (Mora)**
3. **Observar mapa:** ¿Hay nuevos puntos rojos?
4. **Filtrar:** Calificación CR = "Deficiente" o peor
5. **Modal Distribución:** Ver cantidad de clientes >60 días mora
6. **Generar lista mental:** 3-5 casos prioritarios para seguimiento
7. **Comunicar:** Enviar alertas a equipo de cobranza

**Frecuencia:** Diaria (lunes a viernes, 9:00 AM)

---

### Workflow 2: Revisión Semanal de Cartera (45 minutos)

**Objetivo:** Análisis integral de la salud de la cartera

1. **Análisis por dimensión (15 min cada una):**

   **INGRESO:**
   - IPC1 (Mora): Tendencia semanal
   - IPC7 (Capacidad): Clientes con capacidad deteriorada
   - IPC9 (Concentración): Exposición institucional

   **VOLUNTAD:**
   - IPC3 (Mora proporcional): Patrones de morosidad
   - IPC10 (Contagio): Sobreendeudamiento
   - IPC12 (Rechazos): Operaciones rechazadas

   **GARANTÍA:**
   - IPC11 (Retención): Clientes antiguos vs nuevos
   - IPC15 (Experiencia crediticia): Madurez financiera
   - IPC14 (Variación ingreso): Estabilidad económica

2. **Comparación semanal:**
   - Anotar métricas clave en hoja de control
   - Comparar con semana anterior
   - Identificar tendencias (mejora/deterioro)

3. **Reporte ejecutivo:**
   - Top 5 alertas de la semana
   - 2-3 insights principales
   - Acciones recomendadas

**Frecuencia:** Semanal (viernes por la tarde)

---

### Workflow 3: Evaluación Mensual Estratégica (2 horas)

**Objetivo:** Análisis profundo para toma de decisiones estratégicas

1. **Análisis geográfico (30 min):**
   - Identificar sedes con mejor/peor performance
   - Buscar patrones regionales
   - Comparar zonas urbanas vs rurales

2. **Análisis de productos (30 min):**
   - Comparar performance entre tipos de crédito
   - Identificar productos de alto/bajo riesgo
   - Evaluar nuevos productos piloto

3. **Análisis demográfico (30 min):**
   - Performance por género
   - Segmentación por monto de crédito
   - Análisis de capacidad de pago

4. **Preparación de reporte gerencial (30 min):**
   - Presentación con insights principales
   - Gráficos y visualizaciones
   - Recomendaciones estratégicas
   - Plan de acción para próximo mes

**Frecuencia:** Mensual (última semana del mes)

---

## CONTACTO Y SOPORTE

### Soporte Técnico

**Para problemas técnicos del sistema:**

📧 **Email:** soporte-mirar@adra.org.pe  
📞 **Teléfono:** (01) 123-4567 Ext. 100  
🕐 **Horario:** Lunes a Viernes, 8:00 AM - 6:00 PM

### Capacitación

**Para solicitar capacitación adicional:**

📧 **Email:** capacitacion@adra.org.pe  
📅 **Talleres:** Primer martes de cada mes (presencial/virtual)

### Sugerencias y Mejoras

**Para proponer nuevas funcionalidades:**

🔗 **Portal:** https://mirar.adra.org.pe/sugerencias  
📧 **Email:** feedback-mirar@adra.org.pe

---

## FIN DEL MANUAL DE USUARIO

**Versión:** 1.0  
**Última actualización:** Enero 2026  
**Elaborado por:** Equipo de Desarrollo ADRA

> *"Trabajar con la gente en pobreza y sufrimiento para crear un cambio justo y positivo."*  
> — Misión ADRA

---

**¿Necesitas ayuda adicional?**  
Consulta el **Manual del Administrador** para información técnica avanzada o contacta a tu administrador de sistema.
