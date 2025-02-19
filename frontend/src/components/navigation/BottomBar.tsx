import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Home, Settings, Bell } from 'lucide-react'
import { Logo } from '../Logo'

const menuItems = [
  {
    icon: Home,
    label: 'Home',
    href: '/'
  },
  {
    icon: Bell,
    label: 'Notificações',
    href: '/notifications'
  },
  {
    icon: Settings,
    label: 'Configurações',
    href: '/settings'
  }
]

export function BottomBar() {
  const location = useLocation()

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 py-2 px-4">
      <div className="flex items-center justify-around">
        <Logo showText={false} />
        
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center gap-1 p-2 rounded-lg text-zinc-700',
                isActive && 'text-primary'
              )}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
} 