/**
 * InsightRAG Frontend - Chat list.
 *
 * Author: ManuelDuque
 * Date: 02/02/2026
 *
 * Renders the conversation history and keeps the viewport pinned to the
 * newest message.
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { useInsight } from '../context/InsightContext'
import ChatMessage from './ChatMessage'

export default function ChatList() {
  const { messages, loading } = useInsight()
  const scrollContainerRef = useRef(null)
  const messagesEndRef = useRef(null)
  const [isPinnedToBottom, setIsPinnedToBottom] = useState(true)

  const scrollToBottom = (behavior = 'auto') => {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    const container = scrollContainerRef.current
    if (!container) {
      return
    }

    const handleScroll = () => {
      const distanceToBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight
      setIsPinnedToBottom(distanceToBottom < 120)
    }

    container.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [])

  useEffect(() => {
    if (!isPinnedToBottom) {
      return
    }

    const behavior = messages.length > 6 ? 'smooth' : 'auto'
    scrollToBottom(behavior)
  }, [messages, loading, isPinnedToBottom])

  const renderedMessages = useMemo(
    () => messages.map((msg, index) => (
      <ChatMessage key={msg.id ?? index} message={msg} />
    )),
    [messages]
  )

  return (
    <main
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-6 container mx-auto max-w-4xl custom-scrollbar"
    >
      {renderedMessages}
      {loading && (
        <div className="flex justify-start">
           <div className="bg-linear-to-br from-slate-800/90 to-slate-700/90 backdrop-blur-sm rounded-2xl p-4 rounded-bl-sm flex items-center gap-2 border border-indigo-500/20 shadow-xl">
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
