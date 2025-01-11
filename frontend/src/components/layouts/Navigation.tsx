import { Home, List, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface NavigationItem {
  label: string
  icon: (props: { className?: string }) => ReactNode
  path: string
}

export function Navigation() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  const navigationItems = [
    {
      label: 'Início',
      icon: Home,
      path: '/'
    },
    {
      label: 'Medicamentos',
      icon: List,
      path: '/medications'
    },
    {
      label: 'Configurações',
      icon: Settings,
      path: '/settings'
    }
  ]

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="fixed z-50 bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden">
        <div className="flex items-center justify-around">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-2 px-3 min-w-[64px]",
                isActive(item.path) ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 flex-col p-4">
        <div className="flex items-center gap-3 px-2 py-4 mb-6">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold">M</span>
          </div>
          <span className="font-semibold text-lg">MedTime</span>
        </div>

        <div className="space-y-1">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors",
                isActive(item.path) ? "text-primary bg-primary/5" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
} 