import { Outlet, useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { useGetAuthProfile } from '@/api/generated/auth/auth'
import { Navigation } from './Navigation'
import { Header } from '@/components/home/Header'

export function RootLayout() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: profile, isLoading } = useGetAuthProfile()

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    navigate('/login')
  }

  const handleProfileUpdate = () => {
    queryClient.invalidateQueries({ queryKey: ['auth', 'profile'] })
  }

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="min-h-screen bg-[#F5F3FF]">
      <div className="md:pl-64">
        <Header />
        <div className="pb-20 md:pb-6">
          <Outlet />
        </div>
      </div>
      <Navigation />
    </div>
  )
} 