import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/user'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const token = localStorage.getItem('token')

  useEffect(() => {
    if (!token || !user) {
      navigate('/login', { replace: true })
    }
  }, [token, user, navigate])

  if (!token || !user) {
    return null
  }

  return <>{children}</>
} 