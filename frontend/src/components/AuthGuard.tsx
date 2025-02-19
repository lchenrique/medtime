import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { useAuth } from '@/hooks/useAuth'
import { Loading } from '@/components/Loading'
import { storage } from '@/lib/storage'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate()
  const { user } = useUserStore()
  const [isLoading, setIsLoading] = useState(true)
  const { loadUser } = useAuth()
  const [hasChecked, setHasChecked] = useState(false)

  useEffect(() => {
    if (hasChecked) return

    console.log('🔄 AuthGuard: Iniciando verificação...')
    const init = async () => {
      try {
        const token = await storage.get('token')
        console.log('🔑 AuthGuard: Token encontrado?', !!token)
        
        if (!token) {
          console.log('❌ AuthGuard: Sem token, redirecionando para login')
          await new Promise(resolve => setTimeout(resolve, 500))
          setIsLoading(false)
          navigate('/login', { replace: true })
          return
        }
        
        console.log('👤 AuthGuard: Carregando usuário...')
        const user = await loadUser()
        console.log('👤 AuthGuard: Usuário carregado?', !!user)
        
        if (!user) {
          console.log('❌ AuthGuard: Sem usuário, redirecionando para login')
          await new Promise(resolve => setTimeout(resolve, 500))
          setIsLoading(false)
          navigate('/login', { replace: true })
          return
        }

        setIsLoading(false)
      } catch (error) {
        console.error('❌ AuthGuard: Erro ao carregar usuário:', error)
        await new Promise(resolve => setTimeout(resolve, 500))
        setIsLoading(false)
        navigate('/login', { replace: true })
      } finally {
        setHasChecked(true)
      }
    }

    init()
  }, [loadUser, navigate, hasChecked])

  if (isLoading) {
    console.log('⌛ AuthGuard: Mostrando loading...')
    return <Loading />
  }

  if (!user) {
    console.log('❌ AuthGuard: Sem usuário após carregamento')
    return null
  }

  console.log('✅ AuthGuard: Renderizando conteúdo protegido')
  return <>{children}</>
} 