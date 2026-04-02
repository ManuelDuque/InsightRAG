/**
 * InsightRAG Frontend - File uploader.
 *
 * Author: ManuelDuque
 * Date: 02/02/2026
 *
 * Provides a styled file input that triggers ingestion of a PDF via the
 * context action.
 */

import { useInsight } from '../context/InsightContext'

export default function FileUploader() {
  const { handleFileUpload } = useInsight()

  return (
    <label className="flex-1 cursor-pointer whitespace-nowrap md:flex-none">
      <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e.target.files[0])} className="hidden" />
      <span className="btn btn-primary flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm md:w-auto" aria-label="Subir PDF">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
        </svg>
        <span>Subir PDF</span>
      </span>
    </label>
  )
}
