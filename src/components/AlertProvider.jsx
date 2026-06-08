import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import '../styles/alerts.css'

const AlertCtx = createContext(null)
export const useAlert = () => useContext(AlertCtx)

export default function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [dialog, setDialog] = useState(null)
  const resolveRef = useRef(null)

  const toast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const confirm = useCallback((message) => new Promise(resolve => {
    resolveRef.current = resolve
    setDialog(message)
  }), [])

  const dismiss = (id) => setToasts(prev => prev.filter(t => t.id !== id))
  const handleConfirm = () => { resolveRef.current?.(true); setDialog(null) }
  const handleCancel = () => { resolveRef.current?.(false); setDialog(null) }

  return (
    <AlertCtx.Provider value={{ toast, confirm }}>
      {children}

      <div className="toast-wrap" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`} role="alert">
            <span className="t-icon" aria-hidden="true" />
            <span className="t-msg">{t.message}</span>
            <button className="t-close" onClick={() => dismiss(t.id)} aria-label="Cerrar">✕</button>
          </div>
        ))}
      </div>

      {dialog && (
        <div className="dlg-overlay" role="dialog" aria-modal="true">
          <div className="dlg-box">
            <div className="dlg-icon" aria-hidden="true" />
            <p className="dlg-msg">{dialog}</p>
            <div className="dlg-btns">
              <button className="dlg-cancel" onClick={handleCancel}>Cancelar</button>
              <button className="dlg-confirm" onClick={handleConfirm}>Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </AlertCtx.Provider>
  )
}
