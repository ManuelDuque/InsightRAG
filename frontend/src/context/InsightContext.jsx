/**
 * InsightRAG Frontend - Global state (React Context).
 *
 * Author: ManuelDuque
 * Date: 02/02/2026
 *
 * This module owns application state and side-effects:
 * - Chat messages (user + AI)
 * - Loading state
 * - Available LLM models and the currently selected model
 * - High-level actions (upload, ask, reset)
 *
 * Components consume the context through the `useInsight` hook.
 */

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { fetchModels, uploadFile, askQuestion, resetDatabase, getErrorMessage } from '../services/api'

const InsightContext = createContext()

/**
 * Access the InsightRAG context.
 *
 * @returns {object} Context value containing state and actions.
 * @throws {Error} If used outside of `InsightProvider`.
 */
export const useInsight = () => {
  const context = useContext(InsightContext)
  if (!context) {
    throw new Error('useInsight must be used within an InsightProvider')
  }
  return context
}

/**
 * Provider component that supplies global InsightRAG state.
 *
 * @param {{children: import('react').ReactNode}} props
 */
export const InsightProvider = ({ children }) => {
  const buildMessage = useCallback((role, content, sources = []) => ({
    id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
    role,
    content,
    sources,
    createdAt: new Date().toISOString()
  }), [])

  const [messages, setMessages] = useState([
    buildMessage('ai', '👋 ¡Hola! Soy InsightRAG. Elige un modelo, sube un PDF y pregúntame lo que quieras.')
  ])
  const [loading, setLoading] = useState(false)
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const askAbortControllerRef = useRef(null)

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
        addMessage('ai', `⚠️ Error: ${getErrorMessage(error, 'No puedo conectar con el servidor.')}`)
      }
    }
    loadModels()
  }, [])

  const addMessage = useCallback((role, content, sources = []) => {
    setMessages(prev => [...prev, buildMessage(role, content, sources)])
  }, [buildMessage])

  useEffect(() => {
    return () => {
      askAbortControllerRef.current?.abort()
    }
  }, [])

  const handleFileUpload = async (file) => {
    if (!file) return
    setLoading(true)
    try {
      await uploadFile(file)
      addMessage('ai', `✅ Archivo **"${file.name}"** procesado y listo para consultas.`)
    } catch (error) {
      console.error(error)
      addMessage('ai', `❌ Error al subir el archivo: ${getErrorMessage(error, 'Error desconocido')}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (text) => {
    if (!text.trim() || loading) return

    addMessage('user', text)
    setLoading(true)
    askAbortControllerRef.current?.abort()
    askAbortControllerRef.current = new AbortController()

    try {
      const data = await askQuestion(text, selectedModel, askAbortControllerRef.current.signal)
      addMessage('ai', data.answer, data.sources)
    } catch (error) {
      if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
        return
      }
      console.error(error)
      addMessage('ai', `❌ Error: ${getErrorMessage(error, 'Algo falló al generar la respuesta.')}`)
    } finally {
      askAbortControllerRef.current = null
      setLoading(false)
    }
  }

  const openResetModal = useCallback(() => {
    if (loading) {
      return
    }
    setIsResetModalOpen(true)
  }, [loading])

  const closeResetModal = useCallback(() => {
    if (loading) {
      return
    }
    setIsResetModalOpen(false)
  }, [loading])

  const handleReset = async () => {
    if (loading) {
      return
    }

    setIsResetModalOpen(false)
    setLoading(true)
    try {
      await resetDatabase()
      setMessages([buildMessage('ai', '🔄 Base de datos borrada exitosamente. Puedes subir un nuevo documento.')])
    } catch (error) {
      console.error(error)
      addMessage('ai', `❌ Error: ${getErrorMessage(error, 'No se pudo borrar la base de datos.')}`)
    } finally {
      setLoading(false)
    }
  }

  const value = {
    messages,
    loading,
    isResetModalOpen,
    models,
    selectedModel,
    setSelectedModel,
    handleFileUpload,
    handleSendMessage,
    handleReset,
    openResetModal,
    closeResetModal
  }

  return (
    <InsightContext.Provider value={value}>
      {children}
    </InsightContext.Provider>
  )
}
