import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'

// Configuración básica de Axios
const api = axios.create({
  baseURL: 'http://127.0.0.1:8000'
})

function App() {
  // ESTADOS
  const [messages, setMessages] = useState([
    { role: 'ai', content: '👋 ¡Hola! Soy InsightRAG. Elige un modelo, sube un PDF y pregúntame lo que quieras.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [models, setModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const messagesEndRef = useRef(null)
  const dropdownRef = useRef(null)

  // Scroll al fondo automático
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // 1. AL CARGAR: Pedir lista de modelos
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const res = await api.get('/models')
        setModels(res.data.models)
        if (res.data.models.length > 0) {
          setSelectedModel(res.data.models[0])
        }
      } catch (error) {
        console.error("Error conectando con el backend:", error)
        setMessages(p => [...p, { role: 'ai', content: '⚠️ Error: No puedo conectar con el servidor.' }])
      }
    }
    fetchModels()
  }, [])

  // 2. FUNCIÓN: Subir PDF
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)

    setLoading(true)
    try {
      await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setMessages(prev => [...prev, { role: 'ai', content: `✅ Archivo **"${file.name}"** procesado y listo para consultas.` }])
    } catch (error) {
      console.error(error)
      alert('Error al subir el archivo')
    }
    setLoading(false)
  }

  // 3. FUNCIÓN: Enviar Pregunta
  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userText = input
    setMessages(prev => [...prev, { role: 'user', content: userText }])
    setInput('') 
    setLoading(true)

    try {
      const res = await api.post('/ask', {
        query: userText,
        model_name: selectedModel
      })
      
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: res.data.answer,
        sources: res.data.sources 
      }])
    } catch (error) {
      console.error(error)
      setMessages(prev => [...prev, { role: 'ai', content: '❌ Error: Algo falló al generar la respuesta.' }])
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-slate-200 font-sans animate-gradient">
      
      {/* HEADER */}
      <header className="bg-gradient-to-r from-slate-800/95 via-indigo-900/30 to-slate-800/95 backdrop-blur-xl border-b border-indigo-500/20 p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/50">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
             </svg>
          </div>
          <h1 className="text-xl font-bold tracking-wide text-white">Insight<span className="text-indigo-400">RAG</span></h1>
        </div>

        <div className="flex items-center justify-center gap-3 w-full md:w-auto md:justify-end">
          {/* SELECCION DE MODELO */}
          <div className="relative flex-1 md:flex-none" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              disabled={models.length === 0}
              className="flex items-center justify-between bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/30 text-slate-300 py-2.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 text-sm w-full md:w-44 shadow-lg hover:border-indigo-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-indigo-400 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
                <span className="truncate text-xs md:text-sm">
                  {selectedModel ? (
                    selectedModel.replace('models/', '').length > 15 
                      ? selectedModel.replace('models/', '').substring(0, 15) + '...' 
                      : selectedModel.replace('models/', '')
                  ) : 'Seleccionar...'}
                </span>
              </div>
              <svg 
                className={`w-4 h-4 text-indigo-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && models.length > 0 && (
              <div className="absolute z-50 mt-2 w-full md:w-44 bg-gradient-to-br from-slate-800 to-slate-900 border border-indigo-500/30 rounded-lg shadow-2xl shadow-indigo-900/50 backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                  {models.map((model, index) => (
                    <button
                      key={model}
                      onClick={() => {
                        setSelectedModel(model)
                        setIsDropdownOpen(false)
                      }}
                      className={`w-full text-left px-4 py-3 text-sm transition-all duration-200 flex items-center gap-3 group ${
                        selectedModel === model
                          ? 'bg-gradient-to-r from-indigo-600/50 to-purple-600/50 text-white border-l-4 border-indigo-400'
                          : 'text-slate-300 hover:bg-indigo-600/20 hover:text-white border-l-4 border-transparent hover:border-indigo-400/50'
                      } ${index !== models.length - 1 ? 'border-b border-slate-700/50' : ''}`}
                    >
                      <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                        selectedModel === model 
                          ? 'bg-indigo-400 shadow-lg shadow-indigo-400/50' 
                          : 'bg-slate-600 group-hover:bg-indigo-400/50'
                      }`} />
                      <span className="truncate flex-1 text-xs">{model.replace('models/', '')}</span>
                      {selectedModel === model && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-indigo-400">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* BOTON SUBIR */}
          <label className="flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 text-white py-2 px-4 rounded-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 font-medium text-sm flex-1 md:flex-none whitespace-nowrap">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span>Subir PDF</span>
            <input type="file" accept=".pdf" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </header>

      {/* CHAT AREA */}
      <main className="flex-1 overflow-y-auto p-4 space-y-6 container mx-auto max-w-4xl custom-scrollbar">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm shadow-indigo-500/40' 
                  : 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 text-slate-100 rounded-bl-sm border border-indigo-500/20 backdrop-blur-sm shadow-indigo-900/20'
              }`}
            >
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              {/* Fuentes */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-indigo-400/20 text-xs">
                  <p className="font-semibold text-slate-400 mb-1">Fuentes consultadas:</p>
                  <ul className="list-disc pl-4 space-y-1 text-slate-300 opacity-80">
                    {msg.sources.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
             <div className="bg-gradient-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-2xl p-4 rounded-bl-sm flex items-center gap-2 border border-indigo-500/20 shadow-xl">
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* INPUT AREA */}
      <footer className="p-4 bg-gradient-to-r from-slate-800/95 via-indigo-900/30 to-slate-800/95 backdrop-blur-xl border-t border-indigo-500/20 shadow-2xl">
        <div className="container mx-auto max-w-4xl">
          {/* INDICADOR MODELO ACTIVO */}
          {selectedModel && (
            <div className="flex items-center justify-center gap-2 mb-3 group">
              <div className="flex items-center gap-2 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-indigo-500/20 rounded-full px-3 py-1.5 shadow-lg transition-all duration-300 hover:border-indigo-400/40">
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse shadow-lg shadow-indigo-400/50"></div>
                <span className="text-[10px] md:text-xs text-slate-400 font-medium">Modelo:</span>
                <span className="text-[10px] md:text-xs text-slate-200 font-semibold max-w-[150px] md:max-w-[250px] truncate">
                  {selectedModel.replace('models/', '')}
                </span>
              </div>
            </div>
          )}
          
          <div className="relative">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
              placeholder="Escribe tu pregunta sobre el documento..." 
              className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/30 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 placeholder-slate-400 shadow-xl shadow-indigo-900/20 hover:border-indigo-400/50 transition-all duration-300"
            />
            <button 
              onClick={handleSendMessage} 
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 p-1.5 bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      </footer>

    </div>
  )
}

export default App