import axios from 'axios'

const API_BASE_URL = 'http://127.0.0.1:8000'

const api = axios.create({
  baseURL: API_BASE_URL
})

export const fetchModels = async () => {
  const response = await api.get('/models')
  return response.data.models
}

export const uploadFile = async (file) => {
  const formData = new FormData()
  formData.append('file', file)
  
  await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const askQuestion = async (query, modelName) => {
  const response = await api.post('/ask', {
    query,
    model_name: modelName
  })
  return response.data
}

export default api
