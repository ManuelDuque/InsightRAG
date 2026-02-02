import ModelSelector from './ModelSelector'
import FileUploader from './FileUploader'

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-slate-800/95 via-indigo-900/30 to-slate-800/95 backdrop-blur-xl border-b border-indigo-500/20 p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/50">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
           </svg>
        </div>
        <h1 className="text-xl font-bold tracking-wide text-white">Insight<span className="text-indigo-400">RAG</span></h1>
      </div>

      <div className="flex items-center justify-center gap-3 w-full md:w-auto md:justify-end">
        <ModelSelector />
        <FileUploader />
      </div>
    </header>
  )
}
