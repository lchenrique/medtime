import { Loader2 } from 'lucide-react'

export function Loading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background backdrop-blur-sm z-50">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  )
} 