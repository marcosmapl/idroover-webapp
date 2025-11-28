import React, { createContext, useContext, useCallback, useState } from 'react'
import Toast from './Toast'

const ToastContext = createContext({ pushToast: () => { }, setLoading: () => { } })

export function useToast() {
    return useContext(ToastContext)
}

export default function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const pushToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now() + Math.random()
        const t = { id, message, type }
        setToasts((s) => [...s, t])
        setTimeout(() => setToasts((s) => s.filter(x => x.id !== id)), duration)
    }, [])

    const removeToast = useCallback((id) => setToasts((s) => s.filter(x => x.id !== id)), [])

    const setLoading = useCallback((value) => setIsLoading(value), [])

    return (
        <ToastContext.Provider value={{ pushToast, setLoading, isLoading }}>
            {children}
            {isLoading && (
                <div className="spinner-overlay" aria-hidden>
                    <div className="spinner" />
                </div>
            )}
            <div className="app-toast-container" aria-live="polite">
                {toasts.map(t => (
                    <Toast key={t.id} message={t.message} type={t.type} onClose={() => removeToast(t.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    )
}
