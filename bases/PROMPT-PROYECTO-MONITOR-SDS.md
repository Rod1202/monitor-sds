# PROMPT — Proyecto "Monitor SDS" (Misión Tecnológica)

Documento maestro para generar el proyecto completo: frontend (dashboard Material Design), backend serverless (Netlify Functions) y base de datos (Supabase), consumiendo la API de EKM Insight / HP Smart Device Services (SDS).

---

## 0. Objetivo del proyecto

Construir un dashboard web de monitoreo de impresoras/equipos para clientes de HP SDS Latam, con dos vistas principales (**Estatus** y **Alertas**), que:

1. Consulta la API de EKM Insight (`/monitor-sds/bases/DOC_API.MD`) a través de **Netlify Functions** (nunca desde el navegador, para no exponer credenciales).
2. Calcula el estado de cada equipo (**Online / Offline / Unknown**) en base al campo `lastContact` devuelto por `GET /api/devices`.
3. Persiste snapshots diarios de sincronización en **Supabase** (`/monitor-sds/bases/supabase-database.sql`) para poder graficar tendencias históricas (por semana, por mes).
4. Se despliega en **Netlify** (sitio estático + funciones serverless + variables de entorno).

---

## 1. Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + TypeScript |
| UI Kit | MUI (Material UI v6) — Material Design 3 |
| Gráficos | MUI X Charts o Recharts (line charts, donuts, barras horizontales) |
| Tablas | MUI DataGrid o tablas MUI con paginación |
| Backend serverless | Netlify Functions (Node.js, carpeta `netlify/functions/`) |
| Base de datos | Supabase (PostgreSQL) |
| Hosting | Netlify (sitio + functions + scheduled functions) |
| Autenticación contra API externa | JWT de dos pasos (Basic Auth → Bearer Token), manejado 100% en backend |

---

## 2. Arquitectura general

```
[Browser: React/Vite/MUI]
        │  (fetch a rutas relativas /.netlify/functions/*)
        ▼
[Netlify Functions]
   ├── auth.ts            → hace login contra EKM Insight, cachea el JWT
   ├── customers.ts       → GET /api/customers (proxy)
   ├── devices.ts         → GET /api/devices?customerId= (proxy)
   ├── sync-snapshot.ts   → función programada (scheduled) que:
   │                          1. Trae customers activos
   │                          2. Trae devices por cada customer
   │                          3. Calcula estado (Online/Offline/Unknown)
   │                          4. Inserta un snapshot por device en Supabase
   └── dashboard-data.ts  → agrega/consulta datos ya calculados desde Supabase
        │
        ▼
[Supabase Postgres]
   └── device_sync_snapshots (ver supabase-database.sql)
```

**Regla de seguridad:** `apikey` y `apisecret` de EKM Insight y las credenciales de Supabase (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) viven solo como **variables de entorno de Netlify**, nunca en el bundle del frontend.

---

## 3. Variables de entorno (Netlify → Site settings → Environment variables)

```
EKM_API_BASE_URL=https://hp-sds-latam.insightportal.net/PortalAPI
EKM_API_KEY=...
EKM_API_SECRET=...

SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...   # usado solo en funciones, no en frontend
SUPABASE_ANON_KEY=...           # si el frontend necesita leer datos directamente
```

---

## 4. Documentación de la API EKM Insight / HP SDS (referencia)

> Spec 1.18 — OpenAPI 3.0.1 — Base URL: `https://hp-sds-latam.insightportal.net/PortalAPI`

### 4.1 Autenticación (dos pasos)

**Paso 1 — Login:** `POST /login`
- Auth: HTTP Basic con `Authorization: Basic base64(apikey:apisecret)`
- Sin body
- Respuesta `200 OK`:
```json
{ "access_token": "string", "token_type": "string", "expires_in": 0 }
```
El token también viene en el header de respuesta `Authorization: Bearer <token>`.

**Paso 2 — Resto de endpoints:** requieren `Authorization: Bearer <access_token>`.

> El JWT es de vida corta (`expires_in` en segundos). La función de backend debe renovarlo proactivamente antes de que expire, no esperar a un `401`.

### 4.2 `GET /api/customers`

Lista de clientes.

| Parámetro | Ubicación | Tipo | Requerido |
|---|---|---|---|
| `name` | query | string | No |
| `status` | query | string (`ACTIVE`/`EXPIRED`) | No |
| `groupId` | query | integer | No |
| `includeCustomFields` | query | boolean | No |

Respuesta: `array<CustomerRestDTO>` con campos como `name`, `status`, `createdDate`, `customerId`, `groupId`, etc.

### 4.3 `GET /api/devices`

Lista de dispositivos por cliente.

| Parámetro | Ubicación | Tipo | Requerido |
|---|---|---|---|
| `customerId` | query | integer | **Sí** |
| `includeExtendedFields` | query | boolean | No |
| `includeCustomFields` | query | boolean | No |

Respuesta: `array<DeviceRestDTO>`, campo clave: **`lastContact`** (ISO 8601 UTC, ej. `2026-07-01T10:15:00Z`), además de `serialNumber`, `deviceId`, `customerId`, `ipAddress`, `extendedFields.manufacturer`, `extendedFields.model`, `extendedFields.zone`, `registered`, `discoveryDate`, etc.

### 4.4 Flujo típico de consulta

1. `GET /api/customers?status=ACTIVE` → lista de clientes activos.
2. Por cada `customerId` → `GET /api/devices?customerId=X&includeExtendedFields=true`.
3. Con cada device, calcular estado (ver sección 5).
4. Insertar un snapshot por device en Supabase (tabla `device_sync_snapshots`).

Hay **39 endpoints GET en total** documentados en el spec completo (Customer, Group, Zone, Territory, Delivery Location, Notes, Portal User, Monitor, Discovery Range, Device, Media, Consumable Requests), pero el MVP de este dashboard solo necesita `customers` y `devices`.

---

## 5. Lógica de cálculo de estado (Online / Offline / Unknown)

Regla de negocio, en base al campo `lastContact` de cada device comparado contra **la fecha del sistema (hoy, UTC)**:

- **Online**: `lastContact` no es nulo **y** su fecha (parte `YYYY-MM-DD` en UTC) es **igual** a la fecha actual del sistema.
- **Offline**: `lastContact` no es nulo pero su fecha es **anterior** a hoy.
- **Unknown**: `lastContact` es `null`/ausente (el equipo nunca fue contactado o el dato no vino en la respuesta).

Esto coincide exactamente con la lógica ya implementada en el trigger SQL `update_device_sync_estado()` (ver sección 6), que compara `(last_contact AT TIME ZONE 'UTC')::DATE = snapshot_date`. El backend debe replicar esta misma comparación al calcular el estado antes de insertar el snapshot, y también al calcular en tiempo real las tarjetas KPI del frontend (llamando a `dashboard-data.ts`, que lee de Supabase, no directo de la API en cada render).

**Alertas derivadas** (Vista "Alertas"):
- **Sin contacto 24h**: `lastContact` existe y `now() - lastContact > 24h`.
- **Sin contacto 7 días**: `lastContact` existe y `now() - lastContact > 7 días`.
- **Nunca contactados**: `lastContact IS NULL`.
- **Serial Number duplicados**: mismo `serialNumber` asociado a más de un `deviceId` (o a más de un `customerId`) en el snapshot más reciente.

---

## 6. Esquema de base de datos (Supabase)

```sql
-- ============================================================
-- TABLA: Snapshots de sincronización de equipos
-- ============================================================

CREATE TABLE IF NOT EXISTS device_sync_snapshots (
    snapshot_id     BIGSERIAL PRIMARY KEY,

    -- Datos del cliente
    customer_name   TEXT NOT NULL,
    customer_id     INTEGER NOT NULL,

    -- Datos del equipo
    device_id       INTEGER NOT NULL,
    serial_number   TEXT,
    last_contact    TIMESTAMPTZ,

    -- Fecha en que se realizó la consulta
    snapshot_date   DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Estado calculado por trigger
    estado          TEXT NOT NULL,

    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- FUNCIÓN PARA CALCULAR EL ESTADO
-- ============================================================

CREATE OR REPLACE FUNCTION update_device_sync_estado()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    IF NEW.last_contact IS NOT NULL
       AND (NEW.last_contact AT TIME ZONE 'UTC')::DATE = NEW.snapshot_date THEN
        NEW.estado := 'Sincronizado';
    ELSE
        NEW.estado := 'Desincronizado';
    END IF;
    RETURN NEW;
END;
$$;

-- ============================================================
-- TRIGGER
-- ============================================================

DROP TRIGGER IF EXISTS trg_device_sync_estado
ON device_sync_snapshots;

CREATE TRIGGER trg_device_sync_estado
BEFORE INSERT OR UPDATE
ON device_sync_snapshots
FOR EACH ROW
EXECUTE FUNCTION update_device_sync_estado();

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_snapshots_customer_date
ON device_sync_snapshots(customer_id, snapshot_date);

CREATE INDEX IF NOT EXISTS idx_snapshots_estado
ON device_sync_snapshots(estado);

CREATE INDEX IF NOT EXISTS idx_snapshots_device
ON device_sync_snapshots(device_id, snapshot_date);
```

> **Nota de mapeo:** el trigger usa `'Sincronizado'`/`'Desincronizado'` como nomenclatura de "estado del snapshot diario", que es distinto (pero relacionado) del estado **Online/Offline/Unknown** que se muestra en el dashboard. El backend, al insertar, debe guardar en `estado` (o en una columna adicional `estado_dashboard`) el valor Online/Offline/Unknown calculado según la regla de la sección 5, para poder alimentar directamente los donuts y KPIs sin recalcular en el frontend. Se recomienda agregar una columna extra si se quiere conservar ambos conceptos:
> ```sql
> ALTER TABLE device_sync_snapshots
> ADD COLUMN IF NOT EXISTS estado_conectividad TEXT; -- 'Online' | 'Offline' | 'Unknown'
> ```

**Queries de referencia útiles** (ya incluidas en el SQL original): resumen del día por cliente/estado, listado de equipos desincronizados, histórico de % de sincronización por cliente y fecha.

---

## 7. Especificación de UI (Material Design) — Dashboard "Monitor SDS"

### 7.1 Identidad y metadatos

- Título de pestaña: `Mision Tecnologica | Monitor SDS`
- Favicon: `/monitor.sds/public/favicon-mt.png`
- Logo header: `/monitor-sds/public/logoMT.avif`, alineado a la izquierda, 32–40px de alto, proporción respetada
- Color primario: `#0066FF`
- Fondo: blanco `#FFFFFF` o gris claro `#F5F7FA`; cards blancas con elevation 1-2
- Colores de estado:
  - Online/Activo: verde `#2E7D32`
  - Offline/Alerta crítica: rojo `#D32F2F`
  - Unknown/Advertencia: ámbar `#F9A825`
- Tipografía: Roboto o Inter (títulos 20–24px semibold, subtítulos 14–16px medium, cuerpo 12–14px regular)
- Componentes Material Design 3: bordes redondeados 8–12px, sombras suaves, hover/ripple, iconografía outline (Material Icons)

### 7.2 Header (fijo)

De izquierda a derecha:
1. Logo `logoMT.avif`
2. Texto "Monitor SDS" junto al logo (secundario, gris oscuro)
3. Buscador Material — placeholder **"Buscar cliente..."**, fondo `#F1F3F6`, ícono de lupa, filtra toda la vista por cliente
4. A la derecha: ícono de notificaciones (badge rojo numérico si hay alertas), avatar/usuario, y tabs/switch **Estatus / Alertas**
5. Fondo del header: blanco con línea divisoria inferior, o azul primario `#0066FF` con íconos/texto en blanco (elegir una variante y mantenerla consistente)

### 7.3 Navegación

Tabs Material: **Estatus** (vista ejecutiva) y **Alertas** (vista operativa). Tab activa resaltada en `#0066FF` (subrayado o "pill").

### 7.4 Vista 1 — Estatus

**Fila 1 — KPI Cards (grid 4x2, 8 tarjetas):**
1. Total Clientes
2. Clientes Activos (chip verde)
3. Clientes Expirados (chip rojo)
4. Total Equipos
5. % Equipos Online (mini progreso circular verde)
6. % Equipos Offline (mini progreso circular rojo)
7. Cobertura de Monitoreo
8. Equipos Nuevos del Mes (flecha de tendencia ↑ verde)

**Fila 2 — Tendencia de Monitoreo (2 line charts, 50/50):**
- "Equipos Descubiertos por Semana" (color primario, área con gradiente)
- "Equipos Descubiertos por Mes"

**Fila 3 — Tendencia de Desincronización (2 line charts, 50/50):**
- "Equipos Desincronizados por Semana" (rojo/naranja)
- "Equipos Desincronizados por Mes"

**Fila 4 — Estado General del Parque (2 donuts, 50/50):**
- "Estado de Monitoreo": ONLINE (verde) / OFFLINE (rojo) / UNKNOWN (ámbar), leyenda con porcentajes
- "Equipos por Fabricante": donut multicolor (Kyocera, HP, Canon, Epson), leyenda con nombre y cantidad

**Fila 5 — Distribución del Inventario (2 barras horizontales, 50/50):**
- "Equipos por Cliente" (orden descendente, color primario)
- "Equipos por Modelo" (Top 10)

**Fila 6 — Evolución del Inventario (2 line charts, 50/50):**
- "Equipos Registrados por Mes"
- "Equipos Descubiertos por Mes (Histórico)"

**Fila 7 — Información Complementaria (2 cards, ancho medio):**
- "Antigüedad Promedio del Parque"
- "Último Contacto Promedio"

### 7.5 Vista 2 — Alertas

**Fila 1 — KPI Cards de alerta (4 tarjetas, acentos rojo/ámbar):**
1. Equipos sin contacto 24 horas
2. Equipos sin contacto 7 días
3. Equipos Nunca Contactados
4. Serial Number Duplicados

**Fila 2 — Timeline horizontal de salud del parque:**
Línea base con nodos cronológicos; cada nodo con ícono según tipo de evento (sincronización perdida, recuperación, sin contacto, duplicado, descubrimiento), color codificado (verde/rojo/ámbar), tooltip con detalle y fecha.

**Fila 3 — Tablas de seguimiento (Material Data Tables, zebra striping, chips de estado):**
1. **Equipos sin contacto 24h** — Cliente, Serial Number, Modelo, Último Contacto, Estado (chip), IP
2. **Equipos sin contacto 7 días** — mismas columnas
3. **Equipos Nunca Contactados** — Cliente, Serial Number, Modelo, Fecha de Registro, Estado, IP

**Fila 4 — Tabla de duplicados:**
**Equipos con Serial Number Duplicado** — Serial Number, Cliente, Device ID, Modelo, Fabricante

### 7.6 Layout y responsividad

- Sin sidebar; navegación por tabs en el header
- Grid de 12 columnas, padding 24px, separación entre secciones 16–24px
- Cards con `border-radius: 12px`, `elevation-1` (hover → `elevation-2`)
- Responsive: filas de 2 gráficos → 1 columna en mobile; KPI cards → scroll horizontal o grid 2x4

---

## 8. Estructura de carpetas propuesta

```
monitor-sds/
├── netlify.toml
├── package.json
├── vite.config.ts
├── public/
│   ├── favicon-mt.png
│   └── logoMT.avif
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── theme/                 # tema MUI (color primario #0066FF, tipografía)
│   ├── components/
│   │   ├── layout/            # Header, Tabs, Buscador
│   │   ├── kpi/                # KpiCard
│   │   ├── charts/             # LineChart, DonutChart, BarChartHorizontal
│   │   ├── tables/              # DataTable con chips de estado
│   │   └── timeline/            # TimelineHealth
│   ├── views/
│   │   ├── EstatusView.tsx
│   │   └── AlertasView.tsx
│   ├── hooks/                  # useCustomers, useDevices, useDashboardData
│   └── types/                  # CustomerRestDTO, DeviceRestDTO, SnapshotRow
└── netlify/
    └── functions/
        ├── auth.ts             # login + cache de JWT (in-memory / con expiración)
        ├── customers.ts        # proxy GET /api/customers
        ├── devices.ts          # proxy GET /api/devices?customerId=
        ├── sync-snapshot.ts    # scheduled function: recorre customers→devices→inserta en Supabase
        └── dashboard-data.ts   # lee agregados desde Supabase para el frontend
```

### `netlify.toml` (referencia)

```toml
[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[functions]
  node_bundler = "esbuild"

[[plugins]]
  package = "@netlify/plugin-functions-install-core"

# Scheduled function: correr sync-snapshot todos los días, ej. cada hora
[[scheduled.functions]]
  path = "sync-snapshot"
  schedule = "0 * * * *"
```

---

## 9. Pasos de implementación sugeridos

1. Crear proyecto: `npm create vite@latest monitor-sds -- --template react-ts`, instalar MUI (`@mui/material`, `@mui/icons-material`, `@emotion/react`, `@emotion/styled`), y librería de charts.
2. Configurar tema MUI con `primary.main: '#0066FF'`, tipografía Roboto/Inter, `shape.borderRadius: 12`.
3. Implementar `netlify/functions/auth.ts`: login Basic → obtener JWT → cachear en memoria con timestamp de expiración (`expires_in`), renovar automáticamente antes de expirar.
4. Implementar `customers.ts` y `devices.ts` como proxies autenticados (reusan el JWT de `auth.ts`).
5. Implementar `sync-snapshot.ts` como **scheduled function**: trae customers activos → por cada uno trae devices → calcula estado Online/Offline/Unknown (sección 5) → inserta filas en `device_sync_snapshots` vía Supabase client (`@supabase/supabase-js`, con `SUPABASE_SERVICE_ROLE_KEY`).
6. Implementar `dashboard-data.ts`: agrega los datos de Supabase (conteos por estado, por fabricante, por cliente, históricos por semana/mes) y expone JSON listo para las cards/gráficos.
7. Construir componentes de UI (Header, Tabs, KPI Cards, Charts, Timeline, Data Tables) siguiendo sección 7.
8. Conectar frontend a las funciones vía `fetch('/.netlify/functions/dashboard-data')`, con estados de loading/error.
9. Configurar variables de entorno en Netlify (sección 3) y desplegar (`netlify deploy --prod` o conectar el repo a Netlify).
10. Verificar que la scheduled function corre correctamente y que los snapshots se acumulan día a día para alimentar los históricos.

---

## 10. Notas finales

- El JWT de EKM Insight es de vida corta; toda función que lo use debe validar expiración antes de cada llamada.
- Las fechas de la API vienen en ISO 8601 UTC (`2026-07-01T10:15:00Z`); todas las comparaciones de "hoy" deben hacerse en UTC para evitar desfases de zona horaria entre servidor/API/Supabase.
- El campo `estado` del trigger SQL (`Sincronizado`/`Desincronizado`) es independiente del estado de conectividad (`Online`/`Offline`/`Unknown`) mostrado en el dashboard — decidir si se unifican o se guardan en columnas separadas antes de escribir el código de inserción.
