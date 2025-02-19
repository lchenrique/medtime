import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { usePutAuthProfile, getGetAuthProfileQueryKey } from '@/api/generated/auth/auth'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useUserStore } from '@/stores/user'
import { useDrawer } from '@/hooks/useDrawer'

export function EditProfileSheet() {
  const { user, setUser } = useUserStore()
  const { close } = useDrawer()
  const [name, setName] = useState(user?.name || '')
  const [isDiabetic, setIsDiabetic] = useState(user?.isDiabetic || false)
  const [hasHeartCondition, setHasHeartCondition] = useState(user?.hasHeartCondition || false)
  const [hasHypertension, setHasHypertension] = useState(user?.hasHypertension || false)
  const [allergies, setAllergies] = useState(user?.allergies || '')
  const [observations, setObservations] = useState(user?.observations || '')
  
  const queryClient = useQueryClient()
  const { mutate: updateProfile, isPending } = usePutAuthProfile()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (name.trim().length < 2) {
      toast.error('O nome deve ter pelo menos 2 caracteres', {
        position: 'bottom-left',
        className: 'bg-white dark:bg-gray-800'
      })
      return
    }

    updateProfile(
      { 
        data: { 
          name,
          isDiabetic,
          hasHeartCondition,
          hasHypertension,
          allergies,
          observations
        } 
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAuthProfileQueryKey() })
          if (user) {
            setUser({ 
              ...user, 
              name,
              isDiabetic,
              hasHeartCondition,
              hasHypertension,
              allergies,
              observations
            })
          }
          toast.success('Perfil atualizado com sucesso!', {
            position: 'bottom-left',
            className: 'bg-white dark:bg-gray-800'
          })
          close()
        },
        onError: () => {
          toast.error('Erro ao atualizar perfil', {
            position: 'bottom-left',
            className: 'bg-white dark:bg-gray-800'
          })
        },
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome</Label>
        <Input
          id="name"
          placeholder="Digite seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <Label>Condições de Saúde</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="diabetic" 
              checked={isDiabetic}
              onCheckedChange={(checked) => setIsDiabetic(checked as boolean)}
            />
            <Label htmlFor="diabetic" className="font-normal">Diabetes</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="heartCondition" 
              checked={hasHeartCondition}
              onCheckedChange={(checked) => setHasHeartCondition(checked as boolean)}
            />
            <Label htmlFor="heartCondition" className="font-normal">Condição Cardíaca</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="hypertension" 
              checked={hasHypertension}
              onCheckedChange={(checked) => setHasHypertension(checked as boolean)}
            />
            <Label htmlFor="hypertension" className="font-normal">Hipertensão</Label>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="allergies">Alergias</Label>
        <Textarea
          id="allergies"
          placeholder="Liste suas alergias (medicamentos, alimentos, etc)"
          value={allergies}
          onChange={(e) => setAllergies(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="observations">Observações Adicionais</Label>
        <Textarea
          id="observations"
          placeholder="Outras informações relevantes sobre sua saúde"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? 'Salvando...' : 'Salvar alterações'}
      </Button>
    </form>
  )
} 