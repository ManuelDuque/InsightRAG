import { useState } from 'react'
import { useInsight } from '../context/InsightContext'
import ActiveModelIndicator from './ActiveModelIndicator'

export default function InputArea() {
  const { handleSendMessage, loading } = useInsight()
  const [input, setInput] = useState('')

  const onSend = () => {
    if (!input.trim() || loading) return
    handleSendMessage(input)
    setInput('')
  }

  return (
    <footer className="p-4 bg-gradient-to-r from-slate-800/95 via-indigo-900/30 to-slate-800/95 backdrop-blur-xl border-t border-indigo-500/20 shadow-2xl">
      <div className="container mx-auto max-w-4xl">
        <ActiveModelIndicator />
        
        <div className="relative">
          <input 
            type="text" 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
            placeholder="Escribe tu pregunta sobre el documento..." 
            className="w-full bg-gradient-to-br from-slate-900 to-slate-800 border border-indigo-500/30 text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 placeholder-slate-400 shadow-xl shadow-indigo-900/20 hover:border-indigo-400/50 transition-all duration-300"
          />
          <button 
            onClick={onSend} 
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
  )
}
