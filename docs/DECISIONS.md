# Engineering Decisions — InsightRAG

Este documento captura **decisiones técnicas** (ADRs ligeros) para que un revisor/reclutador entienda el *porqué* del sistema, no solo el *qué*.

## D1 — Embeddings locales con HuggingFace

**Decisión**: usar `HuggingFaceEmbeddings` con `sentence-transformers/all-MiniLM-L6-v2`.

**Motivación**
- **Coste**: evita facturación por embeddings en APIs.
- **Latencia**: reduce el tiempo de indexación/consulta (dependiendo del hardware).
- **Privacidad**: el texto del documento no sale del entorno al vectorizar.
- **Control**: misma versión del modelo, reproducibilidad y posibilidad de tuning.

**Trade-offs**
- Consumo local de CPU/RAM.
- Calidad de embeddings puede ser inferior a modelos premium.

**Alternativas consideradas**
- Embeddings gestionados (OpenAI/Google/etc.): mejor calidad y menos mantenimiento, pero coste y dependencia.

## D2 — Chunking con RecursiveCharacterTextSplitter (1000/200)

**Decisión**: `RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)`.

**Motivación**
- Chunk de ~1000 caracteres es un buen compromiso entre:
  - **recuperación semántica** (no demasiado pequeño),
  - **contexto suficiente** para responder,
  - **coste de tokens** al pasar contexto al LLM.
- Overlap de 200 reduce el riesgo de partir conceptos/frases a mitad.

**Trade-offs**
- Más overlap ⇒ más chunks ⇒ más almacenamiento y tiempo de indexación.
- Chunks demasiado grandes ⇒ peor precisión en recuperación.

**Alternativas consideradas**
- Split por tokens (más robusto para modelos específicos) usando `tiktoken`.
- Split por estructura (títulos/headers) si el documento tiene buena semántica.

## D3 — ChromaDB persistente en disco (MVP)

**Decisión**: `Chroma(persist_directory=./chroma_db)`.

**Motivación**
- Arranque rápido y sin infraestructura adicional.
- Persistencia local entre reinicios.

**Trade-offs**
- En Windows pueden ocurrir file locks.
- No escala para múltiples instancias / despliegues distribuidos.

## D4 — RetrievalQA chain type "stuff"

**Decisión**: usar `RetrievalQA.from_chain_type(..., chain_type="stuff")`.

**Motivación**
- Simple y suficiente para un MVP.
- Menos componentes ⇒ más fácil depurar.

**Trade-offs**
- Puede degradar si hay mucho contexto o documentos grandes.

**Alternativas**
- `map_reduce` / `refine` para documentos extensos.
- Reranking y/o compresión de contexto.

## D5 — Fuentes trazables (page + snippet)

**Decisión**: devolver sources con `page` (metadata de LangChain) + snippet.

**Motivación**
- Trazabilidad: el usuario puede verificar *dónde* está la evidencia.
- UX: permite navegar el PDF y aumenta la confianza en el sistema.

---

## Backlog de decisiones futuras (para crecimiento)

- Rate limiting (server-side) y control de cuota.
- Streaming (SSE/WebSocket) para tokens y "thoughts".
- Autenticación y multi-tenant (índices por usuario).
- Evaluación: métricas de precisión (hit-rate) y dataset de test.
