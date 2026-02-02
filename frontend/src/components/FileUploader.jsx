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
    <label className="flex items-center justify-center gap-2 cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all duration-300 text-white py-2 px-4 rounded-lg shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 font-medium text-sm flex-1 md:flex-none whitespace-nowrap">
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
      <span>Subir PDF</span>
      <input type="file" accept=".pdf" onChange={(e) => handleFileUpload(e.target.files[0])} className="hidden" />
    </label>
  )
}
