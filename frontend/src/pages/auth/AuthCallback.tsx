import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '@/stores/user'
import { storage } from '@/lib/storage'
import { getAuthProfile } from '@/api/generated/auth/auth'

export function AuthCallback() {
  const navigate = useNavigate()
  const { setUser } = useUserStore()

  useEffect(() => {
    async function processAuth() {
      try {
        // Pega os parâmetros da URL
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')
        const error = params.get('error')

        console.log('Parâmetros recebidos:', { token: token ? 'Presente' : 'Ausente', error })

        if (error) {
          console.error('Erro na autenticação:', error)
          navigate('/login', { replace: true })
          return
        }

        if (!token) {
          console.error('Token não encontrado')
          navigate('/login', { replace: true })
          return
        }

        console.log('Token recebido e válido')

        // Salva o token
        await storage.set('token', token)
        console.log('Token salvo no storage')

        // Busca o perfil do usuário
        const profile = await getAuthProfile()
        console.log('Perfil do usuário obtido:', profile)
        setUser(profile)

        // Redireciona para a home
        console.log('Redirecionando para home')
        navigate('/', { replace: true })
      } catch (err) {
        console.error('Erro ao processar autenticação:', err)
        navigate('/login', { replace: true })
      }
    }

    processAuth()
  }, [navigate, setUser])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-500">Processando autenticação...</p>
    </div>
  )
} 