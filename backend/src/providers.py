"""InsightRAG Backend - Infrastructure providers.

This module centralizes infrastructure dependencies so services do not depend
on module-level mutable globals. Providers can be wired through FastAPI
lifespan and injected into route handlers for better testability.
"""

import gc
import google.generativeai as genai
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma

from .config import GOOGLE_API_KEY, DB_FOLDER, logger


class RAGProviders:
    """Container for infra dependencies used by RAG services."""

    def __init__(self) -> None:
        genai.configure(api_key=GOOGLE_API_KEY)
        self.genai = genai

        logger.info("Cargando modelo de Embeddings Local...")
        self.embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        self.vector_db = Chroma(
            persist_directory=DB_FOLDER,
            embedding_function=self.embeddings,
        )

    def build_llm(self, model_name: str) -> ChatGoogleGenerativeAI:
        """Build a chat model client for a selected provider model name."""
        return ChatGoogleGenerativeAI(model=model_name, temperature=0, max_retries=2)

    def rebuild_vector_db(self) -> None:
        """Recreate vector database client after destructive reset operations."""
        self.vector_db = Chroma(
            persist_directory=DB_FOLDER,
            embedding_function=self.embeddings,
        )

    def dispose(self) -> None:
        """Best-effort cleanup for process shutdown or app lifespan teardown."""
        self.vector_db = None
        gc.collect()
