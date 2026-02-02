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

# Configurar GenAI nativo para listar modelos
genai.configure(api_key=GOOGLE_API_KEY)

# Inicializar Embeddings (Singleton)
logger.info("Cargando modelo de Embeddings Local...")
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_db = Chroma(persist_directory=DB_FOLDER, embedding_function=embeddings)

def list_available_models():
    """Obtiene modelos de Google compatibles con generación de contenido"""
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
    """Guarda, carga, fragmenta e indexa un PDF"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Solo archivos PDF")

    file_path = os.path.join(TEMP_FOLDER, file.filename)
    
    try:
        # Guardar
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Cargar
        loader = PyPDFLoader(file_path)
        docs = loader.load()

        # Fragmentar
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)

        # Indexar
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
    """Ejecuta la cadena RAG"""
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
    """Elimina completamente la base de datos vectorial y reinicializa"""
    global vector_db
    try:
        # PASO 1: Limpieza Lógica (Intentar vaciar la base de datos mediante la API)
        # Esto es crucial si no podemos borrar los archivos por bloqueos de Windows
        if vector_db is not None:
            try:
                # Intentar borrar todos los documentos primero
                ids = vector_db.get().get('ids', [])
                if ids:
                    vector_db.delete(ids)
                    logger.info(f"Eliminados {len(ids)} documentos de la colección actual.")
                
                # Intentar borrar la colección entera
                # ChromaDB a veces mantiene el archivo lockeado, así que vaciarlo es la mejor opción fallback
                try:
                    vector_db.delete_collection()
                    logger.info("Colección eliminada lógicamente.")
                except Exception as e:
                    logger.warning(f"No se pudo eliminar la colección (puede que ya esté vacía): {e}")

            except Exception as e:
                logger.warning(f"Error durante la limpieza lógica: {e}")

        # PASO 2: Intentar liberar recursos del sistema
        try:
            vector_db = None
            import gc
            gc.collect()
        except:
            pass

        # PASO 3: Limpieza Física (Best Effort)
        # Intentamos borrar la carpeta, pero si Windows la bloquea, no fallamos
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

        # Limpiar archivos temporales (esto suele dar menos problemas)
        if os.path.exists(TEMP_FOLDER):
            for file in os.listdir(TEMP_FOLDER):
                file_path = os.path.join(TEMP_FOLDER, file)
                try:
                    if os.path.isfile(file_path):
                        os.remove(file_path)
                except:
                    pass
            logger.info(f"Archivos temporales limpiados.")

        # PASO 4: Reinicialización
        # Recreamos directorios si fueron borrados
        os.makedirs(DB_FOLDER, exist_ok=True)
        os.makedirs(TEMP_FOLDER, exist_ok=True)
        
        # Reinicializar ChromaDB
        # Si la carpeta persistía (por bloqueo), al menos la colección debería estar vacía por el Paso 1
        vector_db = Chroma(persist_directory=DB_FOLDER, embedding_function=embeddings)
        logger.info("Base de datos vectorial reinicializada y lista.")
        
    except Exception as e:
        logger.error(f"Error crítico al resetear: {e}")
        # Recuperación de emergencia para evitar que la API muera
        if vector_db is None:
            try:
                vector_db = Chroma(persist_directory=DB_FOLDER, embedding_function=embeddings)
            except:
                logger.error("No se pudo recuperar la instancia de vector_db")
        raise HTTPException(status_code=500, detail=f"Error reseteando DB: {str(e)}")
