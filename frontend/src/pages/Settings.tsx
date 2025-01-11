import { useEffect, useState, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTauriNotifications } from '@/hooks/useTauriNotifications'
import { getVersion } from '@tauri-apps/api/app'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/user'
import { TauriNotificationClient } from '@/lib/notifications/tauri'

export function Settings() {
  const { user, updateUser } = useUserStore()
  const { hasPermission, requestPermission } = useTauriNotifications()
  const [isTauri, setIsTauri] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')

  useEffect(() => {
    // Verifica se está rodando no Tauri
    getVersion()
      .then(() => setIsTauri(true))
      .catch(() => setIsTauri(false))
  }, [])

  useEffect(() => {
    if (user) {
      setWhatsappNumber(user.whatsappNumber || '')
      setTelegramChatId(user.telegramChatId || '')
    }
  }, [user])

  if (!user) return null

  const handleTauriToggle = useCallback(async () => {
    try {
      // Se está ativando, solicita permissão
      if (!user.tauriEnabled && !hasPermission) {
        await requestPermission()
      }

      await updateUser({ tauriEnabled: !user.tauriEnabled })

      // Se ativou, inicializa com sync
      if (!user.tauriEnabled) {
        const client = TauriNotificationClient.getInstance()
        await client.initializeWithSync()
      }

      toast.success('Configurações atualizadas com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar configurações')
    }
  }, [user.tauriEnabled, hasPermission, requestPermission, updateUser])

  const handleWhatsappSubmit = useCallback(() => {
    if (whatsappNumber === user.whatsappNumber) return
    updateUser({ whatsappNumber: whatsappNumber || null })
      .then(() => toast.success('Configurações atualizadas com sucesso!'))
      .catch(() => toast.error('Erro ao atualizar configurações'))
  }, [updateUser, whatsappNumber, user.whatsappNumber])

  const handleTelegramSubmit = useCallback(() => {
    if (telegramChatId === user.telegramChatId) return
    updateUser({ telegramChatId: telegramChatId || null })
      .then(() => toast.success('Configurações atualizadas com sucesso!'))
      .catch(() => toast.error('Erro ao atualizar configurações'))
  }, [updateUser, telegramChatId, user.telegramChatId])

  return (
    <div className="container mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Configurações</h1>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Notificações</h2>

        {isTauri && (
          <div className="flex items-center justify-between py-2">
            <div className="space-y-0.5">
              <Label>Notificações do Sistema</Label>
              <p className="text-sm text-muted-foreground">
                Receba notificações diretamente no seu computador
              </p>
            </div>
            <Switch
              checked={user.tauriEnabled}
              onCheckedChange={handleTauriToggle}
            />
          </div>
        )}

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>WhatsApp</Label>
            <p className="text-sm text-muted-foreground">
              Receba notificações via WhatsApp
            </p>
          </div>
          <Switch
            checked={user.whatsappEnabled}
            onCheckedChange={(checked) => 
              updateUser({ whatsappEnabled: checked })
                .then(() => toast.success('Configurações atualizadas com sucesso!'))
                .catch(() => toast.error('Erro ao atualizar configurações'))
            }
          />
        </div>

        {user.whatsappEnabled && (
          <div className="mt-2 space-y-2">
            <Label>Número do WhatsApp</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: +5511999999999"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
              <Button onClick={handleWhatsappSubmit}>Salvar</Button>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between py-2">
          <div className="space-y-0.5">
            <Label>Telegram</Label>
            <p className="text-sm text-muted-foreground">
              Receba notificações via Telegram
            </p>
          </div>
          <Switch
            checked={user.telegramEnabled}
            onCheckedChange={(checked) => 
              updateUser({ telegramEnabled: checked })
                .then(() => toast.success('Configurações atualizadas com sucesso!'))
                .catch(() => toast.error('Erro ao atualizar configurações'))
            }
          />
        </div>

        {user.telegramEnabled && (
          <div className="mt-2 space-y-2">
            <Label>Chat ID do Telegram</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Ex: 123456789"
                value={telegramChatId}
                onChange={(e) => setTelegramChatId(e.target.value)}
              />
              <Button onClick={handleTelegramSubmit}>Salvar</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  )
} 