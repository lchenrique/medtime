import { Capacitor } from '@capacitor/core'

export function getApiUrl() {
  // Se estiver rodando no Capacitor (Android/iOS)
  if (Capacitor.isNativePlatform()) {
    // Em produção, usa a URL do backend hospedado
    return import.meta.env.VITE_API_URL
  }

  // Se estiver rodando no browser, usa a variável de ambiente
  return import.meta.env.VITE_API_URL
} 