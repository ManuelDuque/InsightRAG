import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchModels, uploadFile, askQuestion } from '../services/api'

const InsightContext = createContext()

export const useInsight = () => {
  const context = useContext(InsightContext)
  if (!context) {
    throw new Error('useInsight must be used within an InsightProvider')
  }
  return context
}

export const InsightProvider = ({ children }) => {
  const [messages, setMessages] = useState([
    { role: 'ai', content: '👋 ¡Hola! Soy InsightRAG. Elige un modelo, sube un PDF y pregúntame lo que quieras.' }
  ])
  const [loading, setLoading] = useState(false)
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('')

  // Cargar modelos al inicio
  useEffect(() => {
    const loadModels = async () => {
      try {
        const modelsList = await fetchModels()
        setModels(modelsList)
        if (modelsList.length > 0) {
          setSelectedModel(modelsList[0])
        }
      } catch (error) {
        console.error("Error cargando modelos:", error)
        addMessage('ai', '⚠️ Error: No puedo conectar con el servidor.')
      }
    }
    loadModels()
  }, [])

  const addMessage = useCallback((role, content, sources = []) => {
    setMessages(prev => [...prev, { role, content, sources }])
  }, [])

  const handleFileUpload = async (file) => {
    if (!file) return
    setLoading(true)
    try {
      await uploadFile(file)
      addMessage('ai', `✅ Archivo **"${file.name}"** procesado y listo para consultas.`)
    } catch (error) {
      console.error(error)
      alert('Error al subir el archivo')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (text) => {
    if (!text.trim()) return

    addMessage('user', text)
    setLoading(true)

    try {
      const data = await askQuestion(text, selectedModel)
      addMessage('ai', data.answer, data.sources)
    } catch (error) {
      console.error(error)
      addMessage('ai', '❌ Error: Algo falló al generar la respuesta.')
    } finally {
      setLoading(false)
    }
  }

  const value = {
    messages,
    loading,
    models,
    selectedModel,
    setSelectedModel,
    handleFileUpload,
    handleSendMessage
  }

  return (
    <InsightContext.Provider value={value}>
      {children}
    </InsightContext.Provider>
  )
}
