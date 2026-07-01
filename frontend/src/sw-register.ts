import { registerSW } from 'virtual:pwa-register'

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nova versão disponível. Atualizar?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App pronto para uso offline! 📦')
    // Podemos mostrar um toast discreto
    const toast = document.createElement('div')
    toast.className = 'fixed bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in'
    toast.textContent = '✅ App pronto para uso offline!'
    document.body.appendChild(toast)
    setTimeout(() => toast.remove(), 4000)
  },
})

// Verificar status da rede e mostrar indicador
window.addEventListener('online', () => {
  console.log('🌐 Online - sincronizando...')
  document.body.classList.remove('offline')
  // Disparar evento personalizado para os componentes reagirem
  window.dispatchEvent(new CustomEvent('appOnline'))
})

window.addEventListener('offline', () => {
  console.log('📴 Offline - usando dados em cache')
  document.body.classList.add('offline')
  window.dispatchEvent(new CustomEvent('appOffline'))
})