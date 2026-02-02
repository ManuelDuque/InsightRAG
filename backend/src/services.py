"""InsightRAG Backend - Service layer.

Author: ManuelDuque
Date: 02/02/2026

This module contains the backend's core application logic:
- PDF ingestion (store temporarily, load, chunk, embed)
- Vector database persistence using Chroma
- Retrieval-Augmented Generation (RAG) query execution
- Vector database reset with Windows-friendly best-effort cleanup

Design
------
The FastAPI routes call into this module so that HTTP concerns remain
separated from business logic.

Operational Notes
-----------------
Chroma persistence can be file-locked on Windows. The reset routine first
attempts a logical cleanup (delete documents/collection) before a physical
folder deletion.
"""

import os
import shutil
import google.generativeai as genai
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain.chains import RetrievalQA
from fastapi import UploadFile, HTTPException

from .config import logger, DB_FOLDER, TEMP_FOLDER, GOOGLE_API_KEY

genai.configure(api_key=GOOGLE_API_KEY)

logger.info("Cargando modelo de Embeddings Local...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_db = Chroma(persist_directory=DB_FOLDER, embedding_function=embeddings)

def list_available_models():
    """Return Google models that support content generation.

    The Google GenAI SDK exposes many models; we filter to those that advertise
    the `generateContent` capability.
    """
    try:
        models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                models.append(m.name)
        return models
    except Exception as e:
        logger.error(f"Error listando modelos: {e}")
        return []

async def process_pdf(file: UploadFile):
    """Ingest a PDF into the vector database.

    Steps
    -----
    1) Persist the uploaded file into the temp folder.
    2) Load pages using LangChain's PDF loader.
    3) Split into overlapping chunks.
    4) Embed and persist chunks into the Chroma vector database.

    Returns
    -------
    int
        Number of chunks added to the vector database.
    """
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Solo archivos PDF")

    file_path = os.path.join(TEMP_FOLDER, file.filename)
    
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        loader = PyPDFLoader(file_path)
        docs = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)

        if splits:
            vector_db.add_documents(documents=splits)
            logger.info(f"Indexados {len(splits)} fragmentos.")
            return len(splits)
        return 0

    except Exception as e:
        logger.error(f"Error procesando PDF: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

def query_rag(query: str, model_name: str):
    """Execute a RAG query over the persisted embeddings.

    Parameters
    ----------
    query:
        Natural language question from the user.
    model_name:
        Google GenAI model identifier (e.g., `models/gemini-...`).

    Returns
    -------
    dict
        A dict with an `answer` string and a list of short `sources` snippets.
    """
    try:
        llm = ChatGoogleGenerativeAI(model=model_name, temperature=0, max_retries=2)
        
        retriever = vector_db.as_retriever(search_kwargs={"k": 3})
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm, chain_type="stuff", retriever=retriever, return_source_documents=True
        )
        
        result = qa_chain.invoke({"query": query})
        
        return {
            "answer": result["result"],
            "sources": [doc.page_content[:150] + "..." for doc in result["source_documents"]]
        }
    except Exception as e:
        logger.error(f"Error en RAG: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def reset_vector_database():
    """Reset the vector database and ingestion temp state.

    This function is written to be resilient on Windows, where the on-disk
    Chroma persistence directory may be locked by the current process.

    Strategy
    --------
    - Logical cleanup first: delete documents / collection through the API.
    - Best-effort physical cleanup: attempt to delete the persistence folder.
    - Always recreate folders and reinitialize the global `vector_db`.
    """
    global vector_db
    try:
        if vector_db is not None:
            try:
                ids = vector_db.get().get('ids', [])
                if ids:
                    vector_db.delete(ids)
                    logger.info(f"Eliminados {len(ids)} documentos de la colección actual.")
                
                try:
                    vector_db.delete_collection()
                    logger.info("Colección eliminada lógicamente.")
                except Exception as e:
                    logger.warning(f"No se pudo eliminar la colección (puede que ya esté vacía): {e}")

            except Exception as e:
                logger.warning(f"Error durante la limpieza lógica: {e}")

        try:
            vector_db = None
            import gc
            gc.collect()
        except:
            pass

        import time
        time.sleep(0.5)
        
        folder_deleted = False
        if os.path.exists(DB_FOLDER):
            try:
                shutil.rmtree(DB_FOLDER)
                folder_deleted = True
                logger.info(f"Directorio DB eliminado físicamente: {DB_FOLDER}")
            except PermissionError:
                logger.warning(f"Windows bloqueó el borrado de {DB_FOLDER}. Se confía en la limpieza lógica realizada.")
            except Exception as e:
                logger.warning(f"No se pudo eliminar directorio DB: {e}")

        if os.path.exists(TEMP_FOLDER):
            for file in os.listdir(TEMP_FOLDER):
                file_path = os.path.join(TEMP_FOLDER, file)
                try:
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                except:
                    pass
            logger.info(f"Archivos temporales limpiados.")

        os.makedirs(DB_FOLDER, exist_ok=True)
        os.makedirs(TEMP_FOLDER, exist_ok=True)
        
        vector_db = Chroma(persist_directory=DB_FOLDER, embedding_function=embeddings)
        logger.info("Base de datos vectorial reinicializada y lista.")
        
    except Exception as e:
        logger.error(f"Error crítico al resetear: {e}")
        if vector_db is None:
            try:
                vector_db = Chroma(persist_directory=DB_FOLDER, embedding_function=embeddings)
            except:
                logger.error("No se pudo recuperar la instancia de vector_db")
        raise HTTPException(status_code=500, detail=f"Error reseteando DB: {str(e)}")
