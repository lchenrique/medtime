import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus } from 'lucide-react'

interface EmptyMedicationNowStateProps {
  onAddClick: () => void
}

export function EmptyMedicationNowState({ onAddClick }: EmptyMedicationNowStateProps) {
  return (
    <Card className="p-6 text-center space-y-4">
      <figure className="mx-auto w-28 h-28">
        <img src="/imgs/no_notifications.png" alt="Nenhum medicamento para hoje" className="w-full h-full object-contain" />
      </figure>
      <div> 
        <h2 className="text-lg font-medium">Nenhum medicamento para hoje</h2>
        <p className="text-sm text-muted-foreground mt-1">  
          Você não tem nenhum medicamento agendado para hoje. Aproveite para adicionar novos medicamentos e manter seu controle em dia.
        </p>
      </div>
      <Button onClick={onAddClick} className="w-full gap-2">
        <Plus className="w-4 h-4" />
        Adicionar Medicamento
      </Button>
    </Card>
  )
}