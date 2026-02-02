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
