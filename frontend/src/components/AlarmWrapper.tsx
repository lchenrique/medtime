import { useParams, useNavigate } from 'react-router-dom';
import { useGetMedicationsId, usePutMedicationsMarkAsTaken } from '@/api/generated/medications/medications';
import { alarmService } from '@/lib/alarm';
import { AlarmScreen } from '@/pages/AlarmScreen';
import { Loading } from '@/components/Loading';

export function AlarmWrapper() {
  const { medicationId } = useParams();
  const navigate = useNavigate();
  const { data: medication, isLoading } = useGetMedicationsId(medicationId!);
  const { mutate: markAsTaken } = usePutMedicationsMarkAsTaken();

  if (isLoading || !medication) {
    return <Loading />;
  }

  const handleTake = () => {
    // Pega o próximo lembrete não tomado
    const nextReminder = medication.reminders?.find(r => !r.taken);
    if (!nextReminder) return;

    markAsTaken({ 
      data: { 
        reminderId: nextReminder.id,
        taken: true,
        scheduledFor: nextReminder.scheduledFor
      }
    });

    // Para o alarme e volta para a tela inicial
    alarmService.stop();
    navigate('/');
  };

  const handleSnooze = () => {
    // TODO: Implementar lógica de adiar
    console.log('Adiando alarme...');
    
    // Para o alarme e volta para a tela inicial
    alarmService.stop();
    navigate('/');
  };

  return (
    <AlarmScreen
      medication={{
        id: medication.id,
        name: medication.name,
        dosage: `${medication.dosageQuantity} ${medication.unit}`
      }}
      onTake={handleTake}
      onSnooze={handleSnooze}
    />
  );
} 