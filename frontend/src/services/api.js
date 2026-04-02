/**
 * InsightRAG Frontend - Backend API client.
 *
 * Author: ManuelDuque
 * Date: 02/02/2026
 *
 * Thin axios wrapper for the FastAPI backend.
 * Keeping API calls centralized makes UI components simpler and reduces
 * repeated error-handling patterns.
 */

import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const API_KEY = import.meta.env.VITE_API_KEY || "";

let parsedBaseUrl;
try {
  parsedBaseUrl = new URL(API_BASE_URL);
} catch {
  throw new Error(
    "VITE_API_BASE_URL invalida. Debe ser una URL absoluta valida.",
  );
}

const isHttpProtocol =
  parsedBaseUrl.protocol === "http:" || parsedBaseUrl.protocol === "https:";
if (!isHttpProtocol) {
  throw new Error(
    "VITE_API_BASE_URL invalida. Solo se permiten protocolos http/https.",
  );
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

if (API_KEY) {
  api.defaults.headers.common["X-API-Key"] = API_KEY;
}

export const getErrorMessage = (error, fallback = "Error inesperado") => {
  if (error?.code === "ERR_CANCELED") {
    return "Solicitud cancelada";
  }

  if (error?.code === "ECONNABORTED") {
    return "El servidor tardó demasiado en responder";
  }

  const status = error?.response?.status;
  if (status === 400) return "Solicitud inválida";
  if (status === 401) return "No autorizado. Revisa tu API key";
  if (status === 413) return "Archivo demasiado grande";
  if (status === 429)
    return "Demasiadas solicitudes. Intenta de nuevo en unos segundos";
  if (status && status >= 500) return "Error interno del servidor";

  const serverDetail = error?.response?.data?.detail;
  if (typeof serverDetail === "string" && serverDetail.trim()) {
    return serverDetail;
  }

  if (typeof error?.message === "string" && error.message.trim()) {
    return error.message;
  }

  return fallback;
};

/**
 * Fetch the list of available LLM models from the backend.
 *
 * @returns {Promise<string[]>} Array of model identifiers.
 */
export const fetchModels = async () => {
  const response = await api.get("/models");
  return response.data.models;
};

/**
 * Upload a PDF file for ingestion into the vector database.
 *
 * @param {File} file Browser File object.
 * @returns {Promise<void>}
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

/**
 * Ask a question against the currently ingested document(s).
 *
 * @param {string} query User question.
 * @param {string} modelName Backend model identifier.
 * @param {AbortSignal} [signal] Optional cancellation signal.
 * @returns {Promise<{answer: string, sources: string[]}>}
 */
export const askQuestion = async (query, modelName, signal) => {
  const response = await api.post(
    "/ask",
    {
      query,
      model_name: modelName,
    },
    { signal },
  );
  return response.data;
};

/**
 * Reset the backend vector database (best-effort) and clear temporary files.
 *
 * @returns {Promise<void>}
 */
export const resetDatabase = async () => {
  await api.post("/reset");
};

export default api;
