import { Outlet, NavLink } from 'react-router-dom'
import { Navigation } from './layouts/Navigation'
import { useDrawer } from '@/hooks/useDrawer'
import { cn } from '@/lib/utils'
import { memo } from 'react'
import { Home, Heart, Pill, MessageCircle } from 'lucide-react'
import { SheetContainer } from './ui/sheet-container'
import { useSheetStore } from '@/stores/sheet-store'
import { Modal } from './ui/modal/Modal'
import { IonPage, IonContent } from '@ionic/react'
import { Dialog } from './ui/modal/Dialog'
import { useModalStore } from '@/stores/modal-store'
import { ChatModal } from './ChatModal'
import Tabs from './tabs'

export const Layout = memo(function Layout() {
  
  return (
    <IonPage>
      <IonContent>
        <div className="min-h-screen bg-background relative">
          {/* Main Content */}
          <main className="pb-20">
            <Outlet />
          </main>

          {/* Bottom Navigation */}
          <Tabs />
          {/* <nav className="fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-md border-t">
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

                <button
                  onClick={handleOpenChat}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-3 text-sm transition-colors",
                    "text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
                  )}
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Chat</span>
                </button>
              </div>
            </div>
          </nav> */}
          
          <Modal />
          <Dialog />
        </div>
      </IonContent>
    </IonPage>
  )
})
