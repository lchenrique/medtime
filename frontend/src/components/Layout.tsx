import { Outlet } from 'react-router-dom'
import { Navigation } from './layouts/Navigation'
import { UserMenu } from './UserMenu'
import { Drawer } from '@/components/ui/drawer'
import { useDrawer } from '@/hooks/useDrawer'
import { cn } from '@/lib/utils'
import { memo } from 'react'
import { MedTimeIcon } from './icons/MedTimeIcon'

const Header = memo(function Header() {
  return (
    <header className="sticky top-0 left-0 right-0 h-20 bg-gradient-to-r from-violet-50/95 to-white/95 backdrop-blur-md border-b border-gray-200/30 shadow-sm flex items-center justify-between px-6 z-50 transition-all duration-300">
      <div className="flex items-center gap-4">
        <MedTimeIcon className="w-9 h-9 text-violet-600 transition-transform hover:scale-105" />
      </div>
      <div className="flex items-center gap-4">
        <UserMenu />
      </div>
    </header>
  )
})

export const Layout = memo(function Layout() {
  const { isOpen } = useDrawer()

  return (
    <div className="min-h-screen bg-violet-50 relative">
      <Navigation />

      <div 
        className={cn(
          "transition-transform duration-500 ease-ios",
          isOpen && "scale-[0.96] -translate-x-[30px] rounded-l-[2rem] overflow-hidden"
        )}
      >
        <Header />

        {/* Main Content */}
        <main className="md:pl-64 pb-16 md:pb-0">
          <div className="max-w-5xl mx-auto overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>

      <Drawer />
    </div>
  )
})
