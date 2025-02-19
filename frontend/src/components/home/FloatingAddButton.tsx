import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface FloatingAddButtonProps {
  onClick: () => void
}

export function FloatingAddButton({ onClick }: FloatingAddButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed z-50 bottom-20 right-6 rounded-full w-14 h-14 p-0 shadow-lg"
    >
      <Plus className="w-6 h-6" />
    </Button>
  )
} 