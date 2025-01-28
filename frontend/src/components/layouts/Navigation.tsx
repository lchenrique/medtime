import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Bell, List, Menu, Settings } from 'lucide-react'
import { useDrawer } from '@/hooks/useDrawer'
import { memo } from 'react'
import { Button } from '../ui/button'
import { MedTimeIcon } from '../icons/MedTimeIcon'

const links = [
  {
    label: 'Lembretes',
    icon: Bell,
    href: '/'
  },
  {
    label: 'Medicamentos',
    icon: List,
    href: '/medications'
  },
  {
    label: 'Configurações',
    icon: Settings,
    href: '/settings'
  }
]

export const Navigation = memo(function Navigation() {
  const drawer = useDrawer()

  const handleToggle = () => {
    if (drawer.isOpen) {
      drawer.close()
    } else {
      drawer.open({ content: null, title: 'Menu' })
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-6 left-6 z-50 md:hidden text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
        onClick={handleToggle}
      >
        <Menu className="w-6 h-6" />
      </Button>

      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white dark:bg-zinc-900/95 border-t border-gray-200/30 backdrop-blur-md">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {links.map(link => (
            <NavLink
              key={link.href}
              to={link.href}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center py-3 px-5 min-w-[64px] transition-colors',
                  isActive
                    ? 'text-violet-600 dark:text-violet-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400'
                )
              }
            >
              <link.icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{link.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <nav className="fixed top-0 left-0 bottom-0 hidden md:flex flex-col w-64 p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-r border-gray-200/30">
        <div className="flex items-center gap-3 mb-8">
          <MedTimeIcon className="w-9 h-9 text-violet-600 dark:text-violet-400" />
          <span className="font-semibold text-lg bg-gradient-to-r from-violet-600 to-violet-400 bg-clip-text text-transparent">
            MedTime
          </span>
        </div>

        <div className="flex-1">
          <ul className="space-y-1">
            {links.map(link => (
              <li key={link.href}>
                <NavLink
                  to={link.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      'hover:bg-violet-50 dark:hover:bg-violet-950/50',
                      isActive
                        ? 'bg-violet-100 dark:bg-violet-950/70 text-violet-600 dark:text-violet-400'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400'
                    )
                  }
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </>
  )
})