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
import { MedicationCard } from '@/components/home/MedicationCard' // Adicionar esta importação

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
      <div className="p-4 space-y-6 mx-auto">
        {/* Header simplificado */}
        <div className="p-4 sm:p-6 bg-gradient-to-br from-violet-700 to-violet-600 rounded-3xl shadow-lg text-white">
          <div className="flex items-start sm:items-center justify-between mb-4 sm:mb-6">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white">Medicamentos</h1>
              <p className="text-sm text-violet-50/90">
                {medications?.length || 0} medicamentos cadastrados
              </p>
            </div>
            <div className="p-2 sm:p-3 bg-white/10 rounded-xl sm:rounded-2xl">
              <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
          </div>

          {/* Stats cards mais compactos */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-1">
                <div className="p-1.5 sm:p-2 rounded-lg bg-white/20">
                  <Package2 className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs sm:text-sm text-white/90">
                  <span className="sm:hidden">Total</span>
                  <span className="hidden sm:inline">Medicamentos</span>
                </p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <p className="text-lg sm:text-2xl font-bold text-white">
                  {medications?.length || 0}
                </p>
                <span className="text-xs sm:text-sm font-normal text-white/80">ativos</span>
              </div>
            </div>
            
            <div className="bg-white/15 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3 mb-1">
                <div className="p-1.5 sm:p-2 rounded-lg bg-red-500/30">
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs sm:text-sm text-white/90">
                  <span className="sm:hidden">Baixo</span>
                  <span className="hidden sm:inline">Estoque Baixo</span>
                </p>
              </div>
              <div className="flex items-baseline gap-1.5">
                <p className="text-lg sm:text-2xl font-bold text-white">
                  {medications?.filter(m => m.remainingQuantity <= m.dosageQuantity * 3).length || 0}
                </p>
                <span className="text-xs sm:text-sm font-normal text-white/80">alertas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de ações - mantém o mesmo layout da Home */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4">
              <Search className="w-5 h-5 text-violet-400" />
            </div>
            <Input
              type="text"
              placeholder="Buscar medicamentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-white border-transparent placeholder:text-violet-300 h-14 rounded-2xl shadow-sm text-base"
            />
          </div>
          <button 
            onClick={handleAddMedicationClick}
            className="h-14 px-6 bg-violet-700 text-white rounded-2xl font-medium hover:bg-violet-800 active:bg-violet-900 transition-colors shadow-sm flex items-center gap-2 justify-center whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            <span className="sm:inline">Adicionar</span>
          </button>
        </div>

        {/* Lista de medicamentos */}
        <div className="bg-white rounded-3xl overflow-hidden shadow-sm">
          {filteredMedications.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredMedications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={{
                    ...medication,
                    description: medication.description || '',
                    dosage: `${medication.dosageQuantity} ${medication.unit}`,
                    time: '',
                    instructions: medication.description || '',
                    status: 'pending',
                    timeUntil: '',
                    reminders: [],
                  }}
                  onClick={() => handleMedicationClick(medication)}
                  variant="list"
                  showStock={true}
                />
              ))}
            </div>
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