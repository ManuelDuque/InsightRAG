"""Application service layer for InsightRAG backend.

This module keeps business logic independent from FastAPI by raising domain
exceptions that are translated at the API boundary.
"""

from __future__ import annotations

import gc
import os
import shutil

from fastapi import UploadFile
from langchain.chains import RetrievalQA
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

from .config import DB_FOLDER, TEMP_FOLDER, logger
from .domain.exceptions import InfrastructureError, ProcessingError, ValidationError
from .providers import RAGProviders


def list_available_models(providers: RAGProviders) -> list[str]:
    """Return provider models supporting content generation."""
    try:
        return [
            model.name
            for model in providers.genai.list_models()
            if "generateContent" in model.supported_generation_methods
        ]
    except Exception as exc:
        logger.error("Error listando modelos: %s", exc)
        raise InfrastructureError("No se pudieron listar los modelos disponibles.", code="models_unavailable") from exc


async def process_pdf(file: UploadFile, providers: RAGProviders) -> int:
    """Ingest a PDF into the vector database and return indexed chunk count."""
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise ValidationError("Solo archivos PDF.", code="invalid_pdf_extension")

    file_path = os.path.join(TEMP_FOLDER, file.filename)

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        docs = PyPDFLoader(file_path).load()
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = splitter.split_documents(docs)

        if not splits:
            return 0

        providers.vector_db.add_documents(documents=splits)
        logger.info("Indexados %s fragmentos.", len(splits))
        return len(splits)
    except ValidationError:
        raise
    except Exception as exc:
        logger.error("Error procesando PDF: %s", exc)
        raise ProcessingError("No se pudo procesar el PDF.", code="pdf_processing_failed") from exc
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)


def query_rag(query: str, model_name: str, providers: RAGProviders) -> dict:
    """Execute a RAG query and return answer plus source snippets."""
    try:
        llm = providers.build_llm(model_name)
        retriever = providers.vector_db.as_retriever(search_kwargs={"k": 3})
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True,
        )
        result = qa_chain.invoke({"query": query})
    except Exception as exc:
        logger.error("Error en RAG: %s", exc)
        raise ProcessingError("No se pudo generar una respuesta para la consulta.", code="rag_query_failed") from exc

    sources = []
    for doc in result.get("source_documents", []) or []:
        page_value = doc.metadata.get("page") if isinstance(doc.metadata, dict) else None
        page = page_value if isinstance(page_value, int) else None
        snippet = f"{doc.page_content[:150]}..." if doc.page_content else ""
        sources.append({"page": page, "snippet": snippet})

    return {"answer": result.get("result", ""), "sources": sources}


def reset_vector_database(providers: RAGProviders) -> None:
    """Reset vector store and temporary files with Windows-safe best effort."""
    try:
        _logical_cleanup(providers)
        _drop_vector_db_reference(providers)
        _cleanup_storage_folders()

        os.makedirs(DB_FOLDER, exist_ok=True)
        os.makedirs(TEMP_FOLDER, exist_ok=True)
        providers.rebuild_vector_db()
        logger.info("Base de datos vectorial reinicializada y lista.")
    except Exception as exc:
        logger.error("Error crítico al resetear: %s", exc)
        if providers.vector_db is None:
            try:
                providers.rebuild_vector_db()
            except Exception as recovery_exc:
                logger.error("No se pudo recuperar la instancia de vector_db: %s", recovery_exc)
        raise ProcessingError("No se pudo resetear la base de datos vectorial.", code="reset_failed") from exc


def _logical_cleanup(providers: RAGProviders) -> None:
    if providers.vector_db is None:
        return

    try:
        ids = providers.vector_db.get().get("ids", [])
        if ids:
            providers.vector_db.delete(ids)
            logger.info("Eliminados %s documentos de la colección actual.", len(ids))
    except Exception as exc:
        logger.warning("Error durante la limpieza lógica de documentos: %s", exc)

    try:
        providers.vector_db.delete_collection()
        logger.info("Colección eliminada lógicamente.")
    except Exception as exc:
        logger.warning("No se pudo eliminar la colección (puede que ya esté vacía): %s", exc)


def _drop_vector_db_reference(providers: RAGProviders) -> None:
    providers.vector_db = None
    gc.collect()


def _cleanup_storage_folders() -> None:
    if os.path.exists(DB_FOLDER):
        try:
            shutil.rmtree(DB_FOLDER)
            logger.info("Directorio DB eliminado físicamente: %s", DB_FOLDER)
        except PermissionError:
            logger.warning(
                "Windows bloqueó el borrado de %s. Se confía en la limpieza lógica realizada.",
                DB_FOLDER,
            )
        except Exception as exc:
            logger.warning("No se pudo eliminar directorio DB: %s", exc)

    if not os.path.exists(TEMP_FOLDER):
        return

    for file_name in os.listdir(TEMP_FOLDER):
        file_path = os.path.join(TEMP_FOLDER, file_name)
        if not os.path.isfile(file_path):
            continue
        try:
            os.remove(file_path)
        except Exception as exc:
            logger.warning("No se pudo eliminar archivo temporal %s: %s", file_name, exc)

    logger.info("Archivos temporales limpiados.")
