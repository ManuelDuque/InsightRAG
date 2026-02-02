import ReactMarkdown from 'react-markdown'

export default function ChatMessage({ message }) {
  const isUser = message.role === 'user'
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div 
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-2xl transition-all duration-300 hover:scale-[1.02] ${
          isUser 
            ? 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-br-sm shadow-indigo-500/40' 
            : 'bg-gradient-to-br from-slate-800/90 to-slate-700/90 text-slate-100 rounded-bl-sm border border-indigo-500/20 backdrop-blur-sm shadow-indigo-900/20'
        }`}
      >
        <div className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {/* Fuentes */}
        {message.sources && message.sources.length > 0 && (
          <div className="mt-4 pt-3 border-t border-indigo-400/20 text-xs">
            <p className="font-semibold text-slate-400 mb-1">Fuentes consultadas:</p>
            <ul className="list-disc pl-4 space-y-1 text-slate-300 opacity-80">
              {message.sources.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
