import { useGetMedications } from '@/api/generated/medications/medications'
import { Button } from '@/components/ui/button'
import { Pill, Clock } from 'lucide-react'

export function Medications() {
  const { data: medications, isLoading } = useGetMedications()

  if (isLoading) {
    return <div>Carregando...</div>
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Medicamentos</h1>
      </div>

      <div className="space-y-4">
        {medications?.map((medication) => (
          <div key={medication.id} className="bg-white p-4 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Pill className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium">{medication.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {medication.description}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {new Date(medication.startDate).toLocaleTimeString('pt-BR', {
                    hour: '2-digit',
                    minute: '2-digit',
                    timeZone: 'UTC'
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 