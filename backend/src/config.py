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
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("InsightRAG")

BASE_DIR = Path(__file__).resolve().parents[1]


def _parse_csv_env(var_name: str, default: str) -> list[str]:
    raw = os.getenv(var_name, default)
    return [item.strip() for item in raw.split(",") if item.strip()]


GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").strip().lower()

INSIGHTRAG_API_KEY = os.getenv("INSIGHTRAG_API_KEY", "")
AUTH_REQUIRED = os.getenv("AUTH_REQUIRED", "false").strip().lower() == "true"

CORS_ORIGINS = _parse_csv_env(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173",
)

MAX_UPLOAD_SIZE_MB = int(os.getenv("MAX_UPLOAD_SIZE_MB", "50"))
MAX_QUERY_LENGTH = int(os.getenv("MAX_QUERY_LENGTH", "5000"))
MIN_QUERY_LENGTH = int(os.getenv("MIN_QUERY_LENGTH", "3"))

DB_FOLDER = str((BASE_DIR / os.getenv("DB_FOLDER", "chroma_db")).resolve())
TEMP_FOLDER = str((BASE_DIR / os.getenv("TEMP_FOLDER", "temp_files")).resolve())

os.makedirs(DB_FOLDER, exist_ok=True)
os.makedirs(TEMP_FOLDER, exist_ok=True)

if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY no encontrada en el entorno.")

if AUTH_REQUIRED and not INSIGHTRAG_API_KEY:
    raise RuntimeError("AUTH_REQUIRED=true pero falta INSIGHTRAG_API_KEY.")

if ENVIRONMENT != "development" and not INSIGHTRAG_API_KEY:
    raise RuntimeError("En producción/staging se requiere INSIGHTRAG_API_KEY.")
