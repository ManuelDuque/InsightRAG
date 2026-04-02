/**
 * InsightRAG Frontend - Input area.
 *
 * Author: ManuelDuque
 * Date: 02/02/2026
 *
 * Bottom panel that provides:
 * - Active model indicator
 * - Reset vector database action
 * - Text input to send a question to the backend
 */

import { useState } from 'react'
import { useInsight } from '../context/InsightContext'
import ActiveModelIndicator from './ActiveModelIndicator'
import ResetConfirmModal from './ResetConfirmModal'

export default function InputArea() {
  const { handleSendMessage, openResetModal, loading } = useInsight()
  const [input, setInput] = useState('')

  const onSend = () => {
    if (!input.trim() || loading) return
    handleSendMessage(input)
    setInput('')
  }

  return (
    <footer className="p-4 bg-linear-to-r from-slate-800/95 via-indigo-900/30 to-slate-800/95 backdrop-blur-xl border-t border-indigo-500/20 shadow-2xl">
      <div className="container mx-auto max-w-4xl">
        <ActiveModelIndicator />
        
        <div className="flex gap-3 items-center">
          <button
            onClick={openResetModal}
            disabled={loading}
            className="shrink-0 p-2.5 bg-linear-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg shadow-xl shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 group"
            title="Borrar base de datos vectorial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="relative flex-1">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
              placeholder="Escribe tu pregunta sobre el documento..." 
              className="w-full bg-linear-to-br from-slate-900 to-slate-800 border border-indigo-500/30 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 placeholder-slate-400 shadow-xl shadow-indigo-900/20 hover:border-indigo-400/50 transition-all duration-300"
            />
            <button 
              onClick={onSend} 
              disabled={loading || !input.trim()}
              className="absolute right-2 top-2 p-1.5 bg-linear-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-110"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <ResetConfirmModal />
    </footer>
  )
}
