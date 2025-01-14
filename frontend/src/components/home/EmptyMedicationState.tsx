import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'

interface EmptyMedicationStateProps {
  onAddClick: () => void
}

export function EmptyMedicationState({ onAddClick }: EmptyMedicationStateProps) {
  return (
    <Card className="p-6 text-center space-y-4">
      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Plus className="w-6 h-6 text-primary" />
      </div>
      <div>
        <h2 className="text-lg font-medium">Nenhum medicamento cadastrado</h2>
        <p className="text-sm text-muted-foreground">
          Adicione seu primeiro medicamento para começar a receber lembretes
        </p>
      </div>
      <Button onClick={onAddClick} className="w-full lg:w-auto">
        <Plus className="w-5 h-5 mr-2" />
        Adicionar Medicamento
      </Button>
    </Card>
  )
} 