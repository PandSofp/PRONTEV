import React, { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

const OfflineNotice = () => {
    const [isOffline, setIsOffline] = useState(!navigator.onLine)

    useEffect(() => {
        const handleOnline = () => setIsOffline(false)
        const handleOffline = () => setIsOffline(true)

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
        }
    }, [])

    if (!isOffline) return null

    return (
        <div className="bg-danger text-white p-2 text-center sticky-top" style={{ zIndex: 9999 }}>
            <WifiOff size={18} className="me-2" />
            Modo Offline Ativado — As vendas serão sincronizadas automaticamente ao restaurar a conexão.
        </div>
    )
}

export default OfflineNotice
