import { useEffect, useState, useCallback } from 'react'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useNotifications } from '@/hooks/useNotifications'
import { getVersion } from '@tauri-apps/api/app'
import { Capacitor } from '@capacitor/core'
import toast from 'react-hot-toast'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUserStore } from '@/stores/user'
import { TauriNotificationClient } from '@/lib/notifications/tauri'
import { capacitorNotificationClient } from '@/lib/notifications/capacitor'
import { useDrawer } from '@/hooks/useDrawer'
import { EditProfileSheet } from '@/components/EditProfileSheet'
import { Heart, ChevronRight, Bell, MessageCircle, BellRing, Database, Send } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Settings() {
  const { user, updateUser } = useUserStore()
  const { hasPermission, requestPermission } = useNotifications()
  const { open } = useDrawer()
  const [isTauri, setIsTauri] = useState(false)
  const [isCapacitor, setIsCapacitor] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [telegramChatId, setTelegramChatId] = useState('')

  useEffect(() => {
    // Verifica se está rodando no Tauri
    getVersion()
      .then(() => setIsTauri(true))
      .catch(() => setIsTauri(false))

    // Verifica se está rodando no Capacitor
    setIsCapacitor(Capacitor.isNativePlatform())
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

      // Se ativou, inicializa
      if (!user.tauriEnabled) {
        const client = TauriNotificationClient.getInstance()
        await client.init()
      }

      toast.success('Configurações atualizadas com sucesso!')
    } catch (error) {
      toast.error('Erro ao atualizar configurações')
    }
  }, [user.tauriEnabled, hasPermission, requestPermission, updateUser])

  const handleCapacitorToggle = useCallback(async () => {
    try {
      // Se está ativando, solicita permissão
      if (!user.capacitorEnabled) {
        const client = capacitorNotificationClient
        const granted = await client.requestPermission()
        
        if (!granted) {
          toast.error('Permissão de notificação negada')
          return
        }
      }

      await updateUser({ capacitorEnabled: !user.capacitorEnabled })

      // Se ativou, inicializa
      if (!user.capacitorEnabled) {
        const client = capacitorNotificationClient
        await client.init()
      }

      toast.success('Configurações atualizadas com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error)
      toast.error('Erro ao atualizar configurações')
    }
  }, [user.capacitorEnabled, updateUser])

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

  const handleTestWebSocket = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao testar WebSocket')
      }
      
      toast.success('Notificação de teste enviada!')
    } catch (error) {
      toast.error('Erro ao testar notificação')
      console.error(error)
    }
  }

  const handleResetDatabase = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/notifications/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao resetar banco')
      }
      
      toast.success('Banco resetado com sucesso!')
    } catch (error) {
      toast.error('Erro ao resetar banco')
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md px-4 py-3">
          <h1 className="text-xl font-normal text-foreground mb-3">Configurações</h1>
        </div>

        {/* Lista de Configurações */}
        <div className="divide-y divide-border">
          {/* Informações de Saúde */}
          <Link to="/health">
            <div className="flex items-center gap-4 p-4 hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center text-red-600 dark:text-red-400">
                <Heart className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground">Informações de Saúde</h3>
                <p className="text-sm text-muted-foreground">Gerencie suas condições de saúde e alergias</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </Link>

          {/* Seção de Notificações */}
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-950/50 flex items-center justify-center text-violet-600 dark:text-violet-400">
                <Bell className="w-5 h-5" />
              </div>
              <h2 className="font-medium text-foreground">Notificações</h2>
            </div>

            {/* Notificações do Sistema */}
            {isTauri && (
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100/50 dark:bg-violet-950/30 flex items-center justify-center text-violet-600/70 dark:text-violet-400/70">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Desktop</p>
                    <p className="text-xs text-muted-foreground">Notificações no computador</p>
                  </div>
                </div>
                <Switch checked={user.tauriEnabled} onCheckedChange={handleTauriToggle} />
              </div>
            )}

            {/* Notificações Mobile */}
            {isCapacitor && (
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-violet-100/50 dark:bg-violet-950/30 flex items-center justify-center text-violet-600/70 dark:text-violet-400/70">
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Mobile</p>
                    <p className="text-xs text-muted-foreground">Notificações no celular</p>
                  </div>
                </div>
                <Switch checked={user.capacitorEnabled} onCheckedChange={handleCapacitorToggle} />
              </div>
            )}

            {/* WhatsApp */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100/50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600/70 dark:text-emerald-400/70">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">WhatsApp</p>
                  <p className="text-xs text-muted-foreground">Notificações via WhatsApp</p>
                </div>
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
              <div className="ml-11 mt-2 mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: +5511999999999"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Button size="sm" onClick={handleWhatsappSubmit}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Telegram */}
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100/50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600/70 dark:text-blue-400/70">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-medium text-sm">Telegram</p>
                  <p className="text-xs text-muted-foreground">Notificações via Telegram</p>
                </div>
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
              <div className="ml-11 mt-2 mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: 123456789"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    className="h-9 text-sm"
                  />
                  <Button size="sm" onClick={handleTelegramSubmit}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Seção de Desenvolvimento */}
          <div className="p-4">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-950/50 flex items-center justify-center text-slate-600 dark:text-slate-400">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="font-medium text-foreground">Desenvolvimento</h2>
            </div>

            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleTestWebSocket}
                className="text-sm"
              >
                Testar WebSocket
              </Button>

              <Button 
                size="sm"
                variant="outline"
                onClick={handleResetDatabase}
                className="text-sm text-red-600 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50"
              >
                Resetar Banco
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 