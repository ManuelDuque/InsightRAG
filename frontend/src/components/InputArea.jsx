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
import Button from './ui/Button'

export default function InputArea() {
  const { handleSendMessage, handleReset, loading } = useInsight()
  const [input, setInput] = useState('')
  const [isResetModalOpen, setIsResetModalOpen] = useState(false)

  const onSend = () => {
    if (!input.trim() || loading) return
    handleSendMessage(input)
    setInput('')
  }

  return (
    <footer className="glass-panel border-x-0 border-b-0 p-4 md:px-6">
      <div className="container mx-auto max-w-4xl">
        <ActiveModelIndicator />
        
        <div className="flex gap-3 items-center">
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            disabled={loading}
            className="shrink-0"
            title="Borrar base de datos vectorial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
              <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
            </svg>
          </Button>

          <div className="relative flex-1">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
              placeholder="Escribe tu pregunta sobre el documento..." 
              className="input-control py-3 pl-4 pr-14 text-sm"
            />
            <Button 
              type="button"
              variant="primary"
              size="sm"
              onClick={onSend} 
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 h-10 w-10 -translate-y-1/2 p-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z" />
              </svg>
            </Button>
          </div>
        </div>
      </div>
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => {
          if (!loading) {
            setIsResetModalOpen(false)
          }
        }}
        onConfirm={async () => {
          await handleReset()
          setIsResetModalOpen(false)
        }}
        loading={loading}
      />
    </footer>
  )
}
