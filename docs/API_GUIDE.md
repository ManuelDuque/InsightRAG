# API Guide — InsightRAG (FastAPI)

Guía escrita del contrato de API. Aunque FastAPI expone Swagger/OpenAPI, esta guía aclara comportamientos, errores y recomendaciones operativas.

Base URL (dev): `http://127.0.0.1:8000`

## Backend Layers

El backend quedó separado por responsabilidades:

- `src/main.py`: arranque FastAPI, lifespan, CORS y handlers de dominio.
- `src/api/routes.py`: rutas HTTP.
- `src/api/dependencies.py`: auth y acceso a providers.
- `src/application_services.py`: lógica de aplicación.
- `src/domain/exceptions.py`: errores tipados con metadata HTTP.
- `src/providers.py`: embeddings, vector DB y LLM.

## Authentication

La autenticación es opcional por configuración. Si `AUTH_REQUIRED=true`, las rutas mutables requieren `X-API-Key`.

Recomendación (prod): API key/Bearer token + CORS restringido + rate limiting por IP/usuario.

## Endpoints

### `GET /models`

Lista modelos disponibles desde el SDK de Google, filtrados por capacidad `generateContent`.

**Response 200**

```json
{
  "models": ["models/gemini-2.5-flash", "models/gemini-2.5-pro", "..."]
}
```

**Errores**

- `500`: el proveedor no está disponible o falla la enumeración de modelos.

**Notas**

- La respuesta se genera desde la capa de aplicación.
- Si el proveedor falla, se traduce a un error de dominio consistente.

---

### `POST /upload`

Sube e indexa un PDF:

- guarda temporalmente,
- extrae texto por páginas,
- parte en chunks,
- genera embeddings locales,
- persiste en Chroma.

**Request**: `multipart/form-data`

- `file`: PDF

**Response 200**

```json
{ "message": "Procesado con éxito: 42 fragmentos indexados." }
```

**Errores**

- `400`: `Solo archivos PDF`
- `400`: cabecera `content-length` inválida
- `413`: el archivo supera `MAX_UPLOAD_SIZE_MB`
- `500`: error inesperado durante ingesta

**Recomendaciones**

- Validar MIME type y tamaño máximo.
- Implementar límite de páginas o streaming si crece.

---

### `POST /ask`

Ejecuta el flujo RAG:

- recupera top-k chunks desde Chroma,
- llama al LLM (Gemini) con el contexto,
- devuelve respuesta + fuentes.

**Request JSON**

```json
{
  "query": "¿Qué es este documento?",
  "model_name": "models/gemini-2.5-flash"
}
```

**Response 200**

```json
{
  "answer": "...",
  "sources": [
    {
      "page": 4,
      "snippet": "..."
    }
  ]
}
```

**Errores**

- `400`: validación de payload (por ejemplo, query vacía o fuera de rango)
- `500`: error inesperado (vector DB / embeddings / proveedor LLM)
- `429` (posible): rate limit del proveedor LLM

#### 429 Rate Limit — qué significa y qué hacer

Un `429` típicamente indica que el proveedor del LLM rechazó la petición por:

- exceso de QPS (requests/segundo),
- exceso de TPM (tokens/minuto),
- cuota diaria agotada,
- burst de peticiones (por ejemplo, spam o reintentos mal gestionados).

**Mitigaciones recomendadas**

- Backoff exponencial con jitter en reintentos.
- Circuit breaker si hay fallos repetidos.
- Encolar peticiones de chat para serializar en una misma sesión.
- Limitar longitud de entrada y de contexto.

---

### `POST /reset`

Resetea el estado vectorial.

**Response 200**

```json
{ "message": "Base de datos vectorial eliminada exitosamente." }
```

**Notas Windows**
La carpeta de persistencia puede quedar bloqueada. El backend hace:

- limpieza lógica (borrado de docs/colección) y luego
- best-effort borrado físico.

Si falla el borrado físico, se intenta reconstruir la colección y mantener el servicio operativo.

## Error Model

Las rutas ya no dependen de `HTTPException` dentro del negocio. La capa `domain/exceptions.py` define errores con:

- `detail`: mensaje legible para el cliente
- `status_code`: código HTTP objetivo
- `code`: identificador estable para UI/telemetría

Ejemplos:

- `validation_error` → 400
- `models_unavailable` → 500
- `pdf_processing_failed` → 500
- `rag_query_failed` → 500

## Health / Observability (Sugerencias)

No hay endpoint de salud aún. En producción se recomienda añadir:

- `GET /health` (liveness)
- `GET /ready` (readiness: Chroma + embeddings cargados)
- logs estructurados (JSON) + correlación por request-id
