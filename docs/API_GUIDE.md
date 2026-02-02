# API Guide — InsightRAG (FastAPI)

Guía escrita del contrato de API. Aunque FastAPI expone Swagger/OpenAPI, esta guía aclara **comportamientos**, **errores**, y **recomendaciones operativas** (por ejemplo, rate limits).

Base URL (dev): `http://127.0.0.1:8000`

## Authentication

Actualmente no hay autenticación.

Recomendación (prod): API key/Bearer token + CORS restringido + rate limiting por IP/usuario.

## Endpoints

### `GET /models`

Lista modelos disponibles desde el SDK de Google (filtrados por capacidad `generateContent`).

**Response 200**
```json
{
  "models": ["models/gemini-2.5-flash", "models/gemini-2.5-pro", "..."]
}
```

**Errores**
- `200` con lista vacía si el SDK falla (se loguea error). En producción se recomienda devolver `502`.

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

## Health / Observability (Sugerencias)

No hay endpoint de salud aún. En producción se recomienda añadir:
- `GET /health` (liveness)
- `GET /ready` (readiness: Chroma + embeddings cargados)
- logs estructurados (JSON) + correlación por request-id
