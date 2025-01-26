import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserMenu } from '@/components/UserMenu'

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">
            Meus Medicamentos
          </h1>
          <p className="text-sm text-muted-foreground">Acompanhe seus medicamentos</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-primary/5 text-gray-500 hover:text-primary transition-all duration-200"
          >
            <Search className="h-5 w-5" />
          </Button>
          <UserMenu />
        </div>
      </div>
    </header>
  )
} 