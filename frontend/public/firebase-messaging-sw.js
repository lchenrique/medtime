importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js')

const firebaseConfig = {
  apiKey: "AIzaSyBWXyprAfPL7dJVf0XbfP8Q1RhZort5RYo",
  authDomain: "remind-560ac.firebaseapp.com",
  databaseURL: "https://remind-560ac.firebaseio.com",
  projectId: "remind-560ac",
  storageBucket: "remind-560ac.appspot.com",
  messagingSenderId: "702754798149",
  appId: "1:702754798149:web:7ff2c6e83164906299812c"
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

// Manipula mensagens em background
messaging.onBackgroundMessage((payload) => {
  console.log('Recebida mensagem em background:', payload)

  const notificationTitle = payload.notification.title
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png'
  }

  return self.registration.showNotification(notificationTitle, notificationOptions)
}) 