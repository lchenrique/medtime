import { useGetMedications } from '@/api/generated/medications/medications'
import { GetMedications200Item } from '@/api/model/getMedications200Item'
import { AddMedicationForm } from '@/components/home/AddMedicationForm'
import { EmptyMedicationState } from '@/components/home/EmptyMedicationState'
import { MedicationCard } from '@/components/home/MedicationCard'
import { Loading } from '@/components/Loading'
import { Input } from '@/components/ui/input'
import { NoResults } from '@/components/ui/NoResults'
import { useModalStore } from '@/stores/modal-store'
import { Medication } from '@/types/medication'
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  RefresherEventDetail
} from '@ionic/react'
import { Plus } from 'lucide-react'
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
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="max-w-2xl mx-auto px-4">
            <div className="flex items-center justify-between">
              <IonTitle>Estoque</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={handleAddMedicationClick}>
                  <Plus className="w-5 h-5" />
                </IonButton>
              </IonButtons>
            </div>
          </div>
        </IonToolbar>

        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-violet-50 dark:bg-violet-950/30 rounded-lg mb-2 px-4 py-2">
            <p className="text-sm text-violet-600 dark:text-violet-400">
              {medications?.length || 0} medicamentos • {' '}
              {medications?.filter(m => m.remainingQuantity <= m.dosageQuantity * 3).length || 0} com estoque baixo
            </p>
          </div>
        </div>

        <IonToolbar>
          <div className="max-w-2xl mx-auto px-4">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value || '')}
              placeholder="Buscar medicamento..."
            />
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <div className="max-w-2xl mx-auto px-4 pb-20">
          {filteredMedications.length > 0 ? (
            <IonList>
              {filteredMedications.map((medication) => (
                <MedicationCard
                  key={medication.id}
                  medication={medication as any}
                  onClick={() => handleMedicationClick(medication)}
                  showStock
                  variant="list"
                />
              ))}
            </IonList>
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

