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

export function Sidebar() {
  const location = useLocation()

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-zinc-200 h-screen p-4">
      <Logo className="mb-8" />
      
      <div className="flex flex-col flex-1 gap-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.href
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-zinc-700 hover:bg-zinc-100 transition-colors',
                isActive && 'bg-primary/10 text-primary hover:bg-primary/20'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </aside>
  )
} 