import React from 'react'
import { Home, Pill, Search, BotMessageSquare, UserCircle2 } from "lucide-react"
import { Link, useLocation } from 'react-router-dom'
import { useModalStore } from '@/stores/modal-store'
import { ChatModal } from './ChatModal'
import { cn } from '@/lib/utils'

const tabs = [
  {
    icon: Home,
    label: 'Início',
    path: '/',
  },
  {
    icon: Pill,
    label: 'Remédios',
    path: '/medications',
  },
  {
    icon: Search,
    label: 'Buscar',
    path: '/search',
  },
  {
    icon: UserCircle2,
    label: 'Perfil',
    path: '/profile',
  },
]

function Tabs() {
  const location = useLocation()
  const open = useModalStore((state) => state.open)

  const handleOpenChat = () => {
    open({
      title: 'Chat com IA',
      content: <ChatModal />
    })
  }

  return (
    <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="inline-flex mx-auto justify-between items-center bg-card dark:bg-card rounded-full px-4 py-2 shadow-lg w-[90vw] max-w-md">
        {tabs.slice(0, 2).map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "inline-flex flex-col items-center justify-center w-[60px] p-2",
              "hover:bg-primary/10 dark:hover:bg-primary/20 rounded-2xl transition-all duration-200",
              "active:scale-95",
              location.pathname === path && "bg-primary/10 dark:bg-primary/20"
            )}
          >
            <Icon className={cn(
              "w-6 h-6 text-muted-foreground",
              location.pathname === path && "text-primary dark:text-primary"
            )} />
            <span className={cn(
              "text-xs text-muted-foreground mt-1",
              location.pathname === path && "text-primary dark:text-primary"
            )}>
              {label}
            </span>
          </Link>
        ))}

        {/* Botão do Chat */}
        <button 
          onClick={handleOpenChat}
          className="relative inline-flex flex-col items-center justify-center w-[60px] -mt-8"
        >
          <div className="p-3 rounded-full bg-primary dark:bg-primary border-4 border-background dark:border-background shadow-lg">
            <BotMessageSquare className="w-6 h-6 text-primary-foreground dark:text-primary-foreground" />
          </div>
          <span className="text-xs text-muted-foreground mt-1">
            Chat
          </span>
        </button>

        {tabs.slice(2).map(({ icon: Icon, label, path }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "inline-flex flex-col items-center justify-center w-[60px] p-2",
              "hover:bg-primary/10 dark:hover:bg-primary/20 rounded-2xl transition-all duration-200",
              "active:scale-95",
              location.pathname === path && "bg-primary/10 dark:bg-primary/20"
            )}
          >
            <Icon className={cn(
              "w-6 h-6 text-muted-foreground",
              location.pathname === path && "text-primary dark:text-primary"
            )} />
            <span className={cn(
              "text-xs text-muted-foreground mt-1",
              location.pathname === path && "text-primary dark:text-primary"
            )}>
              {label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  )
}

export default Tabs
