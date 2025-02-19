import { Button } from "@/components/ui/button"
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

interface SocialButtonProps {
  provider: 'google' | 'facebook'
  icon: React.ReactNode
  label: string
}

export function SocialButton({ provider, icon, label }: SocialButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = () => {
    if (provider === 'google') {
      setIsLoading(true)
      // Redireciona para o endpoint de autenticação do backend
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`
    }
  }

  return (
    <Button 
      variant="outline" 
      className="w-full h-12 text-base font-medium rounded-xl"
      onClick={handleClick}
      disabled={isLoading}
    >
      <span className="mr-2">{icon}</span>
      {isLoading ? "Entrando..." : label}
    </Button>
  )
} 