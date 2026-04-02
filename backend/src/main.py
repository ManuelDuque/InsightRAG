"""InsightRAG Backend - FastAPI application entrypoint.

Author: ManuelDuque
Date: 02/02/2026

This module wires:
- The FastAPI application instance
- CORS middleware configuration
- HTTP routes that delegate to the service layer

Notes
-----
The heavy lifting (RAG chain, vector DB operations, PDF ingestion) lives in
the service layer to keep route handlers small and easy to test.
"""

from fastapi import FastAPI, UploadFile, File, Depends, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from . import schemas, services, config
from .providers import RAGProviders


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.providers = RAGProviders()
    try:
        yield
    finally:
        app.state.providers.dispose()

app = FastAPI(title="InsightRAG API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def verify_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")):
    if not config.AUTH_REQUIRED:
        return

    if x_api_key != config.INSIGHTRAG_API_KEY:
        raise HTTPException(status_code=401, detail="Credenciales invalidas.")


def get_providers(request: Request) -> RAGProviders:
    providers = getattr(request.app.state, "providers", None)
    if providers is None:
        raise HTTPException(status_code=500, detail="Providers no inicializados")
    return providers

@app.get("/models", response_model=schemas.ModelListResponse)
async def get_models(providers: RAGProviders = Depends(get_providers)):
    """Return the list of available LLM models exposed by the backend."""
    models = services.list_available_models(providers)
    return {"models": models}

@app.post("/upload")
async def upload_pdf(
    request: Request,
    file: UploadFile = File(...),
    _: None = Depends(verify_api_key),
    providers: RAGProviders = Depends(get_providers),
):
    """Upload a PDF file, chunk it, embed it, and persist it to the vector DB."""
    if file.content_type not in {"application/pdf", "application/x-pdf"}:
        raise HTTPException(status_code=400, detail="El archivo debe ser un PDF valido.")

    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > config.MAX_UPLOAD_SIZE_MB * 1024 * 1024:
                raise HTTPException(
                    status_code=413,
                    detail=f"El archivo supera el limite de {config.MAX_UPLOAD_SIZE_MB}MB.",
                )
        except ValueError:
            raise HTTPException(status_code=400, detail="Cabecera content-length invalida.")

    num_chunks = await services.process_pdf(file, providers)
    return {"message": f"Procesado con éxito: {num_chunks} fragmentos indexados."}

@app.post("/ask", response_model=schemas.AskResponse)
async def ask_question(
    request: schemas.AskRequest,
    _: None = Depends(verify_api_key),
    providers: RAGProviders = Depends(get_providers),
):
    """Run a RAG query against the current vector DB and return answer + sources."""
    config.logger.info(f"Pregunta: '{request.query}' | Modelo: '{request.model_name}'")
    return services.query_rag(request.query, request.model_name, providers)

@app.post("/reset")
async def reset_database(
    _: None = Depends(verify_api_key),
    providers: RAGProviders = Depends(get_providers),
):
    """Reset the vector database and clear temporary ingestion artifacts."""
    services.reset_vector_database(providers)
    return {"message": "Base de datos vectorial eliminada exitosamente."}