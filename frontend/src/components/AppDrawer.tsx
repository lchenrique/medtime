import { useDrawer } from '@/hooks/useDrawer'
import {
  Sheet,
  SheetContent,
} from '@/components/ui/sheet'

export function AppDrawer() {
  const { isOpen, content, close } = useDrawer()

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent 
        side="right" 
        className="w-full p-0 border-none shadow-none flex flex-col h-full overflow-hidden"
      >
        {content}
      </SheetContent>
    </Sheet>
  )
} 