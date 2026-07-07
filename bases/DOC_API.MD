# EKM Insight API — HP SDS Latam

Documentación de referencia para consumir la API de EKM Insight / HP Smart Device Services (SDS).


| **Versión del spec** | 1.18 |
| **Base URL** | `https://hp-sds-latam.insightportal.net/PortalAPI` |
| **Formato** | OpenAPI 3.0.1 |
| **Fuente** | Generado a partir de `/PortalAPI/v3/api-docs` |
| **Autor** | Rodrigo Carbonel |

Esta API expone datos de la plataforma EKM Insight / HP Smart Device Services (SDS): clientes, dispositivos, monitores (equipos con agente de recolección), zonas, territorios, grupos, notas, consumibles, contadores/lecturas y solicitudes de consumibles.

---

## 1. Autenticación

La API usa un esquema de **dos pasos**: primero se obtiene un JWT usando Basic Auth, y luego ese JWT se usa como Bearer Token en el resto de las llamadas.

### Paso 1 — Obtener el token (`POST /login`)

- **Endpoint:** `POST https://hp-sds-latam.insightportal.net/PortalAPI/login`
- **Autenticación de esta llamada:** Basic Authentication (HTTP Basic, esquema `apiKey` transportado en el header `Authorization`)
- **Credenciales:** tu `apikey` y `apisecret` concatenados como `apikey:apisecret`, codificados en Base64, enviados en el header:

```
Authorization: Basic <base64(apikey:apisecret)>
```

No requiere body.

**Respuesta `200 OK`:**

El token también viene en el header de respuesta `Authorization: Bearer <token>`, y además en el body:

```json
{
  "access_token": "string",
  "token_type": "string",
  "expires_in": 0
}
```

### Paso 2 — Usar el token en las demás llamadas

Todos los demás endpoints (incluyendo todos los GET documentados en este archivo) requieren el esquema de seguridad **JWT (HTTP Bearer)**:

```
Authorization: Bearer <access_token>
```

### Ejemplo con curl

```bash
# 1. Login
curl -X POST "https://hp-sds-latam.insightportal.net/PortalAPI/login" \
  -H "Authorization: Basic $(echo -n 'TU_APIKEY:TU_APISECRET' | base64)"

# 2. Llamada autenticada usando el token obtenido
curl -X GET "https://hp-sds-latam.insightportal.net/PortalAPI/api/customers" \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

> **Nota:** `expires_in` indica la vigencia del token en segundos. Cuando expira, hay que repetir el Paso 1.

---

## 2. Índice de endpoints GET por categoría (tag)

| Categoría | Cantidad de endpoints GET |
|---|---|
| Customer API | 3 |
| Group API | 2 |
| Zone API | 2 |
| Territory API | 2 |
| Delivery Location API | 2 |
| Notes API | 2 |
| Portal User API | 1 |
| Monitor API | 4 |
| Discovery Range API | 1 |
| Device API | 16 |
| Media API | 2 |
| Consumable Requests API | 2 |
| **Total** | **39** |

Todos requieren `Authorization: Bearer <token>` salvo que se indique lo contrario.

---

## 3. Endpoints GET — detalle

### Customer API

#### `GET /api/customers`

Get a list of customers.

**Parámetros:**

| Nombre | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `name` | query | string | No | Customer name |
| `status` | query | string | No | Customer status (`ACTIVE` o `EXPIRED`) |
| `groupId` | query | integer (int32) | No | Group ID |
| `includeCustomFields` | query | boolean | No | Include custom fields in response (optional) |

**Respuesta `200 OK`** — esquema: `array<CustomerRestDTO>`

```json
[
  {
    "name": "string",
    "address": "string",
    "city": "string",
    "zip": "string",
    "country": "string",
    "contactName": "string",
    "contactEmail": "string",
    "telephoneNumber": "string",
    "status": "ACTIVE",
    "createdDate": "2026-07-01T10:15:00Z",
    "customFields": true,
    "customerId": 0,
    "groupId": 0,
    "customFieldValues": {}
  }
]
```

---

### Device API

#### `GET /api/devices`

Get a list of devices by Customer ID.

**Parámetros:**

| Nombre | Ubicación | Tipo | Requerido | Descripción |
|---|---|---|---|---|
| `customerId` | query | integer (int32) | **Sí** | Customer Id |
| `includeExtendedFields` | query | boolean | No | — |
| `includeCustomFields` | query | boolean | No | — |

**Respuesta `200 OK`** — esquema: `array<DeviceRestDTO>`

```json
[
  {
    "customerId": 0,
    "serialNumber": "string",
    "monitorStatus": "string",
    "assetNumber": "string",
    "stickerNumber": "string",
    "discoveryDate": "2026-07-01T10:15:00Z",
    "lastContact": "2026-07-01T10:15:00Z",
    "extendedFields": {
      "macAddress": "string",
      "hostName": "string",
      "comment": "string",
      "monitorName": "string",
      "manufacturer": "string",
      "model": "string",
      "mibDescription": "string",
      "sku": "string",
      "internalId": 0,
      "zone": "string",
      "zoneId": 0,
      "location": "string",
      "firmware": "string"
    },
    "customFieldValues": {},
    "registered": "2026-07-01T10:15:00Z",
    "deviceId": 0,
    "ipAddress": "string"
  }
]
```

---

## 4. Notas de uso

- El token JWT obtenido en `/login` es de vida corta (ver `expires_in`); conviene renovarlo automáticamente en el script de consulta antes de que expire, en vez de esperar a que falle una llamada con `401`.
- `GET /api/devices` requiere siempre `customerId`, por lo que el flujo típico es: `GET /api/customers` para obtener la lista de clientes activos → iterar y llamar `GET /api/devices?customerId=X` por cada uno.
- Los campos de fecha (`lastContact`, `discoveryDate`, `registered`, `createdDate`) vienen en formato ISO 8601 UTC (`2026-07-01T10:15:00Z`).