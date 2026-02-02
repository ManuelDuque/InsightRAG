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

import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_BASE_URL
})

/**
 * Fetch the list of available LLM models from the backend.
 *
 * @returns {Promise<string[]>} Array of model identifiers.
 */
export const fetchModels = async () => {
  const response = await api.get('/models')
  return response.data.models
}

/**
 * Upload a PDF file for ingestion into the vector database.
 *
 * @param {File} file Browser File object.
 * @returns {Promise<void>}
 */
export const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

/**
 * Ask a question against the currently ingested document(s).
 *
 * @param {string} query User question.
 * @param {string} modelName Backend model identifier.
 * @returns {Promise<{answer: string, sources: string[]}>}
 */
export const askQuestion = async (query, modelName) => {
  const response = await api.post('/ask', {
    query,
    model_name: modelName
  })
  return response.data
}

/**
 * Reset the backend vector database (best-effort) and clear temporary files.
 *
 * @returns {Promise<void>}
 */
export const resetDatabase = async () => {
  await api.post('/reset')
}

export default api
