import os
import logging
from dotenv import load_dotenv

# Cargar entorno
load_dotenv()

# Configuración de Logs
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("InsightRAG")

# Constantes
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
DB_FOLDER = "./chroma_db"
TEMP_FOLDER = "./temp_files"

# Crear directorios necesarios
os.makedirs(TEMP_FOLDER, exist_ok=True)

if not GOOGLE_API_KEY:
    logger.error("❌ CRÍTICO: No se encontró GOOGLE_API_KEY en .env")
