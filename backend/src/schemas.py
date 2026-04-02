"""InsightRAG Backend - API schemas.

Author: ManuelDuque
Date: 02/02/2026

This module defines the Pydantic models used to validate and serialize the
FastAPI request/response payloads.
"""

from pydantic import BaseModel, Field
from . import config


class SourceItem(BaseModel):
    """A short citation-like item returned with an answer."""

    page: int | None = None
    snippet: str

class AskRequest(BaseModel):
    """Request payload for the RAG question endpoint."""

    query: str = Field(
        min_length=config.MIN_QUERY_LENGTH,
        max_length=config.MAX_QUERY_LENGTH,
        description="Pregunta del usuario dentro de los limites configurados.",
    )
    model_name: str = Field(
        default="models/gemini-2.5-flash",
        min_length=3,
        max_length=120,
    )

class AskResponse(BaseModel):
    """Response payload returned by the RAG question endpoint."""

    answer: str
    sources: list[SourceItem]

class ModelListResponse(BaseModel):
    """Response payload containing the list of available LLM models."""

    models: list[str]
