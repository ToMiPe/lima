# Modulo IPC - Guia de Usuario

## Descripcion

El modulo IPC permite analizar los Indicadores de Control Interno de la cartera de clientes.
Su objetivo es ayudar a revisar riesgo, comportamiento de pago, estabilidad financiera y distribucion geografica de los registros.

El modulo combina:

- seleccion de dimension e indicador
- filtros de negocio
- analisis grafico
- tabla detallada de registros
- vista en mapa
- exportacion de datos filtrados

## Ingreso al modulo

Ruta funcional:

`Reportes > IPC`

Al abrir el modulo, el sistema muestra una pantalla de analisis con tres zonas principales:

- panel izquierdo para seleccion y filtros
- panel central para graficos y tabla
- panel derecho para mapa geografico

## Dimensiones de analisis

El modulo organiza los indicadores en 3 dimensiones:

### 1. Ingreso del Cliente

Evalua capacidad economica, liquidez, solvencia y respaldo financiero.

Sirve para responder preguntas como:

- el cliente tiene respaldo para sostener la deuda
- sus ingresos son suficientes
- existe presion financiera

### 2. Voluntad de Pago

Evalua disciplina, conducta de pago e historial de cumplimiento.

Sirve para responder preguntas como:

- el cliente suele atrasarse
- la mora es puntual o recurrente
- existe compromiso real de pago

### 3. Garantia Psicologica

Evalua estabilidad personal y financiera, madurez economica y consistencia de comportamiento.

Sirve para responder preguntas como:

- el cliente muestra estabilidad
- mantiene respaldo o ahorro
- presenta senales de continuidad y compromiso

## Flujo de uso recomendado

1. Elegir una dimension.
2. Elegir un indicador IPC.
3. Revisar la descripcion e interpretacion del indicador.
4. Aplicar filtros de base de datos si se necesita acotar la muestra.
5. Analizar los graficos principales.
6. Revisar la tabla de datos si se necesita detalle.
7. Usar el mapa para ver distribucion territorial.
8. Exportar CSV si se requiere trabajo adicional.

## Panel izquierdo

El panel izquierdo concentra el control del analisis.

### Selector de indicador

Permite elegir el IPC que se desea analizar dentro de la dimension activa.

Cada opcion muestra:

- codigo del IPC
- nombre del indicador
- unidad de medida

Cuando se cambia de indicador, el sistema actualiza automaticamente:

- graficos
- estadisticas
- tabla
- mapa
- rangos visibles

### Filtros aplicados

El resumen de filtros muestra:

- total original de registros
- total luego de filtros de base de datos
- total visible en el mapa

Esto ayuda a entender cuanto se redujo la muestra analizada.

### Filtros de base de datos

Estos filtros se aplican antes del analisis del IPC.

Filtros disponibles:

- sede o agencia
- sexo o genero
- monto de credito
- producto
- zona geografica
- categoria
- calificacion CR
- capacidad de pago

Uso recomendado:

- aplicar filtros cuando se quiere analizar una sede especifica
- comparar tipos de producto
- revisar una zona geografica concreta
- concentrarse en un segmento de clientes

### Interpretacion

La seccion de interpretacion explica que significa un nivel:

- bajo
- moderado
- alto

La interpretacion cambia segun el indicador seleccionado.

### Visualizacion por rangos

Permite mostrar u ocultar rangos de clasificacion.

Acciones disponibles:

- `Todos`: activa todos los rangos
- `Ninguno`: oculta todos los rangos
- seleccion manual por rango

Esto es util para enfocarse solo en ciertos niveles de riesgo.

## Panel central - Analisis grafico

El panel central contiene 5 tabs principales.

### 1. Distribucion

Esta vista muestra dos graficos:

- distribucion porcentual
- vista porcentual comparativa

Sirve para ver rapidamente como se reparte la cartera entre los rangos del indicador.

Usar esta tab cuando se quiere:

- identificar el rango dominante
- ver si predomina riesgo bajo, medio o alto
- tener una lectura ejecutiva inicial

### 2. Barras Detalladas

Muestra un grafico de barras por rango y una tabla resumen debajo.

Sirve para:

- comparar cantidades entre rangos
- revisar porcentaje exacto por rango
- identificar con precision cual es el rango mas representativo

Usar esta tab cuando se necesita una lectura mas precisa que la distribucion circular.

### 3. Tendencia Acumulada

Muestra la acumulacion progresiva de registros entre los distintos rangos.

Sirve para:

- identificar concentracion en los primeros rangos
- ver si la distribucion es uniforme o esta cargada hacia pocos segmentos

Interpretacion general:

- curva pronunciada al inicio: alta concentracion
- curva suave: distribucion mas uniforme

### 4. Estadisticas

Muestra medidas resumen del indicador.

Incluye:

- minimo
- promedio
- mediana
- maximo
- total de registros
- rango entre maximo y minimo

Sirve para:

- entender el comportamiento global del indicador
- revisar dispersion
- detectar valores extremos

### 5. Tabla de Datos

Muestra el detalle operativo registro por registro.

Columnas principales:

- cliente
- codigo de cliente
- documento
- agencia
- genero
- producto
- plazo
- saldo capital
- dias de atraso
- valor del IPC
- clasificacion

Funciones disponibles:

- busqueda por cliente o codigo
- ordenamiento por columnas
- paginacion
- exportacion a CSV
- navegacion hacia el mapa

Usar esta tab cuando se necesita validacion caso por caso.

## Que hace cada grafico principal

### Grafico de distribucion porcentual

Muestra cuanto representa cada rango dentro del total analizado.

Ayuda a responder:

- donde esta concentrada la cartera
- cuantos registros caen en cada rango

### Vista porcentual comparativa

Complementa la distribucion principal con una vista mas comparativa de pesos relativos.

Ayuda a comparar visualmente la participacion de cada grupo.

### Grafico de barras por rangos

Muestra cantidad de registros por rango con una lectura directa y precisa.

Es util para reportes operativos y comparaciones exactas.

### Grafico de tendencia acumulada

Muestra la acumulacion de registros conforme avanzan los rangos.

Es util para entender concentracion y progresion.

### Grafico de resumen estadistico

Resume el comportamiento del indicador con medidas centrales y extremas.

Es util para presentar conclusiones ejecutivas.

## Interaccion con los graficos

Al hacer clic en un segmento o barra de un rango, el sistema abre un detalle del rango seleccionado.

Ese detalle permite:

- ver cuantos registros componen el rango
- revisar la lista de clientes de ese subconjunto
- profundizar el analisis sin salir del modulo

## Panel derecho - Mapa

El mapa muestra los registros con ubicacion valida.

Cada punto representa un registro y su color depende del rango del IPC.

El mapa sirve para:

- identificar concentracion territorial
- detectar zonas con mayor riesgo
- visualizar dispersion geografica de la muestra

Funciones del mapa:

- zoom y desplazamiento
- agrupacion de puntos
- informacion rapida al pasar el cursor
- seleccion visual de registros

## Relacion entre tabla y mapa

El modulo sincroniza tabla y mapa.

### Desde la tabla al mapa

Si un registro tiene coordenadas, se puede usar el icono de ubicacion para centrar el mapa en ese cliente.

### Desde el mapa a la tabla

Cuando se selecciona un punto en el mapa, la fila correspondiente puede quedar resaltada en la tabla.

Esto ayuda a combinar analisis territorial con revision operativa.

## Exportacion de datos

En la tab `Tabla de Datos` existe el boton `Exportar CSV`.

La exportacion descarga los registros filtrados para su revision en Excel u otra herramienta.

## Modal de distribucion de datos

El modulo incluye una vista complementaria de distribucion de la muestra analizada.

Esta seccion organiza la informacion en 5 tabs:

### 1. Genero

Muestra como se distribuyen los registros por genero.

Sirve para entender la composicion basica de la muestra.

### 2. Sedes

Muestra el Top 15 de sedes o agencias.

Sirve para identificar en que agencias se concentra la mayor cantidad de registros.

### 3. Productos

Muestra la distribucion por producto.

Sirve para ver que lineas de negocio explican el comportamiento del indicador.

### 4. Zonas

Muestra la distribucion por zona geografica.

Sirve para analizar concentracion territorial de la muestra.

### 5. Montos

Muestra la distribucion por rangos de monto.

Sirve para saber si el comportamiento del IPC esta concentrado en creditos pequenos, medianos o grandes.

## Recomendaciones de uso

- usar primero Distribucion para entender el panorama general
- usar Barras Detalladas para comparar rangos con precision
- usar Tendencia Acumulada para revisar concentracion
- usar Estadisticas para conclusiones resumidas
- usar Tabla de Datos para validacion operativa
- usar el Mapa para revisar ubicacion territorial de casos relevantes

## Consideraciones importantes

### No todo registro aparece en el mapa

Para aparecer en el mapa, el registro debe contar con coordenadas validas.

### Los filtros de base de datos cambian toda la muestra analizada

Si se aplican filtros, cambian:

- conteos
- porcentajes
- promedios
- registros visibles

### Los filtros por rango sirven para enfoque visual

Estos filtros ayudan a concentrarse en ciertas clasificaciones sin cambiar el contexto funcional del indicador seleccionado.

## Resumen

El modulo IPC permite:

- seleccionar una dimension de analisis
- elegir un indicador especifico
- filtrar la muestra de datos
- revisar graficos y estadisticas
- analizar registros en tabla
- ver la distribucion geografica en mapa
- exportar datos filtrados

Es una herramienta pensada para analisis funcional, monitoreo y revision detallada de comportamiento de cartera.