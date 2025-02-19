import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { NotificationManager } from '@/components/NotificationManager'
import { IonButton, IonContent, IonPage } from '@ionic/react'
import { ToastWrapper } from './ToastWrapper'

export function Root() {
  return (

    <>
      <Outlet />
      <NotificationManager />
      <ToastWrapper />
    </>

  )
} 