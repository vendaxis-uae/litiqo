'use client'
import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const icons = {
    success: <CheckCircle size={18} />,
    error: <AlertCircle size={18} />,
    info: <Info size={18} />,
  }

  const colors = {
    success: { bg: 'var(--okbg)', border: 'var(--okbd)', color: 'var(--ok)' },
    error: { bg: 'var(--dnbg)', border: 'var(--dnbd)', color: 'var(--dn)' },
    info: { bg: 'var(--acg)', border: 'var(--ac)', color: 'var(--ac)' },
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{ position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)', zIndex: 10000, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className="animate-slide-up"
            style={{
              background: 'var(--bgc)',
              border: `1px solid var(--bd)`,
              borderRadius: 14,
              padding: '14px 24px',
              boxShadow: 'var(--shadow)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--tx)',
              minWidth: 280,
            }}
          >
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: colors[t.type].bg,
              color: colors[t.type].color,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              {icons[t.type]}
            </div>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
