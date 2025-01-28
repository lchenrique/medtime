import { Sheet, SheetContent } from '@/components/ui/sheet'
import { useDrawer } from '@/hooks/useDrawer'
import { ArrowLeft } from 'lucide-react'
import { Button } from './button'
import { memo } from 'react'

const DrawerHeader = memo(({ title, onClose }: { title?: string | null; onClose: () => void }) => (
  <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md flex items-center gap-4 px-4 py-3 border-b">
    <Button
      variant="ghost"
      size="icon"
      className="text-violet-600 dark:text-violet-400"
      onClick={onClose}
    >
      <ArrowLeft className="h-5 w-5" />
    </Button>
    {title && (
      <h2 className="text-xl font-normal text-foreground">{title}</h2>
    )}
  </div>
))

DrawerHeader.displayName = 'DrawerHeader'

const DrawerContent = memo(({ children }: { children: React.ReactNode }) => (
  <div className="flex-1 overflow-auto bg-background">
    {children}
  </div>
))

DrawerContent.displayName = 'DrawerContent'

export const Drawer = memo(function Drawer() {
  const { isOpen, content, title, close } = useDrawer()

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md p-0 border-l-0 bg-background"
      >
        <div className="flex flex-col h-full will-change-transform">
          <DrawerHeader title={title} onClose={close} />
          <DrawerContent>{content}</DrawerContent>
        </div>
      </SheetContent>
    </Sheet>
  )
}) 