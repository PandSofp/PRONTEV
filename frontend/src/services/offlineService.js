import { openDB } from 'idb'

const DB_NAME = 'prontev_offline_db'
const DB_VERSION = 1

export const initDB = async () => {
    return openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('products')) {
                db.createObjectStore('products', { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains('services')) {
                db.createObjectStore('services', { keyPath: 'id' })
            }
            if (!db.objectStoreNames.contains('pending_sales')) {
                db.createObjectStore('pending_sales', { keyPath: 'offline_id' })
            }
        },
    })
}

export const savePendingSale = async (sale) => {
    const db = await initDB()
    const offline_id = `OFF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    await db.put('pending_sales', { ...sale, offline_id, status: 'PENDING' })
    return offline_id
}

export const getPendingSales = async () => {
    const db = await initDB()
    return db.getAll('pending_sales')
}

export const clearPendingSale = async (offline_id) => {
    const db = await initDB()
    await db.delete('pending_sales', offline_id)
}
