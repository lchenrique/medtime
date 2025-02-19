import { Navigate, Outlet } from 'react-router-dom'
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
    </>
  )
} 