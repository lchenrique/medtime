import { Outlet, NavLink } from 'react-router-dom'
import { Navigation } from './layouts/Navigation'
import { useDrawer } from '@/hooks/useDrawer'
import { cn } from '@/lib/utils'
import { memo } from 'react'
import { Home, Heart, Pill } from 'lucide-react'
import { SheetContainer } from './ui/sheet-container'
import { useSheetStore } from '@/stores/sheet-store'

export const Layout = memo(function Layout() {
  const isOpen = useSheetStore(state => state.isOpen)

  return (
    <div className="min-h-screen bg-background relative">
      <div >
        {/* Main Content */}
        <main className="pb-20">
          <div className="max-w-2xl mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-around">
              <NavLink
                to="/"
                className={({ isActive }) => cn(
                  "flex flex-col items-center gap-1 px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
                )}
              >
                <Home className="w-5 h-5" />
                <span>Hoje</span>
              </NavLink>

              <NavLink
                to="/medications"
                className={({ isActive }) => cn(
                  "flex flex-col items-center gap-1 px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
                )}
              >
                <Pill className="w-5 h-5" />
                <span>Medicamentos</span>
              </NavLink>

              <NavLink
                to="/health"
                className={({ isActive }) => cn(
                  "flex flex-col items-center gap-1 px-4 py-3 text-sm transition-colors",
                  isActive
                    ? "text-violet-600 dark:text-violet-400"
                    : "text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
                )}
              >
                <Heart className="w-5 h-5" />
                <span>Saúde</span>
              </NavLink>
            </div>
          </div>
        </nav>
      </div>

      {/* Sheet Container - Agora depois do conteúdo principal */}
      <SheetContainer />
    </div>
  )
})
