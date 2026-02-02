import os
import shutil
import logging
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel # Necesario para recibir JSON en el body
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_chroma import Chroma
from langchain.chains import RetrievalQA

# --- LOGS ---
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- CONFIGURACIÓN ---
load_dotenv()
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    logger.error("❌ CRÍTICO: No se encontró GOOGLE_API_KEY en .env")

# Configuramos la librería nativa de Google para listar modelos
genai.configure(api_key=GOOGLE_API_KEY)

app = FastAPI(title="InsightRAG API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FOLDER = "./chroma_db"
TEMP_FOLDER = "./temp_files"
os.makedirs(TEMP_FOLDER, exist_ok=True)

# --- EMBEDDINGS (Locales/HuggingFace) ---
# Se mantienen fijos porque no afecta a la "inteligencia" de la respuesta, solo a la búsqueda
embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
vector_db = Chroma(persist_directory=DB_FOLDER, embedding_function=embeddings)

# --- MODELO DE DATOS PARA LA PETICIÓN ---
class AskRequest(BaseModel):
    query: str
    model_name: str = "models/gemini-2.0-flash" # Valor por defecto seguro

# --- ENDPOINTS ---

@app.get("/models")
async def get_models():
    """Devuelve la lista de modelos disponibles en tu cuenta de Google"""
    try:
        models = []
        for m in genai.list_models():
            if 'generateContent' in m.supported_generation_methods:
                models.append(m.name)
        return {"models": models}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    # ... (El código de upload se mantiene IGUAL que antes) ...
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Solo se permiten archivos PDF")

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
        
        return {"message": f"Procesado con éxito: {len(splits)} fragmentos indexados."}

    except Exception as e:
        logger.error(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.post("/ask")
async def ask_question(request: AskRequest):
    """
    Ahora recibe un JSON: { "query": "...", "model_name": "models/gemini-..." }
    """
    query = request.query
    model_name = request.model_name
    
    logger.info(f"Pregunta: '{query}' usando modelo: '{model_name}'")

    if not query:
        raise HTTPException(status_code=400, detail="La pregunta vacía")

    try:
        # 1. Instanciamos el LLM dinámicamente según lo que pida el usuario
        llm = ChatGoogleGenerativeAI(
            model=model_name, 
            temperature=0,
            max_retries=2
        )

        # 2. Buscamos en ChromaDB
        retriever = vector_db.as_retriever(search_kwargs={"k": 3})
        
        qa_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff",
            retriever=retriever,
            return_source_documents=True 
        )
        
        # 3. Ejecutamos
        result = qa_chain.invoke({"query": query})
        
        return {
            "answer": result["result"],
            "sources": [doc.page_content[:150] + "..." for doc in result["source_documents"]]
        }

    except Exception as e:
        logger.error(f"Error generando respuesta: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))