import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage, type MessagePayload } from 'firebase/messaging'
import toast from 'react-hot-toast'

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

// Função para registrar o token
export async function registerFCMToken() {
  try {
    // Registra o Service Worker primeiro
    await registerServiceWorker()
    
    // Solicita permissão
    const permission = await Notification.requestPermission()
    
    if (permission === 'granted') {
      // Obtém o token
      const token = await getToken(messaging, {
        vapidKey: "BNVpq57mFv0HZRq-j80qLa7K3zimPRsjDehwx7KSifM8DFAyQ2EHMXQqMPQd2Ffw0Ec_RPMFKuLm7VyMarWCteU",
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      })
      
      return token
    }
    
    throw new Error('Permissão negada para notificações')
  } catch (error) {
    console.error('Erro ao registrar token FCM:', error)
    throw error
  }
}

// Listener para mensagens em foreground
onMessage(messaging, (payload: MessagePayload) => {
  console.log('Recebida mensagem em foreground:', payload)
  
  if (payload.notification) {
    toast(payload.notification.body || 'Novo lembrete', {
      icon: '💊',
      duration: 6000
    })
  }
}) 