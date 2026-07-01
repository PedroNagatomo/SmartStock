import { useState, useEffect } from 'react'
import { Wifi, WifiOff } from 'lucide-react'

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showRestored, setShowRestored] = useState(false)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      setShowRestored(true)
      setTimeout(() => setShowRestored(false), 3000)
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && !showRestored) return null

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium z-50 flex items-center justify-center gap-2">
          <WifiOff className="h-4 w-4" />
          Modo offline - dados podem estar desatualizados
        </div>
      )}
      {showRestored && (
        <div className="fixed top-0 left-0 right-0 bg-green-500 text-white px-4 py-2 text-center text-sm font-medium z-50 flex items-center justify-center gap-2 animate-fade-in">
          <Wifi className="h-4 w-4" />
          Conexão restaurada - sincronizando dados...
        </div>
      )}
    </>
  )
}