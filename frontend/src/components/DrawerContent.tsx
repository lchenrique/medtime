import { ReactNode } from 'react'

interface DrawerContentProps {
  children: ReactNode
}

export function DrawerContent({ children }: DrawerContentProps) {
  return (
    <div className="h-full overflow-y-auto py-4">
      {children}
    </div>
  )
} 