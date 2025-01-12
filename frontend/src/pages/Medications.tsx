import { useGetMedications } from '@/api/generated/medications/medications'
import { useDrawer } from '@/hooks/useDrawer'
import { MedicationDetails } from './MedicationDetails'
import { Medication } from '@/types/medication'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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
  }> | null
}

export function Medications() {
  const [searchTerm, setSearchTerm] = useState('')
  const drawer = useDrawer()
  const { data: medications, isLoading } = useGetMedications()

  const handleMedicationClick = (med: ApiMedication) => {
    // Mapeia os dados da API para o formato Medication
    const medication: Medication = {
      ...med,
      description: med.description || '',
      dosage: `${med.dosageQuantity} ${med.unit}`,
      time: new Date(med.startDate).toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      }),
      instructions: med.description || '',
      status: 'pending',
      timeUntil: '',
      reminders: (med.reminders || []).map(reminder => ({
        ...reminder,
        taken: reminder.taken || false,
        takenAt: reminder.takenAt || null,
        skipped: reminder.skipped || false,
        skippedReason: reminder.skippedReason || null,
        time: new Date(reminder.scheduledFor).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit',
          timeZone: 'America/Sao_Paulo'
        })
      }))
    }

    drawer.open({
      title: medication.name,
      content: <MedicationDetails medication={medication} />
    })
  }

  const filteredMedications = medications?.filter(med => 
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${med.dosageQuantity} ${med.unit}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-14 bg-primary/10 rounded-2xl" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-primary/5 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-violet-50">
      <div className="p-4 space-y-6">
        <div className="space-y-4">
          <div>
            <h1 className="text-xl font-semibold text-violet-950">Medicamentos</h1>
            <p className="text-sm text-violet-500">Gerencie seus medicamentos</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
            <Input
              type="text"
              placeholder="Buscar medicamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-violet-100 placeholder:text-violet-300 focus-visible:ring-violet-500"
            />
          </div>
        </div>

        <div className="bg-white rounded-3xl overflow-hidden shadow-sm divide-y divide-violet-100">
          {filteredMedications.length > 0 ? (
            filteredMedications.map((medication) => (
              <button
                key={medication.id}
                onClick={() => handleMedicationClick(medication)}
                className={cn(
                  "w-full flex items-center gap-4 p-4 text-left transition-colors",
                  "hover:bg-violet-50/50 active:bg-violet-50"
                )}
              >
                <div className="shrink-0 w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center">
                  <span className="text-lg font-medium text-violet-500">
                    {medication.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-violet-950 truncate">
                    {medication.name}
                  </h3>
                  <p className="text-sm text-violet-500 truncate">
                    {medication.dosageQuantity} {medication.unit} - {medication.description || 'Sem instruções'}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="p-12 text-center">
              <p className="text-sm text-violet-400">
                {searchTerm 
                  ? `Nenhum medicamento encontrado para "${searchTerm}"`
                  : 'Nenhum medicamento cadastrado'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 