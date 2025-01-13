import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { AuthCard } from '@/components/ui/auth/AuthCard'
import { AuthInput } from '@/components/ui/auth/AuthInput'
import { AuthDivider } from '@/components/ui/auth/AuthDivider'
import { SocialButton } from '@/components/ui/auth/SocialButton'
import { GoogleIcon, FacebookIcon } from '@/components/icons'
import { useUserStore } from '@/stores/user'
import { usePostAuthLogin } from '@/api/generated/auth/auth'
import type { PostAuthLogin200 } from '@/api/model'
import { TauriNotificationClient } from '@/lib/notifications/tauri'
import { getAuthProfile } from '@/api/generated/auth/auth'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

type LoginFormData = z.infer<typeof loginSchema>

export function Login() {
  const [error, setError] = useState('')
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null)
  const navigate = useNavigate()
  const { setUser } = useUserStore()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const { mutate: login, isPending } = usePostAuthLogin({
    mutation: {
      onSuccess: async (response: PostAuthLogin200) => {
        try {
          const { user: responseUser, token } = response
          localStorage.setItem('token', token)
          
          // Busca o perfil completo após login
          const profile = await getAuthProfile()
          setUser(profile)

          // Se o usuário tem Tauri habilitado, inicializa as notificações
          if (responseUser.tauriEnabled) {
            const client = TauriNotificationClient.getInstance()
            await client.init()
          }

          navigate('/', { replace: true })
        } catch (err) {
          console.error('Erro ao processar login:', err)
          setError('Erro ao processar login. Tente novamente.')
        }
      },
      onError: (error: any) => {
        if (error.response?.status === 401) {
          setError('Email ou senha incorretos.')
        } else {
          setError(error.message || 'Erro ao fazer login. Tente novamente.')
        }
      }
    }
  })

  const onSubmit = handleSubmit((data) => {
    setError('')
    login({ 
      data: { 
        email: data.email.trim(), 
        password: data.password 
      }
    })
  })

  return (
    <AuthCard title="Fazer Login">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-3">
          <AuthInput
            type="email"
            {...register('email')}
            placeholder="Email"
            isFocused={focusedInput === 'email'}
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}

          <AuthInput
            type="password"
            {...register('password')}
            placeholder="Senha"
            isFocused={focusedInput === 'password'}
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-end">
          <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary/90">
            Esqueceu a senha?
          </Link>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button 
          type="submit"
          className="w-full h-12 text-base font-medium rounded-xl"
          disabled={isPending}
        >
          {isPending ? "Entrando..." : "Entrar"}
        </Button>

        <AuthDivider />

        <div className="grid grid-cols-2 gap-3">
          <SocialButton icon={<GoogleIcon />} label="Google" />
          <SocialButton icon={<FacebookIcon />} label="Facebook" />
        </div>

        <div className="text-center text-sm text-gray-500">
          Não tem uma conta?{" "}
          <Link 
            to="/register" 
            className="font-medium text-primary hover:text-primary/90"
          >
            Cadastre-se
          </Link>
        </div>
      </form>
    </AuthCard>
  )
} 