
# PROMPT — Dashboard "Monitor SDS" (Material Design)

Genera el diseño de un dashboard web estilo **Material Design**, moderno, limpio y profesional, para una plataforma de monitoreo de impresoras/equipos llamada **Monitor SDS** de la empresa **Misión Tecnológica**.

---

## 1. Identidad y metadatos del sitio

- **Nombre de pestaña del navegador (title tag):** `Mision Tecnologica | Monitor SDS`
- **Favicon:** usar la imagen ubicada en `/monitor.sds/public/favicon-mt.png`
- **Logo principal (header):** usar la imagen ubicada en `/monitor-sds/public/logoMT.avif`, alineado a la izquierda del header, con altura aproximada de 32–40px, manteniendo proporción (no deformar).
- **Color principal (primary):** `#0066FF`
- **Color de superficie/fondo:** blanco `#FFFFFF` o gris muy claro `#F5F7FA` para el fondo general de la app, tarjetas en blanco puro con sombra sutil (elevation 1-2 de Material Design).
- **Colores de estado (para donuts, chips y estados):**
  - Online / Activo: verde `#2E7D32` o similar
  - Offline / Alerta crítica: rojo `#D32F2F`
  - Unknown / Advertencia: ámbar `#F9A825`
- **Tipografía:** tipo Roboto o Inter, jerarquía clara (títulos 20-24px semibold, subtítulos 14-16px medium, cuerpo 12-14px regular).
- **Estilo de componentes:** Material Design 3 (bordes redondeados 8-12px, sombras suaves, ripple/hover states, iconografía outline estilo Material Icons).

---

## 2. Header (barra superior, fija)

Debe incluir, de izquierda a derecha:

1. **Logo** `/monitor-sds/public/logoMT.avif`
2. **Nombre de la plataforma** ("Monitor SDS") como texto secundario junto al logo (opcional, tipografía media, gris oscuro).
3. **Buscador centrado o alineado a la izquierda-centro**: un campo de búsqueda tipo Material (input con ícono de lupa, bordes redondeados, fondo gris claro `#F1F3F6`) con placeholder **"Buscar cliente..."**. Debe permitir filtrar toda la vista por cliente.
4. **A la derecha:** ícono de notificaciones/alertas (con badge numérico rojo si hay alertas activas), ícono o avatar de usuario, y un switch/tabs para cambiar entre las dos vistas principales: **"Estatus"** y **"Alertas"**.
5. Color de fondo del header: blanco con línea divisoria inferior sutil, o azul primario `#0066FF` con texto/íconos en blanco (elige una variante y sé consistente).

---

## 3. Navegación

Debajo del header o como parte de él, un sistema de **tabs (pestañas Material)** con dos opciones:

- **Estatus** (vista general/ejecutiva)
- **Alertas** (vista operativa)

La pestaña activa se resalta con el color primario `#0066FF` (subrayado o fondo tipo "pill").

---

## 4. VISTA 1 — Estatus

### Fila 1 — KPI Cards (8 tarjetas, grid 4x2)

Tarjetas Material blancas, sombra ligera, ícono representativo arriba a la izquierda en color primario, número grande (24-28px bold) y etiqueta descriptiva debajo (12px gris):

1. Total Clientes
2. Clientes Activos (chip verde)
3. Clientes Expirados (chip rojo)
4. Total Equipos
5. % Equipos Online (con mini barra de progreso circular verde)
6. % Equipos Offline (con mini barra de progreso circular roja)
7. Cobertura de Monitoreo
8. Equipos Nuevos del Mes (con flecha de tendencia ↑ verde)

### Fila 2 — Tendencia de Monitoreo (2 gráficos lineales, 50/50)

- Izquierda: **"Equipos Descubiertos por Semana"** — line chart, color primario `#0066FF`, área con gradiente suave debajo de la línea.
- Derecha: **"Equipos Descubiertos por Mes"** — line chart similar.

### Fila 3 — Tendencia de Desincronización (2 gráficos lineales, 50/50)

- Izquierda: **"Equipos Desincronizados por Semana"** — línea en color rojo/naranja de alerta.
- Derecha: **"Equipos Desincronizados por Mes"** — misma paleta.

### Fila 4 — Estado General del Parque (2 donuts, 50/50)

- Izquierda: **"Estado de Monitoreo"** — donut con 3 segmentos: ONLINE (verde), OFFLINE (rojo), UNKNOWN (ámbar). Leyenda lateral con porcentajes.
- Derecha: **"Equipos por Fabricante"** — donut multicolor (Kyocera, HP, Canon, Epson), leyenda con nombre y cantidad.

### Fila 5 — Distribución del Inventario (2 gráficos de barras horizontales, 50/50)

- Izquierda: **"Equipos por Cliente"** — barras horizontales ordenadas de mayor a menor, color primario.
- Derecha: **"Equipos por Modelo"** — Top 10 modelos, barras horizontales.

### Fila 6 — Evolución del Inventario (2 gráficos lineales, 50/50)

- Izquierda: **"Equipos Registrados por Mes"**.
- Derecha: **"Equipos Descubiertos por Mes (Histórico)"**.

### Fila 7 — Información Complementaria (2 cards)

- **Antigüedad Promedio del Parque**
- **Último Contacto Promedio**

Tarjetas simples con ícono, valor y descripción, mismo estilo que Fila 1 pero en ancho medio.

---

## 5. VISTA 2 — Alertas

### Fila 1 — KPI Cards de alerta (4 tarjetas)

Estilo similar a las cards de Estatus, pero con acentos en colores de alerta (rojo/ámbar) y bordes o íconos de advertencia:

1. Equipos sin contacto 24 horas
2. Equipos sin contacto 7 días
3. Equipos Nunca Contactados
4. Serial Number Duplicados

### Fila 2 — Timeline Horizontal de Salud del Parque

Componente tipo **timeline horizontal** con línea base y puntos/nodos cronológicos, cada nodo con:

- Ícono según tipo de evento (sincronización perdida, recuperación, sin contacto, duplicado, descubrimiento)
- Color codificado (verde = positivo, rojo = crítico, ámbar = advertencia)
- Tooltip/etiqueta con el detalle del evento y fecha

### Fila 3 — Tablas de Seguimiento (Material Data Tables)

Tres tablas con encabezado en gris claro, filas alternadas (zebra striping sutil), chips de estado por color:

1. **Equipos sin contacto 24h** — columnas: Cliente, Serial Number, Modelo, Último Contacto, Estado (chip), IP
2. **Equipos sin contacto 7 días** — mismas columnas
3. **Equipos Nunca Contactados** — columnas: Cliente, Serial Number, Modelo, Fecha de Registro, Estado, IP

### Fila 4 — Tabla de Duplicados

**Equipos con Serial Number Duplicado** — columnas: Serial Number, Cliente, Device ID, Modelo, Fabricante.

---

## 6. Layout general y responsividad

- Sidebar opcional no requerido; navegación principal por tabs en el header.
- Grid de 12 columnas, contenedores con padding 24px, separación entre secciones 16-24px.
- Todas las cards con `border-radius: 12px` y sombra `elevation-1` (Material Design), hover con `elevation-2`.
- Diseño responsive: en mobile, las filas de 2 gráficos pasan a 1 columna (stack vertical), las cards KPI pasan a scroll horizontal o grid 2x4.

---

## 7. Objetivo del prompt para la IA generadora de imágenes/UI

Genera una **captura de pantalla de alta fidelidad (mockup)** de este dashboard en la vista **"Estatus"** (o ambas vistas si es posible), aplicando Material Design, el color primario `#0066FF`, el logo y favicon indicados, y el buscador de cliente en el header, respetando el orden y jerarquía visual descrita arriba.
