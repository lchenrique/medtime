import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'

interface EmptyMedicationStateProps {
  onAddClick: () => void
}

export function EmptyMedicationState({ onAddClick }: EmptyMedicationStateProps) {
  return (
    <Card className="p-6 text-center space-y-4">
      <figure className="mx-auto w-28 h-28">
        <img src="/imgs/no_data.png" alt="Sem medicamentos" className="w-full h-full object-contain" />
      </figure>
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