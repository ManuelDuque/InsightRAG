/**
 * InsightRAG Frontend - Model selector.
 *
 * Author: ManuelDuque
 * Date: 02/02/2026
 *
 * Dropdown control that allows selecting one of the backend-supported models.
 *
 * Behavior
 * --------
 * - Disabled until the model list is loaded.
 * - Closes automatically when the user clicks outside the dropdown.
 */

import { useState, useRef, useEffect } from 'react'
import { useInsight } from '../context/InsightContext'

export default function ModelSelector() {
  const { models, selectedModel, setSelectedModel } = useInsight()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative flex-1 md:flex-none" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        disabled={models.length === 0}
        className="input-control flex w-full items-center justify-between py-2.5 px-3 text-sm md:w-44"
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4 flex-shrink-0" style={{ color: 'var(--accent)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
          </svg>
          <span className="truncate text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
            {selectedModel ? (
              selectedModel.replace('models/', '').length > 15 
                ? selectedModel.replace('models/', '').substring(0, 15) + '...' 
                : selectedModel.replace('models/', '')
            ) : 'Seleccionar...'}
          </span>
        </div>
        <svg 
          className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
          style={{ color: 'var(--accent)' }}
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {isDropdownOpen && models.length > 0 && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-lg md:w-44" style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-pop)' }}>
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {models.map((model, index) => (
              <button
                key={model}
                type="button"
                onClick={() => {
                  setSelectedModel(model)
                  setIsDropdownOpen(false)
                }}
                className={`group flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors duration-150 ${
                  selectedModel === model
                    ? 'border-l-4 text-white'
                    : 'border-l-4'
                } ${index !== models.length - 1 ? 'border-b' : ''}`}
                style={{
                  borderBottomColor: index !== models.length - 1 ? 'var(--border-soft)' : undefined,
                  borderLeftColor: selectedModel === model ? 'var(--accent)' : 'transparent',
                  backgroundColor: selectedModel === model ? 'var(--accent)' : 'transparent',
                  color: selectedModel === model ? '#ffffff' : 'var(--text-primary)',
                }}
              >
                <div className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  selectedModel === model 
                    ? 'bg-white'
                    : 'bg-neutral-400 group-hover:bg-neutral-600 dark:bg-neutral-600 dark:group-hover:bg-neutral-400'
                }`} />
                <span className="truncate flex-1 text-xs">{model.replace('models/', '')}</span>
                {selectedModel === model && (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white">
                    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
