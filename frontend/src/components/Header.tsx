import { useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { UserMenu } from './UserMenu'
import { Button } from './ui/button'
import { Bell, Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'

const routes = {
  '/': 'Home',
  '/notifications': 'Notificações',
  '/settings': 'Configurações'
}

export function Header() {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const title = routes[location.pathname as keyof typeof routes] || ''

  return (
    <header className="h-16 border-b border-border bg-background">
      <div className="h-full container max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="lg:hidden">
            <Logo showText={false} />
          </div>
          <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span className="sr-only">
              {theme === 'dark' ? 'Ativar tema claro' : 'Ativar tema escuro'}
            </span>
          </Button>
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  )
} 