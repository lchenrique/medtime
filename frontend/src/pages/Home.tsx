import { useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useGetMedications, usePutMedicationsMarkAsTaken } from '@/api/generated/medications/medications'
import { useDrawer } from '@/hooks/useDrawer'
import { MedicationDetails } from './MedicationDetails'
import { EmptyMedicationState } from '@/components/home/EmptyMedicationState'
import { MedicationCard } from '@/components/home/MedicationCard'
import { Medication } from '@/types/medication'
import { AddMedicationForm } from '@/components/home/AddMedicationForm'
import { Bell, Search, AlertCircle, Plus, Moon, Sun, MoreVertical, Settings } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from 'react-router-dom'
import { useSheetStore } from '@/stores/sheet-store'
import { GetMedications200Item } from '@/api/model'

export type ReminderStatus = 'pending' | 'taken' | 'skipped' | 'late'

export interface MedicationGroup {
  hour: string
  medications: GetMedications200Item[]
}

export function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const { data, isLoading } = useGetMedications(
    { period: 'today' },
    { 
      query: {
        refetchOnWindowFocus: true
      }
    }
  )
  const open = useSheetStore(state => state.open)
  const close = useSheetStore(state => state.close)
  const { mutate: markAsTaken } = usePutMedicationsMarkAsTaken()
  const queryClient = useQueryClient()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const hasNoMedications = !data?.medications || data.medications.length === 0
  const hasNoRemindersToday = !data?.groups.late.length && !data?.groups.onTime.length

  const handleMedicationClick = useCallback((medication: GetMedications200Item) => {
    open({
      title: medication.name,
      content: <MedicationDetails medication={medication} />,
    })
  }, [open])

  const handleAddMedicationClick = useCallback(() => {
    open({
      title: 'Adicionar Medicamento',
      content: <AddMedicationForm onSuccess={() => close()} />,
    })
  }, [open, close])

  const handleTakeMedication = useCallback((medicationId: string, reminderId: string, scheduledFor: string) => {
    markAsTaken({
      data: {
        reminderId,
        scheduledFor,
        taken: true
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['medications'] })
      }
    })
  }, [markAsTaken, queryClient])

  const handleSearch = useCallback(() => {
    open({
      title: 'Pesquisar',
      content: (
        <div className="p-4">
          <Input
            placeholder="Pesquisar medicamento..."
            className="w-full"
            autoFocus
          />
        </div>
      ),
    })
  }, [open])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <div className="animate-spin text-violet-600">
          <Loader2 className="w-6 h-6" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Principal */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-normal text-foreground">MedTime</h1>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleAddMedicationClick}
                className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
              >
                <Plus className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSearch}
                className="text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
              >
                <Search className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-violet-600 dark:hover:text-violet-400"
                  >
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {!hasNoRemindersToday && (
            <div className="mt-3 px-4 py-2 bg-violet-50 dark:bg-violet-950/30 rounded-lg">
              <p className="text-sm text-violet-600 dark:text-violet-400">
                {data?.groups.onTime.length} medicamentos pendentes • {data?.groups.late.length} atrasados
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 relative isolate">
        <div className="max-w-2xl mx-auto">
          {hasNoRemindersToday ? (
            <EmptyMedicationState onAddClick={handleAddMedicationClick} />
          ) : (
            <div className="divide-y divide-border">
              {/* Medicamentos Atrasados */}
              {data?.groups.late.length > 0 && (
                <div>
                  <div className="sticky top-[4.5rem] z-40 bg-background/95 backdrop-blur-md border-y">
                    <div className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-medium">Atrasados</span>
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {data.groups.late.map((group) => (
                      <div key={group.time}>
                        <div className="sticky top-[7rem] z-30 bg-background/95 backdrop-blur-md px-4 py-2 border-y">
                          <span className="text-base font-medium text-foreground">
                            {group.time}
                          </span>
                        </div>

                        <div className="divide-y divide-border">
                          {group.medications.map((item) => (
                            <MedicationCard
                              key={item.reminder.id}
                              medication={item.medication}
                              onClick={() => handleMedicationClick(item.medication)}
                              isLate={true}
                              showTakeButton
                              onTake={() => handleTakeMedication(
                                item.medication.id,
                                item.reminder.id,
                                item.reminder.scheduledFor
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicamentos Pendentes */}
              {data?.groups.onTime.length > 0 && (
                <div>
                  <div className="sticky top-[4.5rem] z-40 bg-background/95 backdrop-blur-md border-y">
                    <div className="flex items-center gap-2 px-4 py-2 text-violet-600 dark:text-violet-400">
                      <Bell className="w-4 h-4" />
                      <span className="text-sm font-medium">Pendentes</span>
                    </div>
                  </div>

                  <div className="divide-y divide-border">
                    {data.groups.onTime.map((group) => (
                      <div key={group.time}>
                        <div className="sticky top-[7rem] z-30 bg-background/95 backdrop-blur-md px-4 py-2 border-y">
                          <span className="text-base font-medium text-foreground">
                            {group.time}
                          </span>
                        </div>

                        <div className="divide-y divide-border">
                          {group.medications.map((item) => (
                            <MedicationCard
                              key={item.reminder.id}
                              medication={item.medication}
                              onClick={() => handleMedicationClick(item.medication)}
                              isLate={false}
                              showTakeButton
                              onTake={() => handleTakeMedication(
                                item.medication.id,
                                item.reminder.id,
                                item.reminder.scheduledFor
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
