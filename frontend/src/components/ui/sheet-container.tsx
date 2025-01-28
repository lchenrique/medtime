import { memo } from 'react'
import { useSheetStore } from '@/stores/sheet-store'
import { Sheet, SheetContent, SheetOverlay, SheetPortal } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export const SheetContainer = memo(function SheetContainer() {
  const { isOpen, options, snap, close, setSnap } = useSheetStore()

  return (
    <Sheet 
      open={isOpen} 
      onOpenChange={close}
      modal
      snapPoints={options?.snapPoints}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
    >
      <SheetPortal>
        <SheetOverlay className="fixed inset-0 bg-black/40" />
        <SheetContent 
          className="fixed flex flex-col bg-white border border-gray-200 border-b-none rounded-t-[10px] bottom-0 left-0 right-0 h-full max-h-[97%] "
        >
          <div 
           className={cn('flex flex-col overflow-y-auto')}
          >
            {/* Handle para arrastar */}
            
            <div className="mt-4">
              {options?.title && (
                <h2 className="text-xl font-medium text-center mb-4">
                  {options.title}
                </h2>
              )}
              {options?.content}
            </div>
          </div>
        </SheetContent>
      </SheetPortal>
    </Sheet>
  )
}) 