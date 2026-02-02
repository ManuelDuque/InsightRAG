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
  )
}
