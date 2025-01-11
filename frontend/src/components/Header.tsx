import { useLocation } from 'react-router-dom'
import { Logo } from './Logo'
import { UserMenu } from './UserMenu'
import { Button } from './ui/button'
import { Bell } from 'lucide-react'

const routes = {
  '/': 'Home',
  '/notifications': 'Notificações',
  '/settings': 'Configurações'
}

export function Header() {
  const location = useLocation()
  const title = routes[location.pathname as keyof typeof routes] || ''

  return (
    <header className="h-16 border-b border-zinc-200 bg-white">
      <div className="h-full container max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="lg:hidden">
            <Logo showText={false} />
          </div>
          <h1 className="text-xl font-semibold text-zinc-900">{title}</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  )
} 