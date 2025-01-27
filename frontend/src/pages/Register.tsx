import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from "@/components/ui/button"
import { AuthCard } from "@/components/ui/auth/AuthCard"
import { AuthInput } from "@/components/ui/auth/AuthInput"
import { AuthDivider } from "@/components/ui/auth/AuthDivider"
import { SocialButton } from "@/components/ui/auth/SocialButton"
import { GoogleIcon, FacebookIcon } from "@/components/icons"
import { useUserStore } from '@/stores/user'
import { storage } from '@/lib/storage'
import { usePostAuthRegister, getAuthProfile } from '@/api/generated/auth/auth'
import type { PostAuthRegister201 } from '@/api/model'

const registerSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
})

type RegisterFormData = z.infer<typeof registerSchema>

export function Register() {
  const [error, setError] = useState('')
  const [focusedInput, setFocusedInput] = useState<'name' | 'email' | 'password' | null>(null)
  const navigate = useNavigate()
  const { setUser } = useUserStore()

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema)
  })

  const { mutate: registerUser, isPending } = usePostAuthRegister({
    mutation: {
      onSuccess: async (response: PostAuthRegister201) => {
        try {
          const { token } = response
          await storage.set('token', token)
          
          // Busca o perfil completo após registro
          const profile = await getAuthProfile()
          setUser(profile)
          
          navigate('/', { replace: true })
        } catch (err) {
          console.error('Erro ao processar registro:', err)
          setError('Erro ao processar registro. Tente novamente.')
        }
      },
      onError: (error: any) => {
        if (error.response?.status === 400) {
          setError('Email já cadastrado.')
        } else {
          setError(error.message || 'Erro ao criar conta. Tente novamente.')
        }
      }
    }
  })

  const onSubmit = handleSubmit((data) => {
    setError('')
    registerUser({ 
      data: {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password
      }
    })
  })

  return (
    <AuthCard title="Criar Conta">
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-3">
          <AuthInput
            type="text"
            {...register('name')}
            placeholder="Nome completo"
            isFocused={focusedInput === 'name'}
            onFocus={() => setFocusedInput('name')}
            onBlur={() => setFocusedInput(null)}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
          )}

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

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        <Button 
          type="submit"
          className="w-full h-12 text-base font-medium rounded-xl"
          disabled={isPending}
        >
          {isPending ? "Criando conta..." : "Criar conta"}
        </Button>

        <AuthDivider />

        <div className="grid grid-cols-2 gap-3">
          <SocialButton icon={<GoogleIcon />} label="Google" provider="google" />
          <SocialButton icon={<FacebookIcon />} label="Facebook" provider="facebook" />
        </div>

        <div className="text-center text-sm text-gray-500">
          Já tem uma conta?{" "}
          <Link 
            to="/login" 
            className="font-medium text-primary hover:text-primary transition-colors"
          >
            Fazer login
          </Link>
        </div>
      </form>
    </AuthCard>
  )
} 