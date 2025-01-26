import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { NotificationManager } from '@/components/NotificationManager'

export function Root() {
  return (
    <>
      <Outlet />
      <NotificationManager />
      <Toaster position="top-right" />
    </>
  )
} 