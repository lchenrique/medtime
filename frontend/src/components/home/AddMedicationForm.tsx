import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Pill, Clock, Calendar, Plus } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { usePostMedications } from '@/api/generated/medications/medications'
import { PostMedicationsBodyIntervalPreset } from '@/api/model/postMedicationsBodyIntervalPreset'
import { cn } from '@/lib/utils'
import { DatetimePicker } from '@/components/ui/datetime-picker'
import { DrawerContent } from '../DrawerContent'

interface AddMedicationFormProps {
  onSuccess: () => void
}

interface MedicationForm {
  name: string
  description: string
  startDateTime: Date
  intervalPreset: PostMedicationsBodyIntervalPreset | 'custom'
  customInterval?: number
  durationInDays: number | 'custom'
  customDuration?: number
  totalQuantity?: number
  remainingQuantity?: number
  unit?: string
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
  { value: 'comprimidos', label: 'Comprimidos' },
  { value: 'ml', label: 'Mililitros (ml)' },
  { value: 'gotas', label: 'Gotas' },
  { value: 'doses', label: 'Doses' },
]

export function AddMedicationForm({ onSuccess }: AddMedicationFormProps) {
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

    // Só deve prosseguir se estiver no último passo
    if (step !== totalSteps) {
      return
    }

    try {
      // Validações
      if (form.name.trim().length < 2) {
        throw new Error('O nome do medicamento deve ter pelo menos 2 caracteres')
      }

      if (!form.startDateTime) {
        throw new Error('A data inicial é obrigatória')
      }

      if (form.intervalPreset === 'custom' && (!form.customInterval || form.customInterval <= 0)) {
        throw new Error('O intervalo personalizado deve ser maior que 0')
      }

      if (form.durationInDays === 'custom' && (!form.customDuration || form.customDuration <= 0)) {
        throw new Error('A duração personalizada deve ser maior que 0')
      }

      // Prepara os dados para envio
      const finalData = {
        name: form.name,
        description: form.description,
        startTime: form.startDateTime.toISOString(),
        intervalPreset: form.intervalPreset === 'custom' 
          ? `${form.customInterval}/${form.customInterval}` as PostMedicationsBodyIntervalPreset
          : form.intervalPreset,
        durationInDays: form.durationInDays === 'custom' ? form.customDuration! : form.durationInDays,
        totalQuantity: Number(form.totalQuantity),
        unit: form.unit!,
        dosageQuantity: Number(form.dosageQuantity)
      }

      createMedication(
        { data: finalData },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['/medications'] })
            
            toast.success('Medicamento adicionado com sucesso!', {
              position: 'bottom-left',
              className: 'bg-white dark:bg-gray-800'
            })
            onSuccess()
          },
          onError: (error) => {
            toast.error('Erro ao adicionar medicamento', {
              position: 'bottom-left',
              className: 'bg-white dark:bg-gray-800'
            })
          },
        }
      )
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erro ao adicionar medicamento', {
        position: 'bottom-left',
        className: 'bg-white dark:bg-gray-800'
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

  const handleSelectChange = (field: keyof MedicationForm) => (value: string) => {
    if (field === 'durationInDays') {
      setForm(prev => ({
        ...prev,
        [field]: value === 'custom' ? 'custom' : Number(value)
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
      <div className="space-y-6">
        {/* Barra de Progresso */}
        <div className="bg-white p-4 rounded-2xl">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Passo {step} de {totalSteps}</span>
              <span className="text-primary">{Math.round((step/totalSteps) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${(step/totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Passo 1: Nome e Descrição */}
          {step === 1 && (
            <div className="bg-white p-6 rounded-2xl space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Qual medicamento você vai tomar?</h2>
                <p className="text-gray-500">Digite o nome do remédio e uma descrição se quiser</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Nome do Medicamento
                  </label>
                  <Input
                    id="name"
                    placeholder="Ex: Dipirona, Paracetamol..."
                    value={form.name}
                    onChange={handleChange('name')}
                    className="text-lg h-12"
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-2">
                    Instruções (opcional)
                  </label>
                  <Textarea
                    id="description"
                    placeholder="Ex: Tomar com água, após as refeições..."
                    value={form.description}
                    onChange={handleChange('description')}
                    className="min-h-[100px] text-base"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Passo 2: Data e Hora Inicial */}
          {step === 2 && (
            <div className="bg-white p-6 rounded-2xl space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Quando você vai começar?</h2>
                <p className="text-gray-500">Escolha a data e o primeiro horário do dia</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
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
                      "w-full border p-2 rounded-lg",
                      canAdvance() 
                        ? "border-input hover:border-primary" 
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
            </div>
          )}

          {/* Passo 3: Intervalo */}
          {step === 3 && (
            <div className="bg-white p-6 rounded-2xl space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Quantas vezes por dia?</h2>
                <p className="text-gray-500">Escolha o intervalo entre as doses</p>
              </div>

              <div className="space-y-4">
                {INTERVAL_OPTIONS.slice(0, -1).map(option => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full h-auto py-4 px-6",
                      form.intervalPreset === option.value && "border-primary bg-primary/5"
                    )}
                    onClick={() => handleSelectChange('intervalPreset')(option.value)}
                  >
                    <div className="w-full flex flex-col items-start">
                      <div className="flex w-full items-center justify-between mb-1">
                        <span className="text-lg font-medium">
                          A cada {option.value.split('/')[0]} horas
                        </span>
                        <span className="text-muted-foreground">
                          {option.value === '6/6' && '4 vezes ao dia'}
                          {option.value === '8/8' && '3 vezes ao dia'}
                          {option.value === '12/12' && '2 vezes ao dia'}
                          {option.value === '24/24' && '1 vez ao dia'}
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
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
                    "w-full h-auto py-4 px-6",
                    form.intervalPreset === 'custom' && "border-primary bg-primary/5"
                  )}
                  onClick={() => handleSelectChange('intervalPreset')('custom')}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="text-lg font-medium">Outro Intervalo</span>
                    <span className="text-muted-foreground">Personalizado</span>
                  </div>
                </Button>

                {form.intervalPreset === 'custom' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium mb-2">
                      Intervalo em horas
                    </label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        placeholder="1"
                        value={form.customInterval || ''}
                        onChange={handleChange('customInterval')}
                        min={1}
                        className="text-lg h-12"
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
            <div className="bg-white p-6 rounded-2xl space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-xl font-semibold">Por quanto tempo?</h2>
                <p className="text-gray-500">Escolha a duração do tratamento</p>
              </div>

              <div className="space-y-4">
                {DURATION_OPTIONS.slice(0, -1).map(option => (
                  <Button
                    key={option.value}
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full h-auto py-6 px-6",
                      form.durationInDays === option.value && "border-primary bg-primary/5"
                    )}
                    onClick={() => handleSelectChange('durationInDays')(String(option.value))}
                  >
                    <div className="text-lg font-medium">{option.label}</div>
                  </Button>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full h-auto py-6 px-6",
                    form.durationInDays === 'custom' && "border-primary bg-primary/5"
                  )}
                  onClick={() => handleSelectChange('durationInDays')('custom')}
                >
                  <div>
                    <div className="text-lg font-medium">Outra Duração</div>
                    <div className="text-base text-muted-foreground mt-1">
                      Escolher uma duração diferente
                    </div>
                  </div>
                </Button>

                {form.durationInDays === 'custom' && (
                  <div className="flex items-center gap-3 mt-4">
                    <Input
                      type="number"
                      placeholder="Ex: 10"
                      value={form.customDuration || ''}
                      onChange={handleChange('customDuration')}
                      min={1}
                      className="text-lg h-12"
                    />
                    <span className="text-base whitespace-nowrap">dias</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Passo 5 - Quantidade */}
          {step === 5 && (
            <form onSubmit={handleSubmit}>
              <div className="bg-white p-6 rounded-2xl space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-xl font-semibold">Quantidade do Medicamento</h2>
                  <p className="text-gray-500">Informe a quantidade que você possui</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tipo de Medicamento
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {UNIT_OPTIONS.map(option => (
                        <Button
                          key={option.value}
                          type="button"
                          variant="outline"
                          className={cn(
                            "h-auto py-4",
                            form.unit === option.value && "border-primary bg-primary/5"
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
                      <label className="block text-sm font-medium mb-2">
                        Quantidade Total
                      </label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          placeholder="Ex: 30"
                          value={form.totalQuantity || ''}
                          onChange={handleChange('totalQuantity')}
                          min={1}
                          className="text-lg h-12"
                        />
                        <span className="text-base whitespace-nowrap">{form.unit}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Quantidade por Dose
                      </label>
                      <div className="flex items-center gap-3">
                        <Input
                          type="number"
                          placeholder="Ex: 1"
                          value={form.dosageQuantity || ''}
                          onChange={handleChange('dosageQuantity')}
                          min={0.1}
                          step="0.1"
                          className="text-lg h-12"
                        />
                        <span className="text-base whitespace-nowrap">{form.unit}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 h-12 text-base"
                  onClick={() => setStep(s => s - 1)}
                >
                  Voltar
                </Button>
                
                <Button
                  type="submit"
                  className="flex-1 h-12 text-base"
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
                  className="flex-1 h-12 text-base"
                  onClick={() => setStep(s => s - 1)}
                >
                  Voltar
                </Button>
              )}
              
              <Button
                type="button"
                className="flex-1 h-12 text-base"
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