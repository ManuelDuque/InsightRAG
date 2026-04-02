/**
 * InsightRAG Frontend - Active model indicator.
 *
 * Author: ManuelDuque
 * Date: 02/02/2026
 *
 * Small status pill showing the currently selected LLM model.
 */

import { useInsight } from '../context/InsightContext'

export default function ActiveModelIndicator() {
  const { selectedModel } = useInsight()

  if (!selectedModel) return null

  return (
    <div className="mb-3 flex items-center justify-center gap-2">
      <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-soft)' }}>
        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: 'var(--accent)' }}></div>
        <span className="text-[10px] font-medium md:text-xs" style={{ color: 'var(--text-muted)' }}>Modelo:</span>
        <span className="max-w-[150px] truncate text-[10px] font-semibold md:max-w-[250px] md:text-xs" style={{ color: 'var(--text-primary)' }}>
          {selectedModel.replace('models/', '')}
        </span>
      </div>
    </div>
  )
}
