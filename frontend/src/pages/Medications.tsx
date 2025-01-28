import { useGetMedications } from '@/api/generated/medications/medications'
import { GetMedications200Item } from '@/api/model/getMedications200Item'
import { useDrawer } from '@/hooks/useDrawer'
import { MedicationDetails } from './MedicationDetails'
import { Medication } from '@/types/medication'
import { Search, Pill, ListFilter, Package2, AlertCircle, Plus, ChevronRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { EmptyMedicationState } from '@/components/home/EmptyMedicationState'
import { AddMedicationForm } from '@/components/home/AddMedicationForm'
import { NoResults } from '@/components/ui/NoResults'
import { MedicationCard } from '@/components/home/MedicationCard'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

// Tipo inferido da resposta da API
type ApiMedication = {
  id: string
  name: string
  description: string | null
  startDate: string
  duration: number
  interval: number
  totalQuantity: number
  remainingQuantity: number
  unit: string
  dosageQuantity: number
  reminders: Array<{
    id: string
    scheduledFor: string
    taken: boolean | null
    takenAt: string | null
    skipped: boolean | null
    skippedReason: string | null
    createdAt: string
    updatedAt: string
  }> | null
}

export function Medications() {
  const [searchTerm, setSearchTerm] = useState('')
  const drawer = useDrawer()
  const { data: medications, isLoading } = useGetMedications()

  const handleMedicationClick = (med: GetMedications200Item) => {
    // Mapeia os dados da API para o formato Medication
    const medication: Medication = {
      id: med.id,
      name: med.name,
      description: med.description || '',
      startDate: med.startDate,
      duration: med.duration,
      interval: med.interval,
      isRecurring: med.interval > 0,
      dosage: `${med.dosageQuantity} ${med.unit}`,
      time: new Date(med.startDate).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'UTC'
      }),
      instructions: med.description || '',
      status: 'pending',
      timeUntil: '',
      reminders: (med.reminders || []).map(reminder => ({
        ...reminder,
        taken: reminder.taken ?? false,
        skipped: reminder.skipped ?? false,
        time: new Date(reminder.scheduledFor).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC'
        }),
        createdAt: reminder.createdAt || new Date().toISOString(),
        updatedAt: reminder.updatedAt || new Date().toISOString()
      })),
      unit: med.unit,
      totalQuantity: med.totalQuantity,
      remainingQuantity: med.remainingQuantity,
      dosageQuantity: med.dosageQuantity,
      userId: '',
      createdAt: '',
      updatedAt: ''
    }

    drawer.open({
      title: medication.name,
      content: <MedicationDetails medication={medication} />
    })
  }

  const filteredMedications =  medications?.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${med.dosageQuantity} ${med.unit}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []


  const handleAddMedicationClick = () => {
    drawer.open({
      title: 'Adicionar Medicamento',
      content: <AddMedicationForm onSuccess={() => drawer.close()} />
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto">
        {/* Header com título e ações */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-normal text-foreground">Estoque</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleAddMedicationClick}
                className="text-violet-600 dark:text-violet-400"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Contador de medicamentos */}
          <div className="px-4 py-2 bg-violet-50 dark:bg-violet-950/30 rounded-lg">
            <p className="text-sm text-violet-600 dark:text-violet-400">
              {medications?.length || 0} medicamentos • {' '}
              {medications?.filter(m => m.remainingQuantity <= m.dosageQuantity * 3).length || 0} com estoque baixo
            </p>
          </div>
        </div>

        {/* Lista de Medicamentos */}
        <div className="divide-y divide-border">
          {filteredMedications.length > 0 ? (
            filteredMedications.map((medication) => (
              <div 
                key={medication.id}
                onClick={() => handleMedicationClick(medication)}
                className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                {/* Avatar do Medicamento */}
                <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <Pill className="w-6 h-6" />
                </div>

                {/* Informações do Medicamento */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-foreground truncate">{medication.name}</h3>
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      medication.remainingQuantity <= medication.dosageQuantity 
                        ? "bg-red-100 dark:bg-red-950/50 text-red-600 dark:text-red-400"
                        : medication.remainingQuantity <= medication.dosageQuantity * 3
                        ? "bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400"
                        : "bg-violet-100 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400"
                    )}>
                      {medication.remainingQuantity} {medication.unit}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {medication.description || `${medication.dosageQuantity} ${medication.unit} por dose`}
                  </p>
                </div>
              </div>
            ))
          ) : (
            searchTerm ? (
              <NoResults message={`Nenhum medicamento encontrado para "${searchTerm}"`} />
            ) : (
              <EmptyMedicationState onAddClick={handleAddMedicationClick} />
            )
          )}
        </div>
      </div>
    </div>
  )
}

// Função auxiliar com cores mais acessíveis
function getProgressColor(remaining: number, dosage: number) {
  if (remaining <= dosage) return '#dc2626' // Vermelho mais escuro
  if (remaining <= dosage * 3) return '#ea580c' // Laranja mais escuro
  return '#6d28d9' // Violeta mais escuro
}