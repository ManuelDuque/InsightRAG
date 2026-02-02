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

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from . import schemas, services, config

app = FastAPI(title="InsightRAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/models", response_model=schemas.ModelListResponse)
async def get_models():
    """Return the list of available LLM models exposed by the backend."""
    models = services.list_available_models()
    return {"models": models}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    """Upload a PDF file, chunk it, embed it, and persist it to the vector DB."""
    num_chunks = await services.process_pdf(file)
    return {"message": f"Procesado con éxito: {num_chunks} fragmentos indexados."}

@app.post("/ask", response_model=schemas.AskResponse)
async def ask_question(request: schemas.AskRequest):
    """Run a RAG query against the current vector DB and return answer + sources."""
    config.logger.info(f"Pregunta: '{request.query}' | Modelo: '{request.model_name}'")
    return services.query_rag(request.query, request.model_name)

@app.post("/reset")
async def reset_database():
    """Reset the vector database and clear temporary ingestion artifacts."""
    services.reset_vector_database()
    return {"message": "Base de datos vectorial eliminada exitosamente."}