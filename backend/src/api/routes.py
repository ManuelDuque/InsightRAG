"""HTTP routes for InsightRAG backend."""

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile

from .. import application_services as services
from .. import config, schemas
from ..providers import RAGProviders
from .dependencies import RequireAuth, get_providers

router = APIRouter()


@router.get("/models", response_model=schemas.ModelListResponse)
async def get_models(providers: RAGProviders = Depends(get_providers)):
    """Return the list of available LLM models exposed by the backend."""
    models = services.list_available_models(providers)
    return {"models": models}


@router.post("/upload")
async def upload_pdf(
    request: Request,
    file: UploadFile = File(...),
    _: None = RequireAuth,
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
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Cabecera content-length invalida.") from exc

    num_chunks = await services.process_pdf(file, providers)
    return {"message": f"Procesado con éxito: {num_chunks} fragmentos indexados."}


@router.post("/ask", response_model=schemas.AskResponse)
async def ask_question(
    request: schemas.AskRequest,
    _: None = RequireAuth,
    providers: RAGProviders = Depends(get_providers),
):
    """Run a RAG query against the current vector DB and return answer + sources."""
    config.logger.info("Pregunta: '%s' | Modelo: '%s'", request.query, request.model_name)
    return services.query_rag(request.query, request.model_name, providers)


@router.post("/reset")
async def reset_database(
    _: None = RequireAuth,
    providers: RAGProviders = Depends(get_providers),
):
    """Reset the vector database and clear temporary ingestion artifacts."""
    services.reset_vector_database(providers)
    return {"message": "Base de datos vectorial eliminada exitosamente."}
