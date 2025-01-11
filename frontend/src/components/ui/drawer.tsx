import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useDrawer } from '@/hooks/useDrawer'
import { ArrowLeft } from 'lucide-react'
import { Button } from './button'
import { memo } from 'react'

const DrawerHeader = memo(({ title, onClose }: { title?: string | null; onClose: () => void }) => (
  <div className="flex items-center gap-4 px-4 py-4 border-b">
    <Button
      variant="ghost"
      size="icon"
      className="hover:bg-primary/5 text-gray-500 hover:text-primary transition-all duration-200"
      onClick={onClose}
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
    {title && (
      <h2 className="text-lg font-semibold">{title}</h2>
    )}
  </div>
))

DrawerHeader.displayName = 'DrawerHeader'

const DrawerContent = memo(({ children }: { children: React.ReactNode }) => (
  <div className="flex-1 overflow-auto bg-accent">
    <div className="px-4 py-6">
      {children}
    </div>
  </div>
))

DrawerContent.displayName = 'DrawerContent'

export const Drawer = memo(function Drawer() {
  const { isOpen, content, title, close } = useDrawer()

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 border-l-0"
      >
        <div className="flex flex-col h-full will-change-transform">
          <DrawerHeader title={title} onClose={close} />
          <DrawerContent>{content}</DrawerContent>
        </div>
      </SheetContent>
    </Sheet>
  )
}) 