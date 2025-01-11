import { Navigate, Outlet } from 'react-router-dom'
import { Drawer } from '@/components/ui/drawer'

interface PrivateLayoutProps {
  isAuthenticated: boolean
}

export function PrivateLayout({ isAuthenticated }: PrivateLayoutProps) {
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return (
    <>
      <Outlet />
      <Drawer />
    </>
  )
} 