import { usePostMedications } from '@/api/generated/medications/medications'
import { PostMedicationsBodyIntervalPreset } from '@/api/model/postMedicationsBodyIntervalPreset'
import { PostMedicationsBodyUnit } from '@/api/model/postMedicationsBodyUnit'
import { Button } from '@/components/ui/button'
import { DatetimePicker } from '@/components/ui/datetime-picker'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { DrawerContent } from '../DrawerContent'
import { useToast } from '@/stores/use-toast'

interface AddMedicationFormProps {
  onSuccess: () => void
}

interface MedicationForm {
  name: string
  description: string
  startDateTime: Date
  intervalPreset: PostMedicationsBodyIntervalPreset | 'custom'
  customInterval?: number
  durationInDays: number | 'custom' | 'recurring'
  customDuration?: number
  totalQuantity?: number
  remainingQuantity?: number
  unit?: PostMedicationsBodyUnit
  dosageQuantity?: number
}

const initialForm: MedicationForm = {
  name: '',
  description: '',
  startDateTime: new Date(),
  intervalPreset: '24/24',
  durationInDays: 30
}

const DURATION_OPTIONS = [
  { value: 7, label: '7 dias' },
  { value: 15, label: '15 dias' },
  { value: 30, label: '30 dias' },
  { value: 60, label: '60 dias' },
  { value: 90, label: '90 dias' },
  { value: 'custom', label: 'Personalizado' },
]

const INTERVAL_OPTIONS = [
  { value: '6/6', label: 'A cada 6 horas' },
  { value: '8/8', label: 'A cada 8 horas' },
  { value: '12/12', label: 'A cada 12 horas' },
  { value: '24/24', label: 'A cada 24 horas' },
  { value: 'custom', label: 'Personalizado' },
]

const UNIT_OPTIONS = [
  { value: 'comprimidos' as PostMedicationsBodyUnit, label: 'Comprimidos' },
  { value: 'ml' as PostMedicationsBodyUnit, label: 'Mililitros (ml)' },
  { value: 'gotas' as PostMedicationsBodyUnit, label: 'Gotas' },
  { value: 'doses' as PostMedicationsBodyUnit, label: 'Doses' },
]

export function AddMedicationForm({ onSuccess }: AddMedicationFormProps) {


  const toast = useToast(state => state.open)
  const [form, setForm] = useState<MedicationForm>(initialForm)
  const queryClient = useQueryClient()
  const { mutate: createMedication, isPending } = usePostMedications()

  // Novo estado para controlar o passo atual do formulário
  const [step, setStep] = useState(1)
  const totalSteps = 5

  // Função para verificar se pode avançar
  const canAdvance = () => {
    switch (step) {
      case 1: // Nome e descrição
        return form.name.trim().length >= 2
      case 2: // Data e hora inicial
        if (!form.startDateTime) return false

        const startDate = new Date(form.startDateTime)

        // Verifica apenas se:
        // 1. A data é válida
        // 2. A data não é mais de 1 ano no passado
        // 3. A data não é mais de 1 ano no futuro
        const now = new Date()
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        const oneYearFuture = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate())

        const isValidDate = !isNaN(startDate.getTime())
        const isWithinRange = startDate >= oneYearAgo && startDate <= oneYearFuture

        return isValidDate && isWithinRange
      case 3: // Intervalo
        return form.intervalPreset !== 'custom' || (form.customInterval && form.customInterval > 0)
      case 4: // Duração
        return form.durationInDays !== 'custom' || (form.customDuration && form.customDuration > 0)
      case 5: // Quantidade
        return !!(
          form.unit &&
          form.totalQuantity && form.totalQuantity > 0 &&
          form.dosageQuantity && form.dosageQuantity > 0
        )
      default:
        return false
    }
  }

  const handleFillForm = () => {
    setForm({
      name: 'Dipirona',
      description: 'Tomar em caso de dor ou febre',
      startDateTime: new Date(),
      intervalPreset: '8/8',
      durationInDays: 7
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.unit || !form.totalQuantity || !form.dosageQuantity) {
     toast({
      title: 'Erro',
      description: 'Preencha todos os campos',
      type: 'error'
     })
      return
    }

    const interval = form.intervalPreset === 'custom'
      ? form.customInterval
      : parseInt(form.intervalPreset.split('/')[0])

    if (!interval) {
     toast({
      title: 'Erro',
      description: 'Intervalo inválido',
      type: 'error'
     })
      return
    }

    const duration = form.durationInDays === 'custom'
      ? form.customDuration
      : form.durationInDays === 'recurring'
        ? undefined
        : form.durationInDays

    if (form.durationInDays !== 'recurring' && !duration) {
     toast({
      title: 'Erro',
      description: 'Duração inválida',
      type: 'error'
     })
      return
    }

    try {
      createMedication(
        {
          data: {
            name: form.name,
            description: form.description || null,
            startTime: form.startDateTime.toISOString(),
            intervalPreset: form.intervalPreset as PostMedicationsBodyIntervalPreset,
            durationInDays: form.durationInDays === 'custom'
              ? form.customDuration!
              : form.durationInDays === 'recurring'
                ? 0 // Valor mínimo para medicamentos recorrentes
                : form.durationInDays as number,
            totalQuantity: form.totalQuantity!,
            unit: form.unit!,
            dosageQuantity: form.dosageQuantity!
          }
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/medications'] })

            toast({
              title: 'Medicamento adicionado',
              description: 'O medicamento foi adicionado com sucesso',
              type: 'success'
            })
            onSuccess()
          },
          onError: (error) => {
            toast({
              title: 'Erro',
              description: 'Erro ao adicionar medicamento',
              type: 'error'
            })
          },
        }
      )
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao adicionar medicamento',
        type: 'error'
      })
    }
  }

  const handleChange = (field: keyof MedicationForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({
      ...prev,
      [field]: field === 'customInterval' || field === 'customDuration'
        ? Number(e.target.value)
        : e.target.value
    }))
  }

  const handleSelectChange = (field: keyof MedicationForm) => (value: string | number) => {
    if (field === 'durationInDays') {
      setForm(prev => ({
        ...prev,
        [field]: value === 'custom' ? 'custom' : value === 'recurring' ? 'recurring' : Number(value)
      }))
    } else {
      setForm(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  return (
    <DrawerContent>
      <div className="space-y-4">
        {/* Barra de Progresso */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md p-4 border-b">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Passo {step} de {totalSteps}</span>
              <span className="text-violet-600 dark:text-violet-400">{Math.round((step / totalSteps) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-violet-600 dark:bg-violet-400 transition-all duration-300 ease-out"
                style={{ width: `${(step / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="px-4 space-y-4">
          {/* Passo 1: Nome e Descrição */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-normal">Qual medicamento você vai tomar?</h2>
                <p className="text-sm text-muted-foreground">Digite o nome do remédio e uma descrição se quiser</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="text-sm text-muted-foreground">
                    Nome do Medicamento
                  </label>
                  <Input
                    id="name"
                    placeholder="Ex: Dipirona, Paracetamol..."
                    value={form.name}
                    onChange={handleChange('name')}
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="text-sm text-muted-foreground">
                    Instruções (opcional)
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Ex: Tomar com água, após as refeições..."
                    value={form.description}
                    onChange={handleChange('description')}
                    className="mt-1.5 min-h-[100px]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Passo 2: Data e Hora Inicial */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-normal">Quando você vai começar?</h2>
                <p className="text-sm text-muted-foreground">Escolha a data e o primeiro horário do dia</p>
              </div>

              <div>
                <label className="text-sm text-muted-foreground">
                  Data e Hora de Início
                </label>
                <DatetimePicker
                  value={form.startDateTime}
                  onChange={(date) => {
                    if (date) {
                      setForm(prev => ({
                        ...prev,
                        startDateTime: date
                      }))
                    }
                  }}
                  format={[
                    ["days", "months", "years"],
                    ["hours", "minutes"]
                  ]}
                  className={cn(
                    "mt-1.5 w-full border rounded-lg",
                    canAdvance()
                      ? "border-input hover:border-violet-600 dark:hover:border-violet-400"
                      : "border-destructive/50 hover:border-destructive"
                  )}
                  dtOptions={{
                    hour12: false,
                    date: form.startDateTime,
                  }}
                />
                {/* Mensagem de erro/ajuda */}
                {form.startDateTime && !canAdvance() && (
                  <p className="mt-2 text-sm text-destructive">
                    A data deve estar dentro do intervalo de 1 ano (passado ou futuro)
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Passo 3: Intervalo */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-normal">Quantas vezes por dia?</h2>
                <p className="text-sm text-muted-foreground">Escolha o intervalo entre as doses</p>
              </div>

              <div className="space-y-4">
                {INTERVAL_OPTIONS.slice(0, -1).map(option => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full h-auto py-4 justify-start",
                      form.intervalPreset === option.value && "border-violet-600 dark:border-violet-400 bg-violet-50 dark:bg-violet-950/30"
                    )}
                    onClick={() => handleSelectChange('intervalPreset')(option.value)}
                  >
                    <div className="w-full">
                      <div className="flex w-full items-center justify-between">
                        <span className="text-base font-medium text-foreground">
                          A cada {option.value.split('/')[0]} horas
                        </span>
                        <span className="text-base text-muted-foreground">
                          {option.value === '6/6' && '4 vezes ao dia'}
                          {option.value === '8/8' && '3 vezes ao dia'}
                          {option.value === '12/12' && '2 vezes ao dia'}
                          {option.value === '24/24' && '1 vez ao dia'}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground mt-1 block">
                        {option.value === '6/6' && '(6h, 12h, 18h, 0h)'}
                        {option.value === '8/8' && '(8h, 16h, 0h)'}
                        {option.value === '12/12' && '(8h, 20h)'}
                        {option.value === '24/24' && '(8h)'}
                      </span>
                    </div>
                  </Button>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full h-auto py-4 justify-start",
                    form.intervalPreset === 'custom' && "border-violet-600 dark:border-violet-400 bg-violet-50 dark:bg-violet-950/30"
                  )}
                  onClick={() => handleSelectChange('intervalPreset')('custom')}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="text-base font-medium text-foreground">Outro Intervalo</span>
                    <span className="text-base text-muted-foreground">Personalizado</span>
                  </div>
                </Button>

                {form.intervalPreset === 'custom' && (
                  <div className="mt-4">
                    <label className="text-base text-muted-foreground">
                      Intervalo em horas
                    </label>
                    <div className="flex items-center gap-3 mt-2">
                      <Input
                        type="number"
                        placeholder="1"
                        value={form.customInterval || ''}
                        onChange={handleChange('customInterval')}
                        min={1}
                        className="text-base py-6"
                      />
                      <span className="text-base text-muted-foreground whitespace-nowrap">
                        horas
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passo 4 - Duração */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-normal">Por quanto tempo?</h2>
                <p className="text-sm text-muted-foreground">Escolha a duração do tratamento</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {DURATION_OPTIONS.slice(0, -1).map(option => (
                    <Button
                      key={option.value}
                      type="button"
                      variant="outline"
                      className={cn(
                        "h-auto py-3",
                        form.durationInDays === option.value && "border-violet-600 dark:border-violet-400 bg-violet-50 dark:bg-violet-950/30"
                      )}
                      onClick={() => handleSelectChange('durationInDays')(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full h-auto py-3",
                    form.durationInDays === 'recurring' && "border-violet-600 dark:border-violet-400 bg-violet-50 dark:bg-violet-950/30"
                  )}
                  onClick={() => handleSelectChange('durationInDays')('recurring')}
                >
                  Contínuo (sem data de término)
                </Button>

                {form.durationInDays === 'custom' && (
                  <div className="mt-4">
                    <label className="text-sm text-muted-foreground">
                      Duração em dias
                    </label>
                    <div className="flex items-center gap-3 mt-1.5">
                      <Input
                        type="number"
                        placeholder="Ex: 10"
                        value={form.customDuration || ''}
                        onChange={handleChange('customDuration')}
                        min={1}
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">dias</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passo 5 - Quantidade */}
          {step === 5 && (
            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-xl font-normal">Quantidade do Medicamento</h2>
                  <p className="text-sm text-muted-foreground">Informe a quantidade que você possui</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm text-muted-foreground">
                      Tipo de Medicamento
                    </label>
                    <div className="grid grid-cols-2 gap-3 mt-1.5">
                      {UNIT_OPTIONS.map(option => (
                        <Button
                          key={option.value}
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-auto py-3",
                            form.unit === option.value && "border-violet-600 dark:border-violet-400 bg-violet-50 dark:bg-violet-950/30"
                          )}
                          onClick={() => handleSelectChange('unit')(option.value)}
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Quantidade Total
                      </label>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Input
                          type="number"
                          placeholder="Ex: 30"
                          value={form.totalQuantity || ''}
                          onChange={handleChange('totalQuantity')}
                          min={1}
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{form.unit}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-muted-foreground">
                        Quantidade por Dose
                      </label>
                      <div className="flex items-center gap-3 mt-1.5">
                        <Input
                          type="number"
                          placeholder="Ex: 1"
                          value={form.dosageQuantity || ''}
                          onChange={handleChange('dosageQuantity')}
                          min={0.1}
                          step="0.1"
                        />
                        <span className="text-sm text-muted-foreground whitespace-nowrap">{form.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(s => s - 1)}
                >
                  Voltar
                </Button>

                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isPending || !canAdvance()}
                >
                  {isPending ? 'Adicionando...' : 'Finalizar'}
                </Button>
              </div>
            </form>
          )}

          {/* Botões de navegação para passos 1-4 */}
          {step < 5 && (
            <div className="flex gap-3">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setStep(s => s - 1)}
                >
                  Voltar
                </Button>
              )}

              <Button
                type="button"
                className="flex-1"
                disabled={!canAdvance()}
                onClick={() => setStep(s => s + 1)}
              >
                Continuar
              </Button>
            </div>
          )}
        </div>
      </div>
    </DrawerContent>
  )
} 