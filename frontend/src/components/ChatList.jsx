import { useEffect, useRef } from 'react'
import { useInsight } from '../context/InsightContext'
import ChatMessage from './ChatMessage'

export default function ChatList() {
  const { messages, loading } = useInsight()
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <main className="flex-1 overflow-y-auto p-4 space-y-6 container mx-auto max-w-4xl custom-scrollbar">
      {messages.map((msg, index) => (
        <ChatMessage key={index} message={msg} />
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
  )
}
