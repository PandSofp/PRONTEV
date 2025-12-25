import { useEffect } from 'react'
import { getPendingSales, clearPendingSale } from '../services/offlineService'
import axios from 'axios'

const SyncManager = () => {
    useEffect(() => {
        const sync = async () => {
            if (!navigator.onLine) return

            const pending = await getPendingSales()
            if (pending.length === 0) return

            console.log(`Sincronizando ${pending.length} vendas...`)

            for (const sale of pending) {
                try {
                    // Add marker that this was an offline sale
                    const response = await axios.post('/api/sales', { ...sale, is_offline: true })
                    if (response.status === 200 || response.status === 201) {
                        await clearPendingSale(sale.offline_id)
                        console.log(`Venda ${sale.offline_id} sincronizada com sucesso.`)
                    }
                } catch (err) {
                    console.error(`Erro ao sincronizar venda ${sale.offline_id}`, err)
                }
            }
        }

        // Run sync on mount and every 30 seconds if online
        sync()
        const interval = setInterval(sync, 30000)

        // Also run sync when coming back online
        window.addEventListener('online', sync)

        return () => {
            clearInterval(interval)
            window.removeEventListener('online', sync)
        }
    }, [])

    return null // This component doesn't render anything
}

export default SyncManager
