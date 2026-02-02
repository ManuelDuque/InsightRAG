from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from . import schemas, services, config

app = FastAPI(title="InsightRAG API")

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/models", response_model=schemas.ModelListResponse)
async def get_models():
    models = services.list_available_models()
    return {"models": models}

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    num_chunks = await services.process_pdf(file)
    return {"message": f"Procesado con éxito: {num_chunks} fragmentos indexados."}

@app.post("/ask", response_model=schemas.AskResponse)
async def ask_question(request: schemas.AskRequest):
    config.logger.info(f"Pregunta: '{request.query}' | Modelo: '{request.model_name}'")
    return services.query_rag(request.query, request.model_name)