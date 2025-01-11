import { useState } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { AuthCard } from "@/components/ui/auth/AuthCard"
import { AuthInput } from "@/components/ui/auth/AuthInput"
import { AuthDivider } from "@/components/ui/auth/AuthDivider"
import { SocialButton } from "@/components/ui/auth/SocialButton"
import { GoogleIcon, FacebookIcon } from "@/components/icons"

export function Register() {
  const [isLoading, setIsLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState<'name' | 'email' | 'password' | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  return (
    <AuthCard title="Criar Conta">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <AuthInput
            type="text"
            id="name"
            placeholder="Nome completo"
            isFocused={focusedInput === 'name'}
            onFocus={() => setFocusedInput('name')}
            onBlur={() => setFocusedInput(null)}
          />

          <AuthInput
            type="email"
            id="email"
            placeholder="Email"
            isFocused={focusedInput === 'email'}
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
          />

          <AuthInput
            type="password"
            id="password"
            placeholder="Senha"
            isFocused={focusedInput === 'password'}
            onFocus={() => setFocusedInput('password')}
            onBlur={() => setFocusedInput(null)}
          />
        </div>

        <Button 
          className="w-full h-12 text-base font-medium rounded-xl"
          disabled={isLoading}
        >
          {isLoading ? "Criando conta..." : "Criar conta"}
        </Button>

        <AuthDivider />

        <div className="grid grid-cols-2 gap-3">
          <SocialButton icon={<GoogleIcon />} label="Google" />
          <SocialButton icon={<FacebookIcon />} label="Facebook" />
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