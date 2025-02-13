import { useGetMedications, usePutMedicationsMarkAsTaken } from '@/api/generated/medications/medications'
import { GetMedications200AnyOfThree, GetMedications200Item } from '@/api/model'
import { Loading } from '@/components/Loading'
import { PageHeader } from '@/components/PageHeader'
import { AddMedicationForm } from '@/components/home/AddMedicationForm'
import { EmptyMedicationNowState } from '@/components/home/EmptyMedicationNowState'
import { MedicationCard } from '@/components/home/MedicationCard'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useModalStore } from '@/stores/modal-store'
import { useUserStore } from '@/stores/user'
import { IonContent, IonList, IonPage, IonRefresher, IonRefresherContent, RefresherEventDetail } from '@ionic/react'
import { AlertCircle, Bell, LogOut, Moon, MoreVertical, Plus, Search, Settings, Sun } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MedicationDetails } from './MedicationDetails'
import { useToast } from '@/stores/use-toast'
import { useTheme } from '@/components/ThemeProvider'
import { ModeToggle } from '@/components/ModeToggle'

export type ReminderStatus = 'pending' | 'taken' | 'skipped' | 'late'

export interface MedicationGroup {
  hour: string
  medications: GetMedications200Item[]
}

export function Home() {
  const toast = useToast(state => state.open)
  const { data, isLoading, refetch, isFetching } = useGetMedications(
    { period: 'today' },
    {
      query: {
        refetchOnWindowFocus: true,
        select: (data): GetMedications200AnyOfThree => {
          if (Array.isArray(data)) {
            return {
              medications: data,
              groups: {
                late: [],
                onTime: [],
              },
            };
          }
          return data;
        },
      }
    }
  )
  const open = useModalStore(state => state.open)
  const close = useModalStore(state => state.close)
  const { mutate: markAsTaken } = usePutMedicationsMarkAsTaken({
    mutation:{
      onSuccess: (data) => {
        refetch()
        if(data?.taken){
          toast({
            title: 'Medicamento marcado como tomado',
            description: 'O medicamento foi marcado como tomado com sucesso',
            type: 'success'
          })
        }
      }
    }
  })
  const { logout } = useUserStore()
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
        refetch()
      }
    })
  }, [markAsTaken, refetch])


  if (isLoading) {
    return (
      <Loading />
    )
  }


  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    refetch()
    if (!isFetching) {
      event.detail.complete();
    }
  }

  return (
    <IonPage>
      <PageHeader title="Medtime" extra={
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg mb-2 px-4 py-2">
            <p className="text-sm text-violet-600 dark:text-violet-400">
              {data?.groups.onTime.length} medicamentos pendentes • {data?.groups.late.length} atrasados
            </p>
          </div>
        </div>
      }>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddMedicationClick}
            className="text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300"
          >
            <Plus className="w-5 h-5" />
          </Button>
          <ModeToggle />
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

              <DropdownMenuItem onClick={() => {
                logout()
                navigate('/login')
              }}>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </PageHeader>


      <IonContent>
          <IonRefresher  slot="fixed" onIonRefresh={handleRefresh}>
            <IonRefresherContent></IonRefresherContent>
          </IonRefresher>
        <div className="max-w-2xl mx-auto px-4 pb-20">
          {hasNoRemindersToday ? (
            <EmptyMedicationNowState onAddClick={handleAddMedicationClick} />
          ) : (
            <div className="space-y-4">
              {/* Medicamentos Atrasados */}
              {data?.groups.late.length > 0 && (
                <div>
                  <div className="sticky top-0 z-40 bg-destructive/10 backdrop-blur-md ">
                    <div className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="w-4 h-8" />
                      <span className="text-sm font-medium">Atrasados</span>
                    </div>
                  </div>

                  <div >
                    {data.groups.late.map((group) => (
                      <div key={group.time}>
                        <div className="sticky top-[3rem] z-30  backdrop-blur-md px-4 py-2 bg-destructive/5 ">
                          <span className="text-lg font-medium text-foreground">
                            {group.time}
                          </span>
                        </div>

                        <IonList className='ion-no-padding p-0 m-0  '>
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
                        </IonList>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicamentos Pendentes */}
              {data?.groups.onTime.length > 0 && (
                <div>
                  <div className="sticky top-0 z-40 bg-primary/10 backdrop-blur-md ">
                    <div className="flex items-center gap-2 px-4 py-2 text-violet-600 dark:text-violet-400">
                      <Bell className="w-4 h-8" />
                      <span className="text-sm font-medium">Pendentes</span>
                    </div>
                  </div>

                 
                    {data.groups.onTime.map((group) => (
                      <div key={group.time}>
                        <div className="sticky top-[3rem] z-30  backdrop-blur-md px-4 py-2 bg-primary/5 ">
                          <span className="text-lg font-medium text-foreground">
                            {group.time}
                          </span>
                        </div>

                        <IonList className='ion-no-padding p-0 m-0'>
                          {group.medications.map((item) => (
                            <MedicationCard
                              key={item.reminder.id}
                              medication={item.medication}
                              onClick={() => handleMedicationClick(item.medication)}
                              isLate={false}
                              showTakeButton={item.reminder.scheduledFor <= new Date().toISOString()}
                              onTake={() => handleTakeMedication(
                                item.medication.id,
                                item.reminder.id,
                                item.reminder.scheduledFor
                              )}
                            />
                          ))}
                        </IonList>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}
