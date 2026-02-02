"""InsightRAG Backend - API schemas.

Author: ManuelDuque
Date: 02/02/2026

This module defines the Pydantic models used to validate and serialize the
FastAPI request/response payloads.
"""

from pydantic import BaseModel


class SourceItem(BaseModel):
    """A short citation-like item returned with an answer."""

    page: int | None = None
    snippet: str

class AskRequest(BaseModel):
    """Request payload for the RAG question endpoint."""

    query: str
    model_name: str = "models/gemini-2.5-flash"

class AskResponse(BaseModel):
    """Response payload returned by the RAG question endpoint."""

    answer: str
    sources: list[SourceItem]

class ModelListResponse(BaseModel):
    """Response payload containing the list of available LLM models."""

    models: list[str]
