"""InsightRAG Backend - Configuration.

Author: ManuelDuque
Date: 02/02/2026

Purpose
-------
Centralizes backend configuration values and logging setup.

This module is intentionally small and import-safe because it is loaded by
multiple modules at startup.
"""

import os
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("InsightRAG")

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
DB_FOLDER = "./chroma_db"
TEMP_FOLDER = "./temp_files"

os.makedirs(TEMP_FOLDER, exist_ok=True)

if not GOOGLE_API_KEY:
    logger.error("❌ CRÍTICO: No se encontró GOOGLE_API_KEY en .env")
