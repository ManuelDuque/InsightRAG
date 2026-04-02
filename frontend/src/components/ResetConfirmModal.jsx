import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Button from './ui/Button'

export default function ResetConfirmModal({ isOpen, onClose, onConfirm, loading }) {

  const cancelButtonRef = useRef(null)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    cancelButtonRef.current?.focus()

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) {
    return null
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(14, 14, 18, 0.4)', backdropFilter: 'blur(3px)' }}
      role="presentation"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl p-6"
        style={{ backgroundColor: 'var(--surface-secondary)', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-pop)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-modal-title"
        aria-describedby="reset-modal-description"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="reset-modal-title" className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Borrar base vectorial
        </h2>
        <p id="reset-modal-description" className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Esta acción eliminará todo el índice actual y no se puede deshacer.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <Button
            ref={cancelButtonRef}
            type="button"
            onClick={onClose}
            disabled={loading}
            variant="secondary"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            variant="danger"
          >
            {loading ? 'Borrando...' : 'Confirmar borrado'}
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
