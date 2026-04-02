import { useEffect, useRef } from 'react'
import { useInsight } from '../context/InsightContext'

export default function ResetConfirmModal() {
  const {
    isResetModalOpen,
    closeResetModal,
    handleReset,
    loading,
  } = useInsight()

  const cancelButtonRef = useRef(null)

  useEffect(() => {
    if (!isResetModalOpen) {
      return
    }

    cancelButtonRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        closeResetModal()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isResetModalOpen, closeResetModal])

  if (!isResetModalOpen) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      role="presentation"
      onClick={closeResetModal}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
        aria-describedby="reset-modal-description"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="reset-modal-title" className="text-lg font-semibold text-white">
          Borrar base vectorial
        </h2>
        <p id="reset-modal-description" className="mt-2 text-sm text-slate-300">
          Esta acción eliminará todo el índice actual y no se puede deshacer.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={closeResetModal}
            disabled={loading}
            className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-200 transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={loading}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Borrando...' : 'Confirmar borrado'}
          </button>
        </div>
      </div>
    </div>
  )
}
