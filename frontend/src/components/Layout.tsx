import { Outlet } from 'react-router-dom'
import { Navigation } from './layouts/Navigation'
import { UserMenu } from './UserMenu'
import { Drawer } from '@/components/ui/drawer'
import { useDrawer } from '@/hooks/useDrawer'
import { cn } from '@/lib/utils'
import { memo } from 'react'
import { MedTimeIcon } from './icons/MedTimeIcon'
import { useUserStore } from '@/stores/user'

const Header = memo(function Header() {
  const { user } = useUserStore()

  return (
    <header className="top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:hidden z-10">
      <div className="flex items-center gap-3">
        <MedTimeIcon className="w-8 h-8" />
        <div className="flex flex-col">
          <span className="font-semibold text-lg">MedTime</span>
          <span className="text-sm text-muted-foreground">Olá, {user?.name?.split(' ')[0]}</span>
        </div>
      </div>
      <UserMenu />
    </header>
  )
})

const DesktopHeader = memo(function DesktopHeader() {
  const { user } = useUserStore()

  return (
    <div className="hidden md:flex items-center justify-between bg-background border p-4">
      <span className="text-muted-foreground">Olá, {user?.name?.split(' ')[0]}</span>
      <UserMenu />
    </div>
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
          <div className="max-w-5xl mx-auto overflow-auto  "> 
            <DesktopHeader />
            <Outlet />
          </div>
        </main>
      </div>

      <Drawer />
    </div>
  )
}) 