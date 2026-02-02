import { useInsight } from '../context/InsightContext'

export default function ActiveModelIndicator() {
  const { selectedModel } = useInsight()

  if (!selectedModel) return null

  return (
    <div className="flex items-center justify-center gap-2 mb-3 group">
      <div className="flex items-center gap-2 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-sm border border-indigo-500/20 rounded-full px-3 py-1.5 shadow-lg transition-all duration-300 hover:border-indigo-400/40">
        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse shadow-lg shadow-indigo-400/50"></div>
        <span className="text-[10px] md:text-xs text-slate-400 font-medium">Modelo:</span>
        <span className="text-[10px] md:text-xs text-slate-200 font-semibold max-w-[150px] md:max-w-[250px] truncate">
          {selectedModel.replace('models/', '')}
        </span>
      </div>
    </div>
  )
}
