import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging'
import toast from 'react-hot-toast'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'

const firebaseConfig = {
  apiKey: "AIzaSyBWXyprAfPL7dJVf0XbfP8Q1RhZort5RYo",
  authDomain: "remind-560ac.firebaseapp.com",
  databaseURL: "https://remind-560ac.firebaseio.com",
  projectId: "remind-560ac",
  storageBucket: "remind-560ac.appspot.com",
  messagingSenderId: "702754798149",
  appId: "1:702754798149:web:7ff2c6e83164906299812c"
}

// Inicializa Firebase
const app = initializeApp(firebaseConfig)

// Inicializa Firebase Cloud Messaging
export const messaging = getMessaging(app)

// Função para registrar o Service Worker
async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/'
      })
      console.log('Service Worker registrado com sucesso:', registration)
      return registration
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error)
      throw error
    }
  }
  throw new Error('Service Worker não suportado neste navegador')
}

// Variável para controlar se os listeners já foram configurados
let listenersConfigured = false;

// Função para registrar o token
export async function registerFCMToken(): Promise<string | null> {
  try {
    if (!Capacitor.isNativePlatform()) {
      console.log('⚠️ Não é uma plataforma nativa, pulando registro FCM')
      return null
    }

    console.log('🔄 Iniciando registro FCM...')
    await PushNotifications.register()
    
    const token = await new Promise<string>((resolve, reject) => {
      let tokenListener: any = null
      let errorListener: any = null

      tokenListener = PushNotifications.addListener('registration', (tokenData) => {
        console.log('📱 Token recebido:', tokenData.value)
        if (tokenListener) tokenListener.then((l: { remove: () => void }) => l.remove())
        if (errorListener) errorListener.then((l: { remove: () => void }) => l.remove())
        resolve(tokenData.value)
      })

      errorListener = PushNotifications.addListener('registrationError', (error) => {
        console.error('❌ Erro ao registrar FCM:', error)
        if (tokenListener) tokenListener.then((l: { remove: () => void }) => l.remove())
        if (errorListener) errorListener.then((l: { remove: () => void }) => l.remove())
        reject(error)
      })
    })

    if (!token) {
      throw new Error('Token FCM não recebido')
    }

    console.log('✅ Token FCM registrado:', token)

    // Configura listeners para notificações
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('📬 Notificação recebida:', notification)
      // Aqui você pode adicionar lógica para mostrar a notificação no app
    })

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('🔔 Ação na notificação:', notification)
      // Aqui você pode adicionar lógica para navegar para a tela apropriada
    })

    return token
  } catch (error) {
    console.error('❌ Erro ao registrar token FCM:', error)
    return null
  }
}

// Listener para mensagens em foreground (web)
if (!Capacitor.isNativePlatform()) {
  onMessage(messaging, (payload: MessagePayload) => {
    console.log('Recebida mensagem em foreground:', payload)
    
    if (payload.notification) {
      toast(payload.notification.body || 'Novo lembrete', {
        icon: '💊',
        duration: 6000
      })
    }
  })
} 