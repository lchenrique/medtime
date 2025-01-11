import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { usePutAuthProfile, getGetAuthProfileQueryKey } from '@/api/generated/auth/auth'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useUserStore } from '@/stores/user'
import { useDrawer } from '@/hooks/useDrawer'

export function EditProfileSheet() {
  const { user } = useUserStore()
  const { close } = useDrawer()
  const [name, setName] = useState(user?.name || '')
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
      { data: { name } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAuthProfileQueryKey() })
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
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          placeholder="Digite seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </form>
  )
} 