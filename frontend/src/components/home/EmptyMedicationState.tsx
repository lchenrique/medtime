import { Button } from '@/components/ui/button'
import { Pill, Plus, ArrowRight } from 'lucide-react'

interface EmptyMedicationStateProps {
  onAddClick: () => void
}

export function EmptyMedicationState({ onAddClick }: EmptyMedicationStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="w-16 h-16 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-violet-400 mb-6">
        <Pill className="w-8 h-8" />
      </div>
      
      <h3 className="text-lg font-medium text-foreground mb-2">
        Nenhum medicamento cadastrado
      </h3>
      
      <p className="text-sm text-muted-foreground text-center mb-6 max-w-sm">
        Comece adicionando seus medicamentos para receber lembretes e manter o controle dos seus horários.
      </p>

      <div className="space-y-3">
        <Button 
          onClick={onAddClick}
          className="w-full gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Medicamento
        </Button>

        <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-violet-600 dark:text-violet-400 mb-3">
            Com o MedTime você pode:
          </h4>
          <ul className="space-y-3">
            {[
              'Receber lembretes nos horários certos',
              'Controlar o estoque dos seus medicamentos',
              'Acompanhar seu histórico de doses',
              'Compartilhar informações com cuidadores'
            ].map((feature, index) => (
              <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                <ArrowRight className="w-4 h-4 text-violet-500 dark:text-violet-400" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}