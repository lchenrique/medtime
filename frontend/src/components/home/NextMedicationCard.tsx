import { Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Medication } from '@/types/medication'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { GetMedications200Item } from '@/api/model'
import { ReminderStatus, MedicationGroup } from '@/pages/Home'

interface NextMedicationCardProps {
  group: MedicationGroup
  onMedicationClick: (medication: GetMedications200Item & { status?: ReminderStatus, timeUntil?: string, isRecurring?: boolean }) => void
}

export function NextMedicationCard({ group, onMedicationClick }: NextMedicationCardProps) {
  const medication = group.medications[0]

  const canTakeMedication = () => {
    if (!medication.reminders[0]) return false
    const reminderDate = new Date(medication.reminders[0].scheduledFor)
    const now = new Date()

    // Ajusta para o fuso horário do Brasil
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const reminderTime = formatTime(reminderDate)
    const currentTime = formatTime(now)

    // Adiciona uma tolerância de 5 minutos antes do horário
    const [hours, minutes] = reminderTime.split(':').map(Number)
    const toleranceDate = new Date(now)
    toleranceDate.setHours(hours, minutes - 5, 0, 0)

    return now >= toleranceDate && currentTime <= reminderTime
  }

  const isToday = () => {
    if (!medication.reminders[0]) return false
    const reminderDate = new Date(medication.reminders[0].scheduledFor)
    const now = new Date()

    // Formata as datas usando o fuso horário do Brasil
    const formatDate = (date: Date) => {
      return new Intl.DateTimeFormat('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
      }).format(date)
    }

    return formatDate(reminderDate) === formatDate(now)
  }

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{medication.name}</h2>
            <p className="text-sm opacity-90">{medication.instructions}</p>
            <p className="text-sm mt-2">
              {medication.dosageQuantity} {medication.unit} • {group.hour}
            </p>
          </div>
          <button
            onClick={() => onMedicationClick(medication)}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors"
          >
            Tomar agora
          </button>
        </div>
      </CardContent>
    </Card>
  )
}