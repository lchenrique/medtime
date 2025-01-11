export function setupSystemTray() {
  // Registra uma tarefa em background
  if ('serviceWorker' in navigator && 'BackgroundTasks' in window) {
    navigator.serviceWorker.ready.then((registration) => {
      // @ts-ignore - API experimental
      registration.backgroundTasks.register('keepAlive', {
        maxAttempts: -1, // Infinito
        minPeriod: 60000, // 1 minuto
      }).then(() => {
        console.log('Background task registrada')
      }).catch((err: Error) => {
        console.error('Erro ao registrar background task:', err)
      })
    })
  }

  // Registra para wake lock (mantém o dispositivo ativo)
  if ('wakeLock' in navigator) {
    // @ts-ignore - API experimental
    navigator.wakeLock.request('screen').then((wakeLock) => {
      console.log('Wake lock ativo')
      
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          // @ts-ignore
          navigator.wakeLock.request('screen')
        }
      })
    }).catch((err) => {
      console.error('Erro ao ativar wake lock:', err)
    })
  }
} 