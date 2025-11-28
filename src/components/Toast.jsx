import React, { useEffect } from 'react'

export default function Toast({ message, type = 'info', onClose, duration = 4000 }) {
    useEffect(() => {
        const t = setTimeout(onClose, duration)
        return () => clearTimeout(t)
    }, [onClose, duration])

    return (
        <div className={`toast toast-${type}`} role="status" aria-live="polite">
            {message}
            <button aria-label="Close" className="toast-close" onClick={onClose}>×</button>
        </div>
    )
}
