import { useGetMedications } from '@/api/generated/medications/medications'
import { GetMedications200Item } from '@/api/model/getMedications200Item'
import { AddMedicationForm } from '@/components/home/AddMedicationForm'
import { EmptyMedicationState } from '@/components/home/EmptyMedicationState'
import { MedicationCard } from '@/components/home/MedicationCard'
import { Loading } from '@/components/Loading'
import { PageHeader } from '@/components/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NoResults } from '@/components/ui/NoResults'
import { useModalStore } from '@/stores/modal-store'
import { Medication } from '@/types/medication'
import {
  IonContent,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail
} from '@ionic/react'
import { AlertCircle, Bell, Package2, Plus } from 'lucide-react'
import { useState } from 'react'
import { MedicationDetails } from './MedicationDetails'

export function Medications() {
  const [searchTerm, setSearchTerm] = useState('')
  const open = useModalStore(state => state.open)
  const close = useModalStore(state => state.close)
  const { data, isLoading, refetch, isFetching } = useGetMedications(
    { period: 'all' },
    {
      query: {
        refetchOnWindowFocus: true
      }
    }
  )

  const medications = Array.isArray(data) ? data : data?.medications || []
  const lowStockMedications = medications.filter(m => m.remainingQuantity <= m.dosageQuantity * 3)
  const normalStockMedications = medications.filter(m => m.remainingQuantity > m.dosageQuantity * 3)

  const handleMedicationClick = (med: GetMedications200Item) => {
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

    open({
      title: medication.name,
      content: <MedicationDetails medication={medication} />
    })
  }

  const filteredMedications = medications?.filter(med =>
    med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    med.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${med.dosageQuantity} ${med.unit}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const handleAddMedicationClick = () => {
    open({
      title: 'Adicionar Medicamento',
      content: <AddMedicationForm onSuccess={() => close()} />
    })
  }

  if (isLoading) {
    return <Loading />
  }

  function handleRefresh(event: CustomEvent<RefresherEventDetail>) {
    refetch()
    if (!isFetching) {
      event.detail.complete();
    }
  }

  return (
    <IonPage>
      <PageHeader title="Estoque" extra={
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-primary/10 dark:bg-primary/20 rounded-lg mb-2 px-4 py-2">
            <p className="text-sm text-primary dark:text-primary">
              {medications?.length || 0} medicamentos • {lowStockMedications.length} com estoque baixo
            </p>
          </div>
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value || '')}
            placeholder="Buscar medicamento..."
            className="bg-background"
          />
        </div>
      }>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddMedicationClick}
          className="text-primary dark:text-primary hover:text-primary"
        >
          <Plus className="w-5 h-5" />
        </Button>
      </PageHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <div className="max-w-2xl mx-auto px-4 pb-20">
          {filteredMedications.length > 0 ? (
            <div className="space-y-4">
              {/* Medicamentos com Estoque Baixo */}
              {lowStockMedications.length > 0 && (
                <div>
                  <div className="top-0 z-40 bg-red-500/10 backdrop-blur-md m-2 rounded-md">
                    <div className="flex items-center gap-2 px-2 py-1 text-red-500">
                      <AlertCircle className="w-4 h-8" />
                      <span className="text-sm font-medium">Estoque Baixo</span>
                    </div>
                  </div>

                  <IonList className="ion-no-padding">
                    {lowStockMedications.map((medication, i) => (
                      <div key={medication.id} className="relative">
                        <div className={`h-full w-1 bg-muted-foreground ${i === 0 ? 'rounded-t-2xl' : ''} ${i === lowStockMedications.length - 1 ? 'rounded-b-2xl' : ''} absolute left-0 top-1/2 -translate-y-1/2`} />
                        <MedicationCard
                          medication={medication as any}
                          onClick={() => handleMedicationClick(medication)}
                          showStock
                          variant="list"
                        />
                      </div>
                    ))}
                  </IonList>
                </div>
              )}

              {/* Medicamentos com Estoque Normal */}
              {normalStockMedications.length > 0 && (
                <div>
                  <div className="top-0 z-40 bg-primary/10 backdrop-blur-md m-2 rounded-md">
                    <div className="flex items-center gap-2 px-2 py-1 text-primary">
                      <Package2 className="w-4 h-8" />
                      <span className="text-sm font-medium">Estoque Normal</span>
                    </div>
                  </div>

                  <IonList className="ion-no-padding">
                    {normalStockMedications.map((medication, i) => (
                      <div key={medication.id} className="relative">
                        <div className={`h-full w-1 bg-muted-foreground ${i === 0 ? 'rounded-t-2xl' : ''} ${i === normalStockMedications.length - 1 ? 'rounded-b-2xl' : ''} absolute left-0 top-1/2 -translate-y-1/2`} />
                        <MedicationCard
                          medication={medication as any}
                          onClick={() => handleMedicationClick(medication)}
                          showStock
                          variant="list"
                        />
                      </div>
                    ))}
                  </IonList>
                </div>
              )}
            </div>
          ) : (
            searchTerm ? (
              <NoResults message={`Nenhum medicamento encontrado para "${searchTerm}"`} />
            ) : (
              <EmptyMedicationState onAddClick={handleAddMedicationClick} />
            )
          )}
        </div>
      </IonContent>
    </IonPage>
  )
}

