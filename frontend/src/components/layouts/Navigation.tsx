import { Home, List, Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { ReactNode } from 'react'
import { MedTimeIcon } from '@/components/icons/MedTimeIcon'

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
      <nav className="fixed z-50 bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-violet-100 shadow-lg md:hidden">
        <div className="flex items-center justify-around max-w-2xl mx-auto">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center py-3 px-5 min-w-[80px] transition-all",
                isActive(item.path) 
                  ? "text-violet-700" 
                  : "text-violet-400 hover:text-violet-600"
              )}
            >
              <item.icon className={cn(
                "w-6 h-6 transition-transform",
                isActive(item.path) && "scale-110"
              )} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-white/80 backdrop-blur-lg border-r border-violet-100 flex-col p-4">
        <div className="flex items-center gap-3 px-3 py-6 mb-6">
          <MedTimeIcon className="w-10 h-10" />
          <span className="font-bold text-xl bg-gradient-to-r from-violet-700 to-violet-500 bg-clip-text text-transparent">
            MedTime
          </span>
        </div>

        <div className="space-y-2 px-2">
          {navigationItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all",
                isActive(item.path)
                  ? "text-violet-700 bg-violet-50 shadow-sm font-medium"
                  : "text-violet-400 hover:text-violet-600 hover:bg-violet-50/50"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform",
                isActive(item.path) && "scale-110"
              )} />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}