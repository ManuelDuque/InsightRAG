/**
 * InsightRAG Frontend - Header.
 *
 * Author: ManuelDuque
 * Date: 02/02/2026
 *
 * Top navigation area containing:
 * - Product branding
 * - Model selector
 * - PDF uploader
 */

import ModelSelector from './ModelSelector'
import FileUploader from './FileUploader'
import Button from './ui/Button'
import { useTheme } from '../context/ThemeContext'

export default function Header() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="glass-panel flex flex-col items-center justify-between gap-4 border-x-0 border-t-0 p-4 md:flex-row md:px-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--accent)', boxShadow: 'var(--shadow-soft)' }}>
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-6 w-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
           </svg>
        </div>
        <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Insight<span style={{ color: 'var(--accent)' }}>RAG</span>
        </h1>
      </div>

      <div className="flex w-full items-center justify-center gap-3 md:w-auto md:justify-end">
        <Button
          type="button"
          size="sm"
          onClick={toggleTheme}
          aria-label="Cambiar tema"
          title="Cambiar tema"
          className="flex items-center gap-2"
        >
          <span>{isDark ? 'Claro' : 'Oscuro'}</span>
        </Button>
        <ModelSelector />
        <FileUploader />
      </div>
    </header>
  )
}
