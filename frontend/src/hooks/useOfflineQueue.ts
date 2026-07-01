import { openDB } from 'idb'
import { useToast } from '../context/ToastContext'

const DB_NAME = 'SmartStockOffline'
const STORE_NAME = 'pendingSales'

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

export async function addToQueue(sale: { productId: number; quantity: number; unitPrice?: number }) {
  const db = await getDB()
  await db.add(STORE_NAME, {
    ...sale,
    timestamp: new Date().toISOString(),
    synced: false,
  })
}

export async function getPendingSales() {
  const db = await getDB()
  return db.getAll(STORE_NAME)
}

export async function clearPendingSale(id: number) {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

export function useOfflineSync() {
  const { addToast } = useToast()

  const syncPendingSales = async () => {
    const pendingSales = await getPendingSales()
    if (pendingSales.length === 0) return

    console.log(`Sincronizando ${pendingSales.length} vendas pendentes...`)
    
    for (const sale of pendingSales) {
      try {
        const response = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: sale.productId,
            quantity: sale.quantity,
            unitPrice: sale.unitPrice,
          }),
        })
        if (response.ok) {
          await clearPendingSale(sale.id)
        }
      } catch (err) {
        console.error('Erro ao sincronizar venda:', err)
        break // para de tentar se falhar
      }
    }

    const remaining = await getPendingSales()
    if (remaining.length === 0) {
      addToast('success', 'Vendas sincronizadas com sucesso!')
    } else {
      addToast('warning', `${remaining.length} vendas ainda pendentes`)
    }
  }

  return { syncPendingSales, addToQueue, getPendingSales }
}